package com.screendangle.app.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.screendangle.app.data.model.DangleSettingsModel
import com.screendangle.app.data.model.PhysicsPreset
import com.screendangle.app.data.model.PhysicsPresetsCatalog
import kotlin.math.roundToInt

@Composable
fun WaveStructureView(
    settings: DangleSettingsModel,
    onUpdateGravity: (Float) -> Unit,
    onUpdateDamping: (Float) -> Unit,
    onUpdateStiffness: (Float) -> Unit,
    onUpdateCordFlexibility: (Float) -> Unit,
    onUpdateWaveStrength: (Float) -> Unit,
    onUpdateCharmWeight: (String) -> Unit,
    onUpdateSwingIntensity: (Float) -> Unit,
    onUpdateReduceMotion: (Boolean) -> Unit,
    onApplyPreset: (PhysicsPreset) -> Unit
) {
    val amber = Color(0xFFF59E0B)
    val cardBg = Color(0xFF181C22)
    val cardBorder = Color(0xFF262C36)

    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Section Title
        Column {
            Text(
                text = "Wave & Structure Physics",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Multi-segment Verlet rope simulation with cord wave propagation and realistic inertia",
                fontSize = 12.sp,
                color = Color(0xFF9CA3AF)
            )
        }

        // 7 Dynamics Presets
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = "Physics Dynamics Presets",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )

            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(PhysicsPresetsCatalog.PRESETS) { preset ->
                    val isSelected = Math.abs(settings.gravity - preset.gravity) < 0.2f &&
                            Math.abs(settings.damping - preset.damping) < 0.01f

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isSelected) amber.copy(alpha = 0.15f) else cardBg,
                        border = BorderStroke(1.dp, if (isSelected) amber else cardBorder),
                        modifier = Modifier
                            .width(135.dp)
                            .clickable { onApplyPreset(preset) }
                    ) {
                        Column(
                            modifier = Modifier.padding(10.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(preset.icon, fontSize = 20.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = preset.name,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) amber else Color.White
                            )
                            Text(
                                text = preset.description,
                                fontSize = 9.sp,
                                color = Color(0xFF9CA3AF),
                                maxLines = 1
                            )
                        }
                    }
                }
            }
        }

        // Cord Flexibility Slider
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = cardBg,
            border = BorderStroke(1.dp, cardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Cord Flexibility", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                        Text("How organically the cord bends and flexes", fontSize = 11.sp, color = Color(0xFF9CA3AF))
                    }
                    Text("${(settings.cordFlexibility * 100).roundToInt()}%", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = amber)
                }
                Slider(
                    value = settings.cordFlexibility,
                    onValueChange = onUpdateCordFlexibility,
                    valueRange = 0.1f..1.0f,
                    colors = SliderDefaults.colors(thumbColor = amber, activeTrackColor = amber)
                )
            }
        }

        // Wave Propagation Slider
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = cardBg,
            border = BorderStroke(1.dp, cardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Wave Propagation", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                        Text("Amplitude of traveling waves down the string", fontSize = 11.sp, color = Color(0xFF9CA3AF))
                    }
                    Text(String.format("%.1fx", settings.waveStrength), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = amber)
                }
                Slider(
                    value = settings.waveStrength,
                    onValueChange = onUpdateWaveStrength,
                    valueRange = 0.0f..2.0f,
                    colors = SliderDefaults.colors(thumbColor = amber, activeTrackColor = amber)
                )
            }
        }

        // Charm Virtual Weight Selector
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = cardBg,
            border = BorderStroke(1.dp, cardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Charm Weight Multiplier", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                Text("Alters inertia, downward tension, and pendulum momentum", fontSize = 11.sp, color = Color(0xFF9CA3AF))

                val weights = listOf(
                    "very_light" to "Very Light (0.4x)",
                    "light" to "Light (0.7x)",
                    "medium" to "Standard (1.0x)",
                    "heavy" to "Heavy (1.8x)",
                    "very_heavy" to "Cast Iron (2.6x)"
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    weights.take(3).forEach { (key, label) ->
                        val isSelected = settings.charmWeight == key
                        Button(
                            onClick = { onUpdateCharmWeight(key) },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isSelected) amber else Color(0xFF262C36),
                                contentColor = if (isSelected) Color(0xFF18181B) else Color.White
                            ),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(label.split(" ")[0], fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }

        // Gravity & Damping sliders
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = cardBg,
            border = BorderStroke(1.dp, cardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Gravity Pull", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                    Text("${String.format("%.1f", settings.gravity)} m/s²", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = amber)
                }
                Slider(
                    value = settings.gravity,
                    onValueChange = onUpdateGravity,
                    valueRange = 4.0f..16.0f,
                    colors = SliderDefaults.colors(thumbColor = amber, activeTrackColor = amber)
                )

                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Air Drag / Damping", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                    Text("${(settings.damping * 100).roundToInt()}%", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = amber)
                }
                Slider(
                    value = settings.damping,
                    onValueChange = onUpdateDamping,
                    valueRange = 0.90f..0.995f,
                    colors = SliderDefaults.colors(thumbColor = amber, activeTrackColor = amber)
                )
            }
        }

        // Reduce Motion Toggle
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = cardBg,
            border = BorderStroke(1.dp, cardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Reduce Motion", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                    Text("Accessibility mode with calm, heavily dampened sways", fontSize = 11.sp, color = Color(0xFF9CA3AF))
                }
                Switch(
                    checked = settings.reduceMotion,
                    onCheckedChange = onUpdateReduceMotion,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = amber,
                        checkedTrackColor = amber.copy(alpha = 0.4f)
                    )
                )
            }
        }
    }
}
