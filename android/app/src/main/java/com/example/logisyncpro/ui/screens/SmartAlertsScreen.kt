package com.example.logisyncpro.ui.screens

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
import com.example.logisyncpro.data.model.AlertSeverity
import com.example.logisyncpro.data.model.SmartAlert
import com.example.logisyncpro.ui.components.BottomNavTab
import com.example.logisyncpro.ui.components.LogiSyncBottomNav

/**
 * Screen 4 — Smart Alerts
 * Matches reference design:
 * - Header: < Alerts
 * - Filter categories: [ All ] (blue), [ Shipment ], [ Delivery ], [ System ]
 * - Notification cards with colored severity circles:
 *   🟢 Success (Shipment Picked Up, Out for Delivery)
 *   🔵 Info (Arrived at Hub, Delivered)
 *   🟠 Warning (Delay Notice)
 *   🔴 Critical
 */
@Composable
fun SmartAlertsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToShipment: (Int) -> Unit,
    onTabSelected: (BottomNavTab) -> Unit
) {
    var selectedCategory by remember { mutableStateOf("All") }
    val categories = listOf("All", "Shipment", "Delivery", "System")

    val alerts = DemoDataSource.demoAlerts
    val filteredAlerts = remember(selectedCategory) {
        if (selectedCategory == "All") alerts
        else alerts.filter { it.category.equals(selectedCategory, ignoreCase = true) }
    }

    Scaffold(
        bottomBar = {
            LogiSyncBottomNav(
                currentTab = BottomNavTab.ALERTS,
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
                    text = "Alerts",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.size(38.dp))
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Filter Tabs / Chips: All, Shipment, Delivery, System
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(categories) { cat ->
                    val isSelected = cat == selectedCategory
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(if (isSelected) Color(0xFF2563EB) else Color(0xFF0F172A))
                            .border(1.dp, if (isSelected) Color(0xFF3B82F6) else Color(0xFF1E293B), RoundedCornerShape(20.dp))
                            .clickable { selectedCategory = cat }
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = cat,
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Color.White else Color(0xFF94A3B8)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Alerts List
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredAlerts) { alert ->
                    val iconColor = when (alert.severity) {
                        AlertSeverity.SUCCESS -> Color(0xFF10B981)
                        AlertSeverity.INFO -> Color(0xFF38BDF8)
                        AlertSeverity.WARNING -> Color(0xFFF59E0B)
                        AlertSeverity.CRITICAL -> Color(0xFFEF4444)
                    }

                    val iconVector = when (alert.severity) {
                        AlertSeverity.SUCCESS -> Icons.Filled.LocalShipping
                        AlertSeverity.INFO -> Icons.Filled.Info
                        AlertSeverity.WARNING -> Icons.Filled.Warning
                        AlertSeverity.CRITICAL -> Icons.Filled.Report
                    }

                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                alert.shipmentId?.let { onNavigateToShipment(it) }
                            },
                        shape = RoundedCornerShape(14.dp),
                        color = Color(0xFF0F172A),
                        border = BorderStroke(1.dp, Color(0xFF1E293B))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            // Colored Circular Severity Icon
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(iconColor),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = iconVector,
                                    contentDescription = alert.severity.name,
                                    tint = Color.White,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(14.dp))

                            // Alert Details
                            Column(
                                modifier = Modifier.weight(1f)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = alert.title,
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )

                                    Text(
                                        text = alert.timeAgo,
                                        fontSize = 11.sp,
                                        color = Color(0xFF64748B)
                                    )
                                }

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = alert.message,
                                    fontSize = 13.sp,
                                    color = Color(0xFF94A3B8),
                                    lineHeight = 18.sp
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
