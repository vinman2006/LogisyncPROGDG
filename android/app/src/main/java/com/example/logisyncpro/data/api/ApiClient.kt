package com.example.logisyncpro.data.api

import android.content.Context
import android.content.SharedPreferences
import com.example.logisyncpro.BuildConfig
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    private const val PREFS_NAME = "logisync_api_prefs"
    private const val KEY_SERVER_URL = "server_url"

    // Default to the BuildConfig configured URL (production HTTPS for release)
    private var currentBaseUrl: String = BuildConfig.API_BASE_URL
    private var sharedPreferences: SharedPreferences? = null

    private var authToken: String? = null
    private var firebaseUid: String? = null

    fun initialize(context: Context) {
        sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedUrl = sharedPreferences?.getString(KEY_SERVER_URL, null)
        if (!savedUrl.isNullOrBlank()) {
            updateBaseUrl(savedUrl, save = false)
        }
    }

    fun setAuth(token: String?, uid: String?) {
        authToken = token
        firebaseUid = uid
    }

    private val authInterceptor = Interceptor { chain ->
        val originalRequest = chain.request()
        val builder = originalRequest.newBuilder()

        authToken?.let { token ->
            builder.header("Authorization", "Bearer $token")
        }
        firebaseUid?.let { uid ->
            builder.header("x-firebase-uid", uid)
        }

        chain.proceed(builder.build())
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    private var retrofit: Retrofit = buildRetrofit(currentBaseUrl)
    var service: LogiSyncApiService = retrofit.create(LogiSyncApiService::class.java)
        private set

    fun getBaseUrl(): String = currentBaseUrl

    fun updateBaseUrl(newUrl: String, save: Boolean = true) {
        val sanitized = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
        currentBaseUrl = sanitized
        retrofit = buildRetrofit(sanitized)
        service = retrofit.create(LogiSyncApiService::class.java)
        if (save) {
            sharedPreferences?.edit()?.putString(KEY_SERVER_URL, sanitized)?.apply()
        }
    }

    private fun buildRetrofit(baseUrl: String): Retrofit {
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}
