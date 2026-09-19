package com.example.logisyncpro.ui.screens

import android.widget.Toast
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
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
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.ui.components.LogisticsMapView

/**
 * Screen 5 — Route Details / Route Optimization
 * Matches reference design:
 * - Header: < Route Details
 * - Subtitle: Nagpur → Mumbai | 320 km • ETA: Today, 4:30 PM
 * - Interactive Map with route options:
 *   [ Fastest 5h 20m ] (blue pill)
 *   [ 6h 10m (+45 km) ] (dark pill)
 *   [ 7h 05m (+80 km) ] (dark pill)
 * - Bottom card:
 *   Recommended Route: 5h 20m • 320 km Via NH44
 *   Button: [ View Turn-by-Turn ]
 */
@Composable
fun RouteDetailsScreen(
    requestId: Int,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val requests by LogiSyncRepository.requests.collectAsState()
    val shipment = remember(requestId, requests) {
        requests.find { it.id == requestId }
            ?: DemoDataSource.getShipmentById(requestId)
            ?: DemoDataSource.demoShipments.first()
    }

    val origCity = shipment.pickup_location.split(",")[0].trim().ifEmpty { "Nagpur" }
    val destCity = shipment.delivery_location.split(",")[0].trim().ifEmpty { "Mumbai" }

    val routes = DemoDataSource.demoRoutes
    var selectedRouteId by remember { mutableStateOf(1) }
    val activeRoute = remember(selectedRouteId) {
        routes.find { it.id == selectedRouteId } ?: routes.first()
    }

    var showTurnByTurnDialog by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = Color(0xFF060E1A)
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Top Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
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
                        text = "Route Details",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    IconButton(
                        onClick = {
                            Toast.makeText(context, "Route optimization refreshed via Live Telemetry", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF0F172A))
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Refresh,
                            contentDescription = "Refresh",
                            tint = Color(0xFF38BDF8),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                // Route Header Summary
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "$origCity \u2192 $destCity",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "${activeRoute.distance} \u2022 ETA: Today, 4:30 PM",
                        fontSize = 13.sp,
                        color = Color(0xFF94A3B8)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Map & Interactive Route Overlay Area
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                ) {
                    // OpenStreetMap
                    LogisticsMapView(
                        originLat = shipment.origin_lat,
                        originLng = shipment.origin_lng,
                        originCity = origCity,
                        destLat = shipment.destination_lat,
                        destLng = shipment.destination_lng,
                        destCity = destCity,
                        vehicleLat = (shipment.origin_lat + shipment.destination_lat) / 2.0,
                        vehicleLng = (shipment.origin_lng + shipment.destination_lng) / 2.0,
                        trackingState = TrackingState.LIVE,
                        distanceRemainingKm = 320.0,
                        modifier = Modifier.fillMaxSize()
                    )

                    // Route Alternative Badges Overlay (Floating on Map)
                    Column(
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        routes.forEach { r ->
                            val isSelected = r.id == selectedRouteId
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(if (isSelected) Color(0xFF2563EB) else Color(0xCC0F172A))
                                    .border(1.dp, if (isSelected) Color(0xFF38BDF8) else Color(0xFF1E293B), RoundedCornerShape(20.dp))
                                    .clickable { selectedRouteId = r.id }
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = "${if (r.isRecommended) "Fastest " else ""}${r.duration}",
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = Color.White
                                )
                            }
                        }
                    }

                    // Bottom Recommended Route Card
                    Surface(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .fillMaxWidth()
                            .padding(16.dp),
                        shape = RoundedCornerShape(16.dp),
                        color = Color(0xFF0F172A),
                        border = BorderStroke(1.dp, Color(0xFF1E293B)),
                        shadowElevation = 8.dp
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(18.dp)
                        ) {
                            Text(
                                text = if (activeRoute.isRecommended) "Recommended Route" else activeRoute.title,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF38BDF8)
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "${activeRoute.duration} \u2022 ${activeRoute.distance}",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }

                            Text(
                                text = activeRoute.via,
                                fontSize = 13.sp,
                                color = Color(0xFF94A3B8)
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            // View Turn-by-Turn Button
                            Button(
                                onClick = { showTurnByTurnDialog = true },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                            ) {
                                Icon(Icons.Filled.Directions, contentDescription = "Turn by turn", modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "View Turn-by-Turn",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }
                }
            }

            // Turn-by-Turn Modal Dialog
            if (showTurnByTurnDialog) {
                AlertDialog(
                    onDismissRequest = { showTurnByTurnDialog = false },
                    containerColor = Color(0xFF0F172A),
                    title = {
                        Text(
                            text = "Turn-by-Turn Instructions",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    },
                    text = {
                        LazyColumn(
                            modifier = Modifier.heightIn(max = 350.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(DemoDataSource.demoTurnByTurn) { step ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(24.dp)
                                            .clip(CircleShape)
                                            .background(Color(0xFF2563EB)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = step.stepNumber.toString(),
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text(
                                            text = step.instruction,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = Color.White
                                        )
                                        Text(
                                            text = "${step.distance} • ${step.notes}",
                                            fontSize = 11.sp,
                                            color = Color(0xFF94A3B8)
                                        )
                                    }
                                }
                            }
                        }
                    },
                    confirmButton = {
                        TextButton(onClick = { showTurnByTurnDialog = false }) {
                            Text("Close", color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold)
                        }
                    }
                )
            }
        }
    }
}
