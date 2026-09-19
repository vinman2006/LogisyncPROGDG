package com.example.logisyncpro.ui.screens

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
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
import com.example.logisyncpro.data.datasource.DemoDataSource
import com.example.logisyncpro.data.model.TrackingState
import com.example.logisyncpro.data.model.TransportRequest
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.BottomNavTab
import com.example.logisyncpro.ui.components.LogiSyncBottomNav
import com.example.logisyncpro.ui.components.LogisticsMapView
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive

/**
 * Screen 1 — Live Tracking
 * Matches the reference image layout:
 * - Search bar: "Track by Order ID / Consignment No."
 * - [ Map ] / [ List ] view toggle
 * - Full interactive OpenStreetMap
 * - Bottom floating consignment card with LS-782341, In Transit, ETA, Distance, and forward navigation arrow.
 */
@Composable
fun LiveTrackingScreen(
    initialShipmentId: Int? = null,
    onNavigateToDetail: (Int) -> Unit,
    onTabSelected: (BottomNavTab) -> Unit
) {
    val context = LocalContext.current
    val liveRequests by LogiSyncRepository.requests.collectAsState()

    // Blend live database requests with fallback demo consignments
    val allShipments = remember(liveRequests) {
        if (liveRequests.isNotEmpty()) {
            val list = liveRequests.toMutableList()
            DemoDataSource.demoShipments.forEach { demo ->
                if (list.none { it.tracking_number == demo.tracking_number || it.id == demo.id }) {
                    list.add(demo)
                }
            }
            list
        } else {
            DemoDataSource.demoShipments
        }
    }

    var searchQuery by remember { mutableStateOf("") }
    var isMapView by remember { mutableStateOf(true) }

    // Selected consignment for the map
    var selectedShipment by remember(allShipments, initialShipmentId) {
        mutableStateOf(
            allShipments.find { it.id == initialShipmentId }
                ?: allShipments.find { it.tracking_number == "LS-782341" }
                ?: allShipments.firstOrNull()
                ?: DemoDataSource.demoShipments.first()
        )
    }

    // Filtered shipments when searching
    val filteredShipments = remember(searchQuery, allShipments) {
        if (searchQuery.isBlank()) allShipments
        else {
            val q = searchQuery.trim().lowercase()
            allShipments.filter {
                it.tracking_number.lowercase().contains(q) ||
                it.id.toString() == q ||
                it.pickup_location.lowercase().contains(q) ||
                it.delivery_location.lowercase().contains(q) ||
                (it.cargo_type.lowercase().contains(q)) ||
                (it.notes?.lowercase()?.contains(q) == true)
            }
        }
    }

    // Auto-select if search query matches an exact consignment
    LaunchedEffect(searchQuery) {
        if (searchQuery.isNotBlank()) {
            val match = allShipments.find {
                it.tracking_number.equals(searchQuery.trim(), ignoreCase = true) ||
                it.id.toString() == searchQuery.trim()
            }
            if (match != null) {
                selectedShipment = match
            }
        }
    }

    Scaffold(
        bottomBar = {
            LogiSyncBottomNav(
                currentTab = BottomNavTab.TRACK,
                onTabSelected = onTabSelected
            )
        },
        containerColor = Color(0xFF060E1A)
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
                // Top Header Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF0F172A)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.LocalShipping,
                                contentDescription = "LogiSync",
                                tint = Color(0xFF38BDF8),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "LogiSync",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        IconButton(
                            onClick = {
                                Toast.makeText(context, "Search active: Type consignment number below", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF0F172A))
                        ) {
                            Icon(Icons.Filled.Search, contentDescription = "Search", tint = Color(0xFF94A3B8), modifier = Modifier.size(18.dp))
                        }
                        IconButton(
                            onClick = {
                                Toast.makeText(context, "Live GPS Telemetry Service Active", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF0F172A))
                        ) {
                            Icon(Icons.Filled.Sensors, contentDescription = "Sensors", tint = Color(0xFF10B981), modifier = Modifier.size(18.dp))
                        }
                    }
                }

                // Search Bar ("Track by Order ID / Consignment No.")
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF0F172A))
                        .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp))
                        .padding(horizontal = 14.dp, vertical = 10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Search,
                            contentDescription = "Search",
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        TextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            placeholder = {
                                Text(
                                    "Track by Order ID / Consignment No.",
                                    color = Color(0xFF64748B),
                                    fontSize = 13.sp
                                )
                            },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                disabledContainerColor = Color.Transparent,
                                cursorColor = Color(0xFF38BDF8),
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent,
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )
                        if (searchQuery.isNotEmpty()) {
                            IconButton(
                                onClick = { searchQuery = "" },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(Icons.Filled.Close, contentDescription = "Clear", tint = Color(0xFF94A3B8), modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Map / List Segmented Toggle Switch
                Row(
                    modifier = Modifier
                        .padding(horizontal = 16.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFF0F172A))
                        .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(10.dp))
                        .padding(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isMapView) Color(0xFF1E293B) else Color.Transparent)
                            .clickable { isMapView = true }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Map",
                            fontSize = 13.sp,
                            fontWeight = if (isMapView) FontWeight.Bold else FontWeight.Medium,
                            color = if (isMapView) Color.White else Color(0xFF64748B)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (!isMapView) Color(0xFF1E293B) else Color.Transparent)
                            .clickable { isMapView = false }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "List",
                            fontSize = 13.sp,
                            fontWeight = if (!isMapView) FontWeight.Bold else FontWeight.Medium,
                            color = if (!isMapView) Color.White else Color(0xFF64748B)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Content View (Map View or List View)
                if (isMapView) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                    ) {
                        val currentShipment = selectedShipment
                        val origCity = currentShipment.pickup_location.split(",")[0].trim()
                        val destCity = currentShipment.delivery_location.split(",")[0].trim()

                        // Interactive OpenStreetMap Canvas
                        LogisticsMapView(
                            originLat = currentShipment.origin_lat,
                            originLng = currentShipment.origin_lng,
                            originCity = origCity,
                            destLat = currentShipment.destination_lat,
                            destLng = currentShipment.destination_lng,
                            destCity = destCity,
                            vehicleLat = (currentShipment.origin_lat + currentShipment.destination_lat) / 2.0,
                            vehicleLng = (currentShipment.origin_lng + currentShipment.destination_lng) / 2.0,
                            trackingState = TrackingState.LIVE,
                            distanceRemainingKm = 320.0,
                            modifier = Modifier.fillMaxSize()
                        )

                        // Bottom Floating Consignment Card
                        Surface(
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 14.dp),
                            shape = RoundedCornerShape(16.dp),
                            color = Color(0xFF0F172A),
                            border = BorderStroke(1.dp, Color(0xFF1E293B)),
                            shadowElevation = 8.dp
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onNavigateToDetail(currentShipment.id) }
                                    .padding(16.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = currentShipment.tracking_number.ifEmpty { "LS-782341" },
                                        fontSize = 19.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )

                                    // Status Badge (In Transit - Green Pill)
                                    val isTransit = currentShipment.status.equals("IN_TRANSIT", ignoreCase = true)
                                    val isDelivered = currentShipment.status.equals("DELIVERED", ignoreCase = true)
                                    val badgeBg = when {
                                        isTransit -> Color(0x3310B981)
                                        isDelivered -> Color(0x333B82F6)
                                        else -> Color(0x33F59E0B)
                                    }
                                    val badgeText = when {
                                        isTransit -> Color(0xFF34D399)
                                        isDelivered -> Color(0xFF60A5FA)
                                        else -> Color(0xFFFBBF24)
                                    }
                                    val displayStatus = when {
                                        isTransit -> "In Transit"
                                        isDelivered -> "Delivered"
                                        else -> "Pending"
                                    }

                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(20.dp))
                                            .background(badgeBg)
                                            .padding(horizontal = 10.dp, vertical = 4.dp)
                                    ) {
                                        Text(
                                            text = displayStatus,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = badgeText
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = "${currentShipment.pickup_location.split(",")[0].trim()} → ${currentShipment.delivery_location.split(",")[0].trim()}",
                                    fontSize = 13.sp,
                                    color = Color(0xFF94A3B8)
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                                        Column {
                                            Text(
                                                text = "ETA",
                                                fontSize = 11.sp,
                                                color = Color(0xFF64748B)
                                            )
                                            Text(
                                                text = currentShipment.requested_date ?: "Today, 4:30 PM",
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = Color.White
                                            )
                                        }

                                        Column {
                                            Text(
                                                text = "Dist",
                                                fontSize = 11.sp,
                                                color = Color(0xFF64748B)
                                            )
                                            Text(
                                                text = "320 km",
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = Color.White
                                            )
                                        }
                                    }

                                    // Right Forward Action Arrow Button leading to details
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(Color(0xFF2563EB))
                                            .clickable { onNavigateToDetail(currentShipment.id) },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                            contentDescription = "Details",
                                            tint = Color.White,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // Searchable List View
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        if (filteredShipments.isEmpty()) {
                            item {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 40.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "No shipments found.",
                                        color = Color(0xFF64748B),
                                        fontSize = 14.sp
                                    )
                                }
                            }
                        } else {
                            items(filteredShipments) { s ->
                                val isSelected = s.id == selectedShipment.id
                                Surface(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            selectedShipment = s
                                            isMapView = true
                                        },
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (isSelected) Color(0xFF1E293B) else Color(0xFF0F172A),
                                    border = BorderStroke(1.dp, if (isSelected) Color(0xFF38BDF8) else Color(0xFF1E293B))
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(14.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text(
                                                text = s.tracking_number,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 15.sp,
                                                color = Color.White
                                            )
                                            Text(
                                                text = "${s.pickup_location.split(",")[0].trim()} → ${s.delivery_location.split(",")[0].trim()}",
                                                fontSize = 12.sp,
                                                color = Color(0xFF94A3B8)
                                            )
                                        }

                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(
                                                text = s.status,
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = if (s.status.equals("IN_TRANSIT", true)) Color(0xFF34D399) else Color(0xFF60A5FA)
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Icon(
                                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                                contentDescription = "Select",
                                                tint = Color(0xFF64748B),
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
