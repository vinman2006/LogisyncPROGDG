package com.example.logisyncpro.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.theme.*

/**
 * 5-Tab Consignment Tracking Bottom Navigation Bar matching reference specification:
 * HOME | TRACK | SHIPMENTS | ALERTS | MORE
 */
enum class BottomNavTab(val title: String, val activeIcon: ImageVector, val inactiveIcon: ImageVector) {
    HOME("Home", Icons.Filled.Home, Icons.Outlined.Home),
    TRACK("Track", Icons.Filled.MyLocation, Icons.Outlined.MyLocation),
    SHIPMENTS("Shipments", Icons.Filled.Inventory2, Icons.Outlined.Inventory2),
    ALERTS("Alerts", Icons.Filled.Notifications, Icons.Outlined.Notifications),
    MORE("More", Icons.Filled.MoreHoriz, Icons.Outlined.MoreHoriz)
}

@Composable
fun LogiSyncBottomNav(
    currentTab: BottomNavTab,
    onTabSelected: (BottomNavTab) -> Unit,
    modifier: Modifier = Modifier,
    secondTabLabel: String = "Track",
    secondTabIcon: ImageVector = Icons.Filled.MyLocation
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding(),
        color = Color(0xFF060E1A),
        border = BorderStroke(1.dp, Color(0xFF1E293B))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp, horizontal = 4.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            BottomNavTab.entries.forEach { tab ->
                val isSelected = tab == currentTab

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onTabSelected(tab) }
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = if (isSelected) tab.activeIcon else tab.inactiveIcon,
                        contentDescription = tab.title,
                        tint = if (isSelected) Color(0xFF38BDF8) else Color(0xFF64748B),
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.height(3.dp))
                    Text(
                        text = tab.title,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color(0xFF38BDF8) else Color(0xFF64748B)
                    )
                }
            }
        }
    }
}
