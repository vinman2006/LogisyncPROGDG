package com.example.logisyncpro.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.theme.*

@Composable
fun LogiSyncBrandHeader(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(
                    Brush.linearGradient(
                        colors = listOf(EmeraldPrimary, EmeraldDark)
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "L",
                fontWeight = FontWeight.Black,
                fontSize = 20.sp,
                color = ObsidianDeep
            )
        }
        Spacer(modifier = Modifier.width(10.dp))
        Row(verticalAlignment = Alignment.Bottom) {
            Text(
                text = "LogiSync",
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = TextPrimary
            )
            Text(
                text = "PRO",
                fontWeight = FontWeight.Black,
                fontSize = 13.sp,
                color = SafetyOrange,
                modifier = Modifier.padding(start = 2.dp, bottom = 2.dp)
            )
        }
    }
}

@Composable
fun StatusBadge(status: String, modifier: Modifier = Modifier) {
    val (bgColor, textColor, label) = when (status.uppercase()) {
        "PENDING" -> Triple(StatusPendingBg, StatusPendingText, "PENDING")
        "ACCEPTED" -> Triple(StatusAcceptedBg, StatusAcceptedText, "ACCEPTED")
        "PICKUP_CONFIRMED" -> Triple(StatusAcceptedBg, StatusAcceptedText, "PICKUP CONFIRMED")
        "IN_TRANSIT" -> Triple(StatusInTransitBg, StatusInTransitText, "IN TRANSIT")
        "DELIVERED" -> Triple(StatusDeliveredBg, StatusDeliveredText, "DELIVERED")
        "CANCELLED" -> Triple(StatusCancelledBg, StatusCancelledText, "CANCELLED")
        else -> Triple(StatusPendingBg, StatusPendingText, status)
    }

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(100.dp),
        color = bgColor,
        border = BorderStroke(1.dp, textColor.copy(alpha = 0.4f))
    ) {
        Text(
            text = label,
            color = textColor,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    borderColor: Color = ObsidianCardBorder,
    backgroundColor: Color = ObsidianCard,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    if (onClick != null) {
        Surface(
            onClick = onClick,
            modifier = modifier,
            shape = RoundedCornerShape(16.dp),
            color = backgroundColor,
            border = BorderStroke(1.dp, borderColor)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                content = content
            )
        }
    } else {
        Surface(
            modifier = modifier,
            shape = RoundedCornerShape(16.dp),
            color = backgroundColor,
            border = BorderStroke(1.dp, borderColor)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                content = content
            )
        }
    }
}

@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false
) {
    Button(
        onClick = onClick,
        enabled = enabled && !isLoading,
        modifier = modifier
            .fillMaxWidth()
            .height(50.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = EmeraldPrimary,
            contentColor = ObsidianDeep,
            disabledContainerColor = ObsidianCardBorder,
            disabledContentColor = TextMuted
        )
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                color = ObsidianDeep,
                strokeWidth = 2.dp
            )
        } else {
            Text(
                text = text,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
        }
    }
}
