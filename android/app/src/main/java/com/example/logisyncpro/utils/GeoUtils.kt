package com.example.logisyncpro.utils

import kotlin.math.*

object GeoUtils {
    private const val EARTH_RADIUS_KM = 6371.0
    private const val EARTH_RADIUS_METERS = 6371000.0

    /**
     * Calculates real distance in kilometers using the Haversine formula.
     */
    fun distanceKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2).pow(2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return EARTH_RADIUS_KM * c
    }

    /**
     * Calculates real distance in meters.
     */
    fun distanceMeters(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2).pow(2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return EARTH_RADIUS_METERS * c
    }

    /**
     * Calculates forward bearing/heading in degrees (0..360).
     */
    fun calculateBearing(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Float {
        val phi1 = Math.toRadians(lat1)
        val phi2 = Math.toRadians(lat2)
        val deltaLambda = Math.toRadians(lon2 - lon1)
        val y = sin(deltaLambda) * cos(phi2)
        val x = cos(phi1) * sin(phi2) - sin(phi1) * cos(phi2) * cos(deltaLambda)
        val theta = atan2(y, x)
        return ((Math.toDegrees(theta) + 360.0) % 360.0).toFloat()
    }

    /**
     * Resolves coordinates for Indian freight terminals and cities.
     */
    fun resolveCityCoordinates(cityName: String): Pair<Double, Double> {
        val cleaned = cityName.trim().lowercase()
        return when {
            cleaned.contains("mumbai") -> Pair(19.0760, 72.8777)
            cleaned.contains("nagpur") -> Pair(21.1458, 79.0882)
            cleaned.contains("pune") -> Pair(18.5204, 73.8567)
            cleaned.contains("delhi") -> Pair(28.6139, 77.2090)
            cleaned.contains("bangalore") || cleaned.contains("bengaluru") -> Pair(12.9716, 77.5946)
            cleaned.contains("hyderabad") -> Pair(17.3850, 78.4867)
            cleaned.contains("chennai") -> Pair(13.0827, 80.2707)
            cleaned.contains("kolkata") -> Pair(22.5726, 88.3639)
            cleaned.contains("ahmedabad") -> Pair(23.0225, 72.5714)
            cleaned.contains("surat") -> Pair(21.1702, 72.8311)
            cleaned.contains("jaipur") -> Pair(26.9124, 75.7873)
            cleaned.contains("lucknow") -> Pair(26.8467, 80.9462)
            cleaned.contains("indore") -> Pair(22.7196, 75.8577)
            cleaned.contains("bhopal") -> Pair(23.2599, 77.4126)
            cleaned.contains("nashik") -> Pair(19.9975, 73.7898)
            cleaned.contains("aurangabad") -> Pair(19.8762, 75.3433)
            else -> Pair(21.1458, 79.0882) // Central India Logistics Default (Nagpur)
        }
    }
}
