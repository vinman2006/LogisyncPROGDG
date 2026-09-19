package com.example.logisyncpro.service

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Looper
import android.util.Log
import androidx.core.app.ActivityCompat
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.utils.GeoUtils
import com.google.android.gms.location.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.CopyOnWriteArrayList

/**
 * Production-Grade Android GPS Location Engine for LogiSyncPRO.
 * Uses Google Play Services FusedLocationProviderClient + simultaneous LocationManager (GPS & Network providers).
 * Fetches instant last-known fixes, continuous real-time streaming, and direct upload to Neon PostgreSQL.
 */
object RealLocationTracker {
    private const val TAG = "RealLocationTracker"

    private const val UPDATE_INTERVAL_MS = 6000L
    private const val FASTEST_INTERVAL_MS = 3000L
    private const val MIN_DISPLACEMENT_METERS = 0f

    private const val GEOFENCE_RADIUS_METERS = 300.0

    private val trackerScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private val _isTrackingActive = MutableStateFlow(false)
    val isTrackingActive: StateFlow<Boolean> = _isTrackingActive.asStateFlow()

    private val _activeShipmentId = MutableStateFlow<Int?>(null)
    val activeShipmentId: StateFlow<Int?> = _activeShipmentId.asStateFlow()

    private val _currentLocation = MutableStateFlow<Location?>(null)
    val currentLocation: StateFlow<Location?> = _currentLocation.asStateFlow()

    private val _lastUpdateTimestamp = MutableStateFlow(0L)
    val lastUpdateTimestamp: StateFlow<Long> = _lastUpdateTimestamp.asStateFlow()

    private val _uploadedFixesCount = MutableStateFlow(0)
    val uploadedFixesCount: StateFlow<Int> = _uploadedFixesCount.asStateFlow()

    private val _isWaitingForNetwork = MutableStateFlow(false)
    val isWaitingForNetwork: StateFlow<Boolean> = _isWaitingForNetwork.asStateFlow()

    private val _isGpsEnabled = MutableStateFlow(true)
    val isGpsEnabled: StateFlow<Boolean> = _isGpsEnabled.asStateFlow()

    private val _lastStatusMessage = MutableStateFlow<String>("GPS Ready")
    val lastStatusMessage: StateFlow<String> = _lastStatusMessage.asStateFlow()

    private data class QueuedLocation(
        val shipmentId: Int,
        val latitude: Double,
        val longitude: Double,
        val accuracy: Float?,
        val speed: Float?,
        val heading: Float?,
        val timestamp: Long
    )
    private val offlineQueue = CopyOnWriteArrayList<QueuedLocation>()

    private var fusedClient: FusedLocationProviderClient? = null
    private var locationCallback: LocationCallback? = null
    private var nativeLocationManager: LocationManager? = null
    private var nativeListener: LocationListener? = null

    private var currentOriginLat: Double = 0.0
    private var currentOriginLng: Double = 0.0
    private var currentDestLat: Double = 0.0
    private var currentDestLng: Double = 0.0

    private var pickupGeofenceTriggered = false
    private var destGeofenceTriggered = false

    private var lastUploadedLat: Double = 0.0
    private var lastUploadedLng: Double = 0.0
    private var lastUploadTimeMs: Long = 0L

