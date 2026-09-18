package com.screendangle.app.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.screendangle.app.data.model.StringMaterialItem
import com.screendangle.app.data.model.StringMaterialsCatalog

@Composable
fun StringMaterialView(
    selectedMaterialId: String,
    stringThickness: Float,
    onSelectMaterial: (String) -> Unit,
    onUpdateThickness: (Float) -> Unit
) {
    val materials = StringMaterialsCatalog.MATERIALS
    val amber = Color(0xFFF59E0B)
    val cardBg = Color(0xFF181C22)
    val cardBorder = Color(0xFF262C36)

    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Section Header
        Column {
            Text(
                text = "String & Cord Material",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Choose artisan cord weave, metallic luster, and thread gauge",
                fontSize = 12.sp,
                color = Color(0xFF9CA3AF)
            )
        }

        // Thickness Slider Card
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
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Cord Thickness / Gauge",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                    Text(
                        text = "%.1f dp".format(stringThickness),
                        fontSize = 13.sp,
                        color = amber,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Visual Cord Preview Bar
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(28.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF0F1217)),
                    contentAlignment = Alignment.Center
                ) {
                    val currentMaterial = StringMaterialsCatalog.getMaterialById(selectedMaterialId)
                    val cordColor = try {
                        Color(android.graphics.Color.parseColor(currentMaterial.colorHex))
                    } catch (_: Exception) {
                        amber
                    }
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.85f)
                            .height(stringThickness.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(cordColor)
                    )
                }

                Slider(
                    value = stringThickness,
                    onValueChange = onUpdateThickness,
                    valueRange = 1.2f..4.5f,
                    colors = SliderDefaults.colors(
                        thumbColor = amber,
                        activeTrackColor = amber,
                        inactiveTrackColor = Color(0xFF374151)
                    )
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Delicate (1.2dp)", fontSize = 11.sp, color = Color(0xFF9CA3AF))
                    Text("Heavy Cord (4.5dp)", fontSize = 11.sp, color = Color(0xFF9CA3AF))
                }
            }
        }

        // Materials Catalog List
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = "Artisan Weaves & Metallic Cords",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )

            materials.forEach { material ->
                val isSelected = material.id == selectedMaterialId
                val baseColor = try {
                    Color(android.graphics.Color.parseColor(material.colorHex))
                } catch (_: Exception) {
                    amber
                }
                val sheenColor = try {
                    Color(android.graphics.Color.parseColor(material.sheenHex))
                } catch (_: Exception) {
                    Color.White
                }

                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) Color(0xFF241F16) else cardBg
                    ),
                    border = BorderStroke(
                        1.5.dp,
                        if (isSelected) amber else cardBorder
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSelectMaterial(material.id) }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Color Swatch Disc
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.radialGradient(
                                        listOf(sheenColor, baseColor)
                                    )
                                )
                                .border(1.5.dp, if (isSelected) amber else Color(0xFF374151), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isSelected) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = null,
                                    tint = if (material.id == "silver" || material.id == "gold") Color.Black else Color.White,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = material.name,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = material.description,
                                fontSize = 12.sp,
                                color = Color(0xFF9CA3AF)
                            )
                        }

                        if (isSelected) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = amber.copy(alpha = 0.2f)
                            ) {
                                Text(
                                    text = "Active",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = amber,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
