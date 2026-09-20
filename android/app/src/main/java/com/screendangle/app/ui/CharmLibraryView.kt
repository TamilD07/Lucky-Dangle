package com.screendangle.app.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.screendangle.app.data.model.*
import java.util.UUID

@Composable
fun CharmLibraryView(
    selectedCharmId: String,
    customCharmsJson: String,
    onSelectCharm: (String) -> Unit,
    onAddCustomCharm: (Charm) -> Unit,
    onDeleteCustomCharm: (String) -> Unit
) {
    val allCharms = remember(customCharmsJson) {
        CharmCatalog.getAllCharms(customCharmsJson)
    }

    var selectedCategory by remember { mutableStateOf<CharmCategory?>(null) }
    var showCreateDialog by remember { mutableStateOf(false) }

    val filteredCharms = remember(allCharms, selectedCategory) {
        if (selectedCategory == null) allCharms
        else allCharms.filter { it.category == selectedCategory }
    }

    val amber = Color(0xFFF59E0B)
    val cardBg = Color(0xFF181C22)
    val cardBorder = Color(0xFF262C36)

    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Top Action Bar: Create Custom Charm Button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Charm Library",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "${allCharms.size} charms ready for hanging",
                    fontSize = 12.sp,
                    color = Color(0xFF9CA3AF)
                )
            }

            Button(
                onClick = { showCreateDialog = true },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = amber,
                    contentColor = Color(0xFF18181B)
                ),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Craft Charm", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
        }

        // Category Filter Chips
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            val categories = listOf(
                null to "All",
                CharmCategory.TRADITIONAL to "Traditional",
                CharmCategory.PROTECTION to "Protection",
                CharmCategory.LUCKY to "Lucky",
                CharmCategory.CUSTOM to "Custom"
            )

            categories.forEach { (cat, label) ->
                val isSelected = selectedCategory == cat
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isSelected) amber.copy(alpha = 0.2f) else cardBg,
                    border = BorderStroke(1.dp, if (isSelected) amber else cardBorder),
                    modifier = Modifier.clickable { selectedCategory = cat }
                ) {
                    Text(
                        text = label,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSelected) amber else Color(0xFFD1D5DB),
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }

        // Charm Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 280.dp, max = 560.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(filteredCharms, key = { it.id }) { charm ->
                val isSelected = charm.id == selectedCharmId
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) Color(0xFF2B2519) else cardBg
                    ),
                    border = BorderStroke(
                        1.5.dp,
                        if (isSelected) amber else cardBorder
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSelectCharm(charm.id) }
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Charm Visual Box
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF0F1217)),
                            contentAlignment = Alignment.Center
                        ) {
                            when (charm.type) {
                                CharmType.EMOJI -> {
                                    Text(
                                        text = charm.emoji ?: "🧿",
                                        fontSize = 32.sp
                                    )
                                }
                                CharmType.TEXT -> {
                                    Box(
                                        modifier = Modifier
                                            .size(44.dp)
                                            .clip(CircleShape)
                                            .background(Color(0xFF4F46E5)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = charm.text ?: "LUCK",
                                            color = Color.White,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 11.sp
                                        )
                                    }
                                }
                                else -> {
                                    charm.drawableResId?.let { resId ->
                                        Image(
                                            painter = painterResource(id = resId),
                                            contentDescription = charm.name,
                                            modifier = Modifier
                                                .size(48.dp)
                                                .clip(CircleShape),
                                            contentScale = ContentScale.Fit
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = charm.name,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) amber else Color.White,
                            textAlign = TextAlign.Center,
                            maxLines = 1
                        )

                        Text(
                            text = charm.origin,
                            fontSize = 10.sp,
                            color = Color(0xFF9CA3AF),
                            textAlign = TextAlign.Center,
                            maxLines = 1
                        )

                        // Bottom action / badges
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = Color(0xFF262C36)
                            ) {
                                Text(
                                    text = charm.category.name.take(4),
                                    fontSize = 8.sp,
                                    color = Color(0xFF9CA3AF),
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }

                            if (charm.category == CharmCategory.CUSTOM) {
                                IconButton(
                                    onClick = { onDeleteCustomCharm(charm.id) },
                                    modifier = Modifier.size(20.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Delete,
                                        contentDescription = "Delete",
                                        tint = Color(0xFFEF4444),
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Create Custom Charm Dialog
    if (showCreateDialog) {
        CreateCustomCharmDialog(
            onDismiss = { showCreateDialog = false },
            onSave = { charm ->
                onAddCustomCharm(charm)
                showCreateDialog = false
            }
        )
    }
}

@Composable
fun CreateCustomCharmDialog(
    onDismiss: () -> Unit,
    onSave: (Charm) -> Unit
) {
    var mode by remember { mutableStateOf(0) } // 0: Emoji, 1: Sigil / Text, 2: Image
    var selectedEmoji by remember { mutableStateOf("🧿") }
    var customEmojiInput by remember { mutableStateOf("") }
    var customText by remember { mutableStateOf("PEACE") }
    var charmName by remember { mutableStateOf("") }
    var charmDescription by remember { mutableStateOf("") }
    var selectedMaterial by remember { mutableStateOf(EmojiMaterialStyle.GOLD) }
    var selectedShape by remember { mutableStateOf(CharmContainerShape.CIRCLE) }
    var selectedDangleType by remember { mutableStateOf("tassel") } // "tassel", "bell", "crystal", "coin", "none"
    var selectedCordColor by remember { mutableStateOf("#D4AF37") }

    val amber = Color(0xFFF59E0B)
    val darkCard = Color(0xFF181C22)

    val popularEmojis = listOf("🧿", "🌸", "🍀", "🐱", "💎", "🌙", "⛩️", "🔔", "🎋", "🦊", "🌟", "🪷", "🧧", "✨", "🐉", "☯️", "🕊️", "🦁")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = darkCard),
            border = BorderStroke(1.dp, Color(0xFF374151)),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.9f)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(18.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Craft Custom Talisman",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF9CA3AF))
                    }
                }

                // Mode Tabs (Emoji / Sigil)
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = { mode = 0 },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (mode == 0) amber else Color(0xFF262C36),
                            contentColor = if (mode == 0) Color(0xFF18181B) else Color.White
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Any Emoji", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    Button(
                        onClick = { mode = 1 },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (mode == 1) amber else Color(0xFF262C36),
                            contentColor = if (mode == 1) Color(0xFF18181B) else Color.White
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Sigil / Text", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }

                // Live Preview Canvas Box
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(110.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF0F1217)),
                    contentAlignment = Alignment.Center
                ) {
                    val activeEmoji = if (customEmojiInput.isNotBlank()) customEmojiInput else selectedEmoji

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        // Container shape simulation
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(
                                    when (selectedShape) {
                                        CharmContainerShape.ROUNDED_RECT -> RoundedCornerShape(12.dp)
                                        CharmContainerShape.OCTAGON -> RoundedCornerShape(18.dp)
                                        else -> CircleShape
                                    }
                                )
                                .background(
                                    when (selectedMaterial) {
                                        EmojiMaterialStyle.GOLD -> Brush.radialGradient(listOf(Color(0xFFFDE047), Color(0xFFD4AF37), Color(0xFF78350F)))
                                        EmojiMaterialStyle.SILVER -> Brush.radialGradient(listOf(Color(0xFFFFFFFF), Color(0xFF94A3B8), Color(0xFF475569)))
                                        EmojiMaterialStyle.NEON -> Brush.linearGradient(listOf(Color(0xFF06B6D4), Color(0xFF3B82F6)))
                                        EmojiMaterialStyle.SEAL -> Brush.linearGradient(listOf(Color(0xFFDC2626), Color(0xFF7F1D1D)))
                                        else -> Brush.linearGradient(listOf(Color(0xFF374151), Color(0xFF1F2937)))
                                    }
                                )
                                .border(
                                    2.dp,
                                    if (selectedMaterial == EmojiMaterialStyle.GOLD) Color(0xFFFEF08A) else Color(0xFFE2E8F0),
                                    CircleShape
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            if (mode == 0) {
                                Text(text = activeEmoji, fontSize = 34.sp)
                            } else {
                                Text(
                                    text = customText.ifBlank { "PEACE" },
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )
                            }
                        }

                        if (selectedDangleType != "none") {
                            Text(
                                text = when (selectedDangleType) {
                                    "tassel" -> "🔻 Silk Tassel"
                                    "bell" -> "🔔 Temple Bell"
                                    "crystal" -> "💎 Crystal"
                                    else -> "🪙 Golden Coin"
                                },
                                fontSize = 10.sp,
                                color = amber,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                }

                if (mode == 0) {
                    // Type any custom emoji
                    OutlinedTextField(
                        value = customEmojiInput,
                        onValueChange = { customEmojiInput = it },
                        label = { Text("Type ANY Emoji (from keyboard)") },
                        placeholder = { Text("e.g. 🐉, 🧿, 🪷, 🔮, ⚡") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = amber,
                            unfocusedBorderColor = Color(0xFF374151)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Emoji Palette
                    Text("Or Choose Quick Talisman", fontSize = 11.sp, color = Color(0xFF9CA3AF))
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(popularEmojis) { emoji ->
                            Surface(
                                shape = CircleShape,
                                color = if (selectedEmoji == emoji && customEmojiInput.isBlank()) amber.copy(alpha = 0.3f) else Color(0xFF262C36),
                                border = BorderStroke(1.dp, if (selectedEmoji == emoji) amber else Color.Transparent),
                                modifier = Modifier.clickable {
                                    selectedEmoji = emoji
                                    customEmojiInput = ""
                                }
                            ) {
                                Text(
                                    text = emoji,
                                    fontSize = 22.sp,
                                    modifier = Modifier.padding(6.dp)
                                )
                            }
                        }
                    }

                    // Material Finish Selector
                    Text("Medallion Material Finish", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        val materials = listOf(
                            EmojiMaterialStyle.GOLD to "Gold",
                            EmojiMaterialStyle.SILVER to "Silver",
                            EmojiMaterialStyle.NEON to "Neon",
                            EmojiMaterialStyle.SEAL to "Seal"
                        )
                        materials.forEach { (mat, label) ->
                            val isSel = selectedMaterial == mat
                            Button(
                                onClick = { selectedMaterial = mat },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isSel) amber else Color(0xFF262C36),
                                    contentColor = if (isSel) Color(0xFF18181B) else Color.White
                                ),
                                shape = RoundedCornerShape(6.dp),
                                contentPadding = PaddingValues(2.dp)
                            ) {
                                Text(label, fontSize = 11.sp)
                            }
                        }
                    }

                    // Shape Selector
                    Text("Container Geometry", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        val shapes = listOf(
                            CharmContainerShape.CIRCLE to "Circle",
                            CharmContainerShape.ROUNDED_RECT to "Plaque",
                            CharmContainerShape.OCTAGON to "Octagon"
                        )
                        shapes.forEach { (sh, label) ->
                            val isSel = selectedShape == sh
                            Button(
                                onClick = { selectedShape = sh },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isSel) amber else Color(0xFF262C36),
                                    contentColor = if (isSel) Color(0xFF18181B) else Color.White
                                ),
                                shape = RoundedCornerShape(6.dp),
                                contentPadding = PaddingValues(2.dp)
                            ) {
                                Text(label, fontSize = 11.sp)
                            }
                        }
                    }
                } else {
                    OutlinedTextField(
                        value = customText,
                        onValueChange = { if (it.length <= 8) customText = it.uppercase() },
                        label = { Text("Sigil Inscription (Max 8 letters)") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = amber,
                            unfocusedBorderColor = Color(0xFF374151)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Bottom Final Dangle Selector
                Text("Bottom Accent Chain", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    val dangles = listOf(
                        "tassel" to "Tassel",
                        "bell" to "Bell",
                        "crystal" to "Crystal",
                        "none" to "None"
                    )
                    dangles.forEach { (dtype, label) ->
                        val isSel = selectedDangleType == dtype
                        Button(
                            onClick = { selectedDangleType = dtype },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isSel) amber else Color(0xFF262C36),
                                contentColor = if (isSel) Color(0xFF18181B) else Color.White
                            ),
                            shape = RoundedCornerShape(6.dp),
                            contentPadding = PaddingValues(2.dp)
                        ) {
                            Text(label, fontSize = 11.sp)
                        }
                    }
                }

                OutlinedTextField(
                    value = charmName,
                    onValueChange = { charmName = it },
                    label = { Text("Talisman Name") },
                    placeholder = {
                        val activeEmoji = if (customEmojiInput.isNotBlank()) customEmojiInput else selectedEmoji
                        Text(if (mode == 0) "e.g. Celestial $activeEmoji" else "e.g. Mystic $customText")
                    },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = amber,
                        unfocusedBorderColor = Color(0xFF374151)
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                // Save Action
                Button(
                    onClick = {
                        val activeEmoji = if (customEmojiInput.isNotBlank()) customEmojiInput else selectedEmoji
                        val name = charmName.ifBlank {
                            if (mode == 0) "Custom $activeEmoji" else "Sigil $customText"
                        }
                        val componentChain = if (selectedDangleType != "none") {
                            ChainComponent(
                                connector = ChainConnector(type = "ring", colorHex = "#D4AF37", sizeDp = 6f),
                                afterComponents = listOf(
                                    CharmBead(id = "sub_bead", colorHex = "#DC2626", radiusDp = 3.5f, offsetDp = 8f)
                                ),
                                finalDangle = ChainFinalDangle(
                                    type = selectedDangleType,
                                    colorHex = if (selectedDangleType == "bell") "#D4AF37" else "#DC2626",
                                    lengthDp = 22f
                                )
                            )
                        } else null

                        val charm = Charm(
                            id = "custom_${UUID.randomUUID().toString().take(8)}",
                            name = name,
                            origin = "Handcrafted",
                            category = CharmCategory.CUSTOM,
                            type = if (mode == 0) CharmType.EMOJI else CharmType.TEXT,
                            description = charmDescription.ifBlank { "Personal handcrafted talisman" },
                            ritualText = "Touch to invoke blessings",
                            ritualKind = "custom",
                            cordColorHex = selectedCordColor,
                            emoji = if (mode == 0) activeEmoji else null,
                            text = if (mode == 1) customText else null,
                            accentColorHex = "#4F46E5",
                            secondaryColorHex = "#FBBF24",
                            emojiMaterial = selectedMaterial,
                            containerShape = selectedShape,
                            componentChain = componentChain
                        )
                        onSave(charm)
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = amber,
                        contentColor = Color(0xFF18181B)
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Add to Charm Library", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
