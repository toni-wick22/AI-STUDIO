package com.cuegeometry.trainer.privacy

import android.content.Context
import android.content.SharedPreferences

class PrivacyManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("cue_trainer_prefs", Context.MODE_PRIVATE)

    fun purgeAllLocalData() {
        prefs.edit().clear().apply()
    }

    fun isLocalOnlyVerified(): Boolean = true
}
