package com.example.logisyncpro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.api.ApiClient
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.GlassCard
import com.example.logisyncpro.ui.components.PrimaryButton
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit,
    onSignOut: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val currentUser by LogiSyncRepository.currentUser.collectAsState()
    val isLoading by LogiSyncRepository.isLoading.collectAsState()

    var serverUrl by remember { mutableStateOf(ApiClient.getBaseUrl()) }
    var urlSavedMessage by remember { mutableStateOf(false) }

    var isEditingName by remember { mutableStateOf(false) }
    var editedName by remember { mutableStateOf(currentUser?.name ?: "") }
    var nameSavedMessage by remember { mutableStateOf(false) }

    val isCarrier = currentUser?.role?.uppercase() == "TRANSPORT_PROVIDER" || currentUser?.role?.uppercase() == "CARRIER"
    val scrollState = rememberScrollState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianDeep)
            .padding(horizontal = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(vertical = 24.dp)
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
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

                Spacer(modifier = Modifier.width(12.dp))

                Text(
                    text = "Profile & Settings",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Profile info card
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "ACTIVE PROFILE (NEON POSTGRESQL)",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextMuted,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                if (isEditingName) {
                    OutlinedTextField(
                        value = editedName,
                        onValueChange = { editedName = it },
                        label = { Text("Display Name", color = TextMuted, fontSize = 11.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = EmeraldPrimary,
                            unfocusedBorderColor = ObsidianCardBorder,
                            focusedContainerColor = ObsidianSurfaceElevated,
                            unfocusedContainerColor = ObsidianSurfaceElevated
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                if (editedName.isNotBlank()) {
                                    coroutineScope.launch {
                                        LogiSyncRepository.saveProfile(
                                            country = currentUser?.country ?: "India",
                                            state = currentUser?.state ?: "Maharashtra",
                                            city = currentUser?.city ?: "Nagpur",
                                            role = currentUser?.role ?: "REQUESTER",
                                            customName = editedName.trim()
                                        )
                                        nameSavedMessage = true
                                        isEditingName = false
                                    }
                                }
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary, contentColor = ObsidianDeep)
                        ) {
                            Text("Save Name to NeonDB", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = { isEditingName = false },
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Cancel", fontSize = 11.sp, color = TextMuted)
                        }
                    }
                } else {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = currentUser?.name ?: "User",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )

                        TextButton(
                            onClick = {
                                editedName = currentUser?.name ?: ""
                                isEditingName = true
                                nameSavedMessage = false
                            }
                        ) {
                            Text("Edit Name", color = EmeraldLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    if (nameSavedMessage) {
                        Text(
                            text = "✓ Name saved to NeonDB ledger",
                            color = EmeraldPrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                Text(
                    text = currentUser?.email ?: "",
                    fontSize = 12.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Operational Role:",
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                    Text(
                        text = if (isCarrier) "Transport Provider / Carrier" else "Requester / Shipper",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isCarrier) SafetyOrange else EmeraldPrimary
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Location Terminal:",
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                    Text(
                        text = "${currentUser?.city ?: "Nagpur"}, ${currentUser?.state ?: "MH"}",
                        fontSize = 12.sp,
                        color = TextPrimary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Quick Role Switcher
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "SWITCH OPERATIONAL ROLE",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextMuted,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Text(
                    text = "Toggle your active profile between Shipper (requesting freight) and Carrier (dispatching loads) for testing multi-user workflows.",
                    fontSize = 12.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = {
                        val newRole = if (isCarrier) "REQUESTER" else "TRANSPORT_PROVIDER"
                        coroutineScope.launch {
                            LogiSyncRepository.saveProfile(
                                country = currentUser?.country ?: "India",
                                state = currentUser?.state ?: "Maharashtra",
                                city = currentUser?.city ?: "Nagpur",
                                role = newRole,
                                customName = currentUser?.name
                            )
                            LogiSyncRepository.refreshRequests()
                        }
                    },
                    enabled = !isLoading,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isCarrier) EmeraldPrimary else SafetyOrange,
                        contentColor = ObsidianDeep
                    )
                ) {
                    Text(
                        text = if (isCarrier) "Switch to Requester Role" else "Switch to Carrier Role",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Server URL configuration
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "BACKEND SERVER CONFIGURATION",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextMuted,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                OutlinedTextField(
                    value = serverUrl,
                    onValueChange = {
                        serverUrl = it
                        urlSavedMessage = false
                    },
                    label = { Text("Base URL", color = TextMuted, fontSize = 11.sp) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = EmeraldPrimary,
                        unfocusedBorderColor = ObsidianCardBorder,
                        focusedContainerColor = ObsidianSurfaceElevated,
                        unfocusedContainerColor = ObsidianSurfaceElevated
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            ApiClient.updateBaseUrl(serverUrl)
                            urlSavedMessage = true
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary, contentColor = ObsidianDeep)
                    ) {
                        Text("Save URL", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = {
                            serverUrl = "http://10.0.2.2:5050/"
                            ApiClient.updateBaseUrl(serverUrl)
                            urlSavedMessage = true
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary)
                    ) {
                        Text("Default", fontSize = 12.sp)
                    }
                }

                if (urlSavedMessage) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "✓ Server URL updated",
                        color = EmeraldPrimary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Sign out button
            OutlinedButton(
                onClick = {
                    LogiSyncRepository.signOut()
                    onSignOut()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, StatusCancelledText.copy(alpha = 0.5f)),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = StatusCancelledText)
            ) {
                Text(
                    text = "Sign Out",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }
    }
}
