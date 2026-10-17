package com.cuegeometry.trainer.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.cuegeometry.trainer.data.Lesson
import com.cuegeometry.trainer.data.LessonRepository
import com.cuegeometry.trainer.viewmodel.CueTrainerViewModel

@Composable
fun LessonsScreen(
    viewModel: CueTrainerViewModel,
    onNavigateToSimulator: () -> Unit,
    modifier: Modifier = Modifier
) {
    val lessons = LessonRepository.getLessons()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(lessons) { lesson ->
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = lesson.title, style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = lesson.description, style = MaterialTheme.typography.bodyMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = "Rule: ${lesson.keyRule}", style = MaterialTheme.typography.labelSmall)
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = {
                            viewModel.moveBall(0, lesson.cuePos)
                            viewModel.moveBall(1, lesson.targetPos)
                            viewModel.setShotMode(lesson.mode)
                            onNavigateToSimulator()
                        }
                    ) {
                        Text(text = "Load Drill onto Table")
                    }
                }
            }
        }
    }
}
