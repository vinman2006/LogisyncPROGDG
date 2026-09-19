package com.example.logisyncpro.data.repository

import com.example.logisyncpro.data.api.ApiClient
import com.example.logisyncpro.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

object LogiSyncRepository {

    private val _currentUser = MutableStateFlow<UserProfile?>(null)
    val currentUser: StateFlow<UserProfile?> = _currentUser.asStateFlow()

    private val _firebaseUid = MutableStateFlow<String?>(null)
    val firebaseUid: StateFlow<String?> = _firebaseUid.asStateFlow()

    private val _userEmail = MutableStateFlow<String?>(null)
    val userEmail: StateFlow<String?> = _userEmail.asStateFlow()

    private val _userDisplayName = MutableStateFlow<String?>(null)
    val userDisplayName: StateFlow<String?> = _userDisplayName.asStateFlow()

    private val _userPhotoUrl = MutableStateFlow<String?>(null)
    val userPhotoUrl: StateFlow<String?> = _userPhotoUrl.asStateFlow()

    private val _requests = MutableStateFlow<List<TransportRequest>>(emptyList())
    val requests: StateFlow<List<TransportRequest>> = _requests.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    fun clearError() {
        _errorMessage.value = null
    }

    private fun mapError(e: Throwable, action: String): String {
        return when (e) {
            is ConnectException, is SocketTimeoutException ->
                "Unable to reach the LogiSyncPRO server. Please verify that the APK backend is running and the API URL (${ApiClient.getBaseUrl()}) is reachable."
            is UnknownHostException ->
                "Network connection error: Unable to resolve server hostname. Please check your network connection."
            else ->
                "Error while attempting to $action: ${e.localizedMessage ?: "Unknown network error"}"
        }
    }

    /**
     * Sign in user with Firebase UID / Google SSO credentials.
     * Queries the dedicated APK Neon PostgreSQL database.
     */
    suspend fun signIn(
        uid: String,
        email: String,
        name: String?,
        photoUrl: String? = null,
        token: String? = null
    ): Boolean {
        _isLoading.value = true
        _firebaseUid.value = uid
        _userEmail.value = email
        _userDisplayName.value = name
        _userPhotoUrl.value = photoUrl
        ApiClient.setAuth(token ?: uid, uid)
        clearError()

        try {
            val response = ApiClient.service.checkUserProfile(uid)
            if (response.isSuccessful) {
                val body = response.body()
                if (body?.exists == true && body.user != null) {
                    _currentUser.value = body.user
                    _isLoading.value = false
                    return true
                } else {
                    _currentUser.value = null
                    _isLoading.value = false
                    return false // Needs onboarding
                }
            } else {
                val code = response.code()
                _errorMessage.value = when (code) {
                    401 -> "Authentication failed: Invalid credentials or expired session."
                    403 -> "Access denied: Unauthorized to connect to APK backend."
                    500, 502, 503 -> "LogiSyncPRO server error ($code). Please check APK backend logs."
                    else -> "Failed to verify user profile (HTTP $code)."
                }
                _isLoading.value = false
                return false
            }
        } catch (e: Exception) {
            _errorMessage.value = mapError(e, "connect to user service")
            _isLoading.value = false
            return false
        }
    }

    /**
     * Complete onboarding and persist profile to APK NeonDB.
     */
    suspend fun saveProfile(
        country: String,
        state: String,
        city: String,
        role: String,
        customName: String? = null
    ): Boolean {
        val uid = _firebaseUid.value ?: run {
            _errorMessage.value = "Authentication required: No active session found."
            return false
        }
        val email = _userEmail.value ?: run {
            _errorMessage.value = "Authentication required: No authenticated email found."
            return false
        }
        val nameToSave = (customName?.trim()?.takeIf { it.isNotEmpty() }
            ?: _userDisplayName.value?.trim()?.takeIf { it.isNotEmpty() }
            ?: run {
                _errorMessage.value = "Display Name is required."
                return false
            })
        val photo = _userPhotoUrl.value ?: ""

        val profile = UserProfile(
            firebase_uid = uid,
            email = email,
            name = nameToSave,
            country = country,
            state = state,
            city = city,
            role = role,
            photo_url = photo
        )

        _isLoading.value = true
        clearError()
        try {
            val response = ApiClient.service.saveUserProfile(uid, profile)
            if (response.isSuccessful && response.body()?.success == true) {
                _currentUser.value = response.body()?.user ?: profile
                _isLoading.value = false
                return true
            } else {
                _errorMessage.value = response.body()?.error ?: "Failed to save profile (HTTP ${response.code()})"
                _isLoading.value = false
                return false
            }
        } catch (e: Exception) {
            _errorMessage.value = mapError(e, "save profile")
            _isLoading.value = false
            return false
        }
    }

