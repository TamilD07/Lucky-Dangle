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
        val TOUCH_PASSTHROUGH = booleanPreferencesKey("touch_passthrough")
        val STRING_MATERIAL_ID = stringPreferencesKey("string_material_id")
        val STRING_THICKNESS = floatPreferencesKey("string_thickness")
        val GRAVITY = floatPreferencesKey("gravity")
        val DAMPING = floatPreferencesKey("damping")
        val STIFFNESS = floatPreferencesKey("stiffness")
        val CORD_FLEXIBILITY = floatPreferencesKey("cord_flexibility")
        val WAVE_STRENGTH = floatPreferencesKey("wave_strength")
        val CHARM_WEIGHT = stringPreferencesKey("charm_weight")
        val CUSTOM_CHARMS_JSON = stringPreferencesKey("custom_charms_json")
    }

    val settingsFlow: Flow<DangleSettingsModel> = context.dataStore.data.map { prefs ->
        DangleSettingsModel(
            isEnabled = prefs[IS_ENABLED] ?: false,
            selectedCharmId = prefs[SELECTED_CHARM_ID] ?: "daruma",
            ropeLength = prefs[ROPE_LENGTH] ?: 135f,
            charmSize = prefs[CHARM_SIZE] ?: 56,
            swingIntensity = prefs[SWING_INTENSITY] ?: 1.0f,
            horizontalPercent = prefs[HORIZONTAL_PERCENT] ?: 0.72f,
            reduceMotion = prefs[REDUCE_MOTION] ?: false,
            onboardingCompleted = prefs[ONBOARDING_COMPLETED] ?: false,
            touchPassthrough = prefs[TOUCH_PASSTHROUGH] ?: false,
            stringMaterialId = prefs[STRING_MATERIAL_ID] ?: "gold",
            stringThickness = prefs[STRING_THICKNESS] ?: 2.4f,
            gravity = prefs[GRAVITY] ?: 9.8f,
            damping = prefs[DAMPING] ?: 0.982f,
            stiffness = prefs[STIFFNESS] ?: 0.15f,
            cordFlexibility = prefs[CORD_FLEXIBILITY] ?: 0.7f,
            waveStrength = prefs[WAVE_STRENGTH] ?: 1.0f,
            charmWeight = prefs[CHARM_WEIGHT] ?: "medium",
            customCharmsJson = prefs[CUSTOM_CHARMS_JSON] ?: ""
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

    suspend fun setTouchPassthrough(enabled: Boolean) {
        context.dataStore.edit { it[TOUCH_PASSTHROUGH] = enabled }
    }

    suspend fun setStringMaterialId(materialId: String) {
        context.dataStore.edit { it[STRING_MATERIAL_ID] = materialId }
    }

    suspend fun setStringThickness(thickness: Float) {
        context.dataStore.edit { it[STRING_THICKNESS] = thickness }
    }

    suspend fun setGravity(gravity: Float) {
        context.dataStore.edit { it[GRAVITY] = gravity }
    }

    suspend fun setDamping(damping: Float) {
        context.dataStore.edit { it[DAMPING] = damping }
    }

    suspend fun setStiffness(stiffness: Float) {
        context.dataStore.edit { it[STIFFNESS] = stiffness }
    }

    suspend fun setCordFlexibility(flexibility: Float) {
        context.dataStore.edit { it[CORD_FLEXIBILITY] = flexibility }
    }

    suspend fun setWaveStrength(strength: Float) {
        context.dataStore.edit { it[WAVE_STRENGTH] = strength }
    }

    suspend fun setCharmWeight(weight: String) {
        context.dataStore.edit { it[CHARM_WEIGHT] = weight }
    }

    suspend fun setCustomCharmsJson(json: String) {
        context.dataStore.edit { it[CUSTOM_CHARMS_JSON] = json }
    }

    suspend fun addCustomCharm(charm: com.screendangle.app.data.model.Charm) {
        context.dataStore.edit { prefs ->
            val currentJson = prefs[CUSTOM_CHARMS_JSON] ?: "[]"
            val currentList = com.screendangle.app.data.model.CharmCatalog.parseCustomCharms(currentJson).toMutableList()
            currentList.removeAll { it.id == charm.id }
            currentList.add(0, charm)
            prefs[CUSTOM_CHARMS_JSON] = com.screendangle.app.data.model.CharmCatalog.encodeCustomCharms(currentList)
            prefs[SELECTED_CHARM_ID] = charm.id
        }
    }

    suspend fun deleteCustomCharm(charmId: String) {
        context.dataStore.edit { prefs ->
            val currentJson = prefs[CUSTOM_CHARMS_JSON] ?: "[]"
            val currentList = com.screendangle.app.data.model.CharmCatalog.parseCustomCharms(currentJson).toMutableList()
            currentList.removeAll { it.id == charmId }
            prefs[CUSTOM_CHARMS_JSON] = com.screendangle.app.data.model.CharmCatalog.encodeCustomCharms(currentList)
            if (prefs[SELECTED_CHARM_ID] == charmId) {
                prefs[SELECTED_CHARM_ID] = com.screendangle.app.data.model.CharmCatalog.BUILT_IN_CHARMS[0].id
            }
        }
    }
}
