package com.example.logisyncpro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.*

@Composable
fun AnalyticsScreen(
    onTabSelected: (BottomNavTab) -> Unit
) {
    val requests by LogiSyncRepository.requests.collectAsState()

    val totalShipments = requests.size
    val pending = requests.count { it.status.uppercase() == "PENDING" }
    val inTransit = requests.count { it.status.uppercase() in listOf("ACCEPTED", "PICKUP_CONFIRMED", "IN_TRANSIT", "OUT_FOR_DELIVERY") }
    val delivered = requests.count { it.status.uppercase() in listOf("DELIVERED", "COMPLETED") }
    val completionRate = if (totalShipments > 0) (delivered * 100) / totalShipments else 0
    val totalWeightKg = requests.sumOf { req -> req.weight.filter { it.isDigit() }.toIntOrNull() ?: 0 }

    Scaffold(
        bottomBar = {
            LogiSyncBottomNav(
                currentTab = BottomNavTab.TRACK,
                onTabSelected = onTabSelected
            )
        },
        containerColor = ObsidianDeep
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 20.dp)
        ) {
            item {
                Text(
                    text = "Fleet Analytics",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "Operational metrics verified via Neon database",
                    fontSize = 12.sp,
                    color = TextMuted
                )
                Spacer(modifier = Modifier.height(20.dp))
            }

            item {
                // Top KPI Grid
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    GlassCard(modifier = Modifier.weight(1f)) {
                        Text(text = "TOTAL DISPATCHES", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "$totalShipments", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Text(text = "Shipments logged", fontSize = 10.sp, color = TextMuted)
                    }

                    GlassCard(modifier = Modifier.weight(1f)) {
                        Text(text = "SUCCESS RATE", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "$completionRate%", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = EmeraldPrimary)
                        Text(text = "$delivered delivered", fontSize = 10.sp, color = TextMuted)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    GlassCard(modifier = Modifier.weight(1f)) {
                        Text(text = "ACTIVE IN TRANSIT", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "$inTransit", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = SafetyOrange)
                        Text(text = "Live vehicles", fontSize = 10.sp, color = TextMuted)
                    }

                    GlassCard(modifier = Modifier.weight(1f)) {
                        Text(text = "TOTAL CARGO", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "${totalWeightKg / 1000} T", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Text(text = "$totalWeightKg kg freight", fontSize = 10.sp, color = TextMuted)
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Status Breakdown Card
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "STATUS DISTRIBUTION",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    StatusRow(label = "Pending Confirmation", count = pending, total = totalShipments, color = StatusPendingText)
                    Spacer(modifier = Modifier.height(12.dp))
                    StatusRow(label = "In Transit / Dispatched", count = inTransit, total = totalShipments, color = EmeraldPrimary)
                    Spacer(modifier = Modifier.height(12.dp))
                    StatusRow(label = "Completed & Delivered", count = delivered, total = totalShipments, color = StatusDeliveredText)
                }
            }
        }
    }
}

@Composable
private fun StatusRow(label: String, count: Int, total: Int, color: androidx.compose.ui.graphics.Color) {
    val fraction = if (total > 0) count.toFloat() / total.toFloat() else 0f
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = label, fontSize = 12.sp, color = TextPrimary)
            Text(text = "$count", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = color)
        }
        Spacer(modifier = Modifier.height(4.dp))
        LinearProgressIndicator(
            progress = { fraction },
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp)),
            color = color,
            trackColor = ObsidianCardBorder
        )
    }
}