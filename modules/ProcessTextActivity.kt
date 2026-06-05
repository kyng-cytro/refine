package com.refine.app

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.SocketTimeoutException
import java.net.URL

private const val TAG = "ProcessTextActivity"

class ProcessTextActivity : Activity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    Log.d(TAG, "onCreate started")

    val text = intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.toString()
    if (text.isNullOrBlank()) {
      Log.d(TAG, "No text in intent, finishing")
      finish()
      return
    }
    Log.d(TAG, "Input text length: ${text.length}")

    val clipboard = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
    try {
      clipboard.setPrimaryClip(ClipData.newPlainText("original", text))
      Log.d(TAG, "Original copied to clipboard")
    } catch (e: Exception) {
      Log.w(TAG, "Clipboard set failed: ${e::class.simpleName}: ${e.message}")
    }

    Log.d(TAG, "Reading activeConfig from EncryptedSharedPreferences")
    val configJson = try {
      val prefs = getEncryptedPrefs()
      Log.d(TAG, "EncryptedSharedPreferences opened")
      prefs.getString("activeConfig", null)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to read EncryptedSharedPreferences: ${e::class.simpleName}: ${e.message}")
      null
    }

    if (configJson == null) {
      Log.d(TAG, "activeConfig is null — not configured")
      toast("Refine: Open the app to configure an API key")
      returnOriginal(text)
      return
    }
    Log.d(TAG, "activeConfig length: ${configJson.length}")

    val config = try {
      JSONObject(configJson as String)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to parse activeConfig JSON: ${e::class.simpleName}: ${e.message}")
      toast("Refine: Open the app to configure an API key")
      returnOriginal(text)
      return
    }

    val configured = config.optBoolean("configured")
    Log.d(TAG, "configured=$configured")
    if (!configured) {
      val reason = config.optString("reason")
      Log.d(TAG, "Not configured, reason=$reason")
      toast(if (reason == "no_api_key") "Refine: Open the app to configure an API key" else "Refine: Open the app to configure a tone")
      returnOriginal(text)
      return
    }

    val url = config.optString("url")
    val key = config.optString("key")
    val model = config.optString("model")
    val provider = config.optString("provider")
    val systemPrompt = config.optString("systemPrompt")
    Log.d(TAG, "Config: provider=$provider model=$model keyPresent=${key.isNotBlank()} systemPromptLength=${systemPrompt.length}")

    if (url.isBlank() || key.isBlank()) {
      Log.d(TAG, "URL or key blank, aborting")
      toast("Refine: Open the app to configure an API key")
      returnOriginal(text)
      return
    }

    toast("Refining…")
    Log.d(TAG, "Launching IO coroutine")

    CoroutineScope(Dispatchers.IO).launch {
      try {
        Log.d(TAG, "Calling API")
        val refined = callApi(url, key, model, provider, systemPrompt, text)
        Log.d(TAG, "API returned, refined length: ${refined.length}")

        Log.d(TAG, "Saving history")
        saveHistory(text, refined)
        Log.d(TAG, "History saved")

        withContext(Dispatchers.Main) {
          Log.d(TAG, "On main thread — copying refined text to clipboard")
          try {
            clipboard.setPrimaryClip(ClipData.newPlainText("refined", refined))
            Log.d(TAG, "Refined text copied to clipboard")
          } catch (e: Exception) {
            Log.w(TAG, "Clipboard copy failed: ${e::class.simpleName}: ${e.message}")
          }

          Log.d(TAG, "Delivering result to caller")
          var resultDelivered = false
          try {
            val reply = Intent().apply { putExtra(Intent.EXTRA_PROCESS_TEXT, refined) }
            setResult(RESULT_OK, reply)
            resultDelivered = true
            Log.d(TAG, "setResult OK")
          } catch (e: Exception) {
            Log.e(TAG, "setResult failed: ${e::class.simpleName}: ${e.message}")
          }

          if (!resultDelivered) {
            toast("Refined — copied to clipboard")
          }

          Log.d(TAG, "Calling finish()")
          finish()
        }
      } catch (e: ApiException) {
        Log.w(TAG, "ApiException: ${e.message}")
        withContext(Dispatchers.Main) {
          toast(e.message ?: "Refine: Something went wrong")
          returnOriginal(text)
        }
      } catch (e: Exception) {
        Log.e(TAG, "Unexpected exception: ${e::class.simpleName}: ${e.message}", e)
        withContext(Dispatchers.Main) {
          toast("Refine: Something went wrong")
          try { returnOriginal(text) } catch (_: Exception) { finish() }
        }
      }
    }
  }

  private fun callApi(url: String, key: String, model: String, provider: String, systemPrompt: String, text: String): String {
    Log.d(TAG, "callApi: building request body")
    val body = if (provider == "anthropic") {
      JSONObject().apply {
        put("model", model)
        put("max_tokens", 2048)
        put("system", systemPrompt)
        put("messages", org.json.JSONArray().apply {
          put(JSONObject().apply { put("role", "user"); put("content", text) })
        })
      }
    } else {
      JSONObject().apply {
        put("model", model)
        put("messages", org.json.JSONArray().apply {
          put(JSONObject().apply { put("role", "system"); put("content", systemPrompt) })
          put(JSONObject().apply { put("role", "user"); put("content", text) })
        })
      }
    }
    Log.d(TAG, "callApi: body built, size=${body.toString().length}")

    val conn = URL(url).openConnection() as HttpURLConnection
    try {
      conn.requestMethod = "POST"
      conn.connectTimeout = 15_000
      conn.readTimeout = 30_000
      conn.doOutput = true
      conn.setRequestProperty("Content-Type", "application/json")
      if (provider == "anthropic") {
        conn.setRequestProperty("x-api-key", key)
        conn.setRequestProperty("anthropic-version", "2023-06-01")
      } else {
        conn.setRequestProperty("Authorization", "Bearer $key")
      }

      Log.d(TAG, "callApi: sending request")
      OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }

      val code = conn.responseCode
      Log.d(TAG, "callApi: response code=$code")

      when (code) {
        200 -> {
          val response = BufferedReader(InputStreamReader(conn.inputStream)).use { it.readText() }
          Log.d(TAG, "callApi: response length=${response.length}")
          val json = JSONObject(response)
          val result = if (provider == "anthropic") {
            json.getJSONArray("content").getJSONObject(0).getString("text")
          } else {
            json.getJSONArray("choices").getJSONObject(0).getJSONObject("message").getString("content")
          }
          Log.d(TAG, "callApi: parsed result length=${result.length}")
          return result
        }
        401 -> throw ApiException("Refine: Invalid API key")
        429 -> throw ApiException("Refine: Rate limit reached, try again shortly")
        in 500..599 -> {
          val errBody = try { BufferedReader(InputStreamReader(conn.errorStream)).use { it.readText() } } catch (_: Exception) { "" }
          Log.e(TAG, "callApi: server error $code: $errBody")
          throw ApiException("Refine: Provider error, try again")
        }
        else -> {
          val errBody = try { BufferedReader(InputStreamReader(conn.errorStream)).use { it.readText() } } catch (_: Exception) { "" }
          Log.e(TAG, "callApi: unexpected code $code: $errBody")
          throw ApiException("Refine: Something went wrong (code $code)")
        }
      }
    } catch (e: SocketTimeoutException) {
      Log.e(TAG, "callApi: timeout: ${e.message}")
      throw ApiException("Refine: Request timed out")
    } catch (e: java.io.IOException) {
      Log.e(TAG, "callApi: IO error: ${e::class.simpleName}: ${e.message}")
      throw ApiException("Refine: No internet connection")
    } finally {
      conn.disconnect()
    }
  }

  private fun saveHistory(source: String, refined: String) {
    try {
      val prefs = getSharedPreferences("RefineAppPrefs", Context.MODE_PRIVATE)
      val existing = prefs.getString("history", "[]")
      val arr = try {
        org.json.JSONArray(existing)
      } catch (e: Exception) {
        Log.w(TAG, "saveHistory: failed to parse existing history, starting fresh")
        org.json.JSONArray()
      }
      val item = JSONObject().apply {
        put("id", System.currentTimeMillis().toString())
        put("source", source)
        put("refined", refined)
        put("timestamp", System.currentTimeMillis())
      }
      val newArr = org.json.JSONArray()
      newArr.put(item)
      for (i in 0 until minOf(arr.length(), 49)) newArr.put(arr.getJSONObject(i))
      prefs.edit().putString("history", newArr.toString()).apply()
      Log.d(TAG, "saveHistory: written ${newArr.length()} entries")
    } catch (e: Exception) {
      Log.e(TAG, "saveHistory: failed: ${e::class.simpleName}: ${e.message}")
    }
  }

  private fun returnOriginal(text: String) {
    Log.d(TAG, "returnOriginal")
    val reply = Intent().apply { putExtra(Intent.EXTRA_PROCESS_TEXT, text) }
    setResult(RESULT_OK, reply)
    finish()
  }

  private fun toast(msg: String) {
    Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
  }

  private fun getEncryptedPrefs() = EncryptedSharedPreferences.create(
    this,
    "RefineSecurePrefs",
    MasterKey.Builder(this).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
  )
}

private class ApiException(msg: String) : Exception(msg)
