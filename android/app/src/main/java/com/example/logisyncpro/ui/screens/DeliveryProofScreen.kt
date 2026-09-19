package com.example.logisyncpro.ui.screens

import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
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
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.datasource.DemoDataSource
import com.example.logisyncpro.data.repository.LogiSyncRepository

/**
 * Screen 6 — Delivery Proof
 * Matches reference design:
 * - Header: < Delivery Proof
 * - Status: Delivered (green pill)
 * - Delivered on: Sep 16, 2025, 3:42 PM
 * - Delivered to: Amit Kulkarni
 * - Segmented tabs: [ Signature ] (active), [ Photo ], [ Location ]
 * - White/light signature drawing canvas with authentic signature stroke
 * - Action button: [ 📥 Download Proof ]
 */
@Composable
fun DeliveryProofScreen(
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

    val proof = DemoDataSource.demoDeliveryProof
    var selectedTab by remember { mutableStateOf("Signature") }
    val tabs = listOf("Signature", "Photo", "Location")

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
                    text = "Delivery Proof",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                // Delivered Green Pill Badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0xFF10B981))
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Delivered",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Delivered Metadata Info
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Delivered on",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B)
                )
                Text(
                    text = proof.deliveredOn,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Delivered to",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B)
                )
                Text(
                    text = proof.deliveredTo,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Tabs: [ Signature ], [ Photo ], [ Location ]
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF0F172A))
                    .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(10.dp))
                    .padding(4.dp)
            ) {
                tabs.forEach { tabName ->
                    val isSelected = tabName == selectedTab
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) Color(0xFF2563EB) else Color.Transparent)
                            .clickable { selectedTab = tabName }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = tabName,
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Color.White else Color(0xFF64748B)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Tab Content Box
            when (selectedTab) {
                "Signature" -> {
                    // White/light card showing handwritten recipient signature
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        shape = RoundedCornerShape(16.dp),
                        color = Color.White,
                        shadowElevation = 4.dp
                    ) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Canvas(modifier = Modifier.fillMaxSize()) {
                                val w = size.width
                                val h = size.height
                                val path = Path().apply {
                                    moveTo(w * 0.18f, h * 0.65f)
                                    cubicTo(w * 0.22f, h * 0.25f, w * 0.28f, h * 0.15f, w * 0.32f, h * 0.70f)
                                    cubicTo(w * 0.34f, h * 0.40f, w * 0.40f, h * 0.45f, w * 0.46f, h * 0.65f)
                                    cubicTo(w * 0.50f, h * 0.30f, w * 0.60f, h * 0.20f, w * 0.65f, h * 0.60f)
                                    cubicTo(w * 0.70f, h * 0.45f, w * 0.78f, h * 0.50f, w * 0.84f, h * 0.55f)
                                }
                                drawPath(
                                    path = path,
                                    color = Color(0xFF0F172A),
                                    style = Stroke(width = 4.dp.toPx(), cap = StrokeCap.Round)
                                )
                                drawLine(
                                    color = Color(0xFF94A3B8),
                                    start = Offset(w * 0.12f, h * 0.82f),
                                    end = Offset(w * 0.88f, h * 0.82f),
                                    strokeWidth = 1.dp.toPx()
                                )
                            }

                            Text(
                                text = "Amit Kulkarni",
                                fontSize = 11.sp,
                                color = Color(0xFF64748B),
                                modifier = Modifier
                                    .align(Alignment.BottomEnd)
                                    .padding(14.dp)
                            )
                        }
                    }
                }

                "Photo" -> {
                    // Delivery Package Photo
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        shape = RoundedCornerShape(16.dp),
                        color = Color(0xFF0F172A),
                        border = BorderStroke(1.dp, Color(0xFF1E293B))
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.PhotoCamera,
                                contentDescription = "Proof photo",
                                tint = Color(0xFF38BDF8),
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "Delivery Package Photo Captured",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "Verified with GPS Geo-Tag • Sep 16, 2025 3:42 PM",
                                fontSize = 12.sp,
                                color = Color(0xFF94A3B8)
                            )
                        }
                    }
                }

                "Location" -> {
                    // Terminal Location Verification
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        shape = RoundedCornerShape(16.dp),
                        color = Color(0xFF0F172A),
                        border = BorderStroke(1.dp, Color(0xFF1E293B))
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.GpsFixed,
                                contentDescription = "GPS Verified",
                                tint = Color(0xFF10B981),
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "Geofence Verification Passed",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = proof.terminalLocation,
                                fontSize = 12.sp,
                                color = Color(0xFF94A3B8)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Download Proof Button
            Button(
                onClick = {
                    Toast.makeText(context, "Delivery Proof exported to Downloads: POD-${proof.trackingNumber}.pdf", Toast.LENGTH_LONG).show()
                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_SUBJECT, "Proof of Delivery - ${proof.trackingNumber}")
                        putExtra(
                            Intent.EXTRA_TEXT,
                            "LogiSync Official Proof of Delivery\nConsignment: ${proof.trackingNumber}\nDelivered to: ${proof.deliveredTo}\nTimestamp: ${proof.deliveredOn}\nLocation: ${proof.terminalLocation}\nVerified electronically by carrier."
                        )
                    }
                    context.startActivity(Intent.createChooser(shareIntent, "Share Delivery Proof"))
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
            ) {
                Icon(Icons.Filled.Download, contentDescription = "Download", modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Download Proof",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}
