package com.refine.sharedprefs

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class RefineSharedPrefsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("RefineSharedPrefs")

    Function("set") { key: String, value: String ->
      val ctx = appContext.reactContext ?: return@Function
      ctx.getSharedPreferences("RefineAppPrefs", Context.MODE_PRIVATE)
        .edit().putString(key, value).apply()
    }

    Function("get") { key: String ->
      val ctx = appContext.reactContext ?: return@Function null
      ctx.getSharedPreferences("RefineAppPrefs", Context.MODE_PRIVATE)
        .getString(key, null)
    }
  }
}
