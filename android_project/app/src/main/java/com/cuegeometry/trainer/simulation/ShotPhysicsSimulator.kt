package com.cuegeometry.trainer.simulation

import com.cuegeometry.trainer.geometry.Vector2D

data class SimulationFrame(
    val cuePos: Vector2D,
    val targetPos: Vector2D,
    val progress: Float
)

class ShotPhysicsSimulator {
    fun calculateShotFrame(
        cueStart: Vector2D,
        ghostPos: Vector2D,
        targetStart: Vector2D,
        targetDest: Vector2D,
        tangentEnd: Vector2D,
        progress: Float
    ): SimulationFrame {
        val clampedProgress = progress.coerceIn(0f, 1f)
        return if (clampedProgress <= 0.45f) {
            val p = clampedProgress / 0.45f
            val cue = cueStart + (ghostPos - cueStart) * p
            SimulationFrame(cue, targetStart, clampedProgress)
        } else {
            val p = (clampedProgress - 0.45f) / 0.55f
            val cue = ghostPos + (tangentEnd - ghostPos) * (p * 0.75f)
            val target = targetStart + (targetDest - targetStart) * p
            SimulationFrame(cue, target, clampedProgress)
        }
    }
}
