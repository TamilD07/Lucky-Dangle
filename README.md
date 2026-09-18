# Screen Dangle — Android Screen Charm & Physics Overlay

> **Turn your screen into a tiny hanging world.**  
> A production-ready native Android application displaying customizable virtual charms hanging from the top bezel of your device, reacting to device motion, gravity, and touch with real-time pendulum physics.

---

## Architecture Overview

```
app/
├── src/
│   ├── main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/screendangle/app/
│   │   │   ├── ScreenDangleApp.kt           # Application class & NotificationChannel setup
│   │   │   ├── MainActivity.kt              # Jetpack Compose Edge-to-Edge Activity & Permission Launcher
│   │   │   ├── data/
│   │   │   │   ├── model/                   # Charm, PhysicsConfig, OverlaySettings models
│   │   │   │   ├── repository/              # Built-in charms & custom charms repository
│   │   │   │   └── preferences/             # Jetpack DataStore Preferences (100% offline)
│   │   │   ├── physics/
│   │   │   │   └── PendulumPhysicsEngine.kt # Numerical semi-implicit Euler & spring-damper physics
│   │   │   ├── sensors/
│   │   │   │   └── MotionSensorManager.kt   # Low-power Accelerometer & Gyroscope listener
│   │   │   ├── overlay/
│   │   │   │   ├── OverlayService.kt        # Foreground Service with WindowManager overlay
│   │   │   │   └── DangleOverlayView.kt     # Hardware-accelerated Canvas custom view
│   │   │   └── ui/
│   │   │       ├── theme/                   # Material 3 typography, color schemes, dynamic shape
│   │   │       └── screens/                 # HomeScreen, Library, Customizer, Position, Privacy
│   │   └── res/
│   │       ├── values/                      # strings.xml, colors.xml, themes.xml
│   │       └── drawable/                    # Vector charm & notification icons
│   └── test/
│       └── java/com/screendangle/app/
│           └── physics/
│               └── PendulumPhysicsEngineTest.kt # Physics stability & bounds unit tests
├── build.gradle.kts
├── settings.gradle.kts
└── proguard-rules.pro
```

---

## 1. How the Floating Overlay Works

Screen Dangle uses the Android windowing system to present a lightweight floating canvas above other applications:

- **Window Type**: `WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY` (Android 8.0+ / API 26+)
- **Flags**:
  - `FLAG_NOT_FOCUSABLE`: Ensures key events, soft keyboards, and navigation bars continue flowing undisturbed to background apps.
  - `FLAG_LAYOUT_IN_SCREEN` & `FLAG_LAYOUT_NO_LIMITS`: Allows the charm anchor mount to fasten seamlessly to the very top edge of the bezel above the status bar.
- **Touch Routing**: Touch events are isolated exclusively to the charm bob's bounding geometry. All touches outside the charm bob pass directly through to whatever app is active beneath it.

---

## 2. Required Permissions & Privacy Model

Screen Dangle is designed to adhere to the strictest security guidelines:

| Permission | Justification |
|---|---|
| `SYSTEM_ALERT_WINDOW` | **Essential**: Allows rendering the decorative charm over other applications. |
| `FOREGROUND_SERVICE` & `FOREGROUND_SERVICE_SPECIAL_USE` | **System Requirement**: Required by Android 14+ to keep the overlay and accelerometer alive while user is in other apps. |
| `POST_NOTIFICATIONS` | Displays a persistent, low-priority status notice with a 1-tap **"Turn Off"** button. |
| `RECEIVE_BOOT_COMPLETED` | (Optional) Automatically restores the overlay upon phone reboot if enabled by the user. |

### Strict Privacy Commitments:
* **ZERO Network Permissions**: `android.permission.INTERNET` is omitted entirely from `AndroidManifest.xml`.
* **NO Broad Storage Access**: Custom photo charms use Android’s modern Photo Picker (`ActivityResultContracts.PickVisualMedia`). Images are loaded directly into memory and downscaled locally.
* **NO Screen Recording or Inspection**: The overlay never reads, records, or intercepts screen pixels, notifications, or keystrokes.
* **NO Battery Drain when Stationary**: When device movement falls below the velocity epsilon threshold ($\varepsilon = 0.0025$), the physics loop enters a sleep state and sensor callbacks unregister, reducing CPU usage to 0%.

---

## 3. Physics Implementation

The simulation solves the second-order nonlinear differential equation for a damped pendulum under external inertial acceleration:

$$\frac{d^2\theta}{dt^2} = -\frac{g}{L}\sin(\theta) - \gamma\frac{d\theta}{dt} + \frac{a_x}{L}\cos(\theta)\cdot k_{\text{response}}$$

Where:
- $\theta$: Angular displacement from vertical downward
- $g$: Scaled gravitational constant
- $L$: Effective rope length (with dynamic spring stretch on touch drag)
- $\gamma$: Air resistance damping coefficient ($0.92 \le \gamma \le 0.999$)
- $a_x$: Lateral MEMS accelerometer reading ($m/s^2$)
- $k_{\text{response}}$: User-configured motion sensitivity multiplier

### Numerical Stability & Safeguards:
- Time-delta clamping: $0.001\text{s} \le \Delta t \le 0.033\text{s}$ prevents exploding step sizes.
- Hard angle clamping ($\pm 72^\circ$) prevents unnatural full $360^\circ$ loops or wrapping.
- Zero `NaN` or `Infinity` coordinates through active sanitization guards.

---

## 4. Google Play Compliance Checklist

- **SYSTEM_ALERT_WINDOW Disclosure**: The app features a dedicated educational prompt informing users:
  *"Screen Dangle needs permission to display your selected charm above other apps. It does not read, record, or control the content of other apps."*
- **No Ads in Overlay**: Zero advertisements or promotional elements are rendered within the overlay window.
- **Easy Dismissal**: A prominent notification action (`Turn Off`) enables immediate termination from anywhere in Android OS.
- **Defensive Revocation Handling**: If overlay permission is revoked in Android App Settings, the service gracefully catches `BadTokenException` and cleanly stops itself without crashing.

---

## 5. Build & Deployment Instructions

### Prerequisites
- Android Studio Hedgehog (2023.1.1) or newer
- JDK 17
- Android SDK 35 (compileSdk 35, minSdk 26)

### Run from Android Studio
1. Open Android Studio and select **Open**, navigating to the project directory.
2. Allow Gradle sync to download AndroidX and Jetpack Compose dependencies.
3. Connect an Android phone (or launch an emulator running API 26+).
4. Click **Run 'app'** (`Shift + F10`).
5. In the app, tap **Screen Dangle [ON]** and grant the overlay permission when prompted.

### Run via Command Line
```bash
# Debug APK
./gradlew assembleDebug

# Run Unit Tests
./gradlew testDebugUnitTest

# Release APK (minified with R8 ProGuard rules)
./gradlew assembleRelease
```
