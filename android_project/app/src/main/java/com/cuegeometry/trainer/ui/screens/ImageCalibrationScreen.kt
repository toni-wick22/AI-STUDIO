package com.cuegeometry.trainer.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ImageCalibrationScreen(modifier: Modifier = Modifier) {
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }

    // Android Photo Picker: Zero broad storage permissions required
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        selectedImageUri = uri
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Image Workspace (Android Photo Picker)",
            style = MaterialTheme.typography.titleLarge
        )
        Text(
            text = "Import a single practice table photo into the local app sandbox. No storage permissions requested.",
            style = MaterialTheme.typography.bodyMedium
        )

        Button(
            onClick = {
                photoPickerLauncher.launch(
                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                )
            }
        ) {
            Text(text = "Choose Photo via System Picker")
        }

        if (selectedImageUri != null) {
            Text(text = "Image Loaded in Sandbox: $selectedImageUri")
            Button(
                onClick = { selectedImageUri = null },
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
            ) {
                Text(text = "Delete Image & Analysis")
            }
        }
    }
}
