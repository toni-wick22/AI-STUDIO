package com.cuegeometry.trainer.geometry

import kotlin.math.sqrt

data class Vector2D(val x: Float, val y: Float) {
    operator fun plus(other: Vector2D) = Vector2D(x + other.x, y + other.y)
    operator fun minus(other: Vector2D) = Vector2D(x - other.x, y - other.y)
    operator fun times(scale: Float) = Vector2D(x * scale, y * scale)

    fun dot(other: Vector2D): Float = x * other.x + y * other.y
    fun cross2D(other: Vector2D): Float = x * other.y - y * other.x
    fun lengthSq(): Float = x * x + y * y
    fun length(): Float = sqrt(lengthSq())

    fun normalize(): Vector2D {
        val len = length()
        return if (len == 0f) Vector2D(0f, 0f) else Vector2D(x / len, y / len)
    }

    fun reflect(normal: Vector2D): Vector2D {
        val n = normal.normalize()
        val d = dot(n)
        return Vector2D(x - 2f * d * n.x, y - 2f * d * n.y)
    }
}
