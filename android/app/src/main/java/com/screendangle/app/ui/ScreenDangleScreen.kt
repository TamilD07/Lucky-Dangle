package com.screendangle.app.ui

import android.content.Context
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.screendangle.app.R
import com.screendangle.app.data.model.Charm
import com.screendangle.app.data.model.CharmCatalog
import com.screendangle.app.data.model.DangleSettingsModel
import com.screendangle.app.data.preferences.DanglePreferences
import com.screendangle.app.overlay.OverlayService
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScreenDangleScreen(
    hasOverlayPermission: Boolean,
    onRequestOverlayPermission: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val preferences = remember { DanglePreferences(context) }
    val settings by preferences.settingsFlow.collectAsState(initial = DangleSettingsModel())

    val selectedCharm = remember(settings.selectedCharmId) {
        CharmCatalog.getCharmById(settings.selectedCharmId)
    }

    // Local preview swing angle
    var previewTilt by remember { mutableFloatStateOf(0f) }
    val animatedAngle by animateFloatAsState(
        targetValue = previewTilt,
        animationSpec = spring(dampingRatio = 0.35f, stiffness = 120f),
        label = "previewSwing"
    )

    // Reset tilt back to center after tap
    LaunchedEffect(previewTilt) {
        if (previewTilt != 0f) {
            kotlinx.coroutines.delay(600)
            previewTilt = 0f
        }
    }

    val amber = Color(0xFFF59E0B)
    val darkBg = Color(0xFF0D0F12)
    val cardBg = Color(0xFF181C22)
    val cardBorder = Color(0xFF262C36)

    Scaffold(
        containerColor = darkBg,
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(amber.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_launcher_foreground),
                                contentDescription = null,
                                tint = amber,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Screen Dangle",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "Bezel-hanging virtual charms",
                                fontSize = 12.sp,
                                color = Color(0xFF9CA3AF)
                            )
                        }
                    }
                },
                actions = {
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = if (settings.isEnabled && hasOverlayPermission) Color(0xFF065F46) else Color(0xFF374151)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (settings.isEnabled && hasOverlayPermission) Color(0xFF34D399) else Color(0xFF9CA3AF)
                                    )
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (settings.isEnabled && hasOverlayPermission) "ACTIVE" else "IDLE",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (settings.isEnabled && hasOverlayPermission) Color(0xFFA7F3D0) else Color(0xFFD1D5DB)
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = darkBg
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Permission Alert Banner
            if (!hasOverlayPermission) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF362005)),
                    border = BorderStroke(1.dp, Color(0xFFB45309)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = Color(0xFFFBBF24),
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Display Permission Required",
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFFEF3C7),
                                fontSize = 15.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "To allow your charm to dangle from the top bezel while you use any app or game, grant 'Display over other apps'.",
                            color = Color(0xFFFDE68A),
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = onRequestOverlayPermission,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFFF59E0B),
                                contentColor = Color(0xFF18181B)
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Grant Permission", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }

            // Master Toggle Card
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = cardBg),
                border = BorderStroke(1.dp, if (settings.isEnabled) amber.copy(alpha = 0.5f) else cardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Dangle on Screen",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(3.dp))
                        Text(
                            text = if (settings.isEnabled)
                                "Charm is currently hanging from top bezel"
                            else
                                "Turn on to show charm over apps",
                            fontSize = 13.sp,
                            color = Color(0xFF9CA3AF)
                        )
                    }

                    Switch(
                        checked = settings.isEnabled,
                        onCheckedChange = { enable ->
                            if (enable && !hasOverlayPermission) {
                                onRequestOverlayPermission()
                            } else {
                                scope.launch {
                                    preferences.setEnabled(enable)
                                    if (enable) {
                                        OverlayService.start(context)
                                    } else {
                                        OverlayService.stop(context)
                                    }
                                }
                            }
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color(0xFF18181B),
                            checkedTrackColor = amber,
                            uncheckedThumbColor = Color(0xFF9CA3AF),
                            uncheckedTrackColor = Color(0xFF374151)
                        )
                    )
                }
            }

            // Interactive Live Preview Stage
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = cardBg),
                border = BorderStroke(1.dp, cardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Interactive Preview",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                        Text(
                            text = "Tap to swing",
                            fontSize = 12.sp,
                            color = amber
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Hanging Bezel Canvas Mockup
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(
                                Brush.verticalGradient(
                                    listOf(Color(0xFF0F1217), Color(0xFF161B22))
                                )
                            )
                            .clickable {
                                previewTilt = if (previewTilt <= 0f) 28f else -28f
                            },
                        contentAlignment = Alignment.TopCenter
                    ) {
                        // Phone bezel / speaker notch simulator
                        Box(
                            modifier = Modifier
                                .width(70.dp)
                                .height(6.dp)
                                .clip(RoundedCornerShape(bottomStart = 4.dp, bottomEnd = 4.dp))
                                .background(Color(0xFF2D3748))
                        )

                        // Hanging assembly with rotation
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier
                                .offset(y = 4.dp)
                                .rotate(animatedAngle)
                        ) {
                            // Cord
                            Box(
                                modifier = Modifier
                                    .width(2.dp)
                                    .height((settings.ropeLength * 0.45f).coerceIn(40f, 90f).dp)
                                    .background(amber)
                            )
                            // Charm Image
                            selectedCharm.drawableResId?.let { resId ->
                                Image(
                                    painter = painterResource(id = resId),
                                    contentDescription = selectedCharm.name,
                                    modifier = Modifier
                                        .size(52.dp)
                                        .clip(CircleShape),
                                    contentScale = ContentScale.Fit
                                )
                            }
                        }

                        // Bottom status text
                        Text(
                            text = "${selectedCharm.name} (${selectedCharm.origin})",
                            fontSize = 11.sp,
                            color = Color(0xFF9CA3AF),
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(bottom = 8.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        OutlinedButton(
                            onClick = { previewTilt = -35f },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            border = BorderStroke(1.dp, Color(0xFF374151))
                        ) {
                            Text("← Nudge Left", fontSize = 12.sp)
                        }

                        OutlinedButton(
                            onClick = { previewTilt = 35f },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            border = BorderStroke(1.dp, Color(0xFF374151))
                        ) {
                            Text("Nudge Right →", fontSize = 12.sp)
                        }
                    }
                }
            }

            // Charm Catalog Selection
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Select Screen Charm",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(horizontal = 4.dp)
                )
                Spacer(modifier = Modifier.height(10.dp))

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(horizontal = 4.dp)
                ) {
                    items(CharmCatalog.BUILT_IN_CHARMS) { charm ->
                        val isSelected = charm.id == settings.selectedCharmId
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
                                .width(125.dp)
                                .clickable {
                                    scope.launch {
                                        preferences.setSelectedCharmId(charm.id)
                                    }
                                }
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(54.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFF0F1217)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    charm.drawableResId?.let { resId ->
                                        Image(
                                            painter = painterResource(id = resId),
                                            contentDescription = charm.name,
                                            modifier = Modifier.size(46.dp),
                                            contentScale = ContentScale.Fit
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = charm.name,
                                    fontSize = 12.sp,
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

                                Spacer(modifier = Modifier.height(6.dp))

                                if (isSelected) {
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = amber.copy(alpha = 0.25f)
                                    ) {
                                        Text(
                                            text = "Selected",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = amber,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                } else {
                                    Spacer(modifier = Modifier.height(15.dp))
                                }
                            }
                        }
                    }
                }
            }

            // Physics & Customization
            Card(
                shape = RoundedCornerShape(18.dp),
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
                    Text(
                        text = "Position & Physics",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    // Horizontal Position
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Top Bezel Position", fontSize = 13.sp, color = Color.White)
                            Text(
                                text = when {
                                    settings.horizontalPercent < 0.35f -> "Left Side"
                                    settings.horizontalPercent > 0.65f -> "Right Side"
                                    else -> "Center Notch"
                                },
                                fontSize = 12.sp,
                                color = amber,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        Slider(
                            value = settings.horizontalPercent,
                            onValueChange = { newVal ->
                                scope.launch { preferences.setHorizontalPercent(newVal) }
                            },
                            valueRange = 0.15f..0.85f,
                            colors = SliderDefaults.colors(
                                thumbColor = amber,
                                activeTrackColor = amber,
                                inactiveTrackColor = Color(0xFF374151)
                            )
                        )
                    }

                    // Rope Length
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Cord Length", fontSize = 13.sp, color = Color.White)
                            Text(
                                text = "${settings.ropeLength.roundToInt()} dp",
                                fontSize = 12.sp,
                                color = amber,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        Slider(
                            value = settings.ropeLength,
                            onValueChange = { newVal ->
                                scope.launch { preferences.setRopeLength(newVal) }
                            },
                            valueRange = 80f..220f,
                            colors = SliderDefaults.colors(
                                thumbColor = amber,
                                activeTrackColor = amber,
                                inactiveTrackColor = Color(0xFF374151)
                            )
                        )
                    }

                    // Charm Size
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Charm Size", fontSize = 13.sp, color = Color.White)
                            Text(
                                text = "${settings.charmSize} dp",
                                fontSize = 12.sp,
                                color = amber,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        Slider(
                            value = settings.charmSize.toFloat(),
                            onValueChange = { newVal ->
                                scope.launch { preferences.setCharmSize(newVal.roundToInt()) }
                            },
                            valueRange = 40f..80f,
                            colors = SliderDefaults.colors(
                                thumbColor = amber,
                                activeTrackColor = amber,
                                inactiveTrackColor = Color(0xFF374151)
                            )
                        )
                    }

                    // Swing Intensity
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Swing Response", fontSize = 13.sp, color = Color.White)
                            Text(
                                text = "%.1fx".format(settings.swingIntensity),
                                fontSize = 12.sp,
                                color = amber,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        Slider(
                            value = settings.swingIntensity,
                            onValueChange = { newVal ->
                                scope.launch { preferences.setSwingIntensity(newVal) }
                            },
                            valueRange = 0.5f..2.5f,
                            colors = SliderDefaults.colors(
                                thumbColor = amber,
                                activeTrackColor = amber,
                                inactiveTrackColor = Color(0xFF374151)
                            )
                        )
                    }

                    // Reduce Motion Toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Gentle Motion Mode", fontSize = 14.sp, color = Color.White)
                            Text(
                                "Dampens swing speed for minimal distractions",
                                fontSize = 12.sp,
                                color = Color(0xFF9CA3AF)
                            )
                        }
                        Switch(
                            checked = settings.reduceMotion,
                            onCheckedChange = { reduce ->
                                scope.launch { preferences.setReduceMotion(reduce) }
                            },
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

            // Privacy & Offline Footer
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Security,
                    contentDescription = null,
                    tint = Color(0xFF9CA3AF),
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "100% Offline • Zero internet permissions • Privacy first",
                    fontSize = 11.sp,
                    color = Color(0xFF9CA3AF)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
