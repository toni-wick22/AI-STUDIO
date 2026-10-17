package com.cuegeometry.trainer.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.cuegeometry.trainer.ui.components.GeometryHud
import com.cuegeometry.trainer.ui.components.ShotControls
import com.cuegeometry.trainer.ui.components.TableCanvas
import com.cuegeometry.trainer.viewmodel.CueTrainerViewModel
import com.cuegeometry.trainer.viewmodel.TrainerUiState

@Composable
fun SimulatorScreen(
    viewModel: CueTrainerViewModel,
    uiState: TrainerUiState,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        TableCanvas(
            uiState = uiState,
            onMoveBall = { id, pos -> viewModel.moveBall(id, pos) }
        )

        GeometryHud(uiState = uiState)

        ShotControls(
            currentMode = uiState.shotMode,
            onSelectMode = { viewModel.setShotMode(it) },
            threeLineMode = uiState.threeLineMode,
            onToggleThreeLine = { viewModel.toggleThreeLineMode() }
        )
    }
}
