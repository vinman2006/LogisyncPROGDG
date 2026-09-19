package com.example.logisyncpro.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp

@Composable
fun WireframeCube(
    modifier: Modifier = Modifier.size(64.dp),
    color: Color = Color(0xFF3B5E52)
) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        val cx = w / 2f
        val cy = h / 2f
        val side = w * 0.42f

        val stroke = Stroke(
            width = 2.5f,
            cap = StrokeCap.Round,
            join = StrokeJoin.Round
        )

        // Isometric cube points
        val top = Offset(cx, cy - side)
        val center = Offset(cx, cy - side * 0.15f)
        val bottom = Offset(cx, cy + side * 0.85f)

        val leftTop = Offset(cx - side * 0.866f, cy - side * 0.5f)
        val leftBottom = Offset(cx - side * 0.866f, cy + side * 0.45f)

        val rightTop = Offset(cx + side * 0.866f, cy - side * 0.5f)
        val rightBottom = Offset(cx + side * 0.866f, cy + side * 0.45f)

        // Top face
        val topFace = Path().apply {
            moveTo(top.x, top.y)
            lineTo(rightTop.x, rightTop.y)
            lineTo(center.x, center.y)
            lineTo(leftTop.x, leftTop.y)
            close()
        }
        drawPath(topFace, color, style = stroke)

        // Left face
        val leftFace = Path().apply {
            moveTo(leftTop.x, leftTop.y)
            lineTo(center.x, center.y)
            lineTo(bottom.x, bottom.y)
            lineTo(leftBottom.x, leftBottom.y)
            close()
        }
        drawPath(leftFace, color, style = stroke)

        // Right face
        val rightFace = Path().apply {
            moveTo(rightTop.x, rightTop.y)
            lineTo(center.x, center.y)
            lineTo(bottom.x, bottom.y)
            lineTo(rightBottom.x, rightBottom.y)
            close()
        }
        drawPath(rightFace, color, style = stroke)
    }
}
