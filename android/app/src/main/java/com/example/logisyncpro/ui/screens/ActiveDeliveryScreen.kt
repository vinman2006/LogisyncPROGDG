package com.example.logisyncpro.ui.screens

import android.Manifest
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.service.RealLocationTracker
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.BottomNavTab
import com.example.logisyncpro.ui.components.LogiSyncBottomNav
import com.example.logisyncpro.ui.components.WireframeCube
import kotlinx.coroutines.launch
import java.util.Locale

@Composable
fun ActiveDeliveryScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToTracking: (Int) -> Unit,
    onNavigateToBrowseRequests: () -> Unit,
    onNavigateToDetail: (Int) -> Unit = {},
    onTabSelected: (BottomNavTab) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val requests by LogiSyncRepository.requests.collectAsState()

    // Real-Time GPS Tracking State
    val isTrackingActive by RealLocationTracker.isTrackingActive.collectAsState()
    val activeShipmentId by RealLocationTracker.activeShipmentId.collectAsState()
    val uploadedFixesCount by RealLocationTracker.uploadedFixesCount.collectAsState()
    val currentDeviceLoc by RealLocationTracker.currentLocation.collectAsState()

    // Always fetch latest requests from Neon DB when screen opens
    LaunchedEffect(Unit) {
        LogiSyncRepository.refreshRequests()
    }

    // Identify active delivery: IN_TRANSIT, ASSIGNED, ACCEPTED, or PICKUP_CONFIRMED
    val activeDelivery = remember(requests) {
        requests.find {
            it.status.uppercase() in listOf("IN_TRANSIT", "ASSIGNED", "ACCEPTED", "PICKUP_CONFIRMED", "OUT_FOR_DELIVERY")
        } ?: requests.firstOrNull()
    }

    val pendingRequests = remember(requests) {
        requests.filter { it.status.uppercase() == "PENDING" }
    }

    // Permission launcher for starting GPS tracking
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (fineGranted || coarseGranted) {
            activeDelivery?.let { s ->
                RealLocationTracker.startTracking(
                    context = context,
                    shipmentId = s.id,
                    originLat = s.origin_lat,
                    originLng = s.origin_lng,
                    destLat = s.destination_lat,
                    destLng = s.destination_lng
                )
                coroutineScope.launch {
                    if (s.status.uppercase() in listOf("PENDING", "ACCEPTED", "ASSIGNED")) {
                        LogiSyncRepository.updateRequestStatus(s.id, "IN_TRANSIT")
                    }
                }
                onNavigateToTracking(s.id)
            }
        } else {
            Toast.makeText(context, "Location permission required to broadcast GPS", Toast.LENGTH_LONG).show()
        }
    }

    fun startGpsForShipment(shipmentId: Int) {
        val target = requests.find { it.id == shipmentId } ?: activeDelivery
        if (target == null) return
        if (RealLocationTracker.hasLocationPermission(context)) {
            RealLocationTracker.startTracking(
                context = context,
                shipmentId = target.id,
                originLat = target.origin_lat,
                originLng = target.origin_lng,
                destLat = target.destination_lat,
                destLng = target.destination_lng
            )
            coroutineScope.launch {
                if (target.status.uppercase() in listOf("PENDING", "ACCEPTED", "ASSIGNED")) {
                    LogiSyncRepository.updateRequestStatus(target.id, "IN_TRANSIT")
                }
            }
            onNavigateToTracking(target.id)
        } else {
            permissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
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

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF071411))
                    .statusBarsPadding()
                    .padding(horizontal = 20.dp, vertical = 14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Active Delivery",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                IconButton(
                    onClick = { coroutineScope.launch { LogiSyncRepository.refreshRequests() } },
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Refresh",
                        tint = EmeraldPrimary
                    )
                }
            }
        },
        bottomBar = {
            LogiSyncBottomNav(
                currentTab = BottomNavTab.SHIPMENTS,
                secondTabLabel = "Deliveries",
                onTabSelected = onTabSelected
            )
        },
        containerColor = Color(0xFF071411)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
        ) {
            Spacer(modifier = Modifier.height(10.dp))

            // LIVE GPS BROADCAST BANNER (if actively tracking)
            if (isTrackingActive) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 14.dp),
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFF0F382A),
                    border = BorderStroke(1.dp, EmeraldPrimary)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(10.dp)
                                        .clip(CircleShape)
                                        .background(EmeraldPrimary.copy(alpha = pulseAlpha))
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "LIVE GPS BROADCASTING",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = EmeraldPrimary
                                )
                            }
                            Text(
                                text = "Synced: $uploadedFixesCount fixes",
                                fontSize = 11.sp,
                                color = Color.White
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        if (currentDeviceLoc != null) {
                            Text(
                                text = String.format(Locale.US, "Fix: %.4f° N, %.4f° E (±%dm)", currentDeviceLoc!!.latitude, currentDeviceLoc!!.longitude, currentDeviceLoc!!.accuracy.toInt()),
                                fontSize = 12.sp,
                                color = EmeraldLight
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = { onNavigateToTracking(activeShipmentId ?: activeDelivery?.id ?: 1) },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(40.dp),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                            ) {
                                Icon(Icons.Default.Navigation, contentDescription = null, tint = ObsidianDeep, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("View Live Map", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = ObsidianDeep)
                            }

                            OutlinedButton(
                                onClick = { RealLocationTracker.stopTracking() },
                                modifier = Modifier
                                    .weight(0.7f)
                                    .height(40.dp),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, Color(0xFF8B2525)),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFFF6B6B))
                            ) {
                                Text("Stop GPS", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            if (activeDelivery != null) {
                // Active shipment card
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp)),
                    color = Color(0xFF0C221B),
                    border = BorderStroke(1.dp, Color(0xFF14352B))
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = activeDelivery.tracking_number.ifEmpty { "SHP-${activeDelivery.id}" },
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = EmeraldPrimary
                            )
                            Surface(
                                shape = RoundedCornerShape(100.dp),
                                color = EmeraldPrimary.copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = activeDelivery.status.replace("_", " "),
                                    color = EmeraldPrimary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "${activeDelivery.pickup_location} → ${activeDelivery.delivery_location}",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "${activeDelivery.weight} · ${activeDelivery.cargo_type}",
                            fontSize = 12.sp,
                            color = Color(0xFF7A9E91)
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Button(
                                onClick = { startGpsForShipment(activeDelivery.id) },
                                modifier = Modifier
                                    .weight(1.2f)
                                    .height(44.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                            ) {
                                Icon(Icons.Default.GpsFixed, contentDescription = null, tint = ObsidianDeep, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (isTrackingActive && activeShipmentId == activeDelivery.id) "Tracking Live" else "Track & Broadcast",
                                    fontWeight = FontWeight.Bold,
                                    color = ObsidianDeep,
                                    fontSize = 12.sp
                                )
                            }

                            OutlinedButton(
                                onClick = { onNavigateToDetail(activeDelivery.id) },
                                modifier = Modifier
                                    .weight(0.8f)
                                    .height(44.dp),
                                shape = RoundedCornerShape(10.dp),
                                border = BorderStroke(1.dp, Color(0xFF14352B)),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
                            ) {
                                Text(
                                    text = "Details",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }
            } else {
                // Empty state if literally no shipments exist
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFF0C221B),
                    border = BorderStroke(1.dp, Color(0xFF14352B))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 28.dp, horizontal = 20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        WireframeCube(
                            modifier = Modifier.size(64.dp),
                            color = Color(0xFF2C4A3E)
                        )
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "No active delivery",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Accept a request below to start a delivery.",
                            fontSize = 12.sp,
                            color = Color(0xFF7A9E91)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // "When you start a delivery" feature guide
            Text(
                text = "When you start a delivery",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(12.dp))

            DeliveryFeatureRow(
                icon = Icons.Default.Place,
                title = "Share your live location",
                subtitle = "Hardware GPS streams to cloud database"
            )

            Spacer(modifier = Modifier.height(10.dp))

            DeliveryFeatureRow(
                icon = Icons.Default.GpsFixed,
                title = "Real-time telemetry",
                subtitle = "Speed, heading & polyline audit trail"
            )

            Spacer(modifier = Modifier.height(10.dp))

            DeliveryFeatureRow(
                icon = Icons.Default.CheckCircleOutline,
                title = "Complete delivery",
                subtitle = "Confirm on arrival to close session"
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Browse Requests Button
            Button(
                onClick = onNavigateToBrowseRequests,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
            ) {
                Icon(Icons.Default.Search, contentDescription = null, tint = ObsidianDeep, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Browse Available Requests",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = ObsidianDeep
                )
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun DeliveryFeatureRow(
    icon: ImageVector,
    title: String,
    subtitle: String
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = Color(0xFF0C221B),
        border = BorderStroke(1.dp, Color(0xFF14352B))
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFF103328)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = EmeraldPrimary,
                    modifier = Modifier.size(22.dp)
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column {
                Text(
                    text = title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subtitle,
                    fontSize = 12.sp,
                    color = Color(0xFF7A9E91)
                )
            }
        }
    }
}