    fun hasLocationPermission(context: Context): Boolean {
        return ActivityCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED ||
        ActivityCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun checkGpsEnabled(context: Context): Boolean {
        val lm = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        val enabled = lm?.isProviderEnabled(LocationManager.GPS_PROVIDER) == true ||
                      lm?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true
        _isGpsEnabled.value = enabled
        return enabled
    }

    fun startTracking(
        context: Context,
        shipmentId: Int,
        originLat: Double = 21.1458,
        originLng: Double = 79.0882,
        destLat: Double = 19.0760,
        destLng: Double = 72.8777
    ): Boolean {
        if (!hasLocationPermission(context)) {
            _lastStatusMessage.value = "Location permission required"
            Log.w(TAG, "Location permission not granted. Cannot start tracking.")
            return false
        }

        checkGpsEnabled(context)

        _activeShipmentId.value = shipmentId
        _isTrackingActive.value = true
        _lastStatusMessage.value = "Acquiring GPS fix..."
        currentOriginLat = originLat
        currentOriginLng = originLng
        currentDestLat = destLat
        currentDestLng = destLng
        pickupGeofenceTriggered = false
        destGeofenceTriggered = false
        lastUploadedLat = 0.0
        lastUploadedLng = 0.0
        lastUploadTimeMs = 0L

        fetchImmediateLastKnownLocation(context, shipmentId)

        try {
            fusedClient = LocationServices.getFusedLocationProviderClient(context)
            val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, UPDATE_INTERVAL_MS)
                .setMinUpdateIntervalMillis(FASTEST_INTERVAL_MS)
                .setMinUpdateDistanceMeters(MIN_DISPLACEMENT_METERS)
                .setWaitForAccurateLocation(false)
                .build()

            locationCallback = object : LocationCallback() {
                override fun onLocationResult(result: LocationResult) {
                    result.lastLocation?.let { handleNewLocation(it, shipmentId) }
                }

                override fun onLocationAvailability(avail: LocationAvailability) {
                    _isGpsEnabled.value = avail.isLocationAvailable
                }
            }

            fusedClient?.requestLocationUpdates(
                locationRequest,
                locationCallback!!,
                Looper.getMainLooper()
            )
            Log.d(TAG, "FusedLocationProvider updates active for shipment #$shipmentId")
        } catch (e: Exception) {
            Log.w(TAG, "FusedLocation failed: ${e.message}")
        }

        startNativeProviders(context, shipmentId)

        trackerScope.launch {
            LogiSyncRepository.startTracking(shipmentId)
        }

        return true
    }

