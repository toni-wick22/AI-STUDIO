package com.cuegeometry.trainer.viewmodel

import androidx.lifecycle.ViewModel
import com.cuegeometry.trainer.geometry.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class CueTrainerViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(TrainerUiState())
    val uiState: StateFlow<TrainerUiState> = _uiState.asStateFlow()

    init {
        recalculateGeometry()
    }

    fun moveBall(ballId: Int, newPos: Vector2D) {
        val clamped = CueGeometryEngine.clampPosition(newPos)
        _uiState.update { state ->
            state.copy(balls = state.balls.map { b ->
                if (b.id == ballId) b.copy(position = clamped) else b
            })
        }
        recalculateGeometry()
    }

    fun setTargetBall(ballId: Int) {
        if (ballId == _uiState.value.cueBallId) return
        _uiState.update { it.copy(targetBallId = ballId) }
        recalculateGeometry()
    }

    fun setTargetPocket(pocket: Pocket) {
        _uiState.update { it.copy(targetPocket = pocket) }
        recalculateGeometry()
    }

    fun setShotMode(mode: ShotMode) {
        _uiState.update { it.copy(shotMode = mode) }
        recalculateGeometry()
    }

    fun toggleThreeLineMode() {
        _uiState.update { it.copy(threeLineMode = !it.threeLineMode) }
    }

    fun grantAiConsent() {
        _uiState.update { it.copy(hasAiConsent = true) }
    }

    fun revokeAiConsent() {
        _uiState.update { it.copy(hasAiConsent = false) }
    }

    fun purgeLocalData() {
        _uiState.update {
            TrainerUiState()
        }
        recalculateGeometry()
    }

    private fun recalculateGeometry() {
        val state = _uiState.value
        val cue = state.balls.find { it.id == state.cueBallId } ?: return
        val target = state.balls.find { it.id == state.targetBallId } ?: return

        var destination = state.targetPocket.position
        if (state.shotMode == ShotMode.BANK_1_CUSHION) {
            val bankPoint = CueGeometryEngine.calculateOneCushionBank(target.position, state.targetPocket.position)
            if (bankPoint != null) {
                destination = bankPoint
            }
        }

        val ghost = CueGeometryEngine.calculateGhostBall(target.position, destination)
        val cutAngle = CueGeometryEngine.calculateCutAngle(cue.position, ghost, target.position)

        val fraction = when {
            cutAngle <= 4f -> "Full Ball (1.0)"
            cutAngle <= 20f -> "3/4 Ball (~0.75)"
            cutAngle <= 35f -> "Half Ball (0.50 - 30°)"
            cutAngle <= 55f -> "Quarter Ball (~0.25)"
            else -> "Thin Cut (<0.10)"
        }

        var blocked = false
        var blockedId: Int? = null

        for (ball in state.balls) {
            if (ball.id == cue.id || ball.id == target.id) continue
            if (CueGeometryEngine.isPathObstructed(cue.position, ghost, ball.position)) {
                blocked = true
                blockedId = ball.id
                break
            }
            if (CueGeometryEngine.isPathObstructed(target.position, destination, ball.position)) {
                blocked = true
                blockedId = ball.id
                break
            }
        }

        _uiState.update {
            it.copy(
                ghostBallPos = ghost,
                cutAngleDeg = cutAngle,
                fractionLabel = fraction,
                isBlocked = blocked,
                blockedByBallId = blockedId
            )
        }
    }
}
