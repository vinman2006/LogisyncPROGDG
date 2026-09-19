package com.example.logisyncpro.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.model.TransportRequest
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.BottomNavTab
import com.example.logisyncpro.ui.components.GlassCard
import com.example.logisyncpro.ui.components.LogiSyncBottomNav
import com.example.logisyncpro.ui.components.WireframeCube
import kotlinx.coroutines.launch

@Composable
fun AvailableRequestsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToDetail: (Int) -> Unit,
    onTabSelected: (BottomNavTab) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val requests by LogiSyncRepository.requests.collectAsState()
    val isLoading by LogiSyncRepository.isLoading.collectAsState()

    val pendingRequests = remember(requests) {
        requests.filter { it.status.uppercase() == "PENDING" }
    }

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF071411))
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onNavigateBack,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }

                Text(
                    text = "Available Requests",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                IconButton(
                    onClick = { coroutineScope.launch { LogiSyncRepository.refreshRequests() } },
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.FilterList,
                        contentDescription = "Filter",
                        tint = Color.White
                    )
                }
            }
        },
        bottomBar = {
            LogiSyncBottomNav(
                currentTab = BottomNavTab.SHIPMENTS,
                secondTabLabel = "Requests",
                secondTabIcon = Icons.Default.Search,
                onTabSelected = onTabSelected
            )
        },
        containerColor = Color(0xFF071411)
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (pendingRequests.isEmpty()) {
                // Empty state matching screenshot
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    WireframeCube(
                        modifier = Modifier.size(80.dp),
                        color = Color(0xFF2C4A3E)
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Text(
                        text = "No requests available",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "New transport requests will appear\nhere when available.",
                        fontSize = 13.sp,
                        color = Color(0xFF7A9E91),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        lineHeight = 18.sp
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 20.dp, vertical = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(pendingRequests) { req ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onNavigateToDetail(req.id) },
                            shape = RoundedCornerShape(12.dp),
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
                                        text = req.tracking_number.ifEmpty { "SHP-${req.id}" },
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = EmeraldPrimary
                                    )
                                    Surface(
                                        shape = RoundedCornerShape(100.dp),
                                        color = StatusPendingBg
                                    ) {
                                        Text(
                                            text = "Pending",
                                            color = StatusPendingText,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Text(
                                    text = "${req.pickup_location} → ${req.delivery_location}",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color.White
                                )

                                Spacer(modifier = Modifier.height(6.dp))

                                Text(
                                    text = if (req.weight.isNotEmpty()) "${req.weight} · ${req.cargo_type.ifEmpty { "General Freight" }}" else "Standard freight",
                                    fontSize = 12.sp,
                                    color = Color(0xFF7A9E91)
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                Button(
                                    onClick = {
                                        coroutineScope.launch {
                                            LogiSyncRepository.acceptRequest(req.id)
                                            LogiSyncRepository.refreshRequests()
                                        }
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(42.dp),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
                                ) {
                                    Text(
                                        text = "Accept Request",
                                        fontWeight = FontWeight.Bold,
                                        color = ObsidianDeep,
                                        fontSize = 13.sp
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
