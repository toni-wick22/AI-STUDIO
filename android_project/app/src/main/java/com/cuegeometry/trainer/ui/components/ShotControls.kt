package com.cuegeometry.trainer.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.cuegeometry.trainer.viewmodel.ShotMode

@Composable
fun ShotControls(
    currentMode: ShotMode,
    onSelectMode: (ShotMode) -> Unit,
    threeLineMode: Boolean,
    onToggleThreeLine: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { onSelectMode(ShotMode.DIRECT) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (currentMode == ShotMode.DIRECT) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
                ),
                modifier = Modifier.weight(1f)
            ) {
                Text(text = "Direct")
            }

            Button(
                onClick = { onSelectMode(ShotMode.BANK_1_CUSHION) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (currentMode == ShotMode.BANK_1_CUSHION) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
                ),
                modifier = Modifier.weight(1f)
            ) {
                Text(text = "Bank")
            }

            Button(
                onClick = { onSelectMode(ShotMode.KICK) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (currentMode == ShotMode.KICK) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
                ),
                modifier = Modifier.weight(1f)
            ) {
                Text(text = "Kick")
            }
        }

        FilterChip(
            selected = threeLineMode,
            onClick = onToggleThreeLine,
            label = { Text(text = "3-Line Learning Mode") }
        )
    }
}
