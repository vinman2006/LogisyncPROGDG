package com.example.logisyncpro.ui.screens

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.datasource.DemoDataSource
import com.example.logisyncpro.data.repository.LogiSyncRepository

data class ChatMessage(
    val isUser: Boolean,
    val text: String,
    val time: String = "Just now"
)

/**
 * Screen 9 — Support & Help
 * Matches reference design:
 * - Header: < Help & Support
 * - AI Assistant Header Card:
 *   "Hi! I'm your LogiSync Assistant. How can I help you today?"
 * - Quick prompt chips:
 *   - Where is my shipment?
 *   - Why is my shipment delayed?
 *   - Change delivery address
 *   - Report an issue
 *   - Talk to a human agent
 * - Interactive conversation using real shipment context
 * - Bottom input bar: Type your message... + Send button
 */
@Composable
fun SupportHelpScreen(
    shipmentId: Int? = null,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val requests by LogiSyncRepository.requests.collectAsState()
    val activeShipment = remember(shipmentId, requests) {
        requests.find { it.id == shipmentId }
            ?: requests.find { it.tracking_number == "LS-782341" }
            ?: DemoDataSource.getShipmentById(shipmentId ?: 3)
            ?: DemoDataSource.demoShipments.first()
    }

    var messageText by remember { mutableStateOf("") }
    val messages = remember {
        mutableStateListOf(
            ChatMessage(
                isUser = false,
                text = "Hi! I'm your LogiSync Assistant. How can I help you today?"
            )
        )
    }

    val quickQuestions = listOf(
        "Where is my shipment?",
        "Why is my shipment delayed?",
        "Change delivery address",
        "Report an issue",
        "Talk to a human agent"
    )

    fun handleSend(query: String) {
        if (query.isBlank()) return
        messages.add(ChatMessage(isUser = true, text = query))

        val q = query.lowercase()
        val s = activeShipment
        val orig = s.pickup_location.split(",")[0].trim()
        val dest = s.delivery_location.split(",")[0].trim()

        val response = when {
            q.contains("where") ->
                "Shipment ${s.tracking_number} ($orig to $dest) is currently ${s.status}. Real-time GPS telemetry shows the vehicle actively en route with ETA ${s.requested_date ?: "Today, 4:30 PM"}."
            q.contains("delay") || q.contains("why") ->
                "I checked the telemetry logs for ${s.tracking_number}. A minor delay notice was recorded due to heavy freight traffic near the highway corridor. Current revised arrival remains on schedule for 4:30 PM."
            q.contains("address") ->
                "To modify the delivery destination for ${s.tracking_number}, please verify your registered shipper OTP or contact the dispatch coordinator."
            q.contains("issue") || q.contains("report") ->
                "Ticket #SUP-8821 has been registered for consignment ${s.tracking_number}. Our 24/7 logistics hub team will inspect and notify you within 15 minutes."
            q.contains("agent") || q.contains("human") ->
                "Connecting you with LogiSync Dedicated Logistics Support (+91 1800-LOGISYNC). Tap below to initiate an express call."
            else ->
                "I found consignment ${s.tracking_number} assigned to driver Vineet Mandhalkar. Status: ${s.status}. Feel free to ask about location, timeline, or documents."
        }

        messages.add(ChatMessage(isUser = false, text = response))
        messageText = ""
    }

    Scaffold(
        containerColor = Color(0xFF060E1A)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Top Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
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
                    text = "Help & Support",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                IconButton(
                    onClick = {
                        val callIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:180056447962"))
                        context.startActivity(callIntent)
                    },
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF0F172A))
                ) {
                    Icon(
                        imageVector = Icons.Filled.Phone,
                        contentDescription = "Call",
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // Chat Messages Stream
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    // Assistant Greeting Header Card
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
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
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF2563EB)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.SmartToy,
                                    contentDescription = "AI Assistant",
                                    tint = Color.White,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column {
                                Text(
                                    text = "LogiSync Assistant",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = "Online • Telemetry-linked",
                                    fontSize = 11.sp,
                                    color = Color(0xFF10B981)
                                )
                            }
                        }
                    }
                }

                // Quick Prompt Suggestion Chips
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        quickQuestions.forEach { question ->
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color(0xFF0F172A))
                                    .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp))
                                    .clickable { handleSend(question) }
                                    .padding(horizontal = 16.dp, vertical = 12.dp)
                            ) {
                                Text(
                                    text = question,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF94A3B8)
                                )
                            }
                        }
                    }
                }

                items(messages) { msg ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (msg.isUser) Arrangement.End else Arrangement.Start
                    ) {
                        Surface(
                            modifier = Modifier.widthIn(max = 280.dp),
                            shape = RoundedCornerShape(14.dp),
                            color = if (msg.isUser) Color(0xFF2563EB) else Color(0xFF1E293B),
                            border = if (!msg.isUser) BorderStroke(1.dp, Color(0xFF334155)) else null
                        ) {
                            Text(
                                text = msg.text,
                                fontSize = 13.sp,
                                color = Color.White,
                                modifier = Modifier.padding(12.dp),
                                lineHeight = 18.sp
                            )
                        }
                    }
                }
            }

            // Bottom Input Bar
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .imePadding(),
                color = Color(0xFF0F172A),
                border = BorderStroke(1.dp, Color(0xFF1E293B))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextField(
                        value = messageText,
                        onValueChange = { messageText = it },
                        placeholder = {
                            Text("Type your message...", color = Color(0xFF64748B), fontSize = 13.sp)
                        },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            disabledContainerColor = Color.Transparent,
                            cursorColor = Color(0xFF38BDF8),
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )

                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF2563EB))
                            .clickable { handleSend(messageText) },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Send,
                            contentDescription = "Send",
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}
