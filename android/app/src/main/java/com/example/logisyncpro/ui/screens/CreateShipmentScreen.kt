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
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.GlassCard
import com.example.logisyncpro.ui.components.PrimaryButton
import kotlinx.coroutines.launch

@Composable
fun CreateShipmentScreen(
    onNavigateBack: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val isLoading by LogiSyncRepository.isLoading.collectAsState()
    val errorMessage by LogiSyncRepository.errorMessage.collectAsState()

    var pickupLocation by remember { mutableStateOf("Nagpur, Maharashtra") }
    var deliveryLocation by remember { mutableStateOf("Mumbai, Maharashtra") }
    var cargoType by remember { mutableStateOf("Industrial Equipment") }
    var weight by remember { mutableStateOf("12,500 kg") }
    var notes by remember { mutableStateOf("Fragile electronic sensors. Keep upright and climate-controlled.") }

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
            // Header Bar
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
                    text = "New Transport Request",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "FREIGHT ROUTE DETAILS",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextMuted,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                OutlinedTextField(
                    value = pickupLocation,
                    onValueChange = { pickupLocation = it },
                    label = { Text("Pickup Origin Location", color = TextMuted, fontSize = 12.sp) },
                    placeholder = { Text("e.g. Nagpur Terminal Hub", color = TextMuted.copy(alpha = 0.5f), fontSize = 12.sp) },
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

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = deliveryLocation,
                    onValueChange = { deliveryLocation = it },
                    label = { Text("Delivery Destination Location", color = TextMuted, fontSize = 12.sp) },
                    placeholder = { Text("e.g. Mumbai Port Warehouse", color = TextMuted.copy(alpha = 0.5f), fontSize = 12.sp) },
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

            Spacer(modifier = Modifier.height(16.dp))

            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "CARGO SPECIFICATIONS",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextMuted,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                OutlinedTextField(
                    value = cargoType,
                    onValueChange = { cargoType = it },
                    label = { Text("Cargo Type", color = TextMuted, fontSize = 12.sp) },
                    placeholder = { Text("e.g. Electronics, Steel, FMCG", color = TextMuted.copy(alpha = 0.5f), fontSize = 12.sp) },
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

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = weight,
                    onValueChange = { weight = it },
                    label = { Text("Payload Weight", color = TextMuted, fontSize = 12.sp) },
                    placeholder = { Text("e.g. 18,000 kg", color = TextMuted.copy(alpha = 0.5f), fontSize = 12.sp) },
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

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Handling Notes / Instructions", color = TextMuted, fontSize = 12.sp) },
                    placeholder = { Text("Specific transport conditions", color = TextMuted.copy(alpha = 0.5f), fontSize = 12.sp) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = EmeraldPrimary,
                        unfocusedBorderColor = ObsidianCardBorder,
                        focusedContainerColor = ObsidianSurfaceElevated,
                        unfocusedContainerColor = ObsidianSurfaceElevated
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 5,
                    shape = RoundedCornerShape(12.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            PrimaryButton(
                text = "Publish to Freight Marketplace",
                isLoading = isLoading,
                onClick = {
                    if (pickupLocation.isNotBlank() && deliveryLocation.isNotBlank() && cargoType.isNotBlank()) {
                        coroutineScope.launch {
                            val success = LogiSyncRepository.createRequest(
                                pickup = pickupLocation.trim(),
                                delivery = deliveryLocation.trim(),
                                cargoType = cargoType.trim(),
                                weight = weight.trim().ifEmpty { "N/A" },
                                notes = notes.trim()
                            )
                            if (success) {
                                onNavigateBack()
                            }
                        }
                    }
                }
            )

            if (errorMessage != null) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = errorMessage ?: "",
                    color = StatusCancelledText,
                    fontSize = 12.sp
                )
            }
        }
    }
}
