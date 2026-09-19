package com.example.logisyncpro.ui.screens

import android.app.Activity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.api.ApiClient
import com.example.logisyncpro.data.repository.LogiSyncRepository
import com.example.logisyncpro.theme.*
import com.example.logisyncpro.ui.components.GlassCard
import com.example.logisyncpro.ui.components.LogiSyncBrandHeader
import com.example.logisyncpro.ui.components.PrimaryButton
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    onNavigateToDashboard: () -> Unit,
    onNavigateToOnboarding: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val isLoading by LogiSyncRepository.isLoading.collectAsState()
    val repositoryError by LogiSyncRepository.errorMessage.collectAsState()

    var localError by remember { mutableStateOf<String?>(null) }
    var customEmail by remember { mutableStateOf("") }
    var customName by remember { mutableStateOf("") }
    var showServerConfigDialog by remember { mutableStateOf(false) }
    var serverUrlInput by remember { mutableStateOf(ApiClient.getBaseUrl()) }

    // Google Sign-In Client Configuration
    // Web Client ID from google-services.json
    val webClientId = "58479456655-h3mulvb8hb9r3fidtfa85qjecbjks7so.apps.googleusercontent.com"
    val googleSignInClient = remember {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(webClientId)
            .requestEmail()
            .requestProfile()
            .build()
        GoogleSignIn.getClient(context, gso)
    }

    // Google Sign-In Activity Result Launcher
    val googleSignInLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                val email = account.email
                val displayName = account.displayName
                val photoUrl = account.photoUrl?.toString()
                val idToken = account.idToken

                if (email.isNullOrBlank()) {
                    localError = "Google authentication did not return an email address."
                    return@rememberLauncherForActivityResult
                }

                // If Google ID token is available, link with Firebase Auth
                if (!idToken.isNullOrBlank()) {
                    try {
                        val auth = FirebaseAuth.getInstance()
                        val credential = GoogleAuthProvider.getCredential(idToken, null)
                        auth.signInWithCredential(credential)
                            .addOnCompleteListener { authTask ->
                                if (authTask.isSuccessful) {
                                    val firebaseUser = auth.currentUser
                                    val realUid = firebaseUser?.uid ?: account.id ?: ("google_" + email.replace("@", "_").replace(".", "_"))
                                    firebaseUser?.getIdToken(false)?.addOnSuccessListener { tokenRes ->
                                        val firebaseIdToken = tokenRes.token ?: idToken
                                        coroutineScope.launch {
                                            val exists = LogiSyncRepository.signIn(
                                                uid = realUid,
                                                email = email,
                                                name = displayName ?: email.substringBefore("@"),
                                                photoUrl = photoUrl,
                                                token = firebaseIdToken
                                            )
                                            if (exists) onNavigateToDashboard() else onNavigateToOnboarding()
                                        }
                                    }?.addOnFailureListener {
                                        // Fallback with Google token
                                        coroutineScope.launch {
                                            val exists = LogiSyncRepository.signIn(
                                                uid = realUid,
                                                email = email,
                                                name = displayName ?: email.substringBefore("@"),
                                                photoUrl = photoUrl,
                                                token = idToken
                                            )
                                            if (exists) onNavigateToDashboard() else onNavigateToOnboarding()
                                        }
                                    }
                                } else {
                                    // Firebase direct failed; verify Google token directly with backend
                                    val realUid = account.id ?: ("google_" + email.replace("@", "_").replace(".", "_"))
                                    coroutineScope.launch {
                                        val exists = LogiSyncRepository.signIn(
                                            uid = realUid,
                                            email = email,
                                            name = displayName ?: email.substringBefore("@"),
                                            photoUrl = photoUrl,
                                            token = idToken
                                        )
                                        if (exists) onNavigateToDashboard() else onNavigateToOnboarding()
                                    }
                                }
                            }
                    } catch (fbErr: Exception) {
                        // Direct backend token verification
                        val realUid = account.id ?: ("google_" + email.replace("@", "_").replace(".", "_"))
                        coroutineScope.launch {
                            val exists = LogiSyncRepository.signIn(
                                uid = realUid,
                                email = email,
                                name = displayName ?: email.substringBefore("@"),
                                photoUrl = photoUrl,
                                token = idToken
                            )
                            if (exists) onNavigateToDashboard() else onNavigateToOnboarding()
                        }
                    }
                } else {
                    // Fallback to Google ID
                    val realUid = account.id ?: ("google_" + email.replace("@", "_").replace(".", "_"))
                    coroutineScope.launch {
                        val exists = LogiSyncRepository.signIn(
                            uid = realUid,
                            email = email,
                            name = displayName ?: email.substringBefore("@"),
                            photoUrl = photoUrl,
                            token = null
                        )
                        if (exists) onNavigateToDashboard() else onNavigateToOnboarding()
                    }
                }
            } catch (e: ApiException) {
                val code = e.statusCode
                localError = when (code) {
                    10 -> "Google Sign-In DEVELOPER_ERROR (10): Keystore SHA-1 fingerprint (7F:DB:95:7A:82:3E:EF:A9:4E:FF:7E:88:8A:F1:24:B2:E4:65:DF:0E) must be registered in Firebase Console under com.example.logisyncpro."
                    12500 -> "Google Sign-In error (12500): Check Google Play Services or Firebase project configuration."
                    7 -> "Network error: Unable to contact Google Play Services. Please check internet access."
                    12501 -> "Google Sign-In was cancelled by user."
                    else -> "Google Sign-In failed ($code): ${e.localizedMessage ?: "Unknown error"}"
                }
            }
        } else {
            localError = "Google Sign-In was cancelled or failed."
        }
    }

    val scrollState = rememberScrollState()
    val activeError = localError ?: repositoryError

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianDeep)
            .padding(horizontal = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(vertical = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top Bar with Server Config
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                LogiSyncBrandHeader()

                IconButton(
                    onClick = {
                        serverUrlInput = ApiClient.getBaseUrl()
                        showServerConfigDialog = true
                    },
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(ObsidianCard)
                        .border(1.dp, ObsidianCardBorder, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Configure Backend Server",
                        tint = TextMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Subtitle Tag
            Surface(
                shape = RoundedCornerShape(100.dp),
                color = ObsidianSurfaceElevated,
                border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldPrimary.copy(alpha = 0.3f))
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Cloud,
                        contentDescription = null,
                        tint = EmeraldPrimary,
                        modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "CLOUD LOGISTICS DISPATCH NETWORK",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldPrimary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Autonomous Freight\nCoordination",
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                color = TextPrimary,
                textAlign = TextAlign.Center,
                lineHeight = 34.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Connect genuine shippers and carriers on a dedicated Neon PostgreSQL ledger with live cloud sync.",
                fontSize = 13.sp,
                color = TextMuted,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 8.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            // PRIMARY AUTHENTICATION: Official Google Sign-In
            GlassCard(
                modifier = Modifier.fillMaxWidth(),
                borderColor = EmeraldPrimary.copy(alpha = 0.5f)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "CONTINUE WITH YOUR GOOGLE ACCOUNT",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        letterSpacing = 0.5.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Authenticates securely via Firebase and connects to your isolated Neon database profile.",
                        fontSize = 12.sp,
                        color = TextMuted,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    PrimaryButton(
                        text = "Sign in with Google",
                        isLoading = isLoading,
                        onClick = {
                            localError = null
                            LogiSyncRepository.clearError()
                            // Launch real Google Sign-In Intent on physical device
                            googleSignInLauncher.launch(googleSignInClient.signInIntent)
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // SECONDARY / MULTI-DEVICE TESTING SECTION
            Text(
                text = "OR SIGN IN WITH A DEDICATED ACCOUNT",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = TextMuted,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp)
            )

            GlassCard(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = customEmail,
                    onValueChange = {
                        customEmail = it
                        localError = null
                    },
                    label = { Text("Google Account Email", color = TextMuted, fontSize = 12.sp) },
                    placeholder = { Text("user@gmail.com", color = TextMuted.copy(alpha = 0.5f), fontSize = 12.sp) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = EmeraldPrimary,
                        unfocusedBorderColor = ObsidianCardBorder,
                        focusedContainerColor = ObsidianSurfaceElevated,
                        unfocusedContainerColor = ObsidianSurfaceElevated
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = customName,
                    onValueChange = {
                        customName = it
                        localError = null
                    },
                    label = { Text("Display Name", color = TextMuted, fontSize = 12.sp) },
                    placeholder = { Text("Full Name", color = TextMuted.copy(alpha = 0.5f), fontSize = 12.sp) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = EmeraldPrimary,
                        unfocusedBorderColor = ObsidianCardBorder,
                        focusedContainerColor = ObsidianSurfaceElevated,
                        unfocusedContainerColor = ObsidianSurfaceElevated
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        val email = customEmail.trim()
                        val name = customName.trim()

                        if (email.isEmpty() || !email.contains("@")) {
                            localError = "Please enter a valid email address to authenticate."
                            return@Button
                        }
                        if (name.isEmpty()) {
                            localError = "Please enter your display name to continue."
                            return@Button
                        }

                        localError = null
                        LogiSyncRepository.clearError()
                        val uid = "google_" + email.replace("@", "_").replace(".", "_")

                        coroutineScope.launch {
                            val exists = LogiSyncRepository.signIn(
                                uid = uid,
                                email = email,
                                name = name
                            )
                            if (exists) onNavigateToDashboard() else onNavigateToOnboarding()
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ObsidianSurfaceElevated),
                    border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldPrimary.copy(alpha = 0.6f))
                ) {
                    Text(
                        text = "Continue with Account",
                        color = EmeraldPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }

            // Error display banner
            if (activeError != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = StatusCancelledBg,
                    border = androidx.compose.foundation.BorderStroke(1.dp, StatusCancelledText.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            imageVector = Icons.Default.Error,
                            contentDescription = null,
                            tint = StatusCancelledText,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = activeError,
                            color = StatusCancelledText,
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }

        // Server URL Configuration Dialog
        if (showServerConfigDialog) {
            AlertDialog(
                onDismissRequest = { showServerConfigDialog = false },
                title = {
                    Text(
                        text = "Production API Configuration",
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                },
                text = {
                    Column {
                        Text(
                            text = "LogiSyncPRO Production API URL:\n(Physical devices require an accessible HTTPS URL or LAN address)",
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = serverUrlInput,
                            onValueChange = { serverUrlInput = it },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary,
                                focusedBorderColor = EmeraldPrimary,
                                unfocusedBorderColor = ObsidianCardBorder
                            ),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }
                },
                confirmButton = {
                    TextButton(
                        onClick = {
                            ApiClient.updateBaseUrl(serverUrlInput)
                            showServerConfigDialog = false
                        }
                    ) {
                        Text("Save & Apply", color = EmeraldPrimary, fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showServerConfigDialog = false }) {
                        Text("Cancel", color = TextMuted)
                    }
                },
                containerColor = ObsidianCard,
                shape = RoundedCornerShape(16.dp)
            )
        }
    }
}
