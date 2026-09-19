package com.example.logisyncpro.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.BottomNavTab
import com.example.logisyncpro.ui.components.LogiSyncBottomNav
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateShipmentScreen(
    onNavigateBack: () -> Unit,
    onTabSelected: (BottomNavTab) -> Unit = {}
) {
    val coroutineScope = rememberCoroutineScope()
    val isLoading by LogiSyncRepository.isLoading.collectAsState()

    var pickupLocation by remember { mutableStateOf("") }
    var deliveryLocation by remember { mutableStateOf("") }
    var cargoType by remember { mutableStateOf("") }
    var weight by remember { mutableStateOf("") }
    var requestedDate by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    var cargoDropdownExpanded by remember { mutableStateOf(false) }
    var submitError by remember { mutableStateOf<String?>(null) }

    val cargoOptions = listOf("Industrial Equipment", "Electronics", "Pharmaceuticals", "Agricultural Produce", "Auto Parts", "General Freight")

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF071411))
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 14.dp),
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

                Spacer(modifier = Modifier.width(8.dp))

                Text(
                    text = "Create Transport Request",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        },
        bottomBar = {
            LogiSyncBottomNav(
                currentTab = BottomNavTab.HOME,
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
            Spacer(modifier = Modifier.height(10.dp))

            Text(text = "Pickup Location", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color(0xFF7A9E91))
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = pickupLocation,
                onValueChange = { pickupLocation = it },
                placeholder = { Text("Enter pickup location", color = Color(0xFF4C6E61), fontSize = 14.sp) },
                leadingIcon = { Icon(Icons.Default.Place, contentDescription = null, tint = EmeraldPrimary, modifier = Modifier.size(18.dp)) },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = EmeraldPrimary,
                    unfocusedBorderColor = Color(0xFF14352B),
                    focusedContainerColor = Color(0xFF0C221B),
                    unfocusedContainerColor = Color(0xFF0C221B),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                shape = RoundedCornerShape(10.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text(text = "Destination", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color(0xFF7A9E91))
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = deliveryLocation,
                onValueChange = { deliveryLocation = it },
                placeholder = { Text("Enter destination", color = Color(0xFF4C6E61), fontSize = 14.sp) },
                leadingIcon = { Icon(Icons.Default.Place, contentDescription = null, tint = SafetyOrange, modifier = Modifier.size(18.dp)) },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = EmeraldPrimary,
                    unfocusedBorderColor = Color(0xFF14352B),
                    focusedContainerColor = Color(0xFF0C221B),
                    unfocusedContainerColor = Color(0xFF0C221B),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                shape = RoundedCornerShape(10.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text(text = "Cargo Type", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color(0xFF7A9E91))
            Spacer(modifier = Modifier.height(6.dp))
            Box {
                OutlinedTextField(
                    value = cargoType,
                    onValueChange = {},
                    readOnly = true,
                    placeholder = { Text("Select cargo type", color = Color(0xFF4C6E61), fontSize = 14.sp) },
                    leadingIcon = { Icon(Icons.Default.Inventory2, contentDescription = null, tint = EmeraldPrimary, modifier = Modifier.size(18.dp)) },
                    trailingIcon = {
                        IconButton(onClick = { cargoDropdownExpanded = true }) {
                            Icon(Icons.Default.KeyboardArrowDown, contentDescription = null, tint = Color(0xFF7A9E91))
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { cargoDropdownExpanded = true },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = EmeraldPrimary,
                        unfocusedBorderColor = Color(0xFF14352B),
                        focusedContainerColor = Color(0xFF0C221B),
                        unfocusedContainerColor = Color(0xFF0C221B),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    ),
                    shape = RoundedCornerShape(10.dp)
                )

                DropdownMenu(
                    expanded = cargoDropdownExpanded,
                    onDismissRequest = { cargoDropdownExpanded = false },
                    modifier = Modifier.background(Color(0xFF0C221B))
                ) {
                    cargoOptions.forEach { opt ->
                        DropdownMenuItem(
                            text = { Text(opt, color = Color.White) },
                            onClick = {
                                cargoType = opt
                                cargoDropdownExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(text = "Weight (kg)", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color(0xFF7A9E91))
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = weight,
                onValueChange = { weight = it },
                placeholder = { Text("Enter weight", color = Color(0xFF4C6E61), fontSize = 14.sp) },
                leadingIcon = { Icon(Icons.Default.FitnessCenter, contentDescription = null, tint = EmeraldPrimary, modifier = Modifier.size(18.dp)) },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = EmeraldPrimary,
                    unfocusedBorderColor = Color(0xFF14352B),
                    focusedContainerColor = Color(0xFF0C221B),
                    unfocusedContainerColor = Color(0xFF0C221B),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                shape = RoundedCornerShape(10.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text(text = "Requested Date", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color(0xFF7A9E91))
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = requestedDate,
                onValueChange = { requestedDate = it },
                placeholder = { Text("Select date", color = Color(0xFF4C6E61), fontSize = 14.sp) },
                leadingIcon = { Icon(Icons.Default.CalendarToday, contentDescription = null, tint = EmeraldPrimary, modifier = Modifier.size(18.dp)) },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = EmeraldPrimary,
                    unfocusedBorderColor = Color(0xFF14352B),
                    focusedContainerColor = Color(0xFF0C221B),
                    unfocusedContainerColor = Color(0xFF0C221B),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                shape = RoundedCornerShape(10.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text(text = "Additional Notes (Optional)", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color(0xFF7A9E91))
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                placeholder = { Text("Any special handling instructions...", color = Color(0xFF4C6E61), fontSize = 14.sp) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = EmeraldPrimary,
                    unfocusedBorderColor = Color(0xFF14352B),
                    focusedContainerColor = Color(0xFF0C221B),
                    unfocusedContainerColor = Color(0xFF0C221B),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                shape = RoundedCornerShape(10.dp)
            )

            Spacer(modifier = Modifier.height(20.dp))

            submitError?.let {
                Text(text = it, color = StatusCancelledText, fontSize = 12.sp, modifier = Modifier.padding(bottom = 8.dp))
            }

            Button(
                onClick = {
                    if (pickupLocation.isBlank() || deliveryLocation.isBlank()) {
                        submitError = "Please enter pickup and destination locations."
                        return@Button
                    }
                    coroutineScope.launch {
                        submitError = null
                        val success = LogiSyncRepository.createRequest(
                            pickup = pickupLocation,
                            delivery = deliveryLocation,
                            cargoType = cargoType.ifBlank { "General Freight" },
                            weight = weight.ifBlank { "500 kg" },
                            notes = notes
                        )
                        if (success) {
                            onNavigateBack()
                        } else {
                            submitError = "Failed to create shipment. Please check database connection."
                        }
                    }
                },
                enabled = !isLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
            ) {
                Text(
                    text = if (isLoading) "Submitting..." else "Submit Request",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = ObsidianDeep
                )
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
