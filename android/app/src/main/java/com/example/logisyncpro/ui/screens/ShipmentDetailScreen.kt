package com.example.logisyncpro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.example.logisyncpro.data.model.ShipmentEvent
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.GlassCard
import com.example.logisyncpro.ui.components.PrimaryButton
import com.example.logisyncpro.ui.components.StatusBadge
import kotlinx.coroutines.launch

@Composable
fun ShipmentDetailScreen(
    requestId: Int,
    onNavigateBack: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val requests by LogiSyncRepository.requests.collectAsState()
    val currentUser by LogiSyncRepository.currentUser.collectAsState()
    val isLoading by LogiSyncRepository.isLoading.collectAsState()

    val request = requests.find { it.id == requestId }
    var events by remember { mutableStateOf<List<ShipmentEvent>>(emptyList()) }

    // Fetch audit timeline events
    LaunchedEffect(requestId) {
        events = LogiSyncRepository.getShipmentEvents(requestId)
    }

    val isCarrier = currentUser?.role?.uppercase() == "TRANSPORT_PROVIDER" || currentUser?.role?.uppercase() == "CARRIER"

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianDeep)
    ) {
        if (request == null) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "Shipment not found", color = TextMuted)
                Spacer(modifier = Modifier.height(12.dp))
                Button(onClick = onNavigateBack) {
                    Text("Return to Dashboard")
                }
            }
        } else {
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
                        IconButton(
                            onClick = onNavigateBack,
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(ObsidianCard)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ArrowBack,
                                contentDescription = "Back",
                                tint = TextPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = request.tracking_number.ifEmpty { "LSP-${request.id}" },
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            StatusBadge(status = request.status)
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Route Card
                    GlassCard(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "TRANSIT ROUTE",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextMuted,
                            modifier = Modifier.padding(bottom = 12.dp)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(CircleShape)
                                    .background(EmeraldPrimary)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(text = "ORIGIN PICKUP", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                                Text(text = request.pickup_location, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                            }
                        }

                        Box(
                            modifier = Modifier
                                .padding(start = 4.dp, top = 4.dp, bottom = 4.dp)
                                .width(2.dp)
                                .height(24.dp)
                                .background(ObsidianCardBorder)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(CircleShape)
                                    .background(SafetyOrange)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(text = "DESTINATION DELIVERY", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                                Text(text = request.delivery_location, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Freight & Cargo Specs
                    GlassCard(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "FREIGHT SPECIFICATIONS",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextMuted,
                            modifier = Modifier.padding(bottom = 10.dp)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(text = "Cargo Type", fontSize = 11.sp, color = TextMuted)
                                Text(text = request.cargo_type, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(text = "Gross Weight", fontSize = 11.sp, color = TextMuted)
                                Text(text = request.weight, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                            }
                        }

                        if (!request.notes.isNullOrEmpty()) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(text = "Special Instructions", fontSize = 11.sp, color = TextMuted)
                            Text(text = request.notes, fontSize = 12.sp, color = TextPrimary)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Participants Details (Shipper & Carrier)
                    GlassCard(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "NETWORK PARTICIPANTS",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextMuted,
                            modifier = Modifier.padding(bottom = 10.dp)
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Column {
                                Text(text = "Shipper / Requester", fontSize = 11.sp, color = TextMuted)
                                Text(text = request.requester_name ?: "Shipper", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                                Text(text = request.requester_email ?: "", fontSize = 10.sp, color = TextMuted)
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(text = "Assigned Carrier", fontSize = 11.sp, color = TextMuted)
                                Text(
                                    text = request.provider_name ?: "Unassigned",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (request.provider_name != null) SafetyOrange else TextMuted
                                )
                                if (request.provider_email != null) {
                                    Text(text = request.provider_email, fontSize = 10.sp, color = TextMuted)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Carrier Workflow Progression Actions
                    if (isCarrier) {
                        when (request.status.uppercase()) {
                            "PENDING" -> {
                                PrimaryButton(
                                    text = "Accept Freight Load",
                                    isLoading = isLoading,
                                    onClick = {
                                        coroutineScope.launch {
                                            LogiSyncRepository.acceptRequest(request.id)
                                            events = LogiSyncRepository.getShipmentEvents(request.id)
                                        }
                                    }
                                )
                            }
                            "ACCEPTED" -> {
                                PrimaryButton(
                                    text = "Confirm Cargo Pickup",
                                    isLoading = isLoading,
                                    onClick = {
                                        coroutineScope.launch {
                                            LogiSyncRepository.updateStatus(request.id, "PICKUP_CONFIRMED", "Cargo verified and loaded onto carrier transport")
                                            events = LogiSyncRepository.getShipmentEvents(request.id)
                                        }
                                    }
                                )
                            }
                            "PICKUP_CONFIRMED" -> {
                                PrimaryButton(
                                    text = "Dispatch & Start Transit",
                                    isLoading = isLoading,
                                    onClick = {
                                        coroutineScope.launch {
                                            LogiSyncRepository.updateStatus(request.id, "IN_TRANSIT", "Vehicle in transit along highway corridor")
                                            events = LogiSyncRepository.getShipmentEvents(request.id)
                                        }
                                    }
                                )
                            }
                            "IN_TRANSIT" -> {
                                Button(
                                    onClick = {
                                        coroutineScope.launch {
                                            LogiSyncRepository.updateStatus(request.id, "DELIVERED", "Shipment safely delivered and signed for at destination")
                                            events = LogiSyncRepository.getShipmentEvents(request.id)
                                        }
                                    },
                                    enabled = !isLoading,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(50.dp),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = SafetyOrange,
                                        contentColor = ObsidianDeep
                                    )
                                ) {
                                    Text(text = "Confirm Final Delivery", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                }
                            }
                            "DELIVERED" -> {
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = StatusDeliveredBg,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = "✓ Completed & Delivered",
                                        color = StatusDeliveredText,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        modifier = Modifier.padding(14.dp),
                                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))
                    }

                    // Audit Ledger Timeline Header
                    Text(
                        text = "SHIPMENT AUDIT TRAIL (NEON LEDGER)",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                }

                // Events Timeline List
                if (events.isEmpty()) {
                    item {
                        Text(
                            text = "No event entries recorded yet.",
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                    }
                } else {
                    items(events) { event ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .padding(top = 4.dp)
                                    .clip(CircleShape)
                                    .background(EmeraldPrimary)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = event.description.ifEmpty { event.event_type },
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "By ${event.actor_name ?: "System"} • ${event.created_at}",
                                    fontSize = 10.sp,
                                    color = TextMuted
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
