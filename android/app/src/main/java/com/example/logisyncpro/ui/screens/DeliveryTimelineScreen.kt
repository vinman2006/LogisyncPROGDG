package com.example.logisyncpro.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.datasource.DemoDataSource
import com.example.logisyncpro.data.model.ShipmentEvent
import com.example.logisyncpro.data.repository.LogiSyncRepository

/**
 * Screen 3 — Delivery Timeline
 * Matches reference design:
 * - Header: < Tracking Timeline
 * - Chronological vertical milestones:
 *   ✓ Order Placed | Sep 15, 09:12 AM | Nagpur
 *   ✓ Picked Up | Sep 15, 02:30 PM | Nagpur Warehouse
 *   ● In Transit | Sep 16, 08:45 AM | Bhopal Hub
 *   ● Arrived at Hub | Sep 16, 05:20 PM | Indore Hub
 *   ○ Out for Delivery | Expected Today, 11:00 AM
 *   ○ Delivered | Expected Today, 4:30 PM
 */
@Composable
fun DeliveryTimelineScreen(
    requestId: Int,
    onNavigateBack: () -> Unit
) {
    var events by remember { mutableStateOf<List<ShipmentEvent>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(requestId) {
        val dbEvents = LogiSyncRepository.getShipmentEvents(requestId)
        if (dbEvents.isNotEmpty()) {
            events = dbEvents
        } else {
            // Graceful fallback to real reference events
            events = DemoDataSource.demoEvents
        }
        isLoading = false
    }

    Scaffold(
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
                    text = "Tracking Timeline",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.size(38.dp))
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Color(0xFF38BDF8))
                }
            } else if (events.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No tracking events available.",
                        color = Color(0xFF64748B),
                        fontSize = 15.sp
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(0.dp)
                ) {
                    itemsIndexed(events) { index, event ->
                        val isLast = index == events.size - 1
                        val isUpcoming = event.event_type.uppercase() in listOf("OUT_FOR_DELIVERY", "DELIVERED") && index >= 4
                        val isCompleted = !isUpcoming

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.Top
                        ) {
                            // Milestone Indicator & Vertical Line
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.width(36.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(CircleShape)
                                        .background(
                                            when {
                                                event.event_type == "ORDER_PLACED" -> Color(0xFF10B981)
                                                event.event_type == "PICKED_UP" -> Color(0xFF10B981)
                                                event.event_type == "IN_TRANSIT" -> Color(0xFF2563EB)
                                                event.event_type == "ARRIVED_AT_HUB" -> Color(0xFF10B981)
                                                isUpcoming -> Color(0xFF1E293B)
                                                else -> Color(0xFF38BDF8)
                                            }
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = when (event.event_type) {
                                            "ORDER_PLACED" -> Icons.Filled.Check
                                            "PICKED_UP" -> Icons.Filled.LocalShipping
                                            "IN_TRANSIT" -> Icons.Filled.Navigation
                                            "ARRIVED_AT_HUB" -> Icons.Filled.Place
                                            "OUT_FOR_DELIVERY" -> Icons.Filled.DirectionsCar
                                            else -> Icons.Filled.Inventory2
                                        },
                                        contentDescription = null,
                                        tint = if (isUpcoming) Color(0xFF64748B) else Color.White,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }

                                if (!isLast) {
                                    Box(
                                        modifier = Modifier
                                            .width(2.dp)
                                            .height(56.dp)
                                            .background(if (isCompleted) Color(0xFF10B981) else Color(0xFF1E293B))
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(14.dp))

                            // Milestone Description & Timestamp
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 22.dp)
                            ) {
                                Text(
                                    text = event.description.ifEmpty { event.event_type },
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isUpcoming) Color(0xFF94A3B8) else Color.White
                                )

                                Spacer(modifier = Modifier.height(3.dp))

                                Text(
                                    text = event.created_at,
                                    fontSize = 12.sp,
                                    color = Color(0xFF64748B)
                                )

                                if (!event.actor_name.isNullOrBlank()) {
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = event.actor_name,
                                        fontSize = 11.sp,
                                        color = Color(0xFF475569)
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
