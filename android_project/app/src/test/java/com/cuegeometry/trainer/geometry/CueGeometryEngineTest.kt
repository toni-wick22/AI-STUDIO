package com.cuegeometry.trainer.geometry

import org.junit.Assert.*
import org.junit.Test
import kotlin.math.abs

class CueGeometryEngineTest {

    @Test
    fun testZeroLengthVectorNormalization() {
        val zeroVec = Vector2D(0f, 0f)
        val norm = zeroVec.normalize()
        assertEquals(0f, norm.x, 0.0001f)
        assertEquals(0f, norm.y, 0.0001f)
        assertEquals(0f, zeroVec.length(), 0.0001f)
    }

    @Test
    fun testGhostBallDistanceAndCollinearity() {
        val target = Vector2D(500f, 250f)
        val pocket = Vector2D(960f, 40f)
        val ghost = CueGeometryEngine.calculateGhostBall(target, pocket, CueGeometryEngine.BALL_RADIUS)

        // Exact distance must equal 2 * BALL_RADIUS
        val dist = (target - ghost).length()
        assertEquals(2f * CueGeometryEngine.BALL_RADIUS, dist, 0.001f)

        // Collinearity: (pocket - target) and (target - ghost) must point in the exact same direction
        val dir1 = (pocket - target).normalize()
        val dir2 = (target - ghost).normalize()
        val dot = dir1.dot(dir2)
        assertEquals(1.0f, dot, 0.0001f)
    }

    @Test
    fun testDirectShotZeroCutAngle() {
        val pocket = Vector2D(960f, 250f)
        val target = Vector2D(600f, 250f)
        val ghost = CueGeometryEngine.calculateGhostBall(target, pocket)
        val cue = Vector2D(200f, 250f)
        val cutAngle = CueGeometryEngine.calculateCutAngle(cue, ghost, target)
        assertEquals(0.0f, cutAngle, 0.01f)
    }

    @Test
    fun testHalfBallCutThirtyDegrees() {
        // In billiards, half-ball cut occurs when offset equals R; arcsin(R / 2R) = 30°
        val target = Vector2D(500f, 250f)
        val pocket = Vector2D(500f, 40f) // heading straight up
        val ghost = CueGeometryEngine.calculateGhostBall(target, pocket)
        val rad30 = Math.toRadians(30.0).toFloat()
        val cue = Vector2D(
            ghost.x - 200f * kotlin.math.sin(rad30),
            ghost.y + 200f * kotlin.math.cos(rad30)
        )
        val cutAngle = CueGeometryEngine.calculateCutAngle(cue, ghost, target)
        assertEquals(30.0f, cutAngle, 0.15f)
    }

    @Test
    fun testTangentObstacleDetection() {
        val start = Vector2D(200f, 250f)
        val end = Vector2D(800f, 250f)
        // Ball right on the tangent corridor boundary (distance = corridor radius)
        val obstacleTangent = Vector2D(500f, 250f + CueGeometryEngine.BALL_RADIUS * 1.94f)
        val isBlocked = CueGeometryEngine.isPathObstructed(start, end, obstacleTangent)
        assertTrue(isBlocked)
    }

    @Test
    fun testObstacleOutsideSegment() {
        val start = Vector2D(200f, 250f)
        val end = Vector2D(800f, 250f)
        // Obstacle behind start or past end
        val behindStart = Vector2D(100f, 250f)
        val pastEnd = Vector2D(900f, 250f)
        assertFalse(CueGeometryEngine.isPathObstructed(start, end, behindStart))
        assertFalse(CueGeometryEngine.isPathObstructed(start, end, pastEnd))
    }

    @Test
    fun testBlockedCueBallPath() {
        val cue = Vector2D(200f, 250f)
        val ghost = Vector2D(600f, 250f)
        val intermediateBall = Vector2D(400f, 250f)
        assertTrue(CueGeometryEngine.isPathObstructed(cue, ghost, intermediateBall))
    }

    @Test
    fun testBlockedObjectBallPath() {
        val target = Vector2D(600f, 250f)
        val pocket = Vector2D(960f, 250f)
        val blocker = Vector2D(750f, 250f)
        assertTrue(CueGeometryEngine.isPathObstructed(target, pocket, blocker))
    }

    @Test
    fun testOneCushionReflectionSymmetry() {
        val target = Vector2D(500f, 150f)
        val pocket = Vector2D(60f, 40f)
        val bounce = CueGeometryEngine.calculateOneCushionBank(target, pocket, 40f)
        assertNotNull(bounce)
        assertEquals(40f, bounce!!.y, 0.01f)
    }

    @Test
    fun testTwoCushionReflectionDoubleBounce() {
        val target = Vector2D(500f, 200f)
        val pocket = Vector2D(60f, 40f)
        val bounces = CueGeometryEngine.calculateTwoCushionBank(target, pocket, 40f, 960f)
        assertNotNull(bounces)
        assertEquals(40f, bounces!!.first.y, 0.01f)
        assertEquals(960f, bounces.second.x, 0.01f)
    }

    @Test
    fun testKickShotReflection() {
        val cue = Vector2D(300f, 380f)
        val ghost = Vector2D(700f, 380f)
        val bounce = CueGeometryEngine.calculateKickShot(cue, ghost, CueGeometryEngine.CUSHION_WIDTH)
        assertNotNull(bounce)
        assertEquals(CueGeometryEngine.CUSHION_WIDTH, bounce!!.y, 0.01f)
        assertEquals(500f, bounce.x, 1.0f) // Midpoint for parallel shot
    }

    @Test
    fun testInvalidReflectionOutsideRailSegment() {
        // Reflection ray that would intersect far outside the table rail bounds (e.g. x > 1000)
        val target = Vector2D(950f, 300f)
        val pocket = Vector2D(950f, 400f)
        val invalidBounce = CueGeometryEngine.calculateOneCushionBank(target, pocket, 40f)
        // Must either be null or strictly within [CUSHION_WIDTH, TABLE_WIDTH - CUSHION_WIDTH]
        if (invalidBounce != null) {
            assertTrue(invalidBounce.x in 40f..960f)
        }
    }

    @Test
    fun testBoundaryClamping() {
        val wayOff = Vector2D(-500f, 9999f)
        val clamped = CueGeometryEngine.clampPosition(wayOff)
        assertEquals(CueGeometryEngine.PLAYABLE_MIN_X, clamped.x, 0.001f)
        assertEquals(CueGeometryEngine.PLAYABLE_MAX_Y, clamped.y, 0.001f)
    }

    @Test
    fun testCornerPocketCapture() {
        val cornerPocket = CueGeometryEngine.STANDARD_POCKETS[0] // Top-Left
        val ballInPocket = Vector2D(cornerPocket.position.x + 5f, cornerPocket.position.y + 5f)
        val ballFarAway = Vector2D(500f, 250f)
        assertTrue(CueGeometryEngine.isCapturedByPocket(ballInPocket, cornerPocket))
        assertFalse(CueGeometryEngine.isCapturedByPocket(ballFarAway, cornerPocket))
    }

    @Test
    fun testSidePocketCapture() {
        val sidePocket = CueGeometryEngine.STANDARD_POCKETS[1] // Top-Side
        val ballInPocket = Vector2D(sidePocket.position.x, sidePocket.position.y + 10f)
        val ballOutside = Vector2D(sidePocket.position.x + 50f, sidePocket.position.y + 50f)
        assertTrue(CueGeometryEngine.isCapturedByPocket(ballInPocket, sidePocket))
        assertFalse(CueGeometryEngine.isCapturedByPocket(ballOutside, sidePocket))
    }
}
