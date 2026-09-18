package com.screendangle.app.overlay

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.WindowManager
import androidx.core.app.NotificationCompat
import com.screendangle.app.MainActivity
import com.screendangle.app.R
import com.screendangle.app.ScreenDangleApp
import com.screendangle.app.data.model.DangleSettingsModel
import com.screendangle.app.data.preferences.DanglePreferences
import com.screendangle.app.sensors.MotionSensorManager
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

class OverlayService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private var windowManager: WindowManager? = null
    private var overlayView: DangleOverlayView? = null
    private var sensorManager: MotionSensorManager? = null
    private lateinit var preferences: DanglePreferences
    private var windowParams: WindowManager.LayoutParams? = null

    companion object {
        const val ACTION_STOP_OVERLAY = "com.screendangle.app.ACTION_STOP"
        private const val NOTIFICATION_ID = 1001

        fun start(context: Context) {
            val intent = Intent(context, OverlayService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, OverlayService::class.java).apply {
                action = ACTION_STOP_OVERLAY
            }
            context.startService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        preferences = DanglePreferences(this)
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        startForeground(NOTIFICATION_ID, buildForegroundNotification())

        sensorManager = MotionSensorManager(this) { ax, ay ->
            overlayView?.setExternalTilt(ax, ay)
        }
        sensorManager?.start()

        setupOverlayView()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP_OVERLAY) {
            stopSelf()
            return START_NOT_STICKY
        }
        return START_STICKY
    }

    private fun configureLayoutParams(settings: com.screendangle.app.data.model.DangleSettingsModel, params: WindowManager.LayoutParams) {
        val density = resources.displayMetrics.density
        val screenWidth = resources.displayMetrics.widthPixels

        if (settings.touchPassthrough) {
            // Complete Ghost / Pass-through mode: touches 100% pass to background
            params.flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
            params.width = WindowManager.LayoutParams.MATCH_PARENT
            params.height = ((settings.ropeLength + settings.charmSize + 55f) * density).toInt()
            params.x = 0
            params.y = 0
            overlayView?.setIsLocalizedWindow(false)
        } else {
            // Interactive mode: Window only wraps charm's compact bounding box!
            // Touches outside this compact area pass straight to underlying apps.
            params.flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
            val boxWidth = ((settings.charmSize + 110f) * density).toInt()
            val boxHeight = ((settings.ropeLength + settings.charmSize + 55f) * density).toInt()
            params.width = boxWidth
            params.height = boxHeight
            val centerX = screenWidth * settings.horizontalPercent
            params.x = (centerX - boxWidth / 2f).toInt().coerceIn(0, (screenWidth - boxWidth).coerceAtLeast(0))
            params.y = 0
            overlayView?.setIsLocalizedWindow(true)
        }
    }

    private fun setupOverlayView() {
        serviceScope.launch {
            val settings = preferences.settingsFlow.first()
            val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            }

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.TOP or Gravity.START
                x = 0
                y = 0
            }

            overlayView = DangleOverlayView(this@OverlayService).apply {
                applySettings(settings)
            }

            configureLayoutParams(settings, params)
            windowParams = params

            try {
                windowManager?.addView(overlayView, params)
            } catch (e: Exception) {
                stopSelf()
                return@launch
            }

            preferences.settingsFlow.collect { updatedSettings ->
                windowParams?.let { p ->
                    configureLayoutParams(updatedSettings, p)
                    overlayView?.applySettings(updatedSettings)
                    try {
                        windowManager?.updateViewLayout(overlayView, p)
                    } catch (_: Exception) {}
                }
            }
        }
    }

    private fun buildForegroundNotification(): Notification {
        val launchIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val stopIntent = Intent(this, OverlayService::class.java).apply {
            action = ACTION_STOP_OVERLAY
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, ScreenDangleApp.OVERLAY_CHANNEL_ID)
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(getString(R.string.notification_text))
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(pendingIntent)
            .addAction(R.drawable.ic_launcher_foreground, getString(R.string.action_turn_off), stopPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        sensorManager?.stop()
        if (overlayView != null) {
            try {
                windowManager?.removeView(overlayView)
            } catch (e: Exception) {
                // Ignore
            }
        }
        serviceScope.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
