package com.example.logisyncpro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.model.TransportRequest
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.GlassCard
import com.example.logisyncpro.ui.components.LogiSyncBrandHeader
import com.example.logisyncpro.ui.components.StatusBadge
import kotlinx.coroutines.launch

@Composable
fun DashboardScreen(
    onNavigateToCreateShipment: () -> Unit,
    onNavigateToShipmentDetail: (Int) -> Unit,
    onNavigateToSettings: () -> Unit,
    onSignOut: () -> Unit = {}
) {
    val coroutineScope = rememberCoroutineScope()
    val currentUser by LogiSyncRepository.currentUser.collectAsState()
    val requests by LogiSyncRepository.requests.collectAsState()
    val isLoading by LogiSyncRepository.isLoading.collectAsState()

    var selectedFilter by remember { mutableStateOf("ALL") }

    // Fetch live requests on screen launch
    LaunchedEffect(Unit) {
        LogiSyncRepository.refreshRequests()
    }

    val isCarrier = currentUser?.role?.uppercase() == "TRANSPORT_PROVIDER" || currentUser?.role?.uppercase() == "CARRIER"
    val userName = currentUser?.name ?: "User"
    val userRoleLabel = if (isCarrier) "CARRIER / FLEET OPERATOR" else "SHIPPER / REQUESTER"

    // Computed KPIs
    val pendingCount = requests.count { it.status.uppercase() == "PENDING" }
    val inTransitCount = requests.count { it.status.uppercase() in listOf("ACCEPTED", "PICKUP_CONFIRMED", "IN_TRANSIT", "OUT_FOR_DELIVERY") }
    val deliveredCount = requests.count { it.status.uppercase() == "DELIVERED" }

    val filteredRequests = remember(requests, selectedFilter) {
        when (selectedFilter) {
            "PENDING" -> requests.filter { it.status.uppercase() == "PENDING" }
            "IN_TRANSIT" -> requests.filter { it.status.uppercase() in listOf("ACCEPTED", "PICKUP_CONFIRMED", "IN_TRANSIT", "OUT_FOR_DELIVERY") }
            "DELIVERED" -> requests.filter { it.status.uppercase() == "DELIVERED" }
            else -> requests
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianDeep)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 24.dp)
        ) {
            // Header Bar
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    LogiSyncBrandHeader()

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = {
                                coroutineScope.launch { LogiSyncRepository.refreshRequests() }
                            },
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(ObsidianCard)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Refresh",
                                tint = EmeraldPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        IconButton(
                            onClick = onNavigateToSettings,
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(ObsidianCard)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Settings,
                                contentDescription = "Settings",
                                tint = TextMuted,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        IconButton(
                            onClick = {
                                LogiSyncRepository.signOut()
                                onSignOut()
                            },
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(ObsidianCard)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                                contentDescription = "Sign Out",
                                tint = StatusCancelledText,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Welcome & Role Badge
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Welcome back,",
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                        Text(
                            text = userName,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(100.dp),
                        color = if (isCarrier) SafetyOrange.copy(alpha = 0.15f) else EmeraldPrimary.copy(alpha = 0.15f),
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isCarrier) SafetyOrange else EmeraldPrimary
                        )
                    ) {
                        Text(
                            text = userRoleLabel,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isCarrier) SafetyOrange else EmeraldPrimary,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // KPI Stat Cards Grid
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        modifier = Modifier.weight(1f),
                        label = if (isCarrier) "Loads Open" else "Pending",
                        count = pendingCount.toString(),
                        icon = Icons.Default.PendingActions,
                        accentColor = StatusPendingText
                    )
                    MetricCard(
                        modifier = Modifier.weight(1f),
                        label = "In Transit",
                        count = inTransitCount.toString(),
                        icon = Icons.Default.LocalShipping,
                        accentColor = EmeraldPrimary
                    )
                    MetricCard(
                        modifier = Modifier.weight(1f),
                        label = "Delivered",
                        count = deliveredCount.toString(),
                        icon = Icons.Default.CheckCircle,
                        accentColor = StatusDeliveredText
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Primary Action Button (Shipper creates request, Carrier explores marketplace)
                if (!isCarrier) {
                    Button(
                        onClick = onNavigateToCreateShipment,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = EmeraldPrimary,
                            contentColor = ObsidianDeep
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "New Transport Request",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                } else {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        color = ObsidianSurfaceElevated,
                        border = androidx.compose.foundation.BorderStroke(1.dp, SafetyOrange.copy(alpha = 0.4f))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Explore,
                                contentDescription = null,
                                tint = SafetyOrange,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Freight Marketplace Active",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "Select any open load below to claim and dispatch.",
                                    fontSize = 11.sp,
                                    color = TextMuted
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Filter Tabs Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (isCarrier) "ACTIVE MARKETPLACE & DISPATCHES" else "LIVE SHIPMENTS PIPELINE",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted
                    )

                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(14.dp),
                            color = EmeraldPrimary,
                            strokeWidth = 2.dp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Filter Pill Row
                val filters = listOf("ALL", "PENDING", "IN_TRANSIT", "DELIVERED")
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(filters) { filter ->
                        val isSelected = selectedFilter == filter
                        Surface(
                            modifier = Modifier.clickable { selectedFilter = filter },
                            shape = RoundedCornerShape(100.dp),
                            color = if (isSelected) EmeraldPrimary else ObsidianCard,
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (isSelected) EmeraldPrimary else ObsidianCardBorder
                            )
                        ) {
                            Text(
                                text = filter.replace("_", " "),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) ObsidianDeep else TextMuted,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
            }

            // Shipments List
            if (filteredRequests.isEmpty() && !isLoading) {
                item {
                    GlassCard(
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Inbox,
                                contentDescription = null,
                                tint = TextMuted,
                                modifier = Modifier.size(40.dp)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "No shipments found in this category",
                                fontSize = 13.sp,
                                color = TextMuted
                            )
                        }
                    }
                }
            } else {
                items(filteredRequests) { request ->
                    ShipmentCard(
                        request = request,
                        isCarrier = isCarrier,
                        onItemClick = { onNavigateToShipmentDetail(request.id) },
                        onAccept = {
                            coroutineScope.launch {
                                LogiSyncRepository.acceptRequest(request.id)
                            }
                        }
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
        }
    }
}

@Composable
fun MetricCard(
    modifier: Modifier = Modifier,
    label: String,
    count: String,
    icon: ImageVector,
    accentColor: androidx.compose.ui.graphics.Color
) {
    GlassCard(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextMuted
            )
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = accentColor,
                modifier = Modifier.size(16.dp)
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = count,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
    }
}

