package com.refine.sharedprefs

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
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

    Function("setEncrypted") { key: String, value: String ->
      val ctx = appContext.reactContext ?: return@Function
      getEncryptedPrefs(ctx).edit().putString(key, value).apply()
    }

    Function("getEncrypted") { key: String ->
      val ctx = appContext.reactContext ?: return@Function null
      getEncryptedPrefs(ctx).getString(key, null)
    }
  }

  private fun getEncryptedPrefs(ctx: Context) = EncryptedSharedPreferences.create(
    ctx,
    "RefineSecurePrefs",
    MasterKey.Builder(ctx).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
  )
}
