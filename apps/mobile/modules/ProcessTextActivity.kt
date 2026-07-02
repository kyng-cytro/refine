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
      getPrefs().getString("activeConfig", null)
    } catch (e: Exception) { null }

    if (configJson == null) {
      buildErrorSheet("Open Refine to connect to a server") { returnOriginal(text) }.show(); return
    }

    val config = try {
      JSONObject(configJson as String)
    } catch (e: Exception) {
      buildErrorSheet("Open Refine to connect to a server") { returnOriginal(text) }.show(); return
    }

    if (!config.optBoolean("configured")) {
      val reason = config.optString("reason")
      val msg = when (reason) {
        "no_server" -> "Open Refine to connect to a server"
        "no_tone" -> "Open Refine to configure a tone"
        "no_model" -> "Open Refine to choose a model"
        else -> "Open Refine to finish setup"
      }
      buildErrorSheet(msg) { returnOriginal(text) }.show(); return
    }

    val serverUrl = config.optString("serverUrl")
    val sessionToken = config.optString("sessionToken")
    val modelId = config.optString("modelId")
    val toneSlug = config.optString("toneSlug")

    if (serverUrl.isBlank() || sessionToken.isBlank()) {
      buildErrorSheet("Open Refine to connect to a server") { returnOriginal(text) }.show(); return
    }

    val loadingSheet = buildLoadingSheet()
    loadingSheet.show()

    Thread {
      try {
        val refined = callRefineApi(serverUrl, sessionToken, text, modelId, toneSlug)
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

  private fun callRefineApi(
    serverUrl: String,
    sessionToken: String,
    text: String,
    modelId: String,
    toneSlug: String
  ): String {
    val url = serverUrl.trimEnd('/') + "/v1/refine"
    val body = JSONObject().apply {
      put("text", text)
      put("modelId", modelId)
      put("toneSlug", toneSlug)
    }

    val conn = URL(url).openConnection() as HttpURLConnection
    try {
      conn.requestMethod = "POST"
      conn.connectTimeout = 15_000
      conn.readTimeout = 30_000
      conn.doOutput = true
      conn.setRequestProperty("Content-Type", "application/json")
      conn.setRequestProperty("Authorization", "Bearer $sessionToken")

      OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }

      when (val code = conn.responseCode) {
        200 -> {
          val response = BufferedReader(InputStreamReader(conn.inputStream)).use { it.readText() }
          return JSONObject(response).getString("refined")
        }
        401 -> throw ApiException("Session expired — open Refine to reconnect")
        400 -> {
          val errBody = try { BufferedReader(InputStreamReader(conn.errorStream)).use { it.readText() } } catch (e: Exception) { "" }
          val msg = try { JSONObject(errBody).optString("message") } catch (e: Exception) { "" }
          throw ApiException(msg.ifBlank { "Bad request" })
        }
        in 500..599 -> throw ApiException("Server error, try again")
        else -> throw ApiException("Something went wrong (code $code)")
      }
    } catch (e: SocketTimeoutException) {
      throw ApiException("Request timed out")
    } catch (e: java.io.IOException) {
      throw ApiException("Could not reach the server")
    } finally {
      conn.disconnect()
    }
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
      setPadding((24 * dp).toInt(), (36 * dp).toInt(), (24 * dp).toInt(), (56 * dp).toInt())

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
      setPadding((24 * dp).toInt(), (28 * dp).toInt(), (24 * dp).toInt(), (48 * dp).toInt())

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

  private fun returnOriginal(text: String) {
    val reply = Intent().apply { putExtra(Intent.EXTRA_PROCESS_TEXT, text) }
    setResult(RESULT_OK, reply)
  }

  private fun getPrefs() =
    getSharedPreferences("RefineAppPrefs", Context.MODE_PRIVATE)
}

private class ApiException(msg: String) : Exception(msg)
