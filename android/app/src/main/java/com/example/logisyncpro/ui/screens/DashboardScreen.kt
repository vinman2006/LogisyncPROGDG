package com.example.logisyncpro.ui.screens

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
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.service.RealLocationTracker
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.BottomNavTab
import com.example.logisyncpro.ui.components.LogiSyncBottomNav
import com.example.logisyncpro.ui.components.LogiSyncBrandHeader
import com.example.logisyncpro.ui.components.StatusBadge
import com.example.logisyncpro.ui.components.WireframeCube
import kotlinx.coroutines.launch
import java.util.*

@Composable
fun DashboardScreen(
    onNavigateToCreateShipment: () -> Unit,
    onNavigateToShipmentDetail: (Int) -> Unit,
    onNavigateToTracking: (Int) -> Unit,
    onNavigateToAvailableRequests: () -> Unit,
    onTabSelected: (BottomNavTab) -> Unit,
    onSignOut: () -> Unit = {}
) {
    val coroutineScope = rememberCoroutineScope()
    val currentUser by LogiSyncRepository.currentUser.collectAsState()
    val requests by LogiSyncRepository.requests.collectAsState()

    val isTrackingActive by RealLocationTracker.isTrackingActive.collectAsState()
    val activeShipmentId by RealLocationTracker.activeShipmentId.collectAsState()
    val uploadedFixesCount by RealLocationTracker.uploadedFixesCount.collectAsState()

    var showRoleMenu by remember { mutableStateOf(false) }
    var showNotificationsDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        LogiSyncRepository.refreshRequests()
    }

    val isCarrier = currentUser?.role?.uppercase() == "TRANSPORT_PROVIDER" || currentUser?.role?.uppercase() == "CARRIER"
    val roleLabel = if (isCarrier) "Transport Provider" else "Requester"

    val activeCount = requests.count { it.status.uppercase() in listOf("ACCEPTED", "IN_TRANSIT", "PICKUP_CONFIRMED", "OUT_FOR_DELIVERY") }
    val pendingCount = requests.count { it.status.uppercase() == "PENDING" }

    val recentShipment = remember(requests) {
        requests.find { it.status.uppercase() in listOf("IN_TRANSIT", "ACCEPTED", "ASSIGNED") } ?: requests.firstOrNull()
    }

    val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    val greeting = when {
        hour < 12 -> "Good morning,"
        hour < 17 -> "Good afternoon,"
        else -> "Good evening,"
    }

    // Pulsing transition for LIVE badge
    val infiniteTransition = rememberInfiniteTransition(label = "DashLivePulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "DashPulseAlpha"
    )

    Scaffold(
        bottomBar = {
            LogiSyncBottomNav(
                currentTab = BottomNavTab.HOME,
                secondTabLabel = if (isCarrier) "Deliveries" else "Shipments",
                onTabSelected = onTabSelected
            )
        },
        containerColor = Color(0xFF071411)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                LogiSyncBrandHeader()

                IconButton(
                    onClick = { coroutineScope.launch { LogiSyncRepository.refreshRequests() } },
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Refresh",
                        tint = EmeraldPrimary,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // LIVE GPS BROADCAST BANNER ON DASHBOARD (if actively tracking)
            if (isTrackingActive) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                        .clickable { onNavigateToTracking(activeShipmentId ?: recentShipment?.id ?: 1) },
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFF0F382A),
                    border = BorderStroke(1.dp, EmeraldPrimary)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(CircleShape)
                                    .background(EmeraldPrimary.copy(alpha = pulseAlpha))
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "LIVE GPS BROADCAST ACTIVE",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EmeraldPrimary
                                )
                                Text(
                                    text = "Synced $uploadedFixesCount fixes to Neon PostgreSQL",
                                    fontSize = 11.sp,
                                    color = Color(0xFF9EBFB2)
                                )
                            }
                        }

                        Icon(
                            imageVector = Icons.Default.Navigation,
                            contentDescription = "View",
                            tint = EmeraldPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            // User Greeting and Role Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = greeting,
                        fontSize = 13.sp,
                        color = Color(0xFF7A9E91)
                    )
                    Text(
                        text = currentUser?.name?.ifEmpty { "Logistics Lead" } ?: "Logistics Lead",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                Box {
                    Surface(
                        shape = RoundedCornerShape(100.dp),
                        color = Color(0xFF0C221B),
                        border = BorderStroke(1.dp, Color(0xFF14352B)),
                        modifier = Modifier.clickable { showRoleMenu = true }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = roleLabel,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = EmeraldPrimary
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                imageVector = Icons.Default.ArrowDropDown,
                                contentDescription = null,
                                tint = EmeraldPrimary,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    DropdownMenu(
                        expanded = showRoleMenu,
                        onDismissRequest = { showRoleMenu = false },
                        modifier = Modifier.background(Color(0xFF0C221B))
                    ) {
                        DropdownMenuItem(
                            text = { Text("Requester", color = Color.White) },
                            onClick = {
                                coroutineScope.launch {
                                    LogiSyncRepository.updateUserRole("REQUESTER")
                                    showRoleMenu = false
                                }
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Transport Provider", color = Color.White) },
                            onClick = {
                                coroutineScope.launch {
                                    LogiSyncRepository.updateUserRole("TRANSPORT_PROVIDER")
                                    showRoleMenu = false
                                }
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Two Quick Action Cards: Create Shipment & Browse Requests
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .height(115.dp)
                        .clickable { onNavigateToCreateShipment() },
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF0C221B),
                    border = BorderStroke(1.dp, Color(0xFF14352B))
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .border(1.5.dp, EmeraldPrimary, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = "Create",
                                tint = EmeraldPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Create\nShipment",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            lineHeight = 16.sp
                        )
                    }
                }

                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .height(115.dp)
                        .clickable { onNavigateToAvailableRequests() },
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF0C221B),
                    border = BorderStroke(1.dp, Color(0xFF14352B))
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .border(1.5.dp, EmeraldPrimary, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = "Browse",
                                tint = EmeraldPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Browse\nRequests",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            lineHeight = 16.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Stats Count Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onTabSelected(BottomNavTab.SHIPMENTS) },
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF0C221B),
                    border = BorderStroke(1.dp, Color(0xFF14352B))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Inventory2,
                            contentDescription = null,
                            tint = EmeraldPrimary,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Active Shipments",
                                fontSize = 11.sp,
                                color = Color(0xFF7A9E91)
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = if (activeCount > 0) "$activeCount" else "0",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }

                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigateToAvailableRequests() },
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF0C221B),
                    border = BorderStroke(1.dp, Color(0xFF14352B))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Description,
                            contentDescription = null,
                            tint = SafetyOrange,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Pending Requests",
                                fontSize = 11.sp,
                                color = Color(0xFF7A9E91)
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = if (pendingCount > 0) "$pendingCount" else "0",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Recent Activity",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(12.dp))

            if (recentShipment != null) {
                // Real recent activity card from Neon Database
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToShipmentDetail(recentShipment.id) },
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFF0C221B),
                    border = BorderStroke(1.dp, Color(0xFF14352B))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = recentShipment.tracking_number.ifEmpty { "SHP-${recentShipment.id}" },
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = EmeraldPrimary
                            )
                            StatusBadge(status = recentShipment.status)
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "${recentShipment.pickup_location} → ${recentShipment.delivery_location}",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "${recentShipment.weight} · ${recentShipment.cargo_type}",
                            fontSize = 12.sp,
                            color = Color(0xFF7A9E91)
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "View Details",
                                fontSize = 12.sp,
                                color = Color(0xFF7A9E91),
                                modifier = Modifier.clickable { onNavigateToShipmentDetail(recentShipment.id) }
                            )

                            Button(
                                onClick = { onNavigateToTracking(recentShipment.id) },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.GpsFixed, contentDescription = null, tint = ObsidianDeep, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Track GPS",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ObsidianDeep
                                )
                            }
                        }
                    }
                }
            } else {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFF0C221B),
                    border = BorderStroke(1.dp, Color(0xFF14352B))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 30.dp, horizontal = 20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        WireframeCube(
                            modifier = Modifier.size(52.dp),
                            color = Color(0xFF2C4A3E)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No recent shipments",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Create a shipment or browse requests to begin.",
                            fontSize = 12.sp,
                            color = Color(0xFF7A9E91)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }

    if (showNotificationsDialog) {
        AlertDialog(
            onDismissRequest = { showNotificationsDialog = false },
            containerColor = Color(0xFF0C221B),
            title = { Text("Operational Notifications", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text("Live System Alerts", color = EmeraldLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("• Neon Cloud Database: Connected & Operational", color = Color.White, fontSize = 12.sp)
                    Text("• Google Fused Location: Real GPS Telemetry active", color = Color.White, fontSize = 12.sp)
                    Text("• Active Shipments: " + requests.size + " dispatches verified", color = Color.White, fontSize = 12.sp)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        coroutineScope.launch { LogiSyncRepository.refreshRequests() }
                        showNotificationsDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                ) {
                    Text("Refresh & Dismiss", color = ObsidianDeep, fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}
