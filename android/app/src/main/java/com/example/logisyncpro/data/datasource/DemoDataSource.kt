package com.example.logisyncpro.data.datasource

import com.example.logisyncpro.data.model.*

/**
 * Isolated Demo Data Source for LogiSync Consignment Tracking.
 * Complies with Requirement #14: Kept cleanly separated from production repositories.
 * Supplies robust offline and preview fallback data matching the reference designs.
 */
object DemoDataSource {

    val demoShipments: List<TransportRequest> = listOf(
        TransportRequest(
            id = 3,
            tracking_number = "LS-782341",
            requester_id = 1,
            provider_id = 2,
            pickup_location = "Nagpur, Maharashtra",
            delivery_location = "Mumbai, Maharashtra",
            origin_lat = 21.1458,
            origin_lng = 79.0882,
            destination_lat = 19.0760,
            destination_lng = 72.8777,
            cargo_type = "Electronics (3)",
            cargo_description = "Order #ORD-44521 - Consumer electronics & telemetry units",
            weight = "12.5 kg",
            requested_date = "Today, 4:30 PM",
            notes = "Order ID: #ORD-44521. Recipient: Rohit Deshmukh. Priority express handling.",
            status = "IN_TRANSIT",
            created_at = "Sep 15, 2025, 09:12 AM",
            updated_at = "Today, 12:45 PM",
            requester_name = "Rohit Deshmukh",
            requester_email = "rohit.deshmukh@example.com",
            provider_name = "Vineet Mandhalkar",
            provider_email = "vineet.m@example.com"
        ),
        TransportRequest(
            id = 4,
            tracking_number = "LS-782340",
            requester_id = 1,
            provider_id = 2,
            pickup_location = "Delhi",
            delivery_location = "Nagpur, Maharashtra",
            origin_lat = 28.6139,
            origin_lng = 77.2090,
            destination_lat = 21.1458,
            destination_lng = 79.0882,
            cargo_type = "Automotive Parts",
            cargo_description = "Precision motor valves & gasket assemblies",
            weight = "45.0 kg",
            requested_date = "Sep 15, 2025, 3:42 PM",
            notes = "Delivered to Amit Kulkarni",
            status = "DELIVERED",
            delivered_at = "Sep 15, 2025, 3:42 PM",
            created_at = "Sep 12, 2025, 10:00 AM",
            updated_at = "Sep 15, 2025, 3:42 PM",
            requester_name = "Amit Kulkarni",
            requester_email = "amit.kulkarni@example.com",
            provider_name = "Vineet Mandhalkar"
        ),
        TransportRequest(
            id = 5,
            tracking_number = "LS-782339",
            requester_id = 1,
            provider_id = 2,
            pickup_location = "Pune, Maharashtra",
            delivery_location = "Bengaluru, Karnataka",
            origin_lat = 18.5204,
            origin_lng = 73.8567,
            destination_lat = 12.9716,
            destination_lng = 77.5946,
            cargo_type = "Pharmaceuticals",
            cargo_description = "Temperature-controlled medicine consignments",
            weight = "8.2 kg",
            requested_date = "Tomorrow",
            notes = "Keep cold chain intact (2-8°C).",
            status = "IN_TRANSIT",
            created_at = "Sep 16, 2025, 06:00 AM",
            updated_at = "Today, 08:30 AM",
            requester_name = "Pooja Sharma",
            provider_name = "Vineet Mandhalkar"
        ),
        TransportRequest(
            id = 6,
            tracking_number = "LS-782338",
            requester_id = 1,
            provider_id = null,
            pickup_location = "Ahmedabad, Gujarat",
            delivery_location = "Delhi",
            origin_lat = 23.0225,
            origin_lng = 72.5714,
            destination_lat = 28.6139,
            destination_lng = 77.2090,
            cargo_type = "Textiles",
            cargo_description = "Cotton fabric industrial rolls",
            weight = "60.0 kg",
            requested_date = "Pickup Scheduled",
            notes = "Warehouse loading bay 3.",
            status = "PENDING",
            created_at = "Today, 10:15 AM",
            updated_at = "Today, 10:15 AM",
            requester_name = "Kunal Patel"
        )
    )

    fun getShipmentById(id: Int): TransportRequest? {
        return demoShipments.find { it.id == id } ?: demoShipments.firstOrNull()
    }

    fun getShipmentByTrackingNumber(trackingNo: String): TransportRequest? {
        val query = trackingNo.trim().lowercase()
        return demoShipments.find {
            it.tracking_number.lowercase().contains(query) ||
            it.id.toString() == query ||
            it.cargo_type.lowercase().contains(query)
        } ?: demoShipments.firstOrNull()
    }

