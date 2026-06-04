package com.refine.app

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
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

class ProcessTextActivity : Activity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val text = intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.toString()
    if (text.isNullOrBlank()) {
      finish()
      return
    }

    // Copy original to clipboard immediately
    val clipboard = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
    clipboard.setPrimaryClip(ClipData.newPlainText("original", text))

    // Read active config from encrypted prefs
    val configJson = try {
      getEncryptedPrefs().getString("activeConfig", null)
    } catch (e: Exception) {
      null
    }

    if (configJson == null) {
      toast("Refine: Open the app to configure an API key")
      returnOriginal(text)
      return
    }

    val config = try { JSONObject(configJson) } catch (e: Exception) {
      toast("Refine: Open the app to configure an API key")
      returnOriginal(text)
      return
    }

    if (config.optBoolean("configured") == false) {
      val reason = config.optString("reason")
      toast(if (reason == "no_api_key") "Refine: Open the app to configure an API key" else "Refine: Open the app to configure a tone")
      returnOriginal(text)
      return
    }

    val url = config.optString("url")
    val key = config.optString("key")
    val model = config.optString("model")
    val provider = config.optString("provider")
    val systemPrompt = config.optString("systemPrompt")

    if (url.isBlank() || key.isBlank()) {
      toast("Refine: Open the app to configure an API key")
      returnOriginal(text)
      return
    }

    CoroutineScope(Dispatchers.IO).launch {
      try {
        val refined = callApi(url, key, model, provider, systemPrompt, text)
        saveHistory(text, refined)
        withContext(Dispatchers.Main) {
          val reply = Intent().apply { putExtra(Intent.EXTRA_PROCESS_TEXT, refined) }
          setResult(RESULT_OK, reply)
          finish()
        }
      } catch (e: NotConfiguredException) {
        withContext(Dispatchers.Main) { toast(e.message ?: "Refine: Not configured"); returnOriginal(text) }
      } catch (e: ApiException) {
        withContext(Dispatchers.Main) { toast(e.message ?: "Refine: Something went wrong"); returnOriginal(text) }
      }
    }
  }

  private fun callApi(url: String, key: String, model: String, provider: String, systemPrompt: String, text: String): String {
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

    val conn = URL(url).openConnection() as HttpURLConnection
    try {
      conn.requestMethod = "POST"
      conn.connectTimeout = 10_000
      conn.readTimeout = 10_000
      conn.doOutput = true
      conn.setRequestProperty("Content-Type", "application/json")
      conn.setRequestProperty("Authorization", "Bearer $key")
      if (provider == "anthropic") conn.setRequestProperty("anthropic-version", "2023-06-01")

      OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }

      when (val code = conn.responseCode) {
        200 -> {
          val response = BufferedReader(InputStreamReader(conn.inputStream)).use { it.readText() }
          val json = JSONObject(response)
          return if (provider == "anthropic") {
            json.getJSONArray("content").getJSONObject(0).getString("text")
          } else {
            json.getJSONArray("choices").getJSONObject(0).getJSONObject("message").getString("content")
          }
        }
        401 -> throw ApiException("Refine: Invalid API key")
        429 -> throw ApiException("Refine: Rate limit reached, try again shortly")
        in 500..599 -> throw ApiException("Refine: Provider error, try again")
        else -> throw ApiException("Refine: Something went wrong (code $code)")
      }
    } catch (e: SocketTimeoutException) {
      throw ApiException("Refine: Request timed out")
    } catch (e: java.io.IOException) {
      throw ApiException("Refine: No internet connection")
    } finally {
      conn.disconnect()
    }
  }

  private fun saveHistory(source: String, refined: String) {
    try {
      val prefs = getSharedPreferences("RefineAppPrefs", Context.MODE_PRIVATE)
      val existing = prefs.getString("history", "[]")
      val arr = try { org.json.JSONArray(existing) } catch (e: Exception) { org.json.JSONArray() }
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
    } catch (_: Exception) {}
  }

  private fun returnOriginal(text: String) {
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
private class NotConfiguredException(msg: String) : Exception(msg)