    private fun fetchImmediateLastKnownLocation(context: Context, shipmentId: Int) {
        if (!hasLocationPermission(context)) return

        try {
            fusedClient = fusedClient ?: LocationServices.getFusedLocationProviderClient(context)
            fusedClient?.lastLocation?.addOnSuccessListener { loc ->
                if (loc != null) {
                    Log.i(TAG, "Instant fix from FusedLocation: ${loc.latitude}, ${loc.longitude}")
                    handleNewLocation(loc, shipmentId)
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Fused lastLocation error: ${e.message}")
        }

        try {
            val lm = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
            if (lm != null && ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                val netLoc = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                val gpsLoc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                val best = when {
                    gpsLoc != null && netLoc != null -> if (gpsLoc.time > netLoc.time) gpsLoc else netLoc
                    gpsLoc != null -> gpsLoc
                    netLoc != null -> netLoc
                    else -> null
                }
                if (best != null && _currentLocation.value == null) {
                    Log.i(TAG, "Instant fix from Native Provider: ${best.latitude}, ${best.longitude}")
                    handleNewLocation(best, shipmentId)
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Native lastKnownLocation error: ${e.message}")
        }
    }

    private fun startNativeProviders(context: Context, shipmentId: Int) {
        try {
            nativeLocationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
            nativeListener = object : LocationListener {
                override fun onLocationChanged(location: Location) {
                    handleNewLocation(location, shipmentId)
                }
                override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
                override fun onProviderEnabled(provider: String) { _isGpsEnabled.value = true }
                override fun onProviderDisabled(provider: String) { _isGpsEnabled.value = false }
            }

            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                if (nativeLocationManager?.isProviderEnabled(LocationManager.GPS_PROVIDER) == true) {
                    nativeLocationManager?.requestLocationUpdates(
                        LocationManager.GPS_PROVIDER,
                        UPDATE_INTERVAL_MS,
                        MIN_DISPLACEMENT_METERS,
                        nativeListener!!,
                        Looper.getMainLooper()
                    )
                }
                if (nativeLocationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true) {
                    nativeLocationManager?.requestLocationUpdates(
                        LocationManager.NETWORK_PROVIDER,
                        UPDATE_INTERVAL_MS,
                        MIN_DISPLACEMENT_METERS,
                        nativeListener!!,
                        Looper.getMainLooper()
                    )
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Native location providers registration error", e)
        }
    }

    private fun handleNewLocation(loc: Location, shipmentId: Int) {
        _currentLocation.value = loc
        val now = System.currentTimeMillis()
        _lastUpdateTimestamp.value = now
        _lastStatusMessage.value = String.format(java.util.Locale.US, "GPS: %.4f, %.4f (±%.0fm)", loc.latitude, loc.longitude, loc.accuracy)

        val timeElapsed = now - lastUploadTimeMs
        if (lastUploadTimeMs != 0L && timeElapsed < 4000L) {
            return
        }

        lastUploadedLat = loc.latitude
        lastUploadedLng = loc.longitude
        lastUploadTimeMs = now

        evaluateGeofences(shipmentId, loc.latitude, loc.longitude)

        trackerScope.launch {
            uploadLocation(
                shipmentId = shipmentId,
                lat = loc.latitude,
                lng = loc.longitude,
                accuracy = loc.accuracy,
                speed = if (loc.hasSpeed()) loc.speed else null,
                heading = if (loc.hasBearing()) loc.bearing else null,
                timestamp = now
            )
        }
    }

    private suspend fun uploadLocation(
        shipmentId: Int,
        lat: Double,
        lng: Double,
        accuracy: Float?,
        speed: Float?,
        heading: Float?,
        timestamp: Long
    ) {
        try {
            val success = LogiSyncRepository.recordLocation(
                shipmentId = shipmentId,
                latitude = lat,
                longitude = lng,
                accuracy = accuracy,
                speed = speed,
                heading = heading
            )

            if (success) {
                _isWaitingForNetwork.value = false
                _uploadedFixesCount.value += 1
                _lastStatusMessage.value = "Synced ${_uploadedFixesCount.value} fixes to Neon DB"
                flushOfflineQueue()
            } else {
                queueLocally(shipmentId, lat, lng, accuracy, speed, heading, timestamp)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Location upload failed, queueing offline: ${e.message}")
            _isWaitingForNetwork.value = true
            _lastStatusMessage.value = "Queued offline (waiting for network)"
            queueLocally(shipmentId, lat, lng, accuracy, speed, heading, timestamp)
        }
    }

    private fun queueLocally(shipmentId: Int, lat: Double, lng: Double, acc: Float?, spd: Float?, hdg: Float?, ts: Long) {
        if (offlineQueue.size < 500) {
            offlineQueue.add(QueuedLocation(shipmentId, lat, lng, acc, spd, hdg, ts))
        }
    }

    private suspend fun flushOfflineQueue() {
        if (offlineQueue.isEmpty()) return
        val batch = ArrayList(offlineQueue)
        offlineQueue.clear()

        for (item in batch) {
            try {
                LogiSyncRepository.recordLocation(
                    shipmentId = item.shipmentId,
                    latitude = item.latitude,
                    longitude = item.longitude,
                    accuracy = item.accuracy,
                    speed = item.speed,
                    heading = item.heading
                )
                _uploadedFixesCount.value += 1
            } catch (e: Exception) {
                offlineQueue.add(item)
                _isWaitingForNetwork.value = true
                break
            }
        }
    }

    private fun evaluateGeofences(shipmentId: Int, lat: Double, lng: Double) {
        if (!destGeofenceTriggered && currentDestLat != 0.0 && currentDestLng != 0.0) {
            val distToDest = GeoUtils.distanceMeters(lat, lng, currentDestLat, currentDestLng)
            if (distToDest <= GEOFENCE_RADIUS_METERS) {
                destGeofenceTriggered = true
                trackerScope.launch {
                    LogiSyncRepository.triggerGeofenceEvent(
                        shipmentId = shipmentId,
                        eventType = "ARRIVED_AT_DESTINATION",
                        description = "Tracked vehicle entered destination delivery zone (distance: ${distToDest.toInt()}m)."
                    )
                }
            }
        }

        if (!pickupGeofenceTriggered && currentOriginLat != 0.0 && currentOriginLng != 0.0) {
            val distToOrigin = GeoUtils.distanceMeters(lat, lng, currentOriginLat, currentOriginLng)
            if (distToOrigin <= GEOFENCE_RADIUS_METERS) {
                pickupGeofenceTriggered = true
                trackerScope.launch {
                    LogiSyncRepository.triggerGeofenceEvent(
                        shipmentId = shipmentId,
                        eventType = "ARRIVED_AT_PICKUP",
                        description = "Tracked vehicle arrived at pickup facility (distance: ${distToOrigin.toInt()}m)."
                    )
                }
            }
        }
    }

    fun pauseTracking() {
        _isTrackingActive.value = false
        _lastStatusMessage.value = "Tracking paused"
        fusedClient?.let { client ->
            locationCallback?.let { cb -> client.removeLocationUpdates(cb) }
        }
        nativeLocationManager?.let { lm ->
            nativeListener?.let { l -> lm.removeUpdates(l) }
        }
    }

    fun stopTracking() {
        val shipmentId = _activeShipmentId.value
        pauseTracking()
        _activeShipmentId.value = null
        _uploadedFixesCount.value = 0
        _lastStatusMessage.value = "Tracking stopped"

        if (shipmentId != null) {
            trackerScope.launch {
                LogiSyncRepository.stopTrackingSession(shipmentId)
            }
        }
    }
}
