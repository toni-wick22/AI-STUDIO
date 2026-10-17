package com.cuegeometry.trainer.data

import com.cuegeometry.trainer.geometry.Vector2D
import com.cuegeometry.trainer.viewmodel.ShotMode

data class Lesson(
    val id: String,
    val title: String,
    val description: String,
    val keyRule: String,
    val cuePos: Vector2D,
    val targetPos: Vector2D,
    val pocketId: String,
    val mode: ShotMode
)

object LessonRepository {
    fun getLessons(): List<Lesson> = listOf(
        Lesson(
            id = "lesson_1",
            title = "Direct Shots & Ghost Ball",
            description = "The cue ball must arrive tangent to the target ball at distance 2R along the pocket axis.",
            keyRule = "Ghost Center = Target - 2R * UnitVector(Target to Pocket)",
            cuePos = Vector2D(300f, 250f),
            targetPos = Vector2D(650f, 250f),
            pocketId = "tr",
            mode = ShotMode.DIRECT
        ),
        Lesson(
            id = "lesson_2",
            title = "Cut Angles & 30° Half-Ball Rule",
            description = "When aiming the cue center at the object ball edge, the cut angle is precisely 30 degrees.",
            keyRule = "arcsin(R / 2R) = 30.0 degrees",
            cuePos = Vector2D(400f, 360f),
            targetPos = Vector2D(620f, 200f),
            pocketId = "tr",
            mode = ShotMode.DIRECT
        ),
        Lesson(
            id = "lesson_3",
            title = "The 90-Degree Stun Rule",
            description = "On sliding impact without forward/backward roll, the cue ball separates along the 90° tangent line.",
            keyRule = "Cue Deflection Vector is perpendicular to Line of Centers",
            cuePos = Vector2D(380f, 320f),
            targetPos = Vector2D(600f, 250f),
            pocketId = "tm",
            mode = ShotMode.DIRECT
        ),
        Lesson(
            id = "lesson_4",
            title = "1-Cushion Bank Shots",
            description = "Rebounding the object ball off one cushion using mathematical mirror reflection.",
            keyRule = "Virtual Pocket mirrored equidistant behind cushion rail",
            cuePos = Vector2D(450f, 350f),
            targetPos = Vector2D(650f, 320f),
            pocketId = "tl",
            mode = ShotMode.BANK_1_CUSHION
        ),
        Lesson(
            id = "lesson_5",
            title = "Kick Shots & Escape Angles",
            description = "Bouncing the cue ball off the cushion first when your direct shooting lane is snookered.",
            keyRule = "Angle of incidence equals angle of reflection",
            cuePos = Vector2D(300f, 380f),
            targetPos = Vector2D(680f, 180f),
            pocketId = "br",
            mode = ShotMode.KICK
        )
    )
}
