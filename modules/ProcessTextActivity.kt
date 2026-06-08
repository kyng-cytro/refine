package com.refine.app

import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
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
    if (text.isNullOrBlank()) { finish(); return }

    val configJson = try {
      getEncryptedPrefs().getString("activeConfig", null)
    } catch (e: Exception) { null }

    if (configJson == null) {
      buildErrorSheet("Open the app to configure an API key") { returnOriginal(text) }.show(); return
    }

    val config = try {
      JSONObject(configJson as String)
    } catch (e: Exception) {
      buildErrorSheet("Open the app to configure an API key") { returnOriginal(text) }.show(); return
    }

    if (!config.optBoolean("configured")) {
      val reason = config.optString("reason")
      buildErrorSheet(if (reason == "no_api_key") "Open the app to configure an API key" else "Open the app to configure a tone") { returnOriginal(text) }.show(); return
    }

    val url = config.optString("url")
    val key = config.optString("key")
    val model = config.optString("model")
    val provider = config.optString("provider")
    val systemPrompt = config.optString("systemPrompt")

    if (url.isBlank() || key.isBlank()) {
      buildErrorSheet("Open the app to configure an API key") { returnOriginal(text) }.show(); return
    }

    val loadingSheet = buildLoadingSheet()
    loadingSheet.show()

    Thread {
      try {
        val refined = callApi(url, key, model, provider, systemPrompt, text)
        saveHistory(text, refined)
        runOnUiThread {
          loadingSheet.dismiss()
          val reply = Intent().apply { putExtra(Intent.EXTRA_PROCESS_TEXT, refined) }
          setResult(RESULT_OK, reply)
          finish()
        }
      } catch (e: ApiException) {
        runOnUiThread {
          loadingSheet.dismiss()
          buildErrorSheet(e.message ?: "Something went wrong") { returnOriginal(text) }.show()
        }
      } catch (e: Exception) {
        runOnUiThread {
          loadingSheet.dismiss()
          buildErrorSheet("Something went wrong") { returnOriginal(text) }.show()
        }
      }
    }.start()
  }

  private fun sheetDialog(): Dialog =
    Dialog(this, android.R.style.Theme_Translucent_NoTitleBar).apply {
      setCancelable(false)
      setCanceledOnTouchOutside(false)
      window?.apply {
        setGravity(Gravity.BOTTOM)
        setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
      }
    }

  private fun sheetBackground(): GradientDrawable {
    val dp = resources.displayMetrics.density
    return GradientDrawable().apply {
      setColor(Color.WHITE)
      cornerRadii = floatArrayOf(dp * 20, dp * 20, dp * 20, dp * 20, 0f, 0f, 0f, 0f)
    }
  }

  private fun buildLoadingSheet(): Dialog {
    val dp = resources.displayMetrics.density

    val row = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
      background = sheetBackground()
      setPadding((24 * dp).toInt(), (36 * dp).toInt(), (24 * dp).toInt(), (40 * dp).toInt())

      addView(ProgressBar(this@ProcessTextActivity).apply {
        layoutParams = LinearLayout.LayoutParams((22 * dp).toInt(), (22 * dp).toInt())
        isIndeterminate = true
      })

      addView(TextView(this@ProcessTextActivity).apply {
        text = "Refining…"
        textSize = 15f
        setTextColor(Color.parseColor("#1C1B1F"))
        setPadding((14 * dp).toInt(), 0, 0, 0)
        layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
      })
    }

    return sheetDialog().apply { setContentView(row) }
  }

  private fun buildErrorSheet(message: String, onDismiss: () -> Unit): Dialog {
    val dp = resources.displayMetrics.density

    val container = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      background = sheetBackground()
      setPadding((24 * dp).toInt(), (28 * dp).toInt(), (24 * dp).toInt(), (32 * dp).toInt())

      addView(TextView(this@ProcessTextActivity).apply {
        text = message
        textSize = 15f
        setTextColor(Color.parseColor("#1C1B1F"))
        layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
      })

      addView(TextView(this@ProcessTextActivity).apply {
        text = "Dismiss"
        textSize = 14f
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        setTextColor(Color.parseColor("#1B6EF3"))
        gravity = Gravity.END
        setPadding(0, (16 * dp).toInt(), 0, 0)
        layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        setOnClickListener {
          (parent?.parent as? Dialog)?.dismiss()
          onDismiss()
          finish()
        }
      })
    }

    return sheetDialog().apply { setContentView(container) }
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
        401 -> throw ApiException("Invalid API key — check your settings")
        429 -> throw ApiException("Rate limit reached, try again shortly")
        in 500..599 -> throw ApiException("Provider error, try again")
        else -> throw ApiException("Something went wrong (code $code)")
      }
    } catch (e: SocketTimeoutException) {
      throw ApiException("Request timed out")
    } catch (e: java.io.IOException) {
      throw ApiException("No internet connection")
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
    } catch (e: Exception) { }
  }

  private fun returnOriginal(text: String) {
    val reply = Intent().apply { putExtra(Intent.EXTRA_PROCESS_TEXT, text) }
    setResult(RESULT_OK, reply)
  }

  private fun getEncryptedPrefs() = EncryptedSharedPreferences.create(
    this, "RefineSecurePrefs",
    MasterKey.Builder(this).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
  )
}

private class ApiException(msg: String) : Exception(msg)
