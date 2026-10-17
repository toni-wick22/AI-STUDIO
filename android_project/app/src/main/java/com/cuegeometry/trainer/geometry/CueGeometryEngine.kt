package com.cuegeometry.trainer.geometry

import kotlin.math.*

object CueGeometryEngine {
    const val BALL_RADIUS = 14f
    const val TABLE_WIDTH = 1000f
    const val TABLE_HEIGHT = 500f
    const val CUSHION_WIDTH = 40f

    val PLAYABLE_MIN_X = CUSHION_WIDTH + BALL_RADIUS
    val PLAYABLE_MAX_X = TABLE_WIDTH - CUSHION_WIDTH - BALL_RADIUS
    val PLAYABLE_MIN_Y = CUSHION_WIDTH + BALL_RADIUS
    val PLAYABLE_MAX_Y = TABLE_HEIGHT - CUSHION_WIDTH - BALL_RADIUS

    val STANDARD_POCKETS = listOf(
        Pocket("tl", "Top-Left", Vector2D(CUSHION_WIDTH, CUSHION_WIDTH)),
        Pocket("tm", "Top-Side", Vector2D(TABLE_WIDTH / 2f, CUSHION_WIDTH - 4f)),
        Pocket("tr", "Top-Right", Vector2D(TABLE_WIDTH - CUSHION_WIDTH, CUSHION_WIDTH)),
        Pocket("bl", "Bottom-Left", Vector2D(CUSHION_WIDTH, TABLE_HEIGHT - CUSHION_WIDTH)),
        Pocket("bm", "Bottom-Side", Vector2D(TABLE_WIDTH / 2f, TABLE_HEIGHT - CUSHION_WIDTH + 4f)),
        Pocket("br", "Bottom-Right", Vector2D(TABLE_WIDTH - CUSHION_WIDTH, TABLE_HEIGHT - CUSHION_WIDTH))
    )

    /**
     * Ghost-Ball Position: G = Target - (2 * R) * normalize(Destination - Target)
     */
    fun calculateGhostBall(targetPos: Vector2D, destinationPos: Vector2D, radius: Float = BALL_RADIUS): Vector2D {
        val dir = (destinationPos - targetPos).normalize()
        return targetPos - (dir * (2f * radius))
    }

    /**
     * Cut angle in degrees between cue approach and line of centers
     */
    fun calculateCutAngle(cuePos: Vector2D, ghostPos: Vector2D, targetPos: Vector2D): Float {
        val uCue = (ghostPos - cuePos).normalize()
        val uTarget = (targetPos - ghostPos).normalize()
        val dotVal = uCue.dot(uTarget).coerceIn(-1f, 1f)
        return (acos(dotVal) * 180f / PI.toFloat())
    }

    /**
     * Stun Tangent Line (Exact 90-degree separation rule for sliding cue ball)
     */
    fun calculateTangentLine(
        cuePos: Vector2D,
        ghostPos: Vector2D,
        targetPos: Vector2D,
        length: Float = 200f
    ): Pair<Vector2D, Vector2D> {
        val cueToGhost = ghostPos - cuePos
        val ghostToTarget = targetPos - ghostPos
        val lineOfCenters = ghostToTarget.normalize()
        val cross = cueToGhost.cross2D(ghostToTarget)
        val sign = if (cross >= 0f) -1f else 1f
        val perp = Vector2D(sign * -lineOfCenters.y, sign * lineOfCenters.x)
        val end = ghostPos + (perp * length)
        return Pair(perp, end)
    }

