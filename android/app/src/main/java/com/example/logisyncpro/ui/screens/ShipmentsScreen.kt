package com.example.logisyncpro.ui.screens

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import com.example.logisyncpro.data.model.TransportRequest
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.BottomNavTab
import com.example.logisyncpro.ui.components.LogiSyncBottomNav

/**
 * Screen 7 — My Shipments (Multiple Shipments)
 * Matches reference design:
 * - Header: < My Shipments with Search icon
 * - Filter tabs: [ All ], [ In Transit ], [ Delivered ], [ Pending ], [ Delayed ]
 * - Shipment cards:
 *   - Left: Circular colored icon (green truck, green check, orange clock)
 *   - Center: Consignment No (LS-782341), Route (Nagpur → Mumbai), ETA (Today, 4:30 PM)
 *   - Right: Status badge (In Transit) + Chevron >
 *   - Clicking navigates directly to Shipment Details
 */
@Composable
fun ShipmentsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToDetail: (Int) -> Unit,
    onNavigateToTracking: (Int) -> Unit,
    onNavigateToCreate: () -> Unit,
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

    var selectedFilter by remember { mutableStateOf("All") }
    val filterTabs = listOf("All", "In Transit", "Delivered", "Pending", "Delayed")

    val filteredShipments = remember(selectedFilter, allShipments) {
        when (selectedFilter) {
            "All" -> allShipments
            "In Transit" -> allShipments.filter { it.status.uppercase() in listOf("IN_TRANSIT", "OUT_FOR_DELIVERY", "ACCEPTED") }
            "Delivered" -> allShipments.filter { it.status.uppercase() == "DELIVERED" }
            "Pending" -> allShipments.filter { it.status.uppercase() in listOf("PENDING", "ASSIGNED") }
            "Delayed" -> allShipments.filter { it.notes?.contains("delay", ignoreCase = true) == true }
            else -> allShipments
        }
    }

    Scaffold(
        bottomBar = {
            LogiSyncBottomNav(
                currentTab = BottomNavTab.SHIPMENTS,
                onTabSelected = onTabSelected
            )
        },
        containerColor = Color(0xFF060E1A)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // Top Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onNavigateBack,
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF0F172A))
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Text(
                    text = "My Shipments",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                IconButton(
                    onClick = {
                        Toast.makeText(context, "Search enabled in Live Tracking tab", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF0F172A))
                ) {
                    Icon(
                        imageVector = Icons.Filled.Search,
                        contentDescription = "Search",
                        tint = Color(0xFF94A3B8),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Filter Tabs: [ All ], [ In Transit ], [ Delivered ], [ Pending ], [ Delayed ]
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(filterTabs) { tab ->
                    val isSelected = tab == selectedFilter
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(if (isSelected) Color(0xFF2563EB) else Color(0xFF0F172A))
                            .border(1.dp, if (isSelected) Color(0xFF3B82F6) else Color(0xFF1E293B), RoundedCornerShape(20.dp))
                            .clickable { selectedFilter = tab }
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = tab,
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Color.White else Color(0xFF94A3B8)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Consignment Cards List
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
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
                                text = "No shipments found for this category.",
                                color = Color(0xFF64748B),
                                fontSize = 14.sp
                            )
                        }
                    }
                } else {
                    items(filteredShipments) { s ->
                        val isTransit = s.status.uppercase() in listOf("IN_TRANSIT", "OUT_FOR_DELIVERY", "ACCEPTED")
                        val isDelivered = s.status.uppercase() == "DELIVERED"
                        val isPending = !isTransit && !isDelivered

                        val iconBg = when {
                            isTransit -> Color(0xFF10B981)
                            isDelivered -> Color(0xFF38BDF8)
                            else -> Color(0xFFF59E0B)
                        }
                        val iconVector = when {
                            isTransit -> Icons.Filled.LocalShipping
                            isDelivered -> Icons.Filled.Check
                            else -> Icons.Filled.AccessTime
                        }

                        val badgeBg = when {
                            isTransit -> Color(0x3310B981)
                            isDelivered -> Color(0x333B82F6)
                            else -> Color(0x33F59E0B)
                        }
                        val badgeColor = when {
                            isTransit -> Color(0xFF34D399)
                            isDelivered -> Color(0xFF60A5FA)
                            else -> Color(0xFFFBBF24)
                        }
                        val badgeText = when {
                            isTransit -> "In Transit"
                            isDelivered -> "Delivered"
                            else -> "Pending"
                        }

                        val origCity = s.pickup_location.split(",")[0].trim().ifEmpty { "Nagpur" }
                        val destCity = s.delivery_location.split(",")[0].trim().ifEmpty { "Mumbai" }

                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onNavigateToDetail(s.id) },
                            shape = RoundedCornerShape(14.dp),
                            color = Color(0xFF0F172A),
                            border = BorderStroke(1.dp, Color(0xFF1E293B))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Circular Status Icon
                                Box(
                                    modifier = Modifier
                                        .size(38.dp)
                                        .clip(CircleShape)
                                        .background(iconBg),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = iconVector,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }

                                Spacer(modifier = Modifier.width(14.dp))

                                // Main Consignment Details
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = s.tracking_number,
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )

                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(20.dp))
                                                .background(badgeBg)
                                                .padding(horizontal = 10.dp, vertical = 3.dp)
                                        ) {
                                            Text(
                                                text = badgeText,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = badgeColor
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(3.dp))

                                    Text(
                                        text = "$origCity \u2192 $destCity",
                                        fontSize = 13.sp,
                                        color = Color(0xFF94A3B8)
                                    )

                                    Spacer(modifier = Modifier.height(4.dp))

                                    val subtitle = when {
                                        isTransit -> "ETA: ${s.requested_date ?: "Today, 4:30 PM"}"
                                        isDelivered -> "Delivered: ${s.delivered_at ?: "Sep 15"}"
                                        else -> "Pickup Scheduled"
                                    }

                                    Text(
                                        text = subtitle,
                                        fontSize = 11.sp,
                                        color = Color(0xFF64748B)
                                    )
                                }

                                Spacer(modifier = Modifier.width(8.dp))

                                // Navigation Arrow Chevron
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                    contentDescription = "Details",
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
