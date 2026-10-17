package com.cuegeometry.trainer.geometry

data class Ball(
    val id: Int,
    val position: Vector2D,
    val isCue: Boolean = false
)

data class Pocket(
    val id: String,
    val name: String,
    val position: Vector2D,
    val dropRadius: Float = 28f
)