    val demoEvents: List<ShipmentEvent> = listOf(
        ShipmentEvent(
            id = 101,
            request_id = 3,
            actor_id = 1,
            event_type = "ORDER_PLACED",
            description = "Order Placed",
            created_at = "Sep 15, 09:12 AM • Nagpur",
            actor_name = "Nagpur Central Desk"
        ),
        ShipmentEvent(
            id = 102,
            request_id = 3,
            actor_id = 2,
            event_type = "PICKED_UP",
            description = "Picked Up",
            created_at = "Sep 15, 02:30 PM • Nagpur Warehouse",
            actor_name = "Vineet Mandhalkar"
        ),
        ShipmentEvent(
            id = 103,
            request_id = 3,
            actor_id = 2,
            event_type = "IN_TRANSIT",
            description = "In Transit",
            created_at = "Sep 16, 08:45 AM • Bhopal Hub",
            actor_name = "Vehicle Telemetry"
        ),
        ShipmentEvent(
            id = 104,
            request_id = 3,
            actor_id = 2,
            event_type = "ARRIVED_AT_HUB",
            description = "Arrived at Hub",
            created_at = "Sep 16, 05:20 PM • Indore Hub",
            actor_name = "Indore Regional Hub"
        ),
        ShipmentEvent(
            id = 105,
            request_id = 3,
            actor_id = 2,
            event_type = "OUT_FOR_DELIVERY",
            description = "Out for Delivery",
            created_at = "Expected Today, 11:00 AM • Mumbai Hub",
            actor_name = "Mumbai Dispatcher"
        ),
        ShipmentEvent(
            id = 106,
            request_id = 3,
            actor_id = 2,
            event_type = "DELIVERED",
            description = "Delivered",
            created_at = "Expected Today, 4:30 PM • Destination",
            actor_name = "Final Delivery Terminal"
        )
    )

    val demoAlerts: List<SmartAlert> = listOf(
        SmartAlert(
            id = 1,
            title = "Shipment Picked Up",
            message = "LS-782341 has been picked up from Nagpur Warehouse.",
            category = "Shipment",
            severity = AlertSeverity.SUCCESS,
            timeAgo = "2h ago",
            shipmentId = 3
        ),
        SmartAlert(
            id = 2,
            title = "Arrived at Hub",
            message = "Your shipment has reached Indore Hub.",
            category = "Delivery",
            severity = AlertSeverity.INFO,
            timeAgo = "5h ago",
            shipmentId = 3
        ),
        SmartAlert(
            id = 3,
            title = "Delay Notice",
            message = "Due to heavy traffic, delivery may be delayed by 1 hour.",
            category = "Shipment",
            severity = AlertSeverity.WARNING,
            timeAgo = "1d ago",
            shipmentId = 3
        ),
        SmartAlert(
            id = 4,
            title = "Out for Delivery",
            message = "Your shipment is out for delivery.",
            category = "Delivery",
            severity = AlertSeverity.SUCCESS,
            timeAgo = "1d ago",
            shipmentId = 3
        ),
        SmartAlert(
            id = 5,
            title = "Delivered",
            message = "Your shipment LS-782340 has been delivered successfully.",
            category = "Delivery",
            severity = AlertSeverity.INFO,
            timeAgo = "2d ago",
            shipmentId = 4
        ),
        SmartAlert(
            id = 6,
            title = "System Security Notice",
            message = "LogiSync cloud telemetry database connection active on TLS 1.3.",
            category = "System",
            severity = AlertSeverity.INFO,
            timeAgo = "3d ago",
            shipmentId = null
        )
    )

    val demoInvoice = ShipmentInvoice(
        id = 1,
        shipmentId = 3,
        trackingNumber = "LS-782341",
        shipmentFee = "₹1,250",
        insurance = "₹50",
        taxes = "₹225",
        total = "₹1,525",
        paymentStatus = "Paid",
        paymentDate = "Paid on Sep 15, 2025"
    )

    val demoRoutes = listOf(
        RouteOption(
            id = 1,
            title = "Fastest Route",
            duration = "5h 20m",
            distance = "320 km",
            via = "Via NH44",
            isRecommended = true,
            delayNotice = "Optimal traffic conditions"
        ),
        RouteOption(
            id = 2,
            title = "Alternative Highway",
            duration = "6h 10m",
            distance = "365 km (+45 km)",
            via = "Via SH207",
            isRecommended = false,
            delayNotice = "Moderate traffic near toll plaza"
        ),
        RouteOption(
            id = 3,
            title = "Southern Bypass",
            duration = "7h 05m",
            distance = "400 km (+80 km)",
            via = "Via NH53 Express",
            isRecommended = false,
            delayNotice = "Heavy freight corridor"
        )
    )

    val demoTurnByTurn = listOf(
        TurnByTurnStep(1, "Depart Nagpur Central Hub towards Ring Road", "4.2 km", "Proceed straight"),
        TurnByTurnStep(2, "Merge onto NH44 Express Highway heading West", "142 km", "Follow signs for Amravati / Jalgaon"),
        TurnByTurnStep(3, "Join Samruddhi Mahamarg Corridor", "120 km", "Continuous express transit"),
        TurnByTurnStep(4, "Take Exit 18 toward Thane / Mumbai Logistics Park", "38 km", "Keep right at interchange"),
        TurnByTurnStep(5, "Arrive at Mumbai Terminal Gate 4 on your left", "1.5 km", "Destination reached")
    )

    val demoDeliveryProof = DeliveryProofData(
        shipmentId = 3,
        trackingNumber = "LS-782341",
        deliveredOn = "Sep 16, 2025, 3:42 PM",
        deliveredTo = "Amit Kulkarni",
        terminalLocation = "Mumbai Logistics Terminal B-4 (19.0760° N, 72.8777° E)",
        isVerified = true
    )
}