    /**
     * 1-Cushion Bank reflection aim point via virtual pocket reflection
     */
    fun calculateOneCushionBank(
        targetPos: Vector2D,
        pocketPos: Vector2D,
        railY: Float = CUSHION_WIDTH
    ): Vector2D? {
        val virtualPocket = Vector2D(pocketPos.x, 2f * railY - pocketPos.y)
        val dy = virtualPocket.y - targetPos.y
        if (abs(dy) < 0.001f) return null
        val t = (railY - targetPos.y) / dy
        if (t <= 0f || t >= 1f) return null
        val bx = targetPos.x + t * (virtualPocket.x - targetPos.x)
        if (bx < CUSHION_WIDTH || bx > TABLE_WIDTH - CUSHION_WIDTH) return null
        return Vector2D(bx, railY)
    }

    /**
     * 2-Cushion Bank reflection aim points (Rail 1 top/bottom, Rail 2 side)
     */
    fun calculateTwoCushionBank(
        targetPos: Vector2D,
        pocketPos: Vector2D,
        rail1Y: Float = CUSHION_WIDTH,
        rail2X: Float = TABLE_WIDTH - CUSHION_WIDTH
    ): Pair<Vector2D, Vector2D>? {
        val vP2 = Vector2D(2f * rail2X - pocketPos.x, pocketPos.y)
        val vP1 = Vector2D(vP2.x, 2f * rail1Y - vP2.y)

        val dy1 = vP1.y - targetPos.y
        if (abs(dy1) < 0.001f) return null
        val t1 = (rail1Y - targetPos.y) / dy1
        if (t1 <= 0f || t1 >= 1f) return null
        val b1 = Vector2D(targetPos.x + t1 * (vP1.x - targetPos.x), rail1Y)

        val dx2 = vP2.x - b1.x
        if (abs(dx2) < 0.001f) return null
        val t2 = (rail2X - b1.x) / dx2
        if (t2 <= 0f || t2 >= 1f) return null
        val b2 = Vector2D(rail2X, b1.y + t2 * (vP2.y - b1.y))

        return Pair(b1, b2)
    }

    /**
     * Kick-shot reflection: Cue ball bounces off cushion to strike ghost ball
     */
    fun calculateKickShot(
        cuePos: Vector2D,
        ghostPos: Vector2D,
        railY: Float = CUSHION_WIDTH
    ): Vector2D? {
        val virtualGhost = Vector2D(ghostPos.x, 2f * railY - ghostPos.y)
        val dy = virtualGhost.y - cuePos.y
        if (abs(dy) < 0.001f) return null
        val t = (railY - cuePos.y) / dy
        if (t <= 0f || t >= 1f) return null
        val bx = cuePos.x + t * (virtualGhost.x - cuePos.x)
        if (bx < CUSHION_WIDTH || bx > TABLE_WIDTH - CUSHION_WIDTH) return null
        return Vector2D(bx, railY)
    }

    /**
     * Collision corridor check using segment-circle closest distance
     */
    fun isPathObstructed(
        start: Vector2D,
        end: Vector2D,
        obstaclePos: Vector2D,
        corridorRadius: Float = BALL_RADIUS * 1.95f
    ): Boolean {
        val d = end - start
        val lenSq = d.lengthSq()
        if (lenSq == 0f) return false
        val f = obstaclePos - start
        val t = (f.dot(d) / lenSq).coerceIn(0f, 1f)
        val closest = start + (d * t)
        val distSq = (obstaclePos - closest).lengthSq()
        val isInside = distSq < (corridorRadius * corridorRadius)
        val isSeparated = (obstaclePos - start).length() > BALL_RADIUS * 1.1f &&
                          (obstaclePos - end).length() > BALL_RADIUS * 1.1f
        return isInside && isSeparated
    }

    fun isCapturedByPocket(ballPos: Vector2D, pocket: Pocket): Boolean {
        val dist = (ballPos - pocket.position).length()
        return dist <= pocket.dropRadius
    }

    fun clampPosition(pos: Vector2D): Vector2D {
        return Vector2D(
            pos.x.coerceIn(PLAYABLE_MIN_X, PLAYABLE_MAX_X),
            pos.y.coerceIn(PLAYABLE_MIN_Y, PLAYABLE_MAX_Y)
        )
    }
}
