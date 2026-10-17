package com.cuegeometry.trainer.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = GreenFelt,
    secondary = GhostCyan,
    tertiary = BallYellow,
    background = DarkBackground,
    surface = SurfaceDark
)

@Composable
fun CueGeometryTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography(),
        content = content
    )
}
