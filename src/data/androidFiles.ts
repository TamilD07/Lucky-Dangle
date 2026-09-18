export interface AndroidProjectFile {
  path: string;
  category: 'config' | 'manifest' | 'kotlin_core' | 'kotlin_ui' | 'kotlin_physics' | 'resources' | 'tests';
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  {
    path: 'settings.gradle.kts',
    category: 'config',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ScreenDangle"
include(":app")
`
  },
  {
    path: 'build.gradle.kts',
    category: 'config',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.compose.compiler) apply false
}
`
  },
  {
    path: 'gradle.properties',
    category: 'config',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  },
  {
    path: 'app/build.gradle.kts',
    category: 'config',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.screendangle.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.screendangle.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            isDebuggable = true
            applicationIdSuffix = ".debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX Core & Lifecycle
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.activity:activity-compose:1.10.1")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2025.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // DataStore Preferences for zero-backend offline persistence
    implementation("androidx.datastore:datastore-preferences:1.1.2")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.1")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.10.1")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2025.02.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
`
  },
  {
    path: 'app/proguard-rules.pro',
    category: 'config',
    content: `# Screen Dangle R8 / ProGuard Optimization Rules
# Keep data models serialized to preferences
-keepclassmembers class com.screendangle.app.data.model.** { *; }

# Strip all debug log calls in release builds
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
}

# Preserve Compose runtime annotations
-keepclassmembers class androidx.compose.** { *; }
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    category: 'manifest',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- ONLY essential permission: System Alert Window for the screen dangle overlay -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <!-- Foreground Service permission for reliable overlay persistence on Android 14+ -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />

    <!-- Notification permission for Android 13+ foreground service status notice -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Optional boot auto-start -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <!-- ZERO INTERNET PERMISSION: completely offline, safe & private -->

    <application
        android:name=".ScreenDangleApp"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ScreenDangle"
        tools:targetApi="35">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.ScreenDangle"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Floating Screen Dangle Overlay Service -->
        <service
            android:name=".overlay.OverlayService"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Interactive screen decoration overlay hanging from top bezel" />
        </service>

        <!-- Boot Receiver for Auto-Start feature -->
        <receiver
            android:name=".receiver.BootCompletedReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>

</manifest>
`
  },
  {
    path: 'app/src/main/java/com/screendangle/app/ScreenDangleApp.kt',
    category: 'kotlin_core',
    content: `package com.screendangle.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

class ScreenDangleApp : Application() {

