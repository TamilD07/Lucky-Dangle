package com.screendangle.app.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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

@Composable
fun WaveStructureView(
    settings: DangleSettingsModel,
    onUpdateGravity: (Float) -> Unit,
    onUpdateDamping: (Float) -> Unit,
    onUpdateStiffness: (Float) -> Unit,
    onUpdateSwingIntensity: (Float) -> Unit,
    onUpdateReduceMotion: (Boolean) -> Unit,
    onApplyPreset: (gravity: Float, damping: Float, stiffness: Float) -> Unit
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
                text = "Fine-tune gravitational pull, air drag, cord elasticity, and motion waves",
                fontSize = 12.sp,
                color = Color(0xFF9CA3AF)
            )
        }

        // Quick Presets
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = "Physics Presets",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Earth Natural
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = cardBg,
                    border = BorderStroke(1.dp, cardBorder),
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onApplyPreset(9.8f, 0.982f, 0.18f) }
                ) {
                    Column(
                        modifier = Modifier.padding(10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("🌍 Earth", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text("Natural 9.8 m/s²", fontSize = 10.sp, color = Color(0xFF9CA3AF))
                    }
                }

                // Lunar Low-G
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = cardBg,
                    border = BorderStroke(1.dp, cardBorder),
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onApplyPreset(4.5f, 0.992f, 0.08f) }
                ) {
                    Column(
                        modifier = Modifier.padding(10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("🌙 Lunar", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text("Floaty 4.5 m/s²", fontSize = 10.sp, color = Color(0xFF9CA3AF))
                    }
                }

                // Bouncy Elastic
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = cardBg,
                    border = BorderStroke(1.dp, cardBorder),
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onApplyPreset(14.0f, 0.965f, 0.38f) }
                ) {
                    Column(
                        modifier = Modifier.padding(10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("⚡ Bouncy", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text("Dynamic Snap", fontSize = 10.sp, color = Color(0xFF9CA3AF))
                    }
                }
            }
        }

        // Detailed Sliders Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = cardBg),
            border = BorderStroke(1.dp, cardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Gravity
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Gravitational Acceleration", fontSize = 13.sp, color = Color.White)
                        Text(
                            text = "%.1f m/s²".format(settings.gravity),
                            fontSize = 12.sp,
                            color = amber,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Slider(
                        value = settings.gravity,
                        onValueChange = onUpdateGravity,
                        valueRange = 4.0f..20.0f,
                        colors = SliderDefaults.colors(
                            thumbColor = amber,
                            activeTrackColor = amber,
                            inactiveTrackColor = Color(0xFF374151)
                        )
                    )
                }

                // Damping / Air Resistance
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Air Drag / Wave Damping", fontSize = 13.sp, color = Color.White)
                        Text(
                            text = "%.3f".format(settings.damping),
                            fontSize = 12.sp,
                            color = amber,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Slider(
                        value = settings.damping,
                        onValueChange = onUpdateDamping,
                        valueRange = 0.900f..0.995f,
                        colors = SliderDefaults.colors(
                            thumbColor = amber,
                            activeTrackColor = amber,
                            inactiveTrackColor = Color(0xFF374151)
                        )
                    )
                }

                // Cord Elasticity / Stiffness
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Cord Elasticity & Spring Stiffness", fontSize = 13.sp, color = Color.White)
                        Text(
                            text = "%.2f".format(settings.stiffness),
                            fontSize = 12.sp,
                            color = amber,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Slider(
                        value = settings.stiffness,
                        onValueChange = onUpdateStiffness,
                        valueRange = 0.05f..0.45f,
                        colors = SliderDefaults.colors(
                            thumbColor = amber,
                            activeTrackColor = amber,
                            inactiveTrackColor = Color(0xFF374151)
                        )
                    )
                }

                // Sensor Swing Sensitivity
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Accelerometer Swing Response", fontSize = 13.sp, color = Color.White)
                        Text(
                            text = "%.1fx".format(settings.swingIntensity),
                            fontSize = 12.sp,
                            color = amber,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Slider(
                        value = settings.swingIntensity,
                        onValueChange = onUpdateSwingIntensity,
                        valueRange = 0.5f..2.5f,
                        colors = SliderDefaults.colors(
                            thumbColor = amber,
                            activeTrackColor = amber,
                            inactiveTrackColor = Color(0xFF374151)
                        )
                    )
                }

                // Gentle Motion Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Gentle Motion Mode", fontSize = 14.sp, color = Color.White)
                        Text(
                            "Limits maximum angular velocity for calmer viewing",
                            fontSize = 12.sp,
                            color = Color(0xFF9CA3AF)
                        )
                    }
                    Switch(
                        checked = settings.reduceMotion,
                        onCheckedChange = onUpdateReduceMotion,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color(0xFF18181B),
                            checkedTrackColor = amber,
                            uncheckedThumbColor = Color(0xFF9CA3AF),
                            uncheckedTrackColor = Color(0xFF374151)
                        )
                    )
                }
            }
        }
    }
}
