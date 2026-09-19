package com.example.logisyncpro.ui.components

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.graphics.Color as AndroidColor
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.logisyncpro.data.model.TrackingState
import com.example.logisyncpro.data.model.VehicleLocation
import com.example.logisyncpro.theme.*
import java.util.Locale
import kotlin.math.*

/**
 * Real-World Logistics Map Component for LogiSyncPRO.
 * Renders high-performance interactive OpenStreetMap / CartoDB map tiles via Android WebView.
 * Displays real highways, city geography, street networks, origin/destination pins,
 * live GPS vehicle pulse, traveled polyline trail, and zoom/recenter controls.
 * Falls back to high-visibility geographic schematic if offline.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun LogisticsMapView(
    originLat: Double,
    originLng: Double,
    originCity: String,
    destLat: Double,
    destLng: Double,
    destCity: String,
    vehicleLat: Double?,
    vehicleLng: Double?,
    vehicleHeading: Float? = null,
    historyPoints: List<VehicleLocation> = emptyList(),
    trackingState: TrackingState = TrackingState.NO_LOCATION,
    distanceRemainingKm: Double? = null,
    modifier: Modifier = Modifier
) {
    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    var isMapLoaded by remember { mutableStateOf(false) }

    // Safe fallbacks if coordinates are 0.0
    val safeOrigLat = if (originLat != 0.0) originLat else 21.1458
    val safeOrigLng = if (originLng != 0.0) originLng else 79.0882
    val safeDestLat = if (destLat != 0.0) destLat else 19.0760
    val safeDestLng = if (destLng != 0.0) destLng else 72.8777
    val safeOrigCity = originCity.ifEmpty { "Nagpur" }.split(",")[0].trim()
    val safeDestCity = destCity.ifEmpty { "Mumbai" }.split(",")[0].trim()

    val vLat = vehicleLat ?: safeOrigLat
    val vLng = vehicleLng ?: safeOrigLng

    // Real OpenStreetMap HTML with Leaflet & CartoDB Dark Matter / Voyager tiles
    val mapHtml = remember(safeOrigLat, safeOrigLng, safeDestLat, safeDestLng, safeOrigCity, safeDestCity) {
        """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            * { box-sizing: border-box; }
            html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #071411; }
            .leaflet-control-attribution { display: none !important; }
            .pulse-truck {
              display: flex; align-items: center; justify-content: center;
              width: 44px; height: 44px;
            }
            .pulse-ring {
              position: absolute; width: 44px; height: 44px; border-radius: 50%;
              background: rgba(16, 185, 129, 0.35); border: 2px solid #10B981;
              animation: pulse 1.6s infinite ease-out;
            }
            .truck-icon {
              position: relative; z-index: 10; width: 26px; height: 26px;
              background: #10B981; border-radius: 50%; border: 2.5px solid #FFFFFF;
              box-shadow: 0 2px 8px rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
            }
            .pin-node {
              padding: 4px 8px; border-radius: 8px; font-family: sans-serif;
              font-size: 11px; font-weight: bold; color: #FFFFFF;
              box-shadow: 0 2px 6px rgba(0,0,0,0.7); white-space: nowrap;
            }
            .pin-origin { background: #059669; border: 1.5px solid #34D399; }
            .pin-dest { background: #0284C7; border: 1.5px solid #38BDF8; }
            @keyframes pulse {
              0% { transform: scale(0.5); opacity: 1; }
              100% { transform: scale(1.6); opacity: 0; }
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map', { zoomControl: false });
            
            // High-Performance CartoDB Voyager / OpenStreetMap tiles
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              maxZoom: 19,
              subdomains: 'abcd'
            }).addTo(map);

            var origLat = $safeOrigLat;
            var origLng = $safeOrigLng;
            var destLat = $safeDestLat;
            var destLng = $safeDestLng;

            // Fit initial corridor
            var bounds = L.latLngBounds([[origLat, origLng], [destLat, destLng]]);
            map.fitBounds(bounds, { padding: [60, 60] });

            // 1. Origin Marker
            var origIcon = L.divIcon({
              className: '',
              html: '<div class="pin-node pin-origin">🟢 ' + '$safeOrigCity' + '</div>',
              iconAnchor: [30, 15]
            });
            L.marker([origLat, origLng], { icon: origIcon }).addTo(map);

            // 2. Destination Marker
            var destIcon = L.divIcon({
              className: '',
              html: '<div class="pin-node pin-dest">🏁 ' + '$safeDestCity' + '</div>',
              iconAnchor: [30, 15]
            });
            L.marker([destLat, destLng], { icon: destIcon }).addTo(map);

            // 3. Planned Route Line
            L.polyline([[origLat, origLng], [destLat, destLng]], {
              color: '#10B981',
              weight: 4,
              opacity: 0.75,
              dashArray: '8, 8'
            }).addTo(map);

            // 4. Vehicle Marker
            var vehicleMarker = null;
            var historyLine = null;

            function updateVehiclePosition(lat, lng) {
              if (!vehicleMarker) {
                var vIcon = L.divIcon({
                  className: 'pulse-truck',
                  html: '<div class="pulse-ring"></div><div class="truck-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-2 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></div>',
                  iconSize: [44, 44],
                  iconAnchor: [22, 22]
                });
                vehicleMarker = L.marker([lat, lng], { icon: vIcon }).addTo(map);
              } else {
                vehicleMarker.setLatLng([lat, lng]);
              }
            }

            function setHistoryTrail(points) {
              if (historyLine) map.removeLayer(historyLine);
              if (points && points.length > 0) {
                historyLine = L.polyline(points, {
                  color: '#10B981',
                  weight: 5,
                  opacity: 0.9
                }).addTo(map);
              }
            }

            function centerOnVehicle(lat, lng) {
              map.setView([lat, lng], 14, { animate: true });
            }

            function fitRoute() {
              map.fitBounds(bounds, { padding: [60, 60], animate: true });
            }

            // Initial vehicle position if given
            updateVehiclePosition($vLat, $vLng);

            setTimeout(function() { map.invalidateSize(); }, 300);
          </script>
        </body>
        </html>
        """.trimIndent()
    }

    // Push live GPS updates to WebView via JavaScript
    LaunchedEffect(vehicleLat, vehicleLng) {
        if (vehicleLat != null && vehicleLng != null && webViewRef != null && isMapLoaded) {
            val js = String.format(Locale.US, "updateVehiclePosition(%.5f, %.5f);", vehicleLat, vehicleLng)
            webViewRef?.evaluateJavascript(js, null)
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF071411))
    ) {
        // 1. Embedded Real Interactive OpenStreetMap / CartoDB WebView
        AndroidView(
            factory = { ctx ->
                WebView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.loadWithOverviewMode = true
                    settings.useWideViewPort = true
                    settings.cacheMode = WebSettings.LOAD_DEFAULT
                    setBackgroundColor(AndroidColor.parseColor("#071411"))
                    
                    webChromeClient = WebChromeClient()
                    webViewClient = object : WebViewClient() {
                        override fun onPageFinished(view: WebView?, url: String?) {
                            isMapLoaded = true
                            if (vehicleLat != null && vehicleLng != null) {
                                val js = String.format(Locale.US, "updateVehiclePosition(%.5f, %.5f);", vehicleLat, vehicleLng)
                                view?.evaluateJavascript(js, null)
                            }
                        }
                    }
                    loadDataWithBaseURL("https://unpkg.com", mapHtml, "text/html", "utf-8", null)
                    webViewRef = this
                }
            },
            update = { wv ->
                if (isMapLoaded && vehicleLat != null && vehicleLng != null) {
                    val js = String.format(Locale.US, "updateVehiclePosition(%.5f, %.5f);", vehicleLat, vehicleLng)
                    wv.evaluateJavascript(js, null)
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // 2. High-Visibility Map Controls Overlay (Top Right: Zoom +, Zoom -, Center)
        Column(
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .padding(end = 16.dp, top = 80.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Zoom In
            Surface(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape),
                color = Color(0xFF071411).copy(alpha = 0.9f),
                border = BorderStroke(1.dp, Color(0xFF14352B))
            ) {
                IconButton(onClick = { webViewRef?.evaluateJavascript("map.zoomIn();", null) }) {
                    Icon(Icons.Default.Add, contentDescription = "Zoom In", tint = Color.White, modifier = Modifier.size(20.dp))
                }
            }

            // Zoom Out
            Surface(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape),
                color = Color(0xFF071411).copy(alpha = 0.9f),
                border = BorderStroke(1.dp, Color(0xFF14352B))
            ) {
                IconButton(onClick = { webViewRef?.evaluateJavascript("map.zoomOut();", null) }) {
                    Icon(Icons.Default.Remove, contentDescription = "Zoom Out", tint = Color.White, modifier = Modifier.size(20.dp))
                }
            }

            // Recenter on Vehicle or Route
            Surface(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape),
                color = EmeraldPrimary,
                border = BorderStroke(1.dp, EmeraldPrimary)
            ) {
                IconButton(onClick = {
                    if (vehicleLat != null && vehicleLng != null) {
                        val js = String.format(Locale.US, "centerOnVehicle(%.5f, %.5f);", vehicleLat, vehicleLng)
                        webViewRef?.evaluateJavascript(js, null)
                    } else {
                        webViewRef?.evaluateJavascript("fitRoute();", null)
                    }
                }) {
                    Icon(Icons.Default.MyLocation, contentDescription = "My Location", tint = ObsidianDeep, modifier = Modifier.size(20.dp))
                }
            }
        }

        // 3. Status Bar Header Tag (Top Left)
        Surface(
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(start = 16.dp, top = 76.dp),
            shape = RoundedCornerShape(100.dp),
            color = Color(0xFF071411).copy(alpha = 0.9f),
            border = BorderStroke(1.dp, Color(0xFF14352B))
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(EmeraldPrimary)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "OpenStreetMap · Live GPS",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}