    companion object {
        const val OVERLAY_CHANNEL_ID = "screen_dangle_overlay_channel"
        private lateinit var instance: ScreenDangleApp
        fun getContext(): Context = instance.applicationContext
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = getString(R.string.notification_channel_name)
            val descriptionText = getString(R.string.notification_channel_description)
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(OVERLAY_CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setShowBadge(false)
            }
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/screendangle/app/MainActivity.kt',
    category: 'kotlin_core',
    content: `package com.screendangle.app

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.screendangle.app.ui.MainViewModel
import com.screendangle.app.ui.ScreenDangleRootNavigation
import com.screendangle.app.ui.theme.ScreenDangleTheme

class MainActivity : ComponentActivity() {

    private val overlayPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        // Check if permission was granted upon return from Android system settings
        val hasPermission = checkOverlayPermission()
        mainViewModel?.updateOverlayPermission(hasPermission)
    }

    private var mainViewModel: MainViewModel? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val viewModel: MainViewModel = viewModel()
            mainViewModel = viewModel

            val uiState by viewModel.uiState.collectAsState()

            ScreenDangleTheme(darkTheme = uiState.isDarkTheme) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    ScreenDangleRootNavigation(
                        viewModel = viewModel,
                        onRequestOverlayPermission = { requestOverlayPermission() }
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        mainViewModel?.updateOverlayPermission(checkOverlayPermission())
    }

    private fun checkOverlayPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(this)
        } else {
            true
        }
    }

    private fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            overlayPermissionLauncher.launch(intent)
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/screendangle/app/physics/PendulumPhysicsEngine.kt',
    category: 'kotlin_physics',
    content: `package com.screendangle.app.physics

import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt
import kotlin.math.sign

/**
 * Production-ready numerical pendulum & spring-damper physics engine.
 * Solves the nonlinear damped pendulum equation:
 * theta'' = -(g/L)*sin(theta) - (damping * theta') + (ax/L)*cos(theta)*response
 */
class PendulumPhysicsEngine(
    private var naturalLengthPx: Float = 130f
) {
    var angle: Float = 0f
        private set
    var angularVelocity: Float = 0f
        private set
    var angularAccel: Float = 0f
        private set
    var currentLengthPx: Float = naturalLengthPx
        private set

    var isDragging: Boolean = false
        private set
    var isSleeping: Boolean = false
        private set

    private var externalAx: Float = 0f
    private var externalAy: Float = 0f

    private var dragTargetX: Float = 0f
    private var dragTargetY: Float = naturalLengthPx
    private var prevDragX: Float = 0f
    private var dragVelocity: Float = 0f

    companion object {
        private const val SLEEP_VELOCITY_EPSILON = 0.0025f
        private const val SLEEP_ANGLE_EPSILON = 0.0025f
    }

    fun setRopeLength(length: Float) {
        naturalLengthPx = length.coerceIn(60f, 350f)
        if (!isDragging) {
            currentLengthPx = naturalLengthPx
        }
    }

    fun setExternalAcceleration(ax: Float, ay: Float) {
        externalAx = if (ax.isNaN()) 0f else ax.coerceIn(-15f, 15f)
        externalAy = if (ay.isNaN()) 0f else ay.coerceIn(-15f, 15f)
        if (kotlin.math.abs(externalAx) > 0.08f) {
            isSleeping = false
        }
    }

    fun startDrag(touchRelX: Float, touchRelY: Float) {
        isDragging = true
        isSleeping = false
        dragTargetX = touchRelX
        dragTargetY = touchRelY.coerceAtLeast(30f)
        prevDragX = touchRelX
        dragVelocity = 0f
        updateDragGeometry()
    }

    fun updateDrag(touchRelX: Float, touchRelY: Float, dt: Float = 0.016f) {
        if (!isDragging) return
        dragTargetX = touchRelX
        dragTargetY = touchRelY.coerceAtLeast(30f)
        if (dt > 0.001f) {
            dragVelocity = (touchRelX - prevDragX) / dt
            prevDragX = touchRelX
        }
        updateDragGeometry()
    }

    fun releaseDrag() {
        if (!isDragging) return
        isDragging = false
        val r = currentLengthPx.coerceAtLeast(30f)
        val tangentialSpeed = dragVelocity * cos(angle)
        angularVelocity = (tangentialSpeed / r).coerceIn(-12f, 12f)
        isSleeping = false
    }

    fun applyImpulse(impulse: Float) {
        angularVelocity += impulse
        isSleeping = false
    }

    fun testSwing(intensity: Float = 1.0f) {
        angle = 0.45f * intensity
        angularVelocity = 1.2f * intensity
        isSleeping = false
    }

    fun reset() {
        angle = 0f
        angularVelocity = 0f
        angularAccel = 0f
        currentLengthPx = naturalLengthPx
        isDragging = false
        isSleeping = true
    }

    private fun updateDragGeometry() {
        val dx = dragTargetX
        val dy = dragTargetY
        val dist = sqrt(dx * dx + dy * dy)
        val maxDist = naturalLengthPx * 1.5f
        val minDist = naturalLengthPx * 0.4f
        currentLengthPx = dist.coerceIn(minDist, maxDist)
        angle = atan2(dx, dy)
        angularVelocity = 0f
        angularAccel = 0f
    }

    fun step(
        dt: Float,
        gravity: Float = 9.8f,
        damping: Float = 0.982f,
        swingIntensity: Float = 1.0f,
        movementResponse: Float = 1.2f,
        maxAngleDeg: Float = 72f,
        reduceMotion: Boolean = false
    ) {
        val clampedDt = dt.coerceIn(0.001f, 0.033f)

        if (reduceMotion) {
            if (!isDragging) {
                angle *= 0.82f
                angularVelocity = 0f
                currentLengthPx += (naturalLengthPx - currentLengthPx) * 0.2f
                if (kotlin.math.abs(angle) < 0.001f) {
                    angle = 0f
                    isSleeping = true
                }
            }
            return
        }

        if (isDragging) return

        // Sleep check
        val isStationary = kotlin.math.abs(angle) < SLEEP_ANGLE_EPSILON &&
                kotlin.math.abs(angularVelocity) < SLEEP_VELOCITY_EPSILON &&
                kotlin.math.abs(externalAx) < 0.05f

        if (isStationary) {
            angle = 0f
            angularVelocity = 0f
            angularAccel = 0f
            currentLengthPx = naturalLengthPx
            isSleeping = true
            return
        }

        isSleeping = false

        val g = (gravity * 35f) * swingIntensity
        val l = currentLengthPx.coerceAtLeast(40f)
        val sensorEffect = (externalAx * 85f * movementResponse) / l

        // Restoring torque + inertia torque
        val gravityTorque = -(g / l) * sin(angle)
        val inertiaTorque = sensorEffect * cos(angle)

        angularAccel = gravityTorque + inertiaTorque
        angularVelocity = (angularVelocity + angularAccel * clampedDt) * damping.coerceIn(0.85f, 0.999f)
        angle += angularVelocity * clampedDt

        // Angular clamp limit
        val maxRad = Math.toRadians(maxAngleDeg.toDouble()).toFloat()
        if (kotlin.math.abs(angle) > maxRad) {
            angle = sign(angle) * maxRad
            angularVelocity *= -0.3f
        }

        // Spring restitution back to natural rope length
        currentLengthPx += (naturalLengthPx - currentLengthPx) * (1.5f * clampedDt)

        // NaN safety
        if (angle.isNaN() || angularVelocity.isNaN()) {
            reset()
        }
    }

    fun getBobPositionX(): Float = sin(angle) * currentLengthPx
    fun getBobPositionY(): Float = cos(angle) * currentLengthPx
}
`
  },
  {
    path: 'app/src/main/java/com/screendangle/app/sensors/MotionSensorManager.kt',
    category: 'kotlin_core',
    content: `package com.screendangle.app.sensors

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager

/**
 * Battery-efficient motion sensor manager.
 * Listens to accelerometer with graceful fallback and low sampling rate to conserve battery.
 */
class MotionSensorManager(
    context: Context,
    private val onMotionChanged: (ax: Float, ay: Float) -> Unit
) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    private val accelerometer: Sensor? = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private var isRegistered = false

    fun start() {
        if (isRegistered || sensorManager == null || accelerometer == null) return
        // Use SENSOR_DELAY_GAME or SENSOR_DELAY_UI for smooth 60fps without battery drain
        sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME)
        isRegistered = true
    }

