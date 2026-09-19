package com.example.logisyncpro

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.example.logisyncpro.theme.ObsidianDeep
import com.example.logisyncpro.ui.screens.*

sealed interface AppScreen {
    data object Login : AppScreen
    data object Onboarding : AppScreen
    data object Dashboard : AppScreen
    data object CreateShipment : AppScreen
    data class ShipmentDetail(val requestId: Int) : AppScreen
    data object Settings : AppScreen
}

@Composable
fun MainNavigation() {
    var currentScreen by remember { mutableStateOf<AppScreen>(AppScreen.Login) }
    val screenStack = remember { mutableStateListOf<AppScreen>(AppScreen.Login) }

    fun navigateTo(screen: AppScreen) {
        screenStack.add(screen)
        currentScreen = screen
    }

    fun navigateBack() {
        if (screenStack.size > 1) {
            screenStack.removeLastOrNull()
            currentScreen = screenStack.lastOrNull() ?: AppScreen.Login
        }
    }

    fun replaceWith(screen: AppScreen) {
        screenStack.clear()
        screenStack.add(screen)
        currentScreen = screen
    }

    // Android Hardware / Gesture Back Press Handler
    BackHandler(enabled = screenStack.size > 1) {
        navigateBack()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianDeep)
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
                        onNavigateToSettings = { navigateTo(AppScreen.Settings) },
                        onSignOut = { replaceWith(AppScreen.Login) }
                    )
                }
                is AppScreen.CreateShipment -> {
                    CreateShipmentScreen(
                        onNavigateBack = { navigateBack() }
                    )
                }
                is AppScreen.ShipmentDetail -> {
                    ShipmentDetailScreen(
                        requestId = screen.requestId,
                        onNavigateBack = { navigateBack() }
                    )
                }
                is AppScreen.Settings -> {
                    SettingsScreen(
                        onNavigateBack = { navigateBack() },
                        onSignOut = { replaceWith(AppScreen.Login) }
                    )
                }
            }
        }
    }
}
