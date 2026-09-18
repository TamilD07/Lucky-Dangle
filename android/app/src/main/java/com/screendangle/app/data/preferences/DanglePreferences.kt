package com.screendangle.app.data.preferences

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

    suspend fun setRopeLength(length: Float) {
        context.dataStore.edit { it[ROPE_LENGTH] = length }
    }

    suspend fun setCharmSize(size: Int) {
        context.dataStore.edit { it[CHARM_SIZE] = size }
    }

    suspend fun setSwingIntensity(intensity: Float) {
        context.dataStore.edit { it[SWING_INTENSITY] = intensity }
    }

    suspend fun setReduceMotion(reduce: Boolean) {
        context.dataStore.edit { it[REDUCE_MOTION] = reduce }
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        context.dataStore.edit { it[ONBOARDING_COMPLETED] = completed }
    }
}
