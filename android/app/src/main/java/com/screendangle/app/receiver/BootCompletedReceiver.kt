package com.screendangle.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.screendangle.app.data.preferences.DanglePreferences
import com.screendangle.app.overlay.OverlayService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootCompletedReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            if (!Settings.canDrawOverlays(context)) {
                return
            }
            val prefs = DanglePreferences(context)
            CoroutineScope(Dispatchers.Main).launch {
                val settings = prefs.settingsFlow.first()
                if (settings.isEnabled) {
                    OverlayService.start(context)
                }
            }
        }
    }
}
