package com.cuegeometry.trainer.ui

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import com.cuegeometry.trainer.geometry.Vector2D
import com.cuegeometry.trainer.viewmodel.CueTrainerViewModel
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class CueTrainerUiTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun testBallDraggingAndRepositioning() {
        val viewModel = CueTrainerViewModel()
        val initialCuePos = viewModel.uiState.value.balls[0].position

        // Move Cue ball to new coordinate
        viewModel.moveBall(0, Vector2D(300f, 300f))
        val newPos = viewModel.uiState.value.balls[0].position

        assertEquals(300f, newPos.x, 0.01f)
        assertEquals(300f, newPos.y, 0.01f)
    }

    @Test
    fun testTargetBallSelection() {
        val viewModel = CueTrainerViewModel()
        viewModel.setTargetBall(2)
        assertEquals(2, viewModel.uiState.value.targetBallId)
    }
}
