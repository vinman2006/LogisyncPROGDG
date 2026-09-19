package com.example.logisyncpro

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.ui.components.BottomNavTab
import com.example.logisyncpro.ui.screens.*
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

sealed interface AppScreen {
    data object Login : AppScreen
    data object Onboarding : AppScreen
    data object Dashboard : AppScreen
    data class LiveTracking(val shipmentId: Int? = null) : AppScreen
    data class ShipmentDetail(val requestId: Int) : AppScreen
    data class DeliveryTimeline(val requestId: Int) : AppScreen
    data object SmartAlerts : AppScreen
    data class RouteDetails(val requestId: Int) : AppScreen
    data class DeliveryProof(val requestId: Int) : AppScreen
    data object Shipments : AppScreen
    data class CostInvoice(val requestId: Int) : AppScreen
    data class SupportHelp(val shipmentId: Int? = null) : AppScreen
    data object Settings : AppScreen
    data object AvailableRequests : AppScreen
    data object ActiveDelivery : AppScreen
    data object Routes : AppScreen
    data object Analytics : AppScreen
    data object Messages : AppScreen
    data object CreateShipment : AppScreen
}

@Composable
fun MainNavigation() {
    var currentScreen by remember { mutableStateOf<AppScreen>(AppScreen.Login) }
    val screenStack = remember { mutableStateListOf<AppScreen>(AppScreen.Login) }
    val currentUser by LogiSyncRepository.currentUser.collectAsState()
    val requests by LogiSyncRepository.requests.collectAsState()
    val coroutineScope = rememberCoroutineScope()

    fun navigateTo(screen: AppScreen) {
        screenStack.add(screen)
        currentScreen = screen
    }

    fun navigateBack() {
        if (screenStack.size > 1) {
            screenStack.removeLastOrNull()
            currentScreen = screenStack.lastOrNull() ?: AppScreen.Dashboard
        }
    }

    fun replaceWith(screen: AppScreen) {
        screenStack.clear()
        screenStack.add(screen)
        currentScreen = screen
    }

    fun handleBottomNavTabSelected(tab: BottomNavTab) {
        when (tab) {
            BottomNavTab.HOME -> replaceWith(AppScreen.Dashboard)
            BottomNavTab.TRACK -> replaceWith(AppScreen.LiveTracking())
            BottomNavTab.SHIPMENTS -> replaceWith(AppScreen.Shipments)
            BottomNavTab.ALERTS -> replaceWith(AppScreen.SmartAlerts)
            BottomNavTab.MORE -> replaceWith(AppScreen.Settings)
        }
    }


    // Firebase Session Restore on App Launch
    LaunchedEffect(Unit) {
        val firebaseUser = FirebaseAuth.getInstance().currentUser
        if (firebaseUser != null) {
            val uid = firebaseUser.uid
            val email = firebaseUser.email ?: ""
            val name = firebaseUser.displayName ?: email.substringBefore("@")
            val photo = firebaseUser.photoUrl?.toString()
            coroutineScope.launch {
                try {
                    val exists = LogiSyncRepository.signIn(
                        uid = uid,
                        email = email,
                        name = name,
                        photoUrl = photo,
                        token = null
                    )
                    if (exists) replaceWith(AppScreen.Dashboard)
                    else replaceWith(AppScreen.Onboarding)
                } catch (e: Exception) {
                    replaceWith(AppScreen.Login)
                }
            }
        }
    }

    // Android Hardware Back Gesture
    BackHandler(enabled = screenStack.size > 1) {
        navigateBack()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF060E1A))
            .safeDrawingPadding()
    ) {
        AnimatedContent(
            targetState = currentScreen,
            transitionSpec = {
                fadeIn() togetherWith fadeOut()
            },
            label = "ScreenTransition"
        ) { screen ->
            when (screen) {
                is AppScreen.Login -> {
                    LoginScreen(
                        onNavigateToDashboard = { replaceWith(AppScreen.Dashboard) },
                        onNavigateToOnboarding = { navigateTo(AppScreen.Onboarding) }
                    )
                }
                is AppScreen.Onboarding -> {
                    OnboardingScreen(
                        onNavigateToDashboard = { replaceWith(AppScreen.Dashboard) }
                    )
                }
                is AppScreen.Dashboard -> {
                    DashboardScreen(
                        onNavigateToCreateShipment = { navigateTo(AppScreen.CreateShipment) },
                        onNavigateToShipmentDetail = { id -> navigateTo(AppScreen.ShipmentDetail(id)) },
                        onNavigateToTracking = { id -> navigateTo(AppScreen.LiveTracking(id)) },
                        onNavigateToAvailableRequests = { navigateTo(AppScreen.AvailableRequests) },
                        onTabSelected = ::handleBottomNavTabSelected,
                        onSignOut = { replaceWith(AppScreen.Login) }
                    )
                }
                is AppScreen.LiveTracking -> {
                    LiveTrackingScreen(
                        initialShipmentId = screen.shipmentId,
                        onNavigateToDetail = { id -> navigateTo(AppScreen.ShipmentDetail(id)) },
                        onTabSelected = ::handleBottomNavTabSelected
                    )
                }
                is AppScreen.ShipmentDetail -> {
                    ShipmentDetailScreen(
                        requestId = screen.requestId,
                        onNavigateBack = { navigateBack() },
                        onNavigateToTracking = { id -> navigateTo(AppScreen.LiveTracking(id)) },
                        onNavigateToTimeline = { id -> navigateTo(AppScreen.DeliveryTimeline(id)) },
                        onNavigateToRoute = { id -> navigateTo(AppScreen.RouteDetails(id)) },
                        onNavigateToProof = { id -> navigateTo(AppScreen.DeliveryProof(id)) },
                        onNavigateToInvoice = { id -> navigateTo(AppScreen.CostInvoice(id)) }
                    )
                }
                is AppScreen.DeliveryTimeline -> {
                    DeliveryTimelineScreen(
                        requestId = screen.requestId,
                        onNavigateBack = { navigateBack() }
                    )
                }
                is AppScreen.SmartAlerts -> {
                    SmartAlertsScreen(
                        onNavigateBack = { navigateBack() },
                        onNavigateToShipment = { id -> navigateTo(AppScreen.ShipmentDetail(id)) },
                        onTabSelected = ::handleBottomNavTabSelected
                    )
                }
                is AppScreen.RouteDetails -> {
                    RouteDetailsScreen(
                        requestId = screen.requestId,
                        onNavigateBack = { navigateBack() }
                    )
                }
                is AppScreen.DeliveryProof -> {
                    DeliveryProofScreen(
                        requestId = screen.requestId,
                        onNavigateBack = { navigateBack() }
                    )
                }
                is AppScreen.Shipments -> {
                    ShipmentsScreen(
                        onNavigateBack = { navigateBack() },
                        onNavigateToDetail = { id -> navigateTo(AppScreen.ShipmentDetail(id)) },
                        onNavigateToTracking = { id -> navigateTo(AppScreen.LiveTracking(id)) },
                        onNavigateToCreate = { navigateTo(AppScreen.CreateShipment) },
                        onTabSelected = ::handleBottomNavTabSelected
                    )
                }
                is AppScreen.CostInvoice -> {
                    CostInvoiceScreen(
                        requestId = screen.requestId,
                        onNavigateBack = { navigateBack() }
                    )
                }
                is AppScreen.SupportHelp -> {
                    SupportHelpScreen(
                        shipmentId = screen.shipmentId,
                        onNavigateBack = { navigateBack() }
                    )
                }
                is AppScreen.Settings -> {
                    SettingsScreen(
                        onNavigateBack = { navigateBack() },
                        onSignOut = { replaceWith(AppScreen.Login) },
                        onNavigateToShipments = { navigateTo(AppScreen.Shipments) },
                        onNavigateToSupport = { navigateTo(AppScreen.SupportHelp()) },
                        onTabSelected = ::handleBottomNavTabSelected
                    )
                }
                is AppScreen.AvailableRequests -> {
                    AvailableRequestsScreen(
                        onNavigateBack = { navigateBack() },
                        onNavigateToDetail = { id -> navigateTo(AppScreen.ShipmentDetail(id)) },
                        onTabSelected = ::handleBottomNavTabSelected
                    )
                }
                is AppScreen.ActiveDelivery -> {
                    ActiveDeliveryScreen(
                        onNavigateBack = { navigateBack() },
                        onNavigateToTracking = { id -> navigateTo(AppScreen.LiveTracking(id)) },
                        onNavigateToBrowseRequests = { navigateTo(AppScreen.AvailableRequests) },
                        onTabSelected = ::handleBottomNavTabSelected
                    )
                }
                is AppScreen.Routes -> {
                    RoutesScreen(
                        onNavigateToShipment = { id -> navigateTo(AppScreen.ShipmentDetail(id)) },
                        onTabSelected = ::handleBottomNavTabSelected
                    )
                }
                is AppScreen.Analytics -> {
                    AnalyticsScreen(
                        onTabSelected = ::handleBottomNavTabSelected
                    )
                }
                is AppScreen.Messages -> {
                    MessagesScreen(
                        onNavigateToShipment = { id -> navigateTo(AppScreen.ShipmentDetail(id)) },
                        onTabSelected = ::handleBottomNavTabSelected
                    )
                }
                is AppScreen.CreateShipment -> {
                    CreateShipmentScreen(
                        onNavigateBack = { navigateBack() },
                        onTabSelected = ::handleBottomNavTabSelected
                    )
                }
            }
        }
    }
}
