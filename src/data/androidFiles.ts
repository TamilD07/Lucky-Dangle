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
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
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
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.screendangle.app.ui.ScreenDangleScreen

class MainActivity : ComponentActivity() {

    private var hasOverlayPermission by mutableStateOf(false)

    private val overlayPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        hasOverlayPermission = checkOverlayPermission()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        hasOverlayPermission = checkOverlayPermission()

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF0D0F12),
                    surface = Color(0xFF181C22),
                    primary = Color(0xFFF59E0B)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    ScreenDangleScreen(
                        hasOverlayPermission = hasOverlayPermission,
                        onRequestOverlayPermission = { requestOverlayPermission() }
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        hasOverlayPermission = checkOverlayPermission()
    }

    fun checkOverlayPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(this)
        } else {
            true
        }
    }

    fun requestOverlayPermission() {
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
    path: 'app/src/main/java/com/screendangle/app/ui/ScreenDangleScreen.kt',
    category: 'kotlin_ui',
    content: `package com.screendangle.app.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Security
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

    var previewTilt by remember { mutableFloatStateOf(0f) }
    val animatedAngle by animateFloatAsState(
        targetValue = previewTilt,
        animationSpec = spring(dampingRatio = 0.35f, stiffness = 120f),
        label = "previewSwing"
    )

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
                    horizontalAlignment = Alignment.CenterVertically
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
                        Box(
                            modifier = Modifier
                                .width(70.dp)
                                .height(6.dp)
                                .clip(RoundedCornerShape(bottomStart = 4.dp, bottomEnd = 4.dp))
                                .background(Color(0xFF2D3748))
                        )

                        Column(
                            horizontalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .offset(y = 4.dp)
                                .rotate(animatedAngle)
                        ) {
                            Box(
                                modifier = Modifier
                                    .width(2.dp)
                                    .height((settings.ropeLength * 0.45f).coerceIn(40f, 90f).dp)
                                    .background(amber)
                            )
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

                        Text(
                            text = "\${selectedCharm.name} (\${selectedCharm.origin})",
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
                                horizontalAlignment = Alignment.CenterVertically
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

                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Cord Length", fontSize = 13.sp, color = Color.White)
                            Text(
                                text = "\${settings.ropeLength.roundToInt()} dp",
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

                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Charm Size", fontSize = 13.sp, color = Color.White)
                            Text(
                                text = "\${settings.charmSize} dp",
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
    val ropeLength: Float
        get() = currentLengthPx

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
                return@launch
            }

            preferences.settingsFlow.collect { updatedSettings ->
                overlayView?.applySettings(updatedSettings)
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
  },
  {
    path: 'app/src/main/java/com/screendangle/app/receiver/BootCompletedReceiver.kt',
    category: 'kotlin_core',
    content: `package com.screendangle.app.receiver

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
`
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    category: 'config',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.11.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    category: 'resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Screen Dangle</string>
    <string name="notification_channel_name">Screen Dangle Active</string>
    <string name="notification_channel_description">Shows status notification when virtual charm overlay is active above apps.</string>
    <string name="notification_title">Screen Dangle is active</string>
    <string name="notification_text">Your screen charm is hanging peacefully from the top bezel.</string>
    <string name="action_turn_off">Turn Off</string>
    <string name="permission_overlay_explanation">Screen Dangle needs permission to display your selected charm above other apps. It does not read, record, or control the content of other apps.</string>
</resources>
`
  },
  {
    path: 'app/src/main/res/values/colors.xml',
    category: 'resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#F59E0B</color>
    <color name="primary_dark">#D97706</color>
    <color name="background">#0F0F0F</color>
    <color name="surface">#1A1A1A</color>
    <color name="text_primary">#F5F5F5</color>
    <color name="text_secondary">#A3A3A3</color>
</resources>
`
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    category: 'resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.ScreenDangle" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>
`
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_background.xml',
    category: 'resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#171717"
        android:pathData="M0,0h108v108h-108z" />
    <path
        android:fillColor="#262626"
        android:pathData="M54,18 A36,36 0 1,0 54,90 A36,36 0 1,0 54,18" />
</vector>
`
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
    category: 'resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:strokeColor="#F59E0B"
        android:strokeWidth="2.5"
        android:strokeLineCap="round"
        android:pathData="M54,18 L54,42" />
    <path
        android:fillColor="#F59E0B"
        android:pathData="M54,42m-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0" />
    <path
        android:fillColor="#1D4ED8"
        android:pathData="M54,64m-22,0a22,22 0 1,0 44,0a22,22 0 1,0 -44,0" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M54,64m-15,0a15,15 0 1,0 30,0a15,15 0 1,0 -30,0" />
    <path
        android:fillColor="#38BDF8"
        android:pathData="M54,64m-9,0a9,9 0 1,0 18,0a9,9 0 1,0 -18,0" />
    <path
        android:fillColor="#0F172A"
        android:pathData="M54,64m-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M52,62m-1.5,0a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" />
</vector>
`
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    category: 'resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
    category: 'resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
  }
];
