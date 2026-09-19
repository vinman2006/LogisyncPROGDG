package com.example.logisyncpro.data.repository

import android.util.Log
import com.example.logisyncpro.data.db.NeonDatabaseClient
import com.example.logisyncpro.data.model.*
import com.example.logisyncpro.utils.GeoUtils
import com.google.gson.JsonObject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

/**
 * Autonomous Repository for LogiSyncPRO.
 * Executes business operations and live GPS logging directly against the Neon Cloud Database.
 * Requires ZERO external backend hosting (no Render, no local IP server).
 */
object LogiSyncRepository {
    private const val TAG = "LogiSyncRepository"

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
                "Unable to connect to Neon Cloud Database. Please check your internet connection."
            is UnknownHostException ->
                "Network connection error: Unable to resolve cloud database host."
            else ->
                "Error while attempting to $action: ${e.localizedMessage ?: "Unknown network error"}"
        }
    }

    /**
     * Sign in user with Firebase UID / Google SSO credentials.
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
        clearError()

        try {
            val sql = "SELECT id, firebase_uid, email, display_name, photo_url, country, state, city, role, created_at::text, updated_at::text FROM users WHERE firebase_uid = $1 LIMIT 1"
            val rows = NeonDatabaseClient.query(sql, listOf(uid))

            if (rows.size() > 0) {
                val user = parseUserProfile(rows[0].asJsonObject)
                _currentUser.value = user
                _isLoading.value = false
                Log.d(TAG, "User profile loaded: ${user.name} (${user.role})")
                return true
            } else {
                _currentUser.value = null
                _isLoading.value = false
                return false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Sign-in error", e)
            _errorMessage.value = mapError(e, "connect to cloud database")
            _isLoading.value = false
            return false
        }
    }

    /**
     * Complete onboarding and persist profile to Neon Cloud DB directly.
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

        _isLoading.value = true
        clearError()

        try {
            val sql = """
                INSERT INTO users (firebase_uid, email, display_name, photo_url, country, state, city, role, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                ON CONFLICT (firebase_uid) 
                DO UPDATE SET
                  display_name = EXCLUDED.display_name,
                  photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
                  country = EXCLUDED.country,
                  state = EXCLUDED.state,
                  city = EXCLUDED.city,
                  role = EXCLUDED.role,
                  updated_at = NOW()
                RETURNING id, firebase_uid, email, display_name, photo_url, country, state, city, role, created_at::text, updated_at::text;
            """.trimIndent()

            val rows = NeonDatabaseClient.query(
                sql,
                listOf(uid, email, nameToSave, photo, country, state, city, role)
            )

            if (rows.size() > 0) {
                val savedUser = parseUserProfile(rows[0].asJsonObject)
                _currentUser.value = savedUser
                _isLoading.value = false
                return true
            } else {
                _errorMessage.value = "Failed to save profile: Database returned no record."
                _isLoading.value = false
                return false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Save profile error", e)
            _errorMessage.value = mapError(e, "save profile to cloud database")
            _isLoading.value = false
            return false
        }
    }

    /**
     * Fetch transport requests directly from Neon Cloud DB.
     */
    suspend fun refreshRequests(filter: String = "all") {
        _isLoading.value = true
        clearError()

        try {
            val sql = """
                SELECT 
                  tr.id,
                  tr.tracking_number,
                  tr.shipper_id AS requester_id,
                  tr.assigned_carrier_id AS provider_id,
                  CONCAT(tr.origin_city, CASE WHEN tr.origin_state IS NOT NULL AND tr.origin_state != '' THEN CONCAT(', ', tr.origin_state) ELSE '' END) AS pickup_location,
                  CONCAT(tr.destination_city, CASE WHEN tr.destination_state IS NOT NULL AND tr.destination_state != '' THEN CONCAT(', ', tr.destination_state) ELSE '' END) AS delivery_location,
                  COALESCE(tr.origin_lat, 21.1458) AS origin_lat,
                  COALESCE(tr.origin_lng, 79.0882) AS origin_lng,
                  COALESCE(tr.destination_lat, 19.0760) AS destination_lat,
                  COALESCE(tr.destination_lng, 72.8777) AS destination_lng,
                  tr.cargo_type,
                  tr.cargo_description,
                  CONCAT(tr.weight_kg, ' kg') AS weight,
                  tr.requested_date::text,
                  tr.special_instructions AS notes,
                  tr.status,
                  tr.created_at::text,
                  tr.updated_at::text,
                  tr.accepted_at::text,
                  tr.delivered_at::text,
                  s.display_name AS requester_name,
                  s.email AS requester_email,
                  s.city AS requester_city,
                  c.display_name AS provider_name,
                  c.email AS provider_email,
                  c.city AS provider_city
                FROM transport_requests tr
                LEFT JOIN users s ON tr.shipper_id = s.id
                LEFT JOIN users c ON tr.assigned_carrier_id = c.id
                ORDER BY tr.created_at DESC;
            """.trimIndent()

            val rows = NeonDatabaseClient.query(sql)
            val list = mutableListOf<TransportRequest>()
            for (i in 0 until rows.size()) {
                val item = parseTransportRequest(rows[i].asJsonObject)
                if (filter.equals("all", ignoreCase = true)) {
                    list.add(item)
                } else if (filter.equals("pending", ignoreCase = true) && item.status.equals("PENDING", ignoreCase = true)) {
                    list.add(item)
                } else if (filter.equals("active", ignoreCase = true) && item.status.uppercase() in listOf("ACCEPTED", "IN_TRANSIT", "PICKUP_CONFIRMED", "OUT_FOR_DELIVERY")) {
                    list.add(item)
                } else if (filter.equals("delivered", ignoreCase = true) && item.status.equals("DELIVERED", ignoreCase = true)) {
                    list.add(item)
                } else {
                    list.add(item)
                }
            }

            _requests.value = list
        } catch (e: Exception) {
            Log.e(TAG, "Refresh requests error", e)
            _errorMessage.value = mapError(e, "fetch shipments from cloud database")
        } finally {
            _isLoading.value = false
        }
    }

    /**
     * Create a new transport request with auto-resolved geographic coordinates.
     */
    suspend fun createRequest(
        pickup: String,
        delivery: String,
        cargoType: String,
        weight: String,
        notes: String? = null
    ): Boolean {
        _isLoading.value = true
        clearError()

        try {
            val user = _currentUser.value
            val effectiveShipperId = user?.id ?: 1

            val originCity = pickup.split(",")[0].trim()
            val originState = if (pickup.contains(",")) pickup.split(",")[1].trim() else "Maharashtra"
            val destCity = delivery.split(",")[0].trim()
            val destState = if (delivery.contains(",")) delivery.split(",")[1].trim() else "Maharashtra"

            val (originLat, originLng) = GeoUtils.resolveCityCoordinates(originCity)
            val (destLat, destLng) = GeoUtils.resolveCityCoordinates(destCity)

            val cleanWeightNum = weight.replace("[^0-9.]".toRegex(), "").toDoubleOrNull() ?: 1000.0
            val trackingNumber = "LS-${(100000..999999).random()}"

            val insertSql = """
                INSERT INTO transport_requests (
                  tracking_number, shipper_id, origin_city, origin_state,
                  destination_city, destination_state, origin_lat, origin_lng,
                  destination_lat, destination_lng, cargo_type, cargo_description,
                  weight_kg, status, special_instructions, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PENDING', $14, NOW(), NOW())
                RETURNING id;
            """.trimIndent()

            val insertRes = NeonDatabaseClient.query(
                insertSql,
                listOf(
                    trackingNumber,
                    effectiveShipperId,
                    originCity,
                    originState,
                    destCity,
                    destState,
                    originLat,
                    originLng,
                    destLat,
                    destLng,
                    cargoType,
                    notes ?: "",
                    cleanWeightNum,
                    notes ?: ""
                )
            )

            if (insertRes.size() > 0) {
                val newRequestId = insertRes[0].asJsonObject.get("id").asInt

                // Record audit event
                val eventSql = """
                    INSERT INTO shipment_events (request_id, actor_id, event_type, description, created_at)
                    VALUES ($1, $2, 'CREATED', $3, NOW());
                """.trimIndent()
                NeonDatabaseClient.query(
                    eventSql,
                    listOf(
                        newRequestId,
                        effectiveShipperId,
                        "Transport request created for $originCity to $destCity ($cargoType, $weight)"
                    )
                )

                refreshRequests()
                _isLoading.value = false
                return true
            } else {
                _errorMessage.value = "Failed to create shipment in database."
                _isLoading.value = false
                return false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Create request error", e)
            _errorMessage.value = mapError(e, "create transport request")
            _isLoading.value = false
            return false
        }
    }

    /**
     * Carrier accepts shipment.
     */
    suspend fun acceptRequest(requestId: Int): Boolean {
        _isLoading.value = true
        clearError()

        try {
            val user = _currentUser.value
            val carrierId = user?.id ?: 2
            val carrierName = user?.name ?: "Transport Provider"

            val updateSql = """
                UPDATE transport_requests
                SET 
                  status = 'ACCEPTED',
                  assigned_carrier_id = $1,
                  accepted_at = NOW(),
                  updated_at = NOW()
                WHERE id = $2 AND status = 'PENDING' AND assigned_carrier_id IS NULL
                RETURNING id;
            """.trimIndent()

            val updateRes = NeonDatabaseClient.query(updateSql, listOf(carrierId, requestId))

            if (updateRes.size() > 0) {
                val eventSql = """
                    INSERT INTO shipment_events (request_id, actor_id, event_type, description, created_at)
                    VALUES ($1, $2, 'ACCEPTED', $3, NOW());
                """.trimIndent()
                NeonDatabaseClient.query(
                    eventSql,
                    listOf(
                        requestId,
                        carrierId,
                        "Transport provider '$carrierName' accepted the request. Ready for delivery dispatch."
                    )
                )

                refreshRequests()
                _isLoading.value = false
                return true
            } else {
                _errorMessage.value = "This shipment has already been claimed by another carrier."
                _isLoading.value = false
                return false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Accept request error", e)
            _errorMessage.value = mapError(e, "accept transport request")
            _isLoading.value = false
            return false
        }
    }

    // =========================================================================
    // REAL GPS TRACKING & LOGISTICS BACKEND OPERATIONS
    // =========================================================================

    /**
     * Carrier starts delivery: Transitions shipment to IN_TRANSIT and initiates tracking session.
     */
    suspend fun startTracking(shipmentId: Int): Boolean {
        val user = _currentUser.value
        val driverId = user?.id ?: 2

        try {
            // Verify carrier authorization
            val checkSql = "SELECT assigned_carrier_id FROM transport_requests WHERE id = $1 LIMIT 1"
            val rows = NeonDatabaseClient.query(checkSql, listOf(shipmentId))
            if (rows.size() > 0) {
                val assignedCarrier = rows[0].asJsonObject.get("assigned_carrier_id")?.takeIf { !it.isJsonNull }?.asInt
                if (assignedCarrier != null && assignedCarrier != driverId && user?.role == "TRANSPORT_PROVIDER") {
                    Log.w(TAG, "Carrier mismatch for tracking start")
                }
            }

            // Update shipment status to IN_TRANSIT
            val updateSql = """
                UPDATE transport_requests
                SET status = 'IN_TRANSIT', updated_at = NOW()
                WHERE id = $1;
            """.trimIndent()
            NeonDatabaseClient.query(updateSql, listOf(shipmentId))

            // Create tracking session record
            val sessSql = """
                INSERT INTO tracking_sessions (shipment_id, driver_id, started_at, status)
                VALUES ($1, $2, NOW(), 'ACTIVE');
            """.trimIndent()
            NeonDatabaseClient.query(sessSql, listOf(shipmentId, driverId))

            // Record audit milestone event
            val eventSql = """
                INSERT INTO shipment_events (request_id, actor_id, event_type, description, created_at)
                VALUES ($1, $2, 'IN_TRANSIT', $3, NOW());
            """.trimIndent()
            NeonDatabaseClient.query(
                eventSql,
                listOf(shipmentId, driverId, "Delivery commenced. Real-time GPS telemetry initiated by carrier.")
            )

            refreshRequests()
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Start tracking error", e)
            return false
        }
    }

    /**
     * Records real GPS coordinates into vehicle_locations table.
     */
    suspend fun recordLocation(
        shipmentId: Int,
        latitude: Double,
        longitude: Double,
        accuracy: Float? = null,
        speed: Float? = null,
        heading: Float? = null
    ): Boolean {
        val user = _currentUser.value
        val driverId = user?.id ?: 2

        try {
            val sql = """
                INSERT INTO vehicle_locations (
                  shipment_id, driver_id, vehicle_id, latitude, longitude,
                  accuracy, speed, heading, recorded_at, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                RETURNING id;
            """.trimIndent()

            val res = NeonDatabaseClient.query(
                sql,
                listOf(
                    shipmentId,
                    driverId,
                    "VEHICLE-${driverId}",
                    latitude,
                    longitude,
                    accuracy,
                    speed,
                    heading
                )
            )
            return res.size() > 0
        } catch (e: Exception) {
            Log.e(TAG, "Record location DB error", e)
            throw e
        }
    }

    /**
     * Fetches the single latest recorded GPS location for a shipment.
     */
        suspend fun getShipmentById(id: Int): TransportRequest? {
        val cached = _requests.value.find { it.id == id }
        if (cached != null) return cached

        try {
            val sql = """
                SELECT 
                  tr.id,
                  tr.tracking_number,
                  tr.shipper_id AS requester_id,
                  tr.assigned_carrier_id AS provider_id,
                  CONCAT(tr.origin_city, CASE WHEN tr.origin_state IS NOT NULL AND tr.origin_state != '' THEN CONCAT(', ', tr.origin_state) ELSE '' END) AS pickup_location,
                  CONCAT(tr.destination_city, CASE WHEN tr.destination_state IS NOT NULL AND tr.destination_state != '' THEN CONCAT(', ', tr.destination_state) ELSE '' END) AS delivery_location,
                  COALESCE(tr.origin_lat, 21.1458) AS origin_lat,
                  COALESCE(tr.origin_lng, 79.0882) AS origin_lng,
                  COALESCE(tr.destination_lat, 19.0760) AS destination_lat,
                  COALESCE(tr.destination_lng, 72.8777) AS destination_lng,
                  tr.cargo_type,
                  tr.cargo_description,
                  CONCAT(tr.weight_kg, ' kg') AS weight,
                  tr.requested_date::text,
                  tr.special_instructions AS notes,
                  tr.status,
                  tr.created_at::text,
                  tr.updated_at::text,
                  tr.accepted_at::text,
                  tr.delivered_at::text,
                  s.display_name AS requester_name,
                  s.email AS requester_email,
                  s.city AS requester_city,
                  c.display_name AS provider_name,
                  c.email AS provider_email,
                  c.city AS provider_city
                FROM transport_requests tr
                LEFT JOIN users s ON tr.shipper_id = s.id
                LEFT JOIN users c ON tr.assigned_carrier_id = c.id
                WHERE tr.id = $1
                LIMIT 1;
            """.trimIndent()
            val rows = NeonDatabaseClient.query(sql, listOf(id))
            if (rows.size() > 0) {
                return parseTransportRequest(rows[0].asJsonObject)
            }
        } catch (e: Exception) {
            Log.e(TAG, "getShipmentById error", e)
        }
        return null
    }

    suspend fun getLatestLocation(shipmentId: Int): VehicleLocation? {
        return try {
            val sql = """
                SELECT id, shipment_id, driver_id, vehicle_id, latitude, longitude,
                       accuracy, speed, heading, recorded_at::text, created_at::text
                FROM vehicle_locations
                WHERE shipment_id = $1
                ORDER BY recorded_at DESC
                LIMIT 1;
            """.trimIndent()

            val rows = NeonDatabaseClient.query(sql, listOf(shipmentId))
            if (rows.size() > 0) {
                parseVehicleLocation(rows[0].asJsonObject)
            } else null
        } catch (e: Exception) {
            Log.e(TAG, "Get latest location error", e)
            null
        }
    }

    /**
     * Fetches real location history points for a shipment.
     */
    suspend fun getLocationHistory(shipmentId: Int): List<VehicleLocation> {
        return try {
            val sql = """
                SELECT id, shipment_id, driver_id, vehicle_id, latitude, longitude,
                       accuracy, speed, heading, recorded_at::text, created_at::text
                FROM vehicle_locations
                WHERE shipment_id = $1
                ORDER BY recorded_at ASC
                LIMIT 200;
            """.trimIndent()

            val rows = NeonDatabaseClient.query(sql, listOf(shipmentId))
            val list = mutableListOf<VehicleLocation>()
            for (i in 0 until rows.size()) {
                list.add(parseVehicleLocation(rows[i].asJsonObject))
            }
            list
        } catch (e: Exception) {
            Log.e(TAG, "Get location history error", e)
            emptyList()
        }
    }

    /**
     * Closes tracking session in DB.
     */
    suspend fun stopTrackingSession(shipmentId: Int) {
        try {
            val sql = """
                UPDATE tracking_sessions
                SET status = 'COMPLETED', ended_at = NOW()
                WHERE shipment_id = $1 AND status = 'ACTIVE';
            """.trimIndent()
            NeonDatabaseClient.query(sql, listOf(shipmentId))
        } catch (e: Exception) {
            Log.e(TAG, "Stop tracking session error", e)
        }
    }

    /**
     * Logs geofence arrival event in DB.
     */
    suspend fun triggerGeofenceEvent(shipmentId: Int, eventType: String, description: String) {
        try {
            val user = _currentUser.value
            val actorId = user?.id

            val sql = """
                INSERT INTO shipment_events (request_id, actor_id, event_type, description, created_at)
                VALUES ($1, $2, $3, $4, NOW());
            """.trimIndent()
            NeonDatabaseClient.query(sql, listOf(shipmentId, actorId, eventType, description))
        } catch (e: Exception) {
            Log.e(TAG, "Geofence event insert error", e)
        }
    }

    /**
     * Driver confirms final delivery: OUT_FOR_DELIVERY / IN_TRANSIT -> DELIVERED.
     */
    suspend fun confirmDelivery(shipmentId: Int, notes: String? = null): Boolean {
        _isLoading.value = true
        clearError()

        try {
            val user = _currentUser.value
            val carrierId = user?.id ?: 2
            val carrierName = user?.name ?: "Carrier"

            val updateSql = """
                UPDATE transport_requests
                SET 
                  status = 'DELIVERED',
                  delivered_at = NOW(),
                  updated_at = NOW()
                WHERE id = $1
                RETURNING id;
            """.trimIndent()

            val res = NeonDatabaseClient.query(updateSql, listOf(shipmentId))

            if (res.size() > 0) {
                // End tracking session
                stopTrackingSession(shipmentId)

                // Log audit event
                val eventDesc = notes ?: "Delivery completed and verified at destination terminal by $carrierName."
                val eventSql = """
                    INSERT INTO shipment_events (request_id, actor_id, event_type, description, created_at)
                    VALUES ($1, $2, 'DELIVERED', $3, NOW());
                """.trimIndent()
                NeonDatabaseClient.query(eventSql, listOf(shipmentId, carrierId, eventDesc))

                refreshRequests()
                _isLoading.value = false
                return true
            } else {
                _errorMessage.value = "Shipment #$shipmentId not found."
                _isLoading.value = false
                return false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Confirm delivery error", e)
            _errorMessage.value = mapError(e, "confirm delivery")
            _isLoading.value = false
            return false
        }
    }

    /**
     * Fetch timeline audit events for a shipment.
     */
    suspend fun getShipmentEvents(requestId: Int): List<ShipmentEvent> {
        return try {
            val sql = """
                SELECT 
                  se.id,
                  se.request_id,
                  COALESCE(se.actor_id, 0) AS actor_id,
                  se.event_type,
                  se.description,
                  se.created_at::text,
                  COALESCE(u.display_name, 'LogiSyncPRO System') AS actor_name,
                  COALESCE(u.role, 'SYSTEM') AS actor_role
                FROM shipment_events se
                LEFT JOIN users u ON se.actor_id = u.id
                WHERE se.request_id = $1
                ORDER BY se.created_at ASC;
            """.trimIndent()

            val rows = NeonDatabaseClient.query(sql, listOf(requestId))
            val list = mutableListOf<ShipmentEvent>()
            for (i in 0 until rows.size()) {
                list.add(parseShipmentEvent(rows[i].asJsonObject))
            }
            list
        } catch (e: Exception) {
            Log.e(TAG, "Get events error", e)
            emptyList()
        }
    }

    suspend fun updateRequestStatus(requestId: Int, newStatus: String): Boolean {
        _isLoading.value = true
        clearError()
        try {
            val user = _currentUser.value
            val actorId = user?.id ?: 1
            val actorName = user?.name ?: "User"

            val updateSql = """
                UPDATE transport_requests
                SET status = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING id;
            """.trimIndent()
            val updateRes = NeonDatabaseClient.query(updateSql, listOf(newStatus.uppercase(), requestId))

            if (updateRes.size() > 0) {
                val eventSql = """
                    INSERT INTO shipment_events (request_id, actor_id, event_type, description, created_at)
                    VALUES ($1, $2, $3, $4, NOW());
                """.trimIndent()
                NeonDatabaseClient.query(
                    eventSql,
                    listOf(
                        requestId,
                        actorId,
                        newStatus.uppercase(),
                        "Shipment status transitioned to $newStatus by $actorName"
                    )
                )
                refreshRequests()
                return true
            }
            return false
        } catch (e: Exception) {
            _errorMessage.value = mapError(e, "update status")
            return false
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun updateUserRole(newRole: String): Boolean {
        try {
            val user = _currentUser.value ?: return false
            val updateSql = """
                UPDATE users
                SET role = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING id;
            """.trimIndent()
            val res = NeonDatabaseClient.query(updateSql, listOf(newRole.uppercase(), user.id))
            if (res.size() > 0) {
                _currentUser.value = user.copy(role = newRole.uppercase())
                return true
            }
            return false
        } catch (e: Exception) {
            return false
        }
    }

    fun signOut() {
        _currentUser.value = null
        _firebaseUid.value = null
        _userEmail.value = null
        _userDisplayName.value = null
        _userPhotoUrl.value = null
        _requests.value = emptyList()
        clearError()
    }

    private fun parseUserProfile(obj: JsonObject): UserProfile {
        return UserProfile(
            id = obj.get("id")?.asInt ?: 0,
            firebase_uid = obj.get("firebase_uid")?.asString ?: "",
            email = obj.get("email")?.asString ?: "",
            name = obj.get("display_name")?.takeIf { !it.isJsonNull }?.asString
                ?: obj.get("name")?.takeIf { !it.isJsonNull }?.asString,
            photo_url = obj.get("photo_url")?.takeIf { !it.isJsonNull }?.asString ?: "",
            country = obj.get("country")?.takeIf { !it.isJsonNull }?.asString ?: "India",
            state = obj.get("state")?.takeIf { !it.isJsonNull }?.asString ?: "Maharashtra",
            city = obj.get("city")?.takeIf { !it.isJsonNull }?.asString ?: "Nagpur",
            role = obj.get("role")?.takeIf { !it.isJsonNull }?.asString ?: "REQUESTER",
            created_at = obj.get("created_at")?.takeIf { !it.isJsonNull }?.asString,
            updated_at = obj.get("updated_at")?.takeIf { !it.isJsonNull }?.asString
        )
    }

    private fun parseTransportRequest(obj: JsonObject): TransportRequest {
        val pickup = obj.get("pickup_location")?.takeIf { !it.isJsonNull }?.asString ?: ""
        val delivery = obj.get("delivery_location")?.takeIf { !it.isJsonNull }?.asString ?: ""

        val rawOrigLat = obj.get("origin_lat")?.takeIf { !it.isJsonNull }?.asDouble
        val rawOrigLng = obj.get("origin_lng")?.takeIf { !it.isJsonNull }?.asDouble
        val rawDestLat = obj.get("destination_lat")?.takeIf { !it.isJsonNull }?.asDouble
        val rawDestLng = obj.get("destination_lng")?.takeIf { !it.isJsonNull }?.asDouble

        val defaultOrigCoords = GeoUtils.resolveCityCoordinates(pickup)
        val defaultDestCoords = GeoUtils.resolveCityCoordinates(delivery)

        return TransportRequest(
            id = obj.get("id")?.asInt ?: 0,
            tracking_number = obj.get("tracking_number")?.takeIf { !it.isJsonNull }?.asString ?: "",
            requester_id = obj.get("requester_id")?.takeIf { !it.isJsonNull }?.asInt ?: 0,
            provider_id = obj.get("provider_id")?.takeIf { !it.isJsonNull }?.asInt,
            pickup_location = pickup,
            delivery_location = delivery,
            origin_lat = rawOrigLat ?: defaultOrigCoords.first,
            origin_lng = rawOrigLng ?: defaultOrigCoords.second,
            destination_lat = rawDestLat ?: defaultDestCoords.first,
            destination_lng = rawDestLng ?: defaultDestCoords.second,
            cargo_type = obj.get("cargo_type")?.takeIf { !it.isJsonNull }?.asString ?: "General Freight",
            cargo_description = obj.get("cargo_description")?.takeIf { !it.isJsonNull }?.asString,
            weight = obj.get("weight")?.takeIf { !it.isJsonNull }?.asString ?: "1000 kg",
            requested_date = obj.get("requested_date")?.takeIf { !it.isJsonNull }?.asString,
            notes = obj.get("notes")?.takeIf { !it.isJsonNull }?.asString,
            status = obj.get("status")?.takeIf { !it.isJsonNull }?.asString ?: "PENDING",
            created_at = obj.get("created_at")?.takeIf { !it.isJsonNull }?.asString,
            updated_at = obj.get("updated_at")?.takeIf { !it.isJsonNull }?.asString,
            accepted_at = obj.get("accepted_at")?.takeIf { !it.isJsonNull }?.asString,
            delivered_at = obj.get("delivered_at")?.takeIf { !it.isJsonNull }?.asString,
            requester_name = obj.get("requester_name")?.takeIf { !it.isJsonNull }?.asString,
            requester_email = obj.get("requester_email")?.takeIf { !it.isJsonNull }?.asString,
            requester_city = obj.get("requester_city")?.takeIf { !it.isJsonNull }?.asString,
            provider_name = obj.get("provider_name")?.takeIf { !it.isJsonNull }?.asString,
            provider_email = obj.get("provider_email")?.takeIf { !it.isJsonNull }?.asString,
            provider_city = obj.get("provider_city")?.takeIf { !it.isJsonNull }?.asString
        )
    }

    private fun parseVehicleLocation(obj: JsonObject): VehicleLocation {
        return VehicleLocation(
            id = obj.get("id")?.asInt ?: 0,
            shipment_id = obj.get("shipment_id")?.asInt ?: 0,
            driver_id = obj.get("driver_id")?.takeIf { !it.isJsonNull }?.asInt,
            vehicle_id = obj.get("vehicle_id")?.takeIf { !it.isJsonNull }?.asString,
            latitude = obj.get("latitude")?.asDouble ?: 0.0,
            longitude = obj.get("longitude")?.asDouble ?: 0.0,
            accuracy = obj.get("accuracy")?.takeIf { !it.isJsonNull }?.asFloat,
            speed = obj.get("speed")?.takeIf { !it.isJsonNull }?.asFloat,
            heading = obj.get("heading")?.takeIf { !it.isJsonNull }?.asFloat,
            recorded_at = obj.get("recorded_at")?.takeIf { !it.isJsonNull }?.asString,
            created_at = obj.get("created_at")?.takeIf { !it.isJsonNull }?.asString
        )
    }

    private fun parseShipmentEvent(obj: JsonObject): ShipmentEvent {
        return ShipmentEvent(
            id = obj.get("id")?.asInt ?: 0,
            request_id = obj.get("request_id")?.takeIf { !it.isJsonNull }?.asInt ?: 0,
            actor_id = obj.get("actor_id")?.takeIf { !it.isJsonNull }?.asInt ?: 0,
            event_type = obj.get("event_type")?.takeIf { !it.isJsonNull }?.asString ?: "",
            description = obj.get("description")?.takeIf { !it.isJsonNull }?.asString ?: "",
            created_at = obj.get("created_at")?.takeIf { !it.isJsonNull }?.asString ?: "",
            actor_name = obj.get("actor_name")?.takeIf { !it.isJsonNull }?.asString ?: "LogiSyncPRO System",
            actor_role = obj.get("actor_role")?.takeIf { !it.isJsonNull }?.asString ?: "SYSTEM"
        )
    }
}
