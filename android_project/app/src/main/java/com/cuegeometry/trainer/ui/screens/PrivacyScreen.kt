package com.cuegeometry.trainer.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.cuegeometry.trainer.viewmodel.CueTrainerViewModel

@Composable
fun PrivacyScreen(
    viewModel: CueTrainerViewModel,
    modifier: Modifier = Modifier
) {
    var purged by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(text = "Privacy & Safety Policy", style = MaterialTheme.typography.titleLarge)
        Text(
            text = "• 100% Offline-First Architecture\n" +
                   "• Zero Sensitive Permissions (No overlay, accessibility, storage, or mic)\n" +
                   "• No user tracking, no third-party ads, no cloud accounts\n" +
                   "• All shot calculations occur on-device in memory",
            style = MaterialTheme.typography.bodyMedium
        )

        Button(
            onClick = {
                viewModel.purgeLocalData()
                purged = true
            },
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
        ) {
            Text(text = "Purge All Local Data")
        }

        if (purged) {
            Text(text = "All local data has been purged successfully.", color = MaterialTheme.colorScheme.primary)
        }
    }
}