@Composable
fun ShipmentCard(
    request: TransportRequest,
    isCarrier: Boolean,
    onItemClick: () -> Unit,
    onAccept: () -> Unit
) {
    val isPending = request.status.uppercase() == "PENDING"

    GlassCard(
        modifier = Modifier.fillMaxWidth(),
        onClick = onItemClick
    ) {
        // Top row: Tracking number & Status badge
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = request.tracking_number.ifEmpty { "LSP-${request.id}" },
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = TextPrimary
            )
            StatusBadge(status = request.status)
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Route row
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "ORIGIN",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextMuted
                )
                Text(
                    text = request.pickup_location,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimary
                )
            }

            Icon(
                imageVector = Icons.Default.ArrowForward,
                contentDescription = null,
                tint = EmeraldPrimary,
                modifier = Modifier
                    .padding(horizontal = 8.dp)
                    .size(16.dp)
            )

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "DESTINATION",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextMuted
                )
                Text(
                    text = request.delivery_location,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimary
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Cargo info & Weight
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "${request.cargo_type} • ${request.weight}",
                fontSize = 11.sp,
                color = TextMuted
            )

            val partnerName = if (isCarrier) request.requester_name else request.provider_name
            if (!partnerName.isNullOrEmpty()) {
                Text(
                    text = if (isCarrier) "Shipper: $partnerName" else "Carrier: $partnerName",
                    fontSize = 10.sp,
                    color = EmeraldLight
                )
            }
        }

        // Carrier quick-accept button on pending marketplace loads
        if (isCarrier && isPending) {
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onAccept,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(36.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = SafetyOrange,
                    contentColor = ObsidianDeep
                )
            ) {
                Text(
                    text = "Claim & Accept Load",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
