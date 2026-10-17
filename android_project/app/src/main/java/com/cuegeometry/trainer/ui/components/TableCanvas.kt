package com.cuegeometry.trainer.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.input.pointer.pointerInput
import com.cuegeometry.trainer.geometry.CueGeometryEngine
import com.cuegeometry.trainer.geometry.Vector2D
import com.cuegeometry.trainer.ui.theme.*
import com.cuegeometry.trainer.viewmodel.TrainerUiState

@Composable
fun TableCanvas(
    uiState: TrainerUiState,
    onMoveBall: (Int, Vector2D) -> Unit,
    modifier: Modifier = Modifier
) {
    var draggedBallId by remember { mutableStateOf<Int?>(null) }

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(2f / 1f)
            .pointerInput(Unit) {
                detectDragGestures(
                    onDragStart = { offset ->
                        val hit = uiState.balls.find { b ->
                            val dx = b.position.x - offset.x
                            val dy = b.position.y - offset.y
                            (dx * dx + dy * dy) <= (24f * 24f)
                        }
                        draggedBallId = hit?.id
                    },
                    onDrag = { change, dragAmount ->
                        change.consume()
                        draggedBallId?.let { id ->
                            val current = uiState.balls.find { it.id == id }?.position ?: return@let
                            onMoveBall(id, current + Vector2D(dragAmount.x, dragAmount.y))
                        }
                    },
                    onDragEnd = { draggedBallId = null },
                    onDragCancel = { draggedBallId = null }
                )
            }
    ) {
        // 1. Table Border & Cloth
        drawRect(color = RailMahogany)
        drawRect(
            color = GreenFelt,
            topLeft = Offset(CueGeometryEngine.CUSHION_WIDTH, CueGeometryEngine.CUSHION_WIDTH),
            size = androidx.compose.ui.geometry.Size(
                CueGeometryEngine.TABLE_WIDTH - 2 * CueGeometryEngine.CUSHION_WIDTH,
                CueGeometryEngine.TABLE_HEIGHT - 2 * CueGeometryEngine.CUSHION_WIDTH
            )
        )

        // 2. Six Pockets
        CueGeometryEngine.STANDARD_POCKETS.forEach { pocket ->
            drawCircle(
                color = Color.Black,
                radius = pocket.dropRadius,
                center = Offset(pocket.position.x, pocket.position.y)
            )
        }

        // 3. Aim Line (Cue to Ghost)
        val cue = uiState.balls.find { it.id == uiState.cueBallId }?.position ?: Vector2D(0f, 0f)
        drawLine(
            color = if (uiState.isBlocked) WarningRed else CueWhite,
            start = Offset(cue.x, cue.y),
            end = Offset(uiState.ghostBallPos.x, uiState.ghostBallPos.y),
            strokeWidth = 3f
        )

        // 4. Target Line (Target to Pocket)
        val target = uiState.balls.find { it.id == uiState.targetBallId }?.position ?: Vector2D(0f, 0f)
        drawLine(
            color = BallYellow,
            start = Offset(target.x, target.y),
            end = Offset(uiState.targetPocket.position.x, uiState.targetPocket.position.y),
            strokeWidth = 3f
        )

        // 5. 90-Degree Stun Tangent Line
        if (uiState.showTangentLine || uiState.threeLineMode) {
            val (perp, end) = CueGeometryEngine.calculateTangentLine(cue, uiState.ghostBallPos, target.position)
            drawLine(
                color = TangentCyan,
                start = Offset(uiState.ghostBallPos.x, uiState.ghostBallPos.y),
                end = Offset(end.x, end.y),
                strokeWidth = 3f,
                pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f)
            )
        }

        // 6. Ghost Ball Hologram
        drawCircle(
            color = GhostCyan.copy(alpha = 0.5f),
            radius = CueGeometryEngine.BALL_RADIUS,
            center = Offset(uiState.ghostBallPos.x, uiState.ghostBallPos.y)
        )

        // 7. Render Physical Balls
        uiState.balls.forEach { ball ->
            drawCircle(
                color = if (ball.isCue) CueWhite else BallYellow,
                radius = CueGeometryEngine.BALL_RADIUS,
                center = Offset(ball.position.x, ball.position.y)
            )
        }
    }
}