    fun stop() {
        if (!isRegistered || sensorManager == null) return
        sensorManager.unregisterListener(this)
        isRegistered = false
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null || event.sensor.type != Sensor.TYPE_ACCELEROMETER) return
        // Device tilt X and Y
        val ax = event.values[0] // Lateral tilt
        val ay = event.values[1] // Longitudinal tilt
        onMotionChanged(ax, ay)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
`
  },
  {
    path: 'app/src/main/java/com/screendangle/app/overlay/OverlayService.kt',
    category: 'kotlin_core',
    content: `package com.screendangle.app.overlay

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
import com.screendangle.app.data.preferences.DanglePreferences
import com.screendangle.app.sensors.MotionSensorManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class OverlayService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private var windowManager: WindowManager? = null
    private var overlayView: DangleOverlayView? = null
    private var sensorManager: MotionSensorManager? = null
    private lateinit var preferences: DanglePreferences

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

        // Start foreground notification as required by Android 14+
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

            try {
                windowManager?.addView(overlayView, params)
            } catch (e: Exception) {
                // Defensive handling if permission was revoked in background
                stopSelf()
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
                // View already detached
            }
        }
        serviceScope.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
`
  },
  {
    path: 'app/src/main/java/com/screendangle/app/data/preferences/DanglePreferences.kt',
    category: 'kotlin_core',
    content: `package com.screendangle.app.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.screendangle.app.data.model.DangleSettingsModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "screen_dangle_prefs")

