# Screen Dangle R8 / ProGuard Optimization Rules
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
