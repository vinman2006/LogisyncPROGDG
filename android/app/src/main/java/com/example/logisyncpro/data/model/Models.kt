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