class DanglePreferences(private val context: Context) {

    companion object {
        val IS_ENABLED = booleanPreferencesKey("is_enabled")
        val SELECTED_CHARM_ID = stringPreferencesKey("selected_charm_id")
        val ROPE_LENGTH = floatPreferencesKey("rope_length")
        val CHARM_SIZE = intPreferencesKey("charm_size")
        val SWING_INTENSITY = floatPreferencesKey("swing_intensity")
        val HORIZONTAL_PERCENT = floatPreferencesKey("horizontal_percent")
        val REDUCE_MOTION = booleanPreferencesKey("reduce_motion")
        val ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
    }

    val settingsFlow: Flow<DangleSettingsModel> = context.dataStore.data.map { prefs ->
        DangleSettingsModel(
            isEnabled = prefs[IS_ENABLED] ?: false,
            selectedCharmId = prefs[SELECTED_CHARM_ID] ?: "evil_eye",
            ropeLength = prefs[ROPE_LENGTH] ?: 130f,
            charmSize = prefs[CHARM_SIZE] ?: 56,
            swingIntensity = prefs[SWING_INTENSITY] ?: 1.0f,
            horizontalPercent = prefs[HORIZONTAL_PERCENT] ?: 0.72f,
            reduceMotion = prefs[REDUCE_MOTION] ?: false,
            onboardingCompleted = prefs[ONBOARDING_COMPLETED] ?: false
        )
    }

    suspend fun setEnabled(enabled: Boolean) {
        context.dataStore.edit { it[IS_ENABLED] = enabled }
    }

    suspend fun setSelectedCharmId(id: String) {
        context.dataStore.edit { it[SELECTED_CHARM_ID] = id }
    }

    suspend fun setHorizontalPercent(percent: Float) {
        context.dataStore.edit { it[HORIZONTAL_PERCENT] = percent }
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        context.dataStore.edit { it[ONBOARDING_COMPLETED] = completed }
    }
}
`
  },
  {
    path: 'app/src/test/java/com/screendangle/app/physics/PendulumPhysicsEngineTest.kt',
    category: 'tests',
    content: `package com.screendangle.app.physics

import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class PendulumPhysicsEngineTest {

    private lateinit var engine: PendulumPhysicsEngine

    @Before
    fun setUp() {
        engine = PendulumPhysicsEngine(130f)
    }

    @Test
    fun testInitialStateIsAtRest() {
        assertEquals(0f, engine.angle, 0.0001f)
        assertEquals(0f, engine.angularVelocity, 0.0001f)
        assertEquals(130f, engine.currentLengthPx, 0.0001f)
    }

    @Test
    fun testPhysicsDoesNotProduceNaNOrInfinity() {
        // Run 500 violent steps with high acceleration
        engine.setExternalAcceleration(12f, 0f)
        for (i in 0..500) {
            engine.step(
                dt = 0.016f,
                gravity = 9.8f,
                damping = 0.98f,
                swingIntensity = 2.0f,
                movementResponse = 2.5f,
                maxAngleDeg = 75f,
                reduceMotion = false
            )
            assertFalse("Angle is NaN at step $i", engine.angle.isNaN())
            assertFalse("Velocity is NaN at step $i", engine.angularVelocity.isNaN())
            assertTrue("Angle exceeds physical bound", kotlin.math.abs(engine.angle) <= Math.toRadians(75.5))
        }
    }

    @Test
    fun testSleepModeWhenStationary() {
        engine.reset()
        engine.step(0.016f)
        assertTrue("Engine should sleep when resting and no force applied", engine.isSleeping)
    }

    @Test
    fun testReduceMotionModeSuppressesSwing() {
        engine.applyImpulse(5f)
        engine.step(0.016f, reduceMotion = true)
        assertTrue(kotlin.math.abs(engine.angle) < 0.1f)
    }
}
`
  }
];
