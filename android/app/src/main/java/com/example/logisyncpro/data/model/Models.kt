package com.example.logisyncpro.data.model

import com.google.gson.annotations.SerializedName

data class UserProfile(
    val id: Int = 0,
    val firebase_uid: String = "",
    val email: String = "",
    val name: String? = null,
    val photo_url: String? = null,
    val country: String? = null,
    val state: String? = null,
    val city: String? = null,
    val role: String? = "REQUESTER",
    val created_at: String? = null,
    val updated_at: String? = null
)

data class TransportRequest(
    val id: Int = 0,
    val tracking_number: String = "",
    val requester_id: Int = 0,
    val provider_id: Int? = null,
    val pickup_location: String = "",
    val delivery_location: String = "",
    val origin_lat: Double = 21.1458,
    val origin_lng: Double = 79.0882,
    val destination_lat: Double = 19.0760,
    val destination_lng: Double = 72.8777,
    val cargo_type: String = "",
    val cargo_description: String? = null,
    val weight: String = "",
    val requested_date: String? = null,
    val notes: String? = null,
    val status: String = "PENDING",
    val created_at: String? = null,
    val updated_at: String? = null,
    val accepted_at: String? = null,
    val delivered_at: String? = null,
    val requester_name: String? = null,
    val requester_email: String? = null,
    val requester_city: String? = null,
    val provider_name: String? = null,
    val provider_email: String? = null,
    val provider_city: String? = null
)

data class VehicleLocation(
    val id: Int = 0,
    val shipment_id: Int = 0,
    val driver_id: Int? = null,
    val vehicle_id: String? = null,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val accuracy: Float? = null,
    val speed: Float? = null,
    val heading: Float? = null,
    val recorded_at: String? = null,
    val created_at: String? = null
)

data class TrackingSession(
    val id: Int = 0,
    val shipment_id: Int = 0,
    val driver_id: Int = 0,
    val started_at: String? = null,
    val ended_at: String? = null,
    val status: String = "ACTIVE"
)

enum class TrackingState {
    LIVE,           // Updated < 30 seconds ago
    LAST_UPDATED,   // Updated 30s to 10 minutes ago
    STALE,          // Updated 10 minutes to 1 hour ago
    OFFLINE,        // Updated > 1 hour ago
    NO_LOCATION     // No location records exist yet
}

data class ShipmentEvent(
    val id: Int = 0,
    val request_id: Int = 0,
    val actor_id: Int = 0,
    val event_type: String = "",
    val description: String = "",
    val created_at: String = "",
    val actor_name: String? = null,
    val actor_role: String? = null
)

data class ProfileCheckResponse(
    val exists: Boolean = false,
    val user: UserProfile? = null
)

data class SaveProfileResponse(
    val success: Boolean = false,
    val user: UserProfile? = null,
    val error: String? = null
)

data class TransportRequestsResponse(
    val success: Boolean = false,
    val requests: List<TransportRequest> = emptyList(),
    val error: String? = null
)

data class TransportRequestActionResponse(
    val success: Boolean = false,
    val request: TransportRequest? = null,
    val error: String? = null
)

data class ShipmentEventsResponse(
    val success: Boolean = false,
    val events: List<ShipmentEvent> = emptyList(),
    val error: String? = null
)

data class CreateRequestDto(
    val pickup_location: String,
    val delivery_location: String,
    val cargo_type: String,
    val cargo_description: String? = null,
    val weight: String,
    val requested_date: String? = null,
    val notes: String? = null
)

data class UpdateStatusDto(
    val status: String,
    val description: String? = null
)


enum class AlertSeverity {
    SUCCESS,
    INFO,
    WARNING,
    CRITICAL
}

data class SmartAlert(
    val id: Int = 0,
    val title: String = "",
    val message: String = "",
    val category: String = "Shipment",
    val severity: AlertSeverity = AlertSeverity.INFO,
    val timeAgo: String = "",
    val shipmentId: Int? = null
)

data class ShipmentInvoice(
    val id: Int = 0,
    val shipmentId: Int = 0,
    val trackingNumber: String = "",
    val shipmentFee: String = "₹1,250",
    val insurance: String = "₹50",
    val taxes: String = "₹225",
    val total: String = "₹1,525",
    val paymentStatus: String = "Paid",
    val paymentDate: String = "Paid on Sep 15, 2025"
)

data class RouteOption(
    val id: Int = 0,
    val title: String = "",
    val duration: String = "",
    val distance: String = "",
    val via: String = "",
    val isRecommended: Boolean = false,
    val delayNotice: String = ""
)

data class TurnByTurnStep(
    val stepNumber: Int = 0,
    val instruction: String = "",
    val distance: String = "",
    val notes: String = ""
)

data class DeliveryProofData(
    val shipmentId: Int = 0,
    val trackingNumber: String = "",
    val deliveredOn: String = "",
    val deliveredTo: String = "",
    val terminalLocation: String = "",
    val isVerified: Boolean = true
)