    /**
     * Fetch transport requests from APK NeonDB.
     */
    suspend fun refreshRequests(filter: String = "all") {
        val uid = _firebaseUid.value ?: return
        _isLoading.value = true
        clearError()
        try {
            val response = ApiClient.service.getTransportRequests(filter, uid)
            if (response.isSuccessful) {
                val body = response.body()
                if (body?.success == true) {
                    _requests.value = body.requests
                } else {
                    _errorMessage.value = body?.error ?: "Failed to load requests"
                }
            } else {
                _errorMessage.value = "Failed to load requests from server (HTTP ${response.code()})"
            }
        } catch (e: Exception) {
            _errorMessage.value = mapError(e, "fetch requests")
        } finally {
            _isLoading.value = false
        }
    }

    /**
     * Create a new transport request (Shipper/Requester role).
     */
    suspend fun createRequest(
        pickup: String,
        delivery: String,
        cargoType: String,
        weight: String,
        notes: String? = null
    ): Boolean {
        val uid = _firebaseUid.value ?: return false
        _isLoading.value = true
        clearError()
        try {
            val dto = CreateRequestDto(
                pickup_location = pickup,
                delivery_location = delivery,
                cargo_type = cargoType,
                cargo_description = notes,
                weight = weight,
                notes = notes
            )
            val response = ApiClient.service.createTransportRequest(uid, dto)
            if (response.isSuccessful && response.body()?.success == true) {
                refreshRequests()
                _isLoading.value = false
                return true
            } else {
                _errorMessage.value = response.body()?.error ?: "Failed to create shipment (HTTP ${response.code()})"
                _isLoading.value = false
                return false
            }
        } catch (e: Exception) {
            _errorMessage.value = mapError(e, "create transport request")
            _isLoading.value = false
            return false
        }
    }

    /**
     * Transport Provider / Carrier accepts a pending shipment request.
     */
    suspend fun acceptRequest(requestId: Int): Boolean {
        val uid = _firebaseUid.value ?: return false
        _isLoading.value = true
        clearError()
        try {
            val response = ApiClient.service.acceptTransportRequest(requestId, uid)
            if (response.isSuccessful && response.body()?.success == true) {
                refreshRequests()
                _isLoading.value = false
                return true
            } else {
                _errorMessage.value = response.body()?.error ?: "Failed to accept load (HTTP ${response.code()})"
                _isLoading.value = false
                return false
            }
        } catch (e: Exception) {
            _errorMessage.value = mapError(e, "accept transport request")
            _isLoading.value = false
            return false
        }
    }

    /**
     * Update shipment status along milestone workflow.
     */
    suspend fun updateStatus(requestId: Int, status: String, description: String? = null): Boolean {
        val uid = _firebaseUid.value ?: return false
        _isLoading.value = true
        clearError()
        try {
            val dto = UpdateStatusDto(status = status, description = description)
            val response = ApiClient.service.updateTransportStatus(requestId, uid, dto)
            if (response.isSuccessful && response.body()?.success == true) {
                refreshRequests()
                _isLoading.value = false
                return true
            } else {
                _errorMessage.value = response.body()?.error ?: "Failed to update status (HTTP ${response.code()})"
                _isLoading.value = false
                return false
            }
        } catch (e: Exception) {
            _errorMessage.value = mapError(e, "update shipment milestone")
            _isLoading.value = false
            return false
        }
    }

    /**
     * Fetch event timeline history for a specific shipment.
     */
    suspend fun getShipmentEvents(requestId: Int): List<ShipmentEvent> {
        val uid = _firebaseUid.value ?: return emptyList()
        return try {
            val response = ApiClient.service.getShipmentEvents(requestId, uid)
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.events ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun signOut() {
        ApiClient.setAuth(null, null)
        _currentUser.value = null
        _firebaseUid.value = null
        _userEmail.value = null
        _userDisplayName.value = null
        _userPhotoUrl.value = null
        _requests.value = emptyList()
        clearError()
    }
}
