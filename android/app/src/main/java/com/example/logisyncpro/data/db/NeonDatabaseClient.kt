package com.example.logisyncpro.data.db

import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Autonomous Cloud Database Client.
 * Connects the Android APK directly to Neon PostgreSQL over HTTPS Serverless SQL API.
 * No external Node/Express backend server or IP address required.
 */
object NeonDatabaseClient {
    private const val TAG = "NeonDatabaseClient"

    // Neon Cloud Database Pointer Key & Serverless HTTPS SQL Endpoint
    const val DATABASE_POINTER = "ep-restless-moon-b4nzb2ae-pooler.c-6.us-east-2.aws.neon.tech/logisync_apk_db"
    private const val NEON_SQL_URL = "https://ep-restless-moon-b4nzb2ae-pooler.c-6.us-east-2.aws.neon.tech/sql"
    private const val NEON_CONNECTION_STRING = "postgresql://neondb_owner:npg_qoNFpJ2zm3Hj@ep-restless-moon-b4nzb2ae-pooler.c-6.us-east-2.aws.neon.tech/logisync_apk_db?sslmode=require"

    private val gson = Gson()
    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    /**
     * Executes a SQL query directly against the Neon PostgreSQL cloud database.
     * Supports $1, $2 parameterized queries for SQL injection safety.
     */
    suspend fun query(sql: String, params: List<Any?> = emptyList()): JsonArray = withContext(Dispatchers.IO) {
        val payload = JsonObject().apply {
            addProperty("query", sql)
            if (params.isNotEmpty()) {
                val paramsArray = JsonArray()
                for (p in params) {
                    when (p) {
                        null -> paramsArray.add(null as String?)
                        is Number -> paramsArray.add(p)
                        is Boolean -> paramsArray.add(p)
                        else -> paramsArray.add(p.toString())
                    }
                }
                add("params", paramsArray)
            }
        }

        val requestBody = gson.toJson(payload).toRequestBody("application/json; charset=utf-8".toMediaType())
        val request = Request.Builder()
            .url(NEON_SQL_URL)
            .addHeader("Neon-Connection-String", NEON_CONNECTION_STRING)
            .addHeader("Content-Type", "application/json")
            .post(requestBody)
            .build()

        try {
            client.newCall(request).execute().use { response ->
                val responseStr = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    val errorMsg = try {
                        val parsed = JsonParser.parseString(responseStr).asJsonObject
                        parsed.get("message")?.asString ?: responseStr
                    } catch (e: Exception) {
                        responseStr
                    }
                    Log.e(TAG, "Neon query failed HTTP ${response.code}: $errorMsg")
                    throw IOException("Cloud Database error (HTTP ${response.code}): $errorMsg")
                }

                val jsonObject = JsonParser.parseString(responseStr).asJsonObject
                jsonObject.getAsJsonArray("rows") ?: JsonArray()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Neon connection exception: ${e.message}", e)
            throw e
        }
    }
}
