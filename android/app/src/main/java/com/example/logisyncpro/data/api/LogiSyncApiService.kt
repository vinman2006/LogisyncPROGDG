package com.example.logisyncpro.data.api

import com.example.logisyncpro.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface LogiSyncApiService {

    @GET("api/user/profile")
    suspend fun checkUserProfile(
        @Query("uid") uid: String
    ): Response<ProfileCheckResponse>

    @POST("api/user/profile")
    suspend fun saveUserProfile(
        @Header("x-firebase-uid") uid: String,
        @Body profile: UserProfile
    ): Response<SaveProfileResponse>

    @GET("api/transport-requests")
    suspend fun getTransportRequests(
        @Query("filter") filter: String = "all",
        @Query("uid") uid: String
    ): Response<TransportRequestsResponse>

    @POST("api/transport-requests")
    suspend fun createTransportRequest(
        @Query("uid") uid: String,
        @Body dto: CreateRequestDto
    ): Response<TransportRequestActionResponse>

    @POST("api/transport-requests/{id}/accept")
    suspend fun acceptTransportRequest(
        @Path("id") requestId: Int,
        @Query("uid") uid: String
    ): Response<TransportRequestActionResponse>

    @POST("api/transport-requests/{id}/status")
    suspend fun updateTransportStatus(
        @Path("id") requestId: Int,
        @Query("uid") uid: String,
        @Body dto: UpdateStatusDto
    ): Response<TransportRequestActionResponse>

    @GET("api/transport-requests/{id}/events")
    suspend fun getShipmentEvents(
        @Path("id") requestId: Int,
        @Query("uid") uid: String
    ): Response<ShipmentEventsResponse>

    @GET("api/transport-requests/{id}")
    suspend fun getTransportRequestById(
        @Path("id") requestId: Int,
        @Query("uid") uid: String
    ): Response<TransportRequestActionResponse>
}
