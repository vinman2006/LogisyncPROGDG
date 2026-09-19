package com.example.logisyncpro.ui.screens

import android.Manifest
import android.content.Context
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.model.*
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.service.RealLocationTracker
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.LogisticsMapView
import com.example.logisyncpro.utils.GeoUtils
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun ShipmentTrackingScreen(
    shipmentId: Int,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val requests by LogiSyncRepository.requests.collectAsState()

    var shipment by remember { mutableStateOf(requests.find { it.id == shipmentId }) }
    var latestLocation by remember { mutableStateOf<VehicleLocation?>(null) }
    var locationHistory by remember { mutableStateOf<List<VehicleLocation>>(emptyList()) }
    var permissionDeniedMessage by remember { mutableStateOf<String?>(null) }
    var isRefreshing by remember { mutableStateOf(false) }

    // Real-Time GPS Tracking State Flows from Hardware Tracker
    val isTrackingActive by RealLocationTracker.isTrackingActive.collectAsState()
    val activeShipmentId by RealLocationTracker.activeShipmentId.collectAsState()
    val currentDeviceLoc by RealLocationTracker.currentLocation.collectAsState()
    val uploadedFixesCount by RealLocationTracker.uploadedFixesCount.collectAsState()
    val lastStatusMessage by RealLocationTracker.lastStatusMessage.collectAsState()
    val isGpsEnabled by RealLocationTracker.isGpsEnabled.collectAsState()
    val isWaitingForNetwork by RealLocationTracker.isWaitingForNetwork.collectAsState()

    val isThisShipmentTracking = isTrackingActive && activeShipmentId == shipmentId

    // Activity Result Launcher for Location Permissions
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (fineGranted || coarseGranted) {
            permissionDeniedMessage = null
            shipment?.let { s ->
                val started = RealLocationTracker.startTracking(
                    context = context,
                    shipmentId = s.id,
                    originLat = s.origin_lat,
                    originLng = s.origin_lng,
                    destLat = s.destination_lat,
                    destLng = s.destination_lng
                )
                if (started) {
                    Toast.makeText(context, "GPS telemetry active. Broadcasting live fixes...", Toast.LENGTH_SHORT).show()
                    coroutineScope.launch {
                        if (s.status.uppercase() in listOf("PENDING", "ACCEPTED", "ASSIGNED")) {
                            LogiSyncRepository.updateRequestStatus(s.id, "IN_TRANSIT")
                        }
                    }
                }
            }
        } else {
            permissionDeniedMessage = "Location permission is required to stream GPS. Please allow location access."
            Toast.makeText(context, "Location permission denied", Toast.LENGTH_LONG).show()
        }
    }

    fun startLiveTracking() {
        if (RealLocationTracker.hasLocationPermission(context)) {
            shipment?.let { s ->
                val started = RealLocationTracker.startTracking(
                    context = context,
                    shipmentId = s.id,
                    originLat = s.origin_lat,
                    originLng = s.origin_lng,
                    destLat = s.destination_lat,
                    destLng = s.destination_lng
                )
                if (started) {
                    Toast.makeText(context, "GPS tracking started", Toast.LENGTH_SHORT).show()
                    coroutineScope.launch {
                        if (s.status.uppercase() in listOf("PENDING", "ACCEPTED", "ASSIGNED")) {
                            LogiSyncRepository.updateRequestStatus(s.id, "IN_TRANSIT")
                        }
                    }
                }
            }
        } else {
            permissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    // Load shipment metadata and poll live location from Neon PostgreSQL
    LaunchedEffect(shipmentId) {
        if (shipment == null) {
            shipment = LogiSyncRepository.getShipmentById(shipmentId)
            if (shipment == null) {
                LogiSyncRepository.refreshRequests()
                shipment = LogiSyncRepository.requests.value.find { it.id == shipmentId }
            }
        }
        while (isActive) {
            val loc = LogiSyncRepository.getLatestLocation(shipmentId)
            val hist = LogiSyncRepository.getLocationHistory(shipmentId)
            if (loc != null) {
                latestLocation = loc
            }
            if (hist.isNotEmpty()) {
                locationHistory = hist
            }
            delay(3000)
        }
    }

    // Dynamic coordinates resolution: uses live GPS hardware fix if actively tracking, else Neon DB fix
    val effectiveLat = remember(isThisShipmentTracking, currentDeviceLoc, latestLocation) {
        if (isThisShipmentTracking && currentDeviceLoc != null) {
            currentDeviceLoc!!.latitude
        } else {
            latestLocation?.latitude ?: currentDeviceLoc?.latitude
        }
    }

    val effectiveLng = remember(isThisShipmentTracking, currentDeviceLoc, latestLocation) {
        if (isThisShipmentTracking && currentDeviceLoc != null) {
            currentDeviceLoc!!.longitude
        } else {
            latestLocation?.longitude ?: currentDeviceLoc?.longitude
        }
    }

    val effectiveHeading = remember(isThisShipmentTracking, currentDeviceLoc, latestLocation) {
        if (isThisShipmentTracking && currentDeviceLoc != null) {
            currentDeviceLoc!!.bearing
        } else {
            latestLocation?.heading ?: currentDeviceLoc?.bearing
        }
    }

    val effectiveSpeedKmh = remember(isThisShipmentTracking, currentDeviceLoc, latestLocation) {
        val speedMps = if (isThisShipmentTracking && currentDeviceLoc != null) {
            currentDeviceLoc!!.speed
        } else {
            latestLocation?.speed ?: currentDeviceLoc?.speed ?: 0f
        }
        (speedMps * 3.6f).toInt()
    }

    val effectiveAccuracyM = remember(isThisShipmentTracking, currentDeviceLoc, latestLocation) {
        val acc = if (isThisShipmentTracking && currentDeviceLoc != null) {
            currentDeviceLoc!!.accuracy
        } else {
            latestLocation?.accuracy ?: currentDeviceLoc?.accuracy ?: 0f
        }
        acc.toInt()
    }

    val trackingState = remember(isThisShipmentTracking, latestLocation, isWaitingForNetwork) {
        when {
            isThisShipmentTracking -> TrackingState.LIVE
            isWaitingForNetwork -> TrackingState.OFFLINE
            latestLocation == null -> TrackingState.NO_LOCATION
            else -> {
                val ageSec = (System.currentTimeMillis() - parseTimestamp(latestLocation!!.recorded_at)) / 1000
                when {
                    ageSec <= 30 -> TrackingState.LIVE
                    ageSec <= 120 -> TrackingState.LAST_UPDATED
                    ageSec <= 900 -> TrackingState.STALE
                    else -> TrackingState.OFFLINE
                }
            }
        }
    }

    val distanceRemainingKm = remember(effectiveLat, effectiveLng, shipment) {
        if (effectiveLat != null && effectiveLng != null && shipment != null && shipment!!.destination_lat != 0.0) {
            GeoUtils.distanceKm(
                effectiveLat, effectiveLng,
                shipment!!.destination_lat, shipment!!.destination_lng
            )
        } else null
    }

    // Pulsing transition for LIVE badge
    val infiniteTransition = rememberInfiniteTransition(label = "LivePulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "PulseAlpha"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF071411))
    ) {
        val currentShipment = shipment
        if (currentShipment == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = EmeraldPrimary)
                    Spacer(modifier = Modifier.height(14.dp))
                    Text("Loading shipment from Neon Cloud...", color = Color(0xFF7A9E91), fontSize = 14.sp)
                }
            }
        } else {
            // Full Screen Satellite / Logistics Map
            LogisticsMapView(
                originLat = currentShipment.origin_lat,
                originLng = currentShipment.origin_lng,
                originCity = currentShipment.pickup_location,
                destLat = currentShipment.destination_lat,
                destLng = currentShipment.destination_lng,
                destCity = currentShipment.delivery_location,
                vehicleLat = effectiveLat,
                vehicleLng = effectiveLng,
                vehicleHeading = effectiveHeading,
                historyPoints = locationHistory,
                trackingState = trackingState,
                distanceRemainingKm = distanceRemainingKm,
                modifier = Modifier.fillMaxSize()
            )

            // Top Floating Navigation Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
                    .align(Alignment.TopCenter),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onNavigateBack,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF071411).copy(alpha = 0.85f))
                        .border(1.dp, Color(0xFF14352B), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }

                Surface(
                    shape = RoundedCornerShape(100.dp),
                    color = Color(0xFF071411).copy(alpha = 0.85f),
                    border = BorderStroke(1.dp, Color(0xFF14352B))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (isThisShipmentTracking) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(EmeraldPrimary.copy(alpha = pulseAlpha))
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                        }
                        Text(
                            text = currentShipment.tracking_number.ifEmpty { "SHP-${currentShipment.id}" },
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Locate / Center GPS Button
                    IconButton(
                        onClick = {
                            if (!isThisShipmentTracking) {
                                startLiveTracking()
                            } else {
                                if (effectiveLat != null && effectiveLng != null) {
                                    Toast.makeText(
                                        context,
                                        "GPS Fixed: ${String.format(Locale.US, "%.4f, %.4f", effectiveLat, effectiveLng)}",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                }
                            }
                        },
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(if (isThisShipmentTracking) EmeraldPrimary else Color(0xFF071411).copy(alpha = 0.85f))
                            .border(1.dp, if (isThisShipmentTracking) EmeraldPrimary else Color(0xFF14352B), CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.GpsFixed,
                            contentDescription = "Locate",
                            tint = if (isThisShipmentTracking) ObsidianDeep else Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    // Manual Refresh from DB Button
                    IconButton(
                        onClick = {
                            coroutineScope.launch {
                                isRefreshing = true
                                val loc = LogiSyncRepository.getLatestLocation(shipmentId)
                                val hist = LogiSyncRepository.getLocationHistory(shipmentId)
                                if (loc != null) latestLocation = loc
                                if (hist.isNotEmpty()) locationHistory = hist
                                isRefreshing = false
                                Toast.makeText(context, "Telemetry synced from Neon DB", Toast.LENGTH_SHORT).show()
                            }
                        },
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF071411).copy(alpha = 0.85f))
                            .border(1.dp, Color(0xFF14352B), CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = if (isRefreshing) EmeraldPrimary else Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            // Bottom Information and Live Control Sheet
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter),
                shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
                color = Color(0xFF0A1E17),
                border = BorderStroke(1.dp, Color(0xFF14352B))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 14.dp)
                ) {
                    // Grabber handle
                    Box(
                        modifier = Modifier
                            .width(40.dp)
                            .height(4.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(Color(0xFF1B4235))
                            .align(Alignment.CenterHorizontally)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Permission Warning Alert if denied
                    AnimatedVisibility(visible = permissionDeniedMessage != null) {
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 10.dp),
                            shape = RoundedCornerShape(10.dp),
                            color = Color(0xFF331400),
                            border = BorderStroke(1.dp, SafetyOrange)
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Warning, contentDescription = null, tint = SafetyOrange, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = permissionDeniedMessage ?: "",
                                    fontSize = 11.sp,
                                    color = Color(0xFFFFD4B2),
                                    modifier = Modifier.weight(1f)
                                )
                                TextButton(onClick = { startLiveTracking() }) {
                                    Text("GRANT", color = SafetyOrange, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    // Hardware GPS Turned Off Warning
                    AnimatedVisibility(visible = !isGpsEnabled) {
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 10.dp),
                            shape = RoundedCornerShape(10.dp),
                            color = Color(0xFF331400),
                            border = BorderStroke(1.dp, SafetyOrange)
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.LocationOff, contentDescription = null, tint = SafetyOrange, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Device GPS hardware is off. Turn on Location services in Android settings.",
                                    fontSize = 11.sp,
                                    color = Color(0xFFFFD4B2)
                                )
                            }
                        }
                    }

                    // Status & Mode Header Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Live Telemetry",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            if (isThisShipmentTracking) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Surface(
                                    shape = RoundedCornerShape(100.dp),
                                    color = EmeraldPrimary.copy(alpha = 0.2f),
                                    border = BorderStroke(1.dp, EmeraldPrimary)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .clip(CircleShape)
                                                .background(EmeraldPrimary.copy(alpha = pulseAlpha))
                                        )
                                        Spacer(modifier = Modifier.width(5.dp))
                                        Text(
                                            text = "BROADCASTING",
                                            color = EmeraldPrimary,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }

                        Surface(
                            shape = RoundedCornerShape(100.dp),
                            color = Color(0xFF0F382A),
                            border = BorderStroke(1.dp, EmeraldPrimary)
                        ) {
                            Text(
                                text = currentShipment.status.replace("_", " "),
                                color = EmeraldPrimary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Real-Time GPS Coordinates & Sync Stats Panel
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFF0C271E),
                        border = BorderStroke(1.dp, Color(0xFF143B2E))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(text = "CURRENT COORDINATES", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF7A9E91))
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = if (effectiveLat != null && effectiveLng != null) {
                                            String.format(Locale.US, "%.5f° N, %.5f° E", effectiveLat, effectiveLng)
                                        } else {
                                            "Acquiring GPS fix..."
                                        },
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (effectiveLat != null) EmeraldLight else Color.White
                                    )
                                }

                                Column(horizontalAlignment = Alignment.End) {
                                    Text(text = "SPEED · ACCURACY", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF7A9E91))
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = "$effectiveSpeedKmh km/h · ±${effectiveAccuracyM}m",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.CloudDone,
                                        contentDescription = null,
                                        tint = if (isWaitingForNetwork) SafetyOrange else EmeraldPrimary,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = if (isWaitingForNetwork) "Queueing offline (No internet)" else "Synced $uploadedFixesCount fixes to Neon Cloud",
                                        fontSize = 11.sp,
                                        color = Color(0xFF9EBFB2)
                                    )
                                }

                                Text(
                                    text = lastStatusMessage,
                                    fontSize = 11.sp,
                                    color = Color(0xFF7A9E91)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Route Points Row: Origin -> Destination
                    Row(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = "Pickup Origin", fontSize = 11.sp, color = Color(0xFF7A9E91))
                            Text(
                                text = currentShipment.pickup_location.ifEmpty { "Not specified" },
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = "Delivery Destination", fontSize = 11.sp, color = Color(0xFF7A9E91))
                            Text(
                                text = currentShipment.delivery_location.ifEmpty { "Not specified" },
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // ACTION BUTTONS SECTION
                    if (isThisShipmentTracking) {
                        // Tracking is active: Show Stop button + Complete Delivery button
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedButton(
                                onClick = {
                                    RealLocationTracker.stopTracking()
                                    Toast.makeText(context, "GPS telemetry paused", Toast.LENGTH_SHORT).show()
                                },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(46.dp),
                                shape = RoundedCornerShape(10.dp),
                                border = BorderStroke(1.dp, Color(0xFF8B2525)),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFFF6B6B))
                            ) {
                                Icon(Icons.Default.Stop, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Stop GPS", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }

                            Button(
                                onClick = {
                                    coroutineScope.launch {
                                        RealLocationTracker.stopTracking()
                                        val ok = LogiSyncRepository.confirmDelivery(currentShipment.id)
                                        if (ok) {
                                            Toast.makeText(context, "Shipment marked as DELIVERED!", Toast.LENGTH_SHORT).show()
                                            onNavigateBack()
                                        }
                                    }
                                },
                                modifier = Modifier
                                    .weight(1.2f)
                                    .height(46.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = ObsidianDeep, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Mark Delivered", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = ObsidianDeep)
                            }
                        }
                    } else {
                        // Tracking is NOT active: Show big prominent "START LIVE GPS TRACKING" button
                        Button(
                            onClick = { startLiveTracking() },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                        ) {
                            Icon(
                                imageVector = Icons.Default.GpsFixed,
                                contentDescription = null,
                                tint = ObsidianDeep,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "START LIVE GPS TRACKING",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = ObsidianDeep
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                }
            }
        }
    }
}

private fun parseTimestamp(dateStr: String?): Long {
    if (dateStr.isNullOrEmpty()) return System.currentTimeMillis()
    return try {
        val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        format.timeZone = TimeZone.getTimeZone("UTC")
        format.parse(dateStr)?.time ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }
}
