package com.example.logisyncpro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.GlassCard
import com.example.logisyncpro.ui.components.LogiSyncBrandHeader
import com.example.logisyncpro.ui.components.PrimaryButton
import kotlinx.coroutines.launch

@Composable
fun OnboardingScreen(
    onNavigateToDashboard: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val initialDisplayName by LogiSyncRepository.userDisplayName.collectAsState()
    val userEmail by LogiSyncRepository.userEmail.collectAsState()
    val isLoading by LogiSyncRepository.isLoading.collectAsState()
    val errorMessage by LogiSyncRepository.errorMessage.collectAsState()

    var displayName by remember(initialDisplayName) { mutableStateOf(initialDisplayName ?: "") }
    var country by remember { mutableStateOf("India") }
    var state by remember { mutableStateOf("Maharashtra") }
    var city by remember { mutableStateOf("Nagpur") }
    var selectedRole by remember { mutableStateOf("REQUESTER") } // "REQUESTER" or "TRANSPORT_PROVIDER"

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
                .padding(vertical = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            LogiSyncBrandHeader()

            Spacer(modifier = Modifier.height(24.dp))

            Surface(
                shape = RoundedCornerShape(100.dp),
                color = ObsidianSurfaceElevated,
                border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldPrimary.copy(alpha = 0.3f))
            ) {
                Text(
                    text = "STEP 01/02 • PROFILE & ROLE SETUP",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = EmeraldPrimary,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Welcome to LogiSyncPRO",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Configure your logistics identity and operational operational role to sync with the Neon PostgreSQL network.",
                fontSize = 12.sp,
                color = TextMuted,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "PERSONAL DETAILS",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextMuted,
                    modifier = Modifier.padding(bottom = 10.dp)
                )

                OutlinedTextField(
                    value = displayName,
                    onValueChange = { displayName = it },
                    label = { Text("Display Name", color = TextMuted, fontSize = 12.sp) },
                    placeholder = { Text("Enter your full name", color = TextMuted.copy(alpha = 0.5f), fontSize = 12.sp) },
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
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "Authenticated Email: ${userEmail ?: "Authenticating..."}",
                    fontSize = 11.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = "DISPATCH HUB / LOCATION",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextMuted,
                    modifier = Modifier.padding(bottom = 10.dp)
                )

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = country,
                        onValueChange = { country = it },
                        label = { Text("Country", color = TextMuted, fontSize = 11.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = EmeraldPrimary,
                            unfocusedBorderColor = ObsidianCardBorder,
                            focusedContainerColor = ObsidianSurfaceElevated,
                            unfocusedContainerColor = ObsidianSurfaceElevated
                        ),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    OutlinedTextField(
                        value = state,
                        onValueChange = { state = it },
                        label = { Text("State", color = TextMuted, fontSize = 11.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = EmeraldPrimary,
                            unfocusedBorderColor = ObsidianCardBorder,
                            focusedContainerColor = ObsidianSurfaceElevated,
                            unfocusedContainerColor = ObsidianSurfaceElevated
                        ),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it },
                    label = { Text("City / Terminal", color = TextMuted, fontSize = 11.sp) },
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
                    shape = RoundedCornerShape(12.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "CHOOSE YOUR LOGISTICS ROLE",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextMuted,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp)
            )

            // Role Option 1: REQUESTER
            val isRequesterSelected = selectedRole == "REQUESTER"
            GlassCard(
                modifier = Modifier.fillMaxWidth(),
                borderColor = if (isRequesterSelected) EmeraldPrimary else ObsidianCardBorder,
                backgroundColor = if (isRequesterSelected) ObsidianSurfaceElevated else ObsidianCard,
                onClick = { selectedRole = "REQUESTER" }
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(EmeraldPrimary.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Business,
                            contentDescription = null,
                            tint = EmeraldPrimary,
                            modifier = Modifier.size(22.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Requester / Shipper",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = "Create transport requests, publish loads, and track dispatches.",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }

                    if (isRequesterSelected) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(EmeraldPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = null,
                                tint = ObsidianDeep,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Role Option 2: TRANSPORT_PROVIDER
            val isCarrierSelected = selectedRole == "TRANSPORT_PROVIDER"
            GlassCard(
                modifier = Modifier.fillMaxWidth(),
                borderColor = if (isCarrierSelected) SafetyOrange else ObsidianCardBorder,
                backgroundColor = if (isCarrierSelected) ObsidianSurfaceElevated else ObsidianCard,
                onClick = { selectedRole = "TRANSPORT_PROVIDER" }
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(SafetyOrange.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalShipping,
                            contentDescription = null,
                            tint = SafetyOrange,
                            modifier = Modifier.size(22.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Transport Provider / Carrier",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = "Accept available freight, confirm cargo pickup, and complete deliveries.",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }

                    if (isCarrierSelected) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(SafetyOrange),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = null,
                                tint = ObsidianDeep,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            PrimaryButton(
                text = "Launch Command Center",
                isLoading = isLoading,
                onClick = {
                    val finalName = displayName.trim().ifEmpty { initialDisplayName?.trim() ?: "" }
                    if (finalName.isEmpty()) {
                        return@PrimaryButton
                    }
                    coroutineScope.launch {
                        val success = LogiSyncRepository.saveProfile(
                            country = country,
                            state = state,
                            city = city,
                            role = selectedRole,
                            customName = finalName
                        )
                        if (success) {
                            onNavigateToDashboard()
                        }
                    }
                }
            )

            if (errorMessage != null) {
                Spacer(modifier = Modifier.height(14.dp))
                Text(
                    text = errorMessage ?: "",
                    color = StatusCancelledText,
                    fontSize = 12.sp,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}
