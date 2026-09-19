package com.example.logisyncpro.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val LogiSyncColorScheme = darkColorScheme(
    primary = EmeraldPrimary,
    onPrimary = ObsidianDeep,
    primaryContainer = ObsidianSurfaceElevated,
    onPrimaryContainer = EmeraldLight,
    secondary = SafetyOrange,
    onSecondary = TextPrimary,
    background = ObsidianDeep,
    onBackground = TextPrimary,
    surface = ObsidianCard,
    onSurface = TextPrimary,
    surfaceVariant = ObsidianSurfaceElevated,
    onSurfaceVariant = TextMuted,
    outline = ObsidianCardBorder
)

@Composable
fun LogiSyncPROTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LogiSyncColorScheme,
        typography = Typography,
        content = content
    )
}
