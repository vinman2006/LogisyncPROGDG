package com.example.logisyncpro.ui.screens

import android.content.Intent
import android.widget.Toast
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
import kotlinx.coroutines.launch

/**
 * Screen 2 — Shipment Details
 * Matches reference design:
 * - Consignment Number (LS-782341) & Status (In Transit)
 * - Route: Nagpur → Mumbai
 * - 4-stage horizontal progress tracker (Picked Up -> In Transit -> Out for Delivery -> Delivered)
 * - Shipment Information card (Order ID, Consignment No, Customer, Items, Weight, Expected Delivery)
 * - Quick feature navigation: Live Tracking, Route, Timeline, Delivery Proof, Invoice
 * - Share Tracking Link button
 */
@Composable
fun ShipmentDetailScreen(
    requestId: Int,
    onNavigateBack: () -> Unit,
    onNavigateToTracking: (Int) -> Unit,
    onNavigateToTimeline: (Int) -> Unit = {},
    onNavigateToRoute: (Int) -> Unit = {},
    onNavigateToProof: (Int) -> Unit = {},
    onNavigateToInvoice: (Int) -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val requests by LogiSyncRepository.requests.collectAsState()

    var shipment by remember {
        mutableStateOf(
            requests.find { it.id == requestId }
                ?: DemoDataSource.getShipmentById(requestId)
                ?: DemoDataSource.demoShipments.first()
        )
    }

    LaunchedEffect(requestId) {
        val remote = LogiSyncRepository.getShipmentById(requestId)
        if (remote != null) {
            shipment = remote
        }
    }

    val s = shipment
    val origCity = s.pickup_location.split(",")[0].trim().ifEmpty { "Nagpur" }
    val destCity = s.delivery_location.split(",")[0].trim().ifEmpty { "Mumbai" }
    val trackingNo = s.tracking_number.ifEmpty { "LS-782341" }
    val orderId = if (s.notes?.contains("ORD-") == true) {
        val idx = s.notes.indexOf("ORD-")
        "#" + s.notes.substring(idx).split(" ", ".", ",")[0].trim()
    } else {
        "#ORD-44521"
    }
    val customerName = s.requester_name?.takeIf { it.isNotBlank() } ?: "Rohit Deshmukh"
    val items = s.cargo_type.ifEmpty { "Electronics (3)" }
    val weight = s.weight.ifEmpty { "12.5 kg" }
    val expectedDelivery = s.requested_date ?: "Today, 4:30 PM"

    val statusUpper = s.status.uppercase()
    val isPickedUp = statusUpper in listOf("ACCEPTED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED")
    val isInTransit = statusUpper in listOf("IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED")
    val isOutForDelivery = statusUpper in listOf("OUT_FOR_DELIVERY", "DELIVERED")
    val isDelivered = statusUpper == "DELIVERED"

    Scaffold(
        containerColor = Color(0xFF060E1A)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
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
                    text = "Shipment Details",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                IconButton(
                    onClick = {
                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_SUBJECT, "Track Shipment $trackingNo")
                            putExtra(
                                Intent.EXTRA_TEXT,
                                "Track your LogiSync shipment $trackingNo ($origCity to $destCity) live: https://logisync.app/track/$trackingNo"
                            )
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "Share Tracking Link"))
                    },
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF0F172A))
                ) {
                    Icon(
                        imageVector = Icons.Filled.Share,
                        contentDescription = "Share",
                        tint = Color(0xFF38BDF8),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Consignment Number & Status Header Card
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = trackingNo,
                        fontSize = 26.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "$origCity → $destCity",
                        fontSize = 14.sp,
                        color = Color(0xFF94A3B8)
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isInTransit) Color(0x3310B981) else Color(0x333B82F6))
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = if (isDelivered) "Delivered" else if (isInTransit) "In Transit" else "Pending",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isInTransit) Color(0xFF34D399) else Color(0xFF60A5FA)
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 4-Stage Horizontal Progress Tracker (Picked Up -> In Transit -> Out for Delivery -> Delivered)
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF0F172A),
                border = BorderStroke(1.dp, Color(0xFF1E293B))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    // Progress Nodes & Lines Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        // Stage 1: Picked Up
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .clip(CircleShape)
                                .background(if (isPickedUp) Color(0xFF10B981) else Color(0xFF334155))
                        )
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(3.dp)
                                .background(if (isInTransit) Color(0xFF10B981) else Color(0xFF334155))
                        )

                        // Stage 2: In Transit
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .clip(CircleShape)
                                .background(if (isInTransit) Color(0xFF38BDF8) else Color(0xFF334155))
                        )
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(3.dp)
                                .background(if (isOutForDelivery) Color(0xFF10B981) else Color(0xFF334155))
                        )

                        // Stage 3: Out for Delivery
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .clip(CircleShape)
                                .background(if (isOutForDelivery) Color(0xFF10B981) else Color(0xFF334155))
                        )
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(3.dp)
                                .background(if (isDelivered) Color(0xFF10B981) else Color(0xFF334155))
                        )

                        // Stage 4: Delivered
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .clip(CircleShape)
                                .background(if (isDelivered) Color(0xFF10B981) else Color(0xFF334155))
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Labels Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Picked Up",
                            fontSize = 11.sp,
                            fontWeight = if (isPickedUp) FontWeight.Bold else FontWeight.Normal,
                            color = if (isPickedUp) Color.White else Color(0xFF64748B)
                        )
                        Text(
                            text = "In Transit",
                            fontSize = 11.sp,
                            fontWeight = if (isInTransit) FontWeight.Bold else FontWeight.Normal,
                            color = if (isInTransit) Color(0xFF38BDF8) else Color(0xFF64748B)
                        )
                        Text(
                            text = "Out for Delivery",
                            fontSize = 11.sp,
                            fontWeight = if (isOutForDelivery) FontWeight.Bold else FontWeight.Normal,
                            color = if (isOutForDelivery) Color.White else Color(0xFF64748B)
                        )
                        Text(
                            text = "Delivered",
                            fontSize = 11.sp,
                            fontWeight = if (isDelivered) FontWeight.Bold else FontWeight.Normal,
                            color = if (isDelivered) Color(0xFF10B981) else Color(0xFF64748B)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Shipment Information Card
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF0F172A),
                border = BorderStroke(1.dp, Color(0xFF1E293B))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp)
                ) {
                    Text(
                        text = "Shipment Information",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    InfoRow(label = "Order ID", value = orderId)
                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp, modifier = Modifier.padding(vertical = 10.dp))

                    InfoRow(label = "Consignment No.", value = trackingNo)
                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp, modifier = Modifier.padding(vertical = 10.dp))

                    InfoRow(label = "Customer", value = customerName)
                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp, modifier = Modifier.padding(vertical = 10.dp))

                    InfoRow(label = "Items", value = items)
                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp, modifier = Modifier.padding(vertical = 10.dp))

                    InfoRow(label = "Weight", value = weight)
                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp, modifier = Modifier.padding(vertical = 10.dp))

                    InfoRow(label = "Expected Delivery", value = expectedDelivery)
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Quick Navigation Hub (Live Tracking, Route, Timeline, Delivery Proof, Invoice)
            Text(
                text = "Tracking Actions",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF94A3B8),
                modifier = Modifier.padding(start = 4.dp, bottom = 10.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                QuickActionCard(
                    title = "Live Tracking",
                    icon = Icons.Filled.MyLocation,
                    color = Color(0xFF38BDF8),
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigateToTracking(s.id) }
                )
                QuickActionCard(
                    title = "Route Details",
                    icon = Icons.Filled.Route,
                    color = Color(0xFF34D399),
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigateToRoute(s.id) }
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                QuickActionCard(
                    title = "Timeline",
                    icon = Icons.Filled.AccessTime,
                    color = Color(0xFFF59E0B),
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigateToTimeline(s.id) }
                )
                QuickActionCard(
                    title = "Delivery Proof",
                    icon = Icons.Filled.AssignmentTurnedIn,
                    color = Color(0xFF818CF8),
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigateToProof(s.id) }
                )
                QuickActionCard(
                    title = "Invoice",
                    icon = Icons.Filled.Receipt,
                    color = Color(0xFFEC4899),
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigateToInvoice(s.id) }
                )
            }

            Spacer(modifier = Modifier.height(22.dp))

            // Primary Button: "Share Tracking Link"
            Button(
                onClick = {
                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_SUBJECT, "LogiSync Tracking - $trackingNo")
                        putExtra(
                            Intent.EXTRA_TEXT,
                            "Track consignment $trackingNo live with real-time GPS telemetry: https://logisync.app/track/$trackingNo"
                        )
                    }
                    context.startActivity(Intent.createChooser(shareIntent, "Share Tracking Link"))
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF2563EB)
                )
            ) {
                Icon(Icons.Filled.Share, contentDescription = "Share", modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Share Tracking Link",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            fontSize = 13.sp,
            color = Color(0xFF64748B)
        )
        Text(
            text = value,
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.White
        )
    }
}

@Composable
private fun QuickActionCard(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        color = Color(0xFF0F172A),
        border = BorderStroke(1.dp, Color(0xFF1E293B))
    ) {
        Column(
            modifier = Modifier.padding(vertical = 12.dp, horizontal = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = color,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color.White
            )
        }
    }
}
