package com.example.logisyncpro.ui.screens

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.ui.components.BottomNavTab
import com.example.logisyncpro.ui.components.LogiSyncBottomNav

/**
 * Screen 10 — Account & Settings
 * Matches reference design:
 * - Header: < Account
 * - Profile card:
 *   - Avatar initials circle: [ VM ]
 *   - Name: Vineet Mandhalkar
 *   - Email: vineet.m@example.com
 *   - Chevron >
 * - Menu list items:
 *   - 📦 My Shipments
 *   - 🔔 Notifications
 *   - 📍 Saved Addresses
 *   - 💳 Payment Methods
 *   - ⚙️ Preferences
 *   - 🎧 Help & Support
 *   - 🚪 Logout (red text)
 */
@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit,
    onSignOut: () -> Unit,
    onNavigateToShipments: () -> Unit = {},
    onNavigateToSupport: () -> Unit = {},
    onTabSelected: (BottomNavTab) -> Unit
) {
    val context = LocalContext.current
    val currentUser by LogiSyncRepository.currentUser.collectAsState()
    val displayName = currentUser?.name?.takeIf { it.isNotBlank() } ?: "Vineet Mandhalkar"
    val email = currentUser?.email?.takeIf { it.isNotBlank() } ?: "vineet.m@example.com"

    val initials = remember(displayName) {
        val parts = displayName.trim().split(" ")
        if (parts.size >= 2) "${parts[0].take(1)}${parts[1].take(1)}".uppercase()
        else displayName.take(2).uppercase()
    }

    var showSimpleDialog by remember { mutableStateOf<String?>(null) }

    Scaffold(
        bottomBar = {
            LogiSyncBottomNav(
                currentTab = BottomNavTab.MORE,
                onTabSelected = onTabSelected
            )
        },
        containerColor = Color(0xFF060E1A)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
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
                    text = "Account",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.size(38.dp))
            }

            Spacer(modifier = Modifier.height(18.dp))

            // User Profile Card
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { showSimpleDialog = "Edit Profile" },
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF0F172A),
                border = BorderStroke(1.dp, Color(0xFF1E293B))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Blue Initials Circle Avatar
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF2563EB)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = initials,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = displayName,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = email,
                            fontSize = 12.sp,
                            color = Color(0xFF94A3B8)
                        )
                    }

                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Edit",
                        tint = Color(0xFF64748B),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Menu Items Card
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF0F172A),
                border = BorderStroke(1.dp, Color(0xFF1E293B))
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    AccountMenuItem(
                        title = "My Shipments",
                        icon = Icons.Filled.Inventory2,
                        onClick = onNavigateToShipments
                    )
                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp)

                    AccountMenuItem(
                        title = "Notifications",
                        icon = Icons.Filled.Notifications,
                        onClick = { showSimpleDialog = "Notifications" }
                    )
                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp)

                    AccountMenuItem(
                        title = "Saved Addresses",
                        icon = Icons.Filled.Place,
                        onClick = { showSimpleDialog = "Saved Addresses" }
                    )
                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp)

                    AccountMenuItem(
                        title = "Payment Methods",
                        icon = Icons.Filled.CreditCard,
                        onClick = { showSimpleDialog = "Payment Methods" }
                    )
                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp)

                    AccountMenuItem(
                        title = "Preferences",
                        icon = Icons.Filled.Settings,
                        onClick = { showSimpleDialog = "Preferences" }
                    )
                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp)

                    AccountMenuItem(
                        title = "Help & Support",
                        icon = Icons.Filled.HeadsetMic,
                        onClick = onNavigateToSupport
                    )
                    HorizontalDivider(color = Color(0xFF1E293B), thickness = 1.dp)

                    // Logout Action Item (Red Accent)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                LogiSyncRepository.signOut()
                                Toast.makeText(context, "Signed out successfully", Toast.LENGTH_SHORT).show()
                                onSignOut()
                            }
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.ExitToApp,
                            contentDescription = "Logout",
                            tint = Color(0xFFEF4444),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(14.dp))
                        Text(
                            text = "Logout",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFEF4444),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        // Action Preference Modals
        if (showSimpleDialog != null) {
            val title = showSimpleDialog!!
            AlertDialog(
                onDismissRequest = { showSimpleDialog = null },
                containerColor = Color(0xFF0F172A),
                title = {
                    Text(title, color = Color.White, fontWeight = FontWeight.Bold)
                },
                text = {
                    Text(
                        text = "Settings and configuration for $title are synced with your cloud profile.",
                        color = Color(0xFF94A3B8),
                        fontSize = 13.sp
                    )
                },
                confirmButton = {
                    TextButton(onClick = { showSimpleDialog = null }) {
                        Text("OK", color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold)
                    }
                }
            )
        }
    }
}

@Composable
private fun AccountMenuItem(
    title: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = title,
            tint = Color(0xFF38BDF8),
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(14.dp))
        Text(
            text = title,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = Color.White,
            modifier = Modifier.weight(1f)
        )
        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = null,
            tint = Color(0xFF64748B),
            modifier = Modifier.size(16.dp)
        )
    }
}
