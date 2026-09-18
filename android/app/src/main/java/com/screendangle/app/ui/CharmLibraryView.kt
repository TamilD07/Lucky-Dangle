package com.screendangle.app.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.screendangle.app.data.model.Charm
import com.screendangle.app.data.model.CharmCatalog
import com.screendangle.app.data.model.CharmCategory
import com.screendangle.app.data.model.CharmType
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
    var viewingCharmDetail by remember { mutableStateOf<Charm?>(null) }

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
                    text = "${allCharms.size} charms available",
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
                Text("Custom Charm", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
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
                                        fontSize = 30.sp
                                    )
                                }
                                CharmType.TEXT -> {
                                    Box(
                                        modifier = Modifier
                                            .size(46.dp)
                                            .clip(CircleShape)
                                            .background(Color(0xFF4F46E5))
                                            .border(1.5.dp, amber, CircleShape),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = charm.text ?: "LUCK",
                                            color = Color.White,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp,
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }
                                else -> {
                                    charm.drawableResId?.let { resId ->
                                        Image(
                                            painter = painterResource(id = resId),
                                            contentDescription = charm.name,
                                            modifier = Modifier.size(46.dp),
                                            contentScale = ContentScale.Fit
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = charm.name,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White,
                            maxLines = 1,
                            textAlign = TextAlign.Center
                        )

                        Text(
                            text = charm.origin,
                            fontSize = 10.sp,
                            color = amber,
                            maxLines = 1,
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (isSelected) {
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = amber.copy(alpha = 0.25f)
                                ) {
                                    Text(
                                        text = "Active",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = amber,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                    )
                                }
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
    var isEmojiMode by remember { mutableStateOf(true) }
    var selectedEmoji by remember { mutableStateOf("🧿") }
    var customText by remember { mutableStateOf("ZEN") }
    var charmName by remember { mutableStateOf("") }
    var charmDescription by remember { mutableStateOf("") }
    var selectedCordColor by remember { mutableStateOf("#D4AF37") }

    val amber = Color(0xFFF59E0B)
    val darkCard = Color(0xFF181C22)

    val popularEmojis = listOf("🧿", "🌸", "🍀", "🐱", "💎", "🌙", "⛩️", "🔔", "🎋", "🦊", "🌟", "🪷", "🧧", "✨")
    val cordColors = listOf("#D4AF37", "#DC2626", "#1E293B", "#D97706", "#2563EB", "#9333EA")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = darkCard),
            border = BorderStroke(1.dp, Color(0xFF374151)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Craft Custom Charm",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color(0xFF9CA3AF)
                        )
                    }
                }

                // Type selector
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { isEmojiMode = true },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isEmojiMode) amber else Color(0xFF262C36),
                            contentColor = if (isEmojiMode) Color(0xFF18181B) else Color.White
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Emoji Icon", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    Button(
                        onClick = { isEmojiMode = false },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (!isEmojiMode) amber else Color(0xFF262C36),
                            contentColor = if (!isEmojiMode) Color(0xFF18181B) else Color.White
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Sigil / Text", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }

                // Visual Preview Box
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(90.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF0F1217)),
                    contentAlignment = Alignment.Center
                ) {
                    if (isEmojiMode) {
                        Text(text = selectedEmoji, fontSize = 44.sp)
                    } else {
                        Box(
                            modifier = Modifier
                                .size(58.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF4F46E5))
                                .border(2.dp, amber, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = customText.ifBlank { "SIGIL" },
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }

                if (isEmojiMode) {
                    Text("Select Emoji Talisman", fontSize = 12.sp, color = Color(0xFFD1D5DB))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        popularEmojis.take(7).forEach { emoji ->
                            Text(
                                text = emoji,
                                fontSize = 22.sp,
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .clickable { selectedEmoji = emoji }
                                    .padding(4.dp)
                            )
                        }
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        popularEmojis.drop(7).forEach { emoji ->
                            Text(
                                text = emoji,
                                fontSize = 22.sp,
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .clickable { selectedEmoji = emoji }
                                    .padding(4.dp)
                            )
                        }
                    }
                } else {
                    OutlinedTextField(
                        value = customText,
                        onValueChange = { if (it.length <= 6) customText = it.uppercase() },
                        label = { Text("Sigil Text (Max 6 letters)") },
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

                OutlinedTextField(
                    value = charmName,
                    onValueChange = { charmName = it },
                    label = { Text("Charm Name") },
                    placeholder = { Text(if (isEmojiMode) "e.g. Mystic Eye" else "e.g. Zen Sigil") },
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
                        val name = charmName.ifBlank {
                            if (isEmojiMode) "Custom $selectedEmoji" else "Sigil $customText"
                        }
                        val charm = Charm(
                            id = "custom_${UUID.randomUUID().toString().take(8)}",
                            name = name,
                            origin = "Handcrafted",
                            category = CharmCategory.CUSTOM,
                            type = if (isEmojiMode) CharmType.EMOJI else CharmType.TEXT,
                            description = charmDescription.ifBlank { "Personal handcrafted talisman" },
                            ritualText = "Touch to invoke blessings",
                            ritualKind = "custom",
                            cordColorHex = selectedCordColor,
                            emoji = if (isEmojiMode) selectedEmoji else null,
                            text = if (!isEmojiMode) customText else null,
                            accentColorHex = "#4F46E5",
                            secondaryColorHex = "#FBBF24"
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
