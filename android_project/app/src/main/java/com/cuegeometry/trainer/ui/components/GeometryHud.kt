package com.cuegeometry.trainer.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cuegeometry.trainer.ui.theme.GhostCyan
import com.cuegeometry.trainer.ui.theme.SurfaceDark
import com.cuegeometry.trainer.ui.theme.WarningRed
import com.cuegeometry.trainer.viewmodel.TrainerUiState

@Composable
fun GeometryHud(uiState: TrainerUiState, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(text = "Cut Angle", fontSize = 12.sp, color = Color.Gray)
                    Text(
                        text = "%.1f°".format(uiState.cutAngleDeg),
                        fontSize = 24.sp,
                        color = Color.White
                    )
                }
                Column {
                    Text(text = "Ball Overlap", fontSize = 12.sp, color = Color.Gray)
                    Text(
                        text = uiState.fractionLabel,
                        fontSize = 16.sp,
                        color = GhostCyan
                    )
                }
            }

            if (uiState.isBlocked) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Lane Blocked by Ball #${uiState.blockedByBallId}",
                    color = WarningRed,
                    fontSize = 12.sp
                )
            }
        }
    }
}
