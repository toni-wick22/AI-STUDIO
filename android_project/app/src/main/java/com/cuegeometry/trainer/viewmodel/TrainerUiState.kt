package com.cuegeometry.trainer.viewmodel

import com.cuegeometry.trainer.geometry.*

enum class ShotMode { DIRECT, BANK_1_CUSHION, BANK_2_CUSHION, KICK }

data class TrainerUiState(
    val balls: List<Ball> = listOf(
        Ball(0, Vector2D(250f, 250f), isCue = true),
        Ball(1, Vector2D(650f, 250f)),
        Ball(2, Vector2D(678f, 236f)),
        Ball(3, Vector2D(678f, 264f)),
        Ball(8, Vector2D(706f, 250f))
    ),
    val cueBallId: Int = 0,
    val targetBallId: Int = 1,
    val targetPocket: Pocket = CueGeometryEngine.STANDARD_POCKETS[2], // Top-Right Corner
    val shotMode: ShotMode = ShotMode.DIRECT,
    val ghostBallPos: Vector2D = Vector2D(0f, 0f),
    val cutAngleDeg: Float = 0f,
    val fractionLabel: String = "Full Ball",
    val isBlocked: Boolean = false,
    val blockedByBallId: Int? = null,
    val showTangentLine: Boolean = true,
    val threeLineMode: Boolean = false,
    val hasAiConsent: Boolean = false
)
