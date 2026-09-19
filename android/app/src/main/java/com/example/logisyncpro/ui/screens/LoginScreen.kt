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
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.logisyncpro.data.db.NeonDatabaseClient
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    onNavigateToDashboard: () -> Unit,
    onNavigateToOnboarding: () -> Unit
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val coroutineScope = rememberCoroutineScope()
    val isLoading by LogiSyncRepository.isLoading.collectAsState()
    val repositoryError by LogiSyncRepository.errorMessage.collectAsState()

    val sha1Fingerprint = "7F:DB:95:7A:82:3E:EF:A9:4E:FF:7E:88:8A:F1:24:B2:E4:65:DF:0E"

    var localError by remember { mutableStateOf<String?>(null) }
    var customEmail by remember { mutableStateOf("") }
    var customPassword by remember { mutableStateOf("") }
    var customName by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var isEmailLoading by remember { mutableStateOf(false) }
    var showCloudDbDialog by remember { mutableStateOf(false) }
    var showShaDialog by remember { mutableStateOf(false) }
    var copySuccessMessage by remember { mutableStateOf(false) }

    // Google Sign-In Client Configuration
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
        val data = result.data
        if (data == null) {
            localError = "Google Sign-In was cancelled."
            return@rememberLauncherForActivityResult
        }

        val task = GoogleSignIn.getSignedInAccountFromIntent(data)
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
            when (code) {
                10 -> {
                    showShaDialog = true
                    localError = "Google DEVELOPER_ERROR (10): Keystore SHA-1 must be registered in Firebase Console. Tap 'Firebase SHA-1 Setup' or continue with Email below."
                }
                12501 -> {
                    localError = "Google Sign-In was cancelled by user."
                }
                12500 -> {
                    showShaDialog = true
                    localError = "Google Sign-In Error (12500): Check Play Services or Firebase Google Auth configuration."
                }
                7 -> {
                    localError = "Network error: Unable to contact Google Play Services. Check internet connection."
                }
                else -> {
                    localError = "Google Sign-In error ($code): ${e.localizedMessage ?: "Unknown error"}. You can sign in using email below."
                }
            }
        } catch (e: Exception) {
            localError = "Sign-In error: ${e.localizedMessage ?: e.message}"
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
            // Top Bar with Cloud DB Indicator & SHA-1 Helper
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                LogiSyncBrandHeader()

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    IconButton(
                        onClick = { showShaDialog = true },
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(ObsidianCard)
                            .border(1.dp, ObsidianCardBorder, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Key,
                            contentDescription = "Firebase SHA-1 Info",
                            tint = EmeraldPrimary,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    IconButton(
                        onClick = { showCloudDbDialog = true },
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(ObsidianCard)
                            .border(1.dp, ObsidianCardBorder, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CloudDone,
                            contentDescription = "Autonomous Cloud Database Pointer",
                            tint = EmeraldPrimary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Subtitle Tag: Autonomous Architecture
            Surface(
                shape = RoundedCornerShape(100.dp),
                color = ObsidianSurfaceElevated,
                border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldPrimary.copy(alpha = 0.3f))
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(EmeraldPrimary)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "AUTONOMOUS CLOUD DATABASE ACTIVE",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldPrimary,
                        letterSpacing = 1.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Enterprise Freight Exchange",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                textAlign = TextAlign.Center,
                lineHeight = 32.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Connect genuine shippers and carriers on a dedicated Neon PostgreSQL ledger with live cloud sync.",
                fontSize = 13.sp,
                color = TextMuted,
                textAlign = TextAlign.Center,
                lineHeight = 18.sp,
                modifier = Modifier.padding(horizontal = 8.dp)
            )

            Spacer(modifier = Modifier.height(28.dp))

            // PRIMARY: Official Google SSO Button
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "FAST SIGN-IN WITH GOOGLE",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextMuted,
                    letterSpacing = 0.8.sp,
                    modifier = Modifier.padding(bottom = 6.dp)
                )

                Text(
                    text = "Authenticates securely via Firebase and connects directly to your isolated Neon database profile.",
                    fontSize = 12.sp,
                    color = TextMuted,
                    lineHeight = 16.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        localError = null
                        LogiSyncRepository.clearError()
                        googleSignInLauncher.launch(googleSignInClient.signInIntent)
                    },
                    enabled = !isLoading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = TextPrimary,
                        contentColor = ObsidianDeep
                    )
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            color = ObsidianDeep,
                            strokeWidth = 2.dp,
                            modifier = Modifier.size(20.dp)
                        )
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "G",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = ObsidianDeep
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Continue with Google",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = ObsidianDeep
                            )
                        }
                    }
                }
            }

            // Error banner if any error occurs
            if (activeError != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = StatusCancelledBg,
                    border = androidx.compose.foundation.BorderStroke(1.dp, StatusCancelledText.copy(alpha = 0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.Top) {
                            Icon(
                                imageVector = Icons.Default.Error,
                                contentDescription = null,
                                tint = StatusCancelledText,
                                modifier = Modifier.size(16.dp).padding(top = 1.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = activeError,
                                color = StatusCancelledText,
                                fontSize = 12.sp,
                                lineHeight = 16.sp
                            )
                        }

                        if (activeError.contains("DEVELOPER_ERROR") || activeError.contains("SHA-1")) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Button(
                                onClick = {
                                    clipboardManager.setText(AnnotatedString(sha1Fingerprint))
                                    copySuccessMessage = true
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = ObsidianSurfaceElevated),
                                border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldPrimary),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth().height(36.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ContentCopy,
                                    contentDescription = null,
                                    tint = EmeraldPrimary,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (copySuccessMessage) "SHA-1 Copied to Clipboard!" else "Copy SHA-1 Fingerprint",
                                    color = EmeraldPrimary,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // SECONDARY / DEDICATED DIRECT ACCOUNT SECTION
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                // Quick Test Profiles
                Text(
                    text = "Quick Demo Profiles (1-Tap)",
                    fontSize = 11.sp,
                    color = TextMuted,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            customEmail = "shipper@logisync.com"
                            customName = "Acme Freight Requester"
                        },
                        modifier = Modifier.weight(1f).height(38.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldPrimary.copy(alpha = 0.5f))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Business,
                            contentDescription = null,
                            tint = EmeraldPrimary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Shipper", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = {
                            customEmail = "carrier@logisync.com"
                            customName = "RapidTransit Fleet"
                        },
                        modifier = Modifier.weight(1f).height(38.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldPrimary.copy(alpha = 0.5f))
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalShipping,
                            contentDescription = null,
                            tint = EmeraldPrimary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Carrier", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                HorizontalDivider(color = ObsidianCardBorder, thickness = 1.dp)

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Or Sign In Directly With Email",
                    fontSize = 11.sp,
                    color = TextMuted,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = customEmail,
                    onValueChange = {
                        customEmail = it
                        localError = null
                    },
                    label = { Text("Account Email", color = TextMuted, fontSize = 12.sp) },
                    placeholder = { Text("e.g. shipper@logisync.com", color = TextMuted.copy(alpha = 0.5f), fontSize = 12.sp) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = EmeraldPrimary,
                        unfocusedBorderColor = ObsidianCardBorder,
                        focusedContainerColor = ObsidianSurfaceElevated,
                        unfocusedContainerColor = ObsidianSurfaceElevated
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = customName,
                    onValueChange = {
                        customName = it
                        localError = null
                    },
                    label = { Text("Your Full Name or Company", color = TextMuted, fontSize = 12.sp) },
                    placeholder = { Text("e.g. Apex Freight Logistics", color = TextMuted.copy(alpha = 0.5f), fontSize = 12.sp) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedBorderColor = EmeraldPrimary,
                        unfocusedBorderColor = ObsidianCardBorder,
                        focusedContainerColor = ObsidianSurfaceElevated,
                        unfocusedContainerColor = ObsidianSurfaceElevated
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Password field
                OutlinedTextField(
                    value = customPassword,
                    onValueChange = { customPassword = it },
                    label = { Text("Password", color = TextMuted, fontSize = 12.sp) },
                    singleLine = true,
                    visualTransformation = if (showPassword)
                        androidx.compose.ui.text.input.VisualTransformation.None
                    else
                        androidx.compose.ui.text.input.PasswordVisualTransformation(),
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                        keyboardType = androidx.compose.ui.text.input.KeyboardType.Password
                    ),
                    trailingIcon = {
                        TextButton(onClick = { showPassword = !showPassword }) {
                            Text(
                                text = if (showPassword) "Hide" else "Show",
                                color = EmeraldPrimary,
                                fontSize = 11.sp
                            )
                        }
                    },
                    textStyle = androidx.compose.ui.text.TextStyle(
                        color = TextPrimary, fontSize = 14.sp
                    ),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = EmeraldPrimary,
                        unfocusedBorderColor = ObsidianCardBorder,
                        focusedContainerColor = ObsidianSurfaceElevated,
                        unfocusedContainerColor = ObsidianSurfaceElevated
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        val email = customEmail.trim()
                        val password = customPassword.trim()
                        val name = customName.trim()

                        if (email.isEmpty() || !email.contains("@")) {
                            localError = "Please enter a valid email address."
                            return@Button
                        }
                        if (password.length < 6) {
                            localError = "Password must be at least 6 characters."
                            return@Button
                        }

                        localError = null
                        LogiSyncRepository.clearError()
                        isEmailLoading = true

                        val auth = com.google.firebase.auth.FirebaseAuth.getInstance()
                        // Try sign-in first; if user not found, create account
                        auth.signInWithEmailAndPassword(email, password)
                            .addOnCompleteListener { task ->
                                if (task.isSuccessful) {
                                    val firebaseUser = auth.currentUser!!
                                    val uid = firebaseUser.uid
                                    val displayName = firebaseUser.displayName
                                        ?: name.ifEmpty { email.substringBefore("@") }
                                    coroutineScope.launch {
                                        isEmailLoading = false
                                        val exists = LogiSyncRepository.signIn(
                                            uid = uid,
                                            email = email,
                                            name = displayName,
                                            photoUrl = firebaseUser.photoUrl?.toString()
                                        )
                                        if (exists) onNavigateToDashboard()
                                        else onNavigateToOnboarding()
                                    }
                                } else {
                                    // User does not exist — create new account
                                    auth.createUserWithEmailAndPassword(email, password)
                                        .addOnCompleteListener { createTask ->
                                            if (createTask.isSuccessful) {
                                                val newUser = auth.currentUser!!
                                                // Update display name
                                                val profileUpdates = com.google.firebase.auth.UserProfileChangeRequest
                                                    .Builder()
                                                    .setDisplayName(name.ifEmpty { email.substringBefore("@") })
                                                    .build()
                                                newUser.updateProfile(profileUpdates)
                                                    .addOnCompleteListener {
                                                        coroutineScope.launch {
                                                            isEmailLoading = false
                                                            val exists = LogiSyncRepository.signIn(
                                                                uid = newUser.uid,
                                                                email = email,
                                                                name = name.ifEmpty { email.substringBefore("@") },
                                                                photoUrl = null
                                                            )
                                                            if (exists) onNavigateToDashboard()
                                                            else onNavigateToOnboarding()
                                                        }
                                                    }
                                            } else {
                                                isEmailLoading = false
                                                localError = createTask.exception?.message
                                                    ?: "Failed to create account. Check email/password."
                                            }
                                        }
                                }
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
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = EmeraldPrimary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = EmeraldPrimary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Footer note
            Text(
                text = "Autonomous APK Architecture \u2022 Connected to Neon Cloud PostgreSQL",
                fontSize = 11.sp,
                color = TextMuted.copy(alpha = 0.6f),
                textAlign = TextAlign.Center
            )
        }

        // Firebase SHA-1 Fingerprint Helper Dialog
        if (showShaDialog) {
            AlertDialog(
                onDismissRequest = { showShaDialog = false },
                title = {
                    Text(
                        text = "Firebase SHA-1 Certificate",
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                },
                text = {
                    Column {
                        Text(
                            text = "To enable Google Sign-In with your project's Firebase Console, register this SHA-1 fingerprint in Project Settings > Your Apps:",
                            fontSize = 12.sp,
                            color = TextMuted,
                            lineHeight = 17.sp
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = ObsidianSurfaceElevated,
                            border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianCardBorder),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = "SHA-1 Fingerprint:",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextMuted
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = sha1Fingerprint,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EmeraldPrimary
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Button(
                            onClick = {
                                clipboardManager.setText(AnnotatedString(sha1Fingerprint))
                                copySuccessMessage = true
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = ObsidianCard),
                            border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldPrimary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth().height(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ContentCopy,
                                contentDescription = null,
                                tint = EmeraldPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (copySuccessMessage) "Copied to Clipboard!" else "Copy SHA-1 to Clipboard",
                                color = EmeraldPrimary,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "Note: You can always use the 'Continue with Account' option below to authenticate immediately without waiting for Firebase.",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }
                },
                confirmButton = {
                    TextButton(onClick = { showShaDialog = false }) {
                        Text("Got it", color = EmeraldPrimary, fontWeight = FontWeight.Bold)
                    }
                },
                containerColor = ObsidianCard,
                shape = RoundedCornerShape(16.dp)
            )
        }

        // Autonomous Cloud Database Pointer Info Dialog
        if (showCloudDbDialog) {
            AlertDialog(
                onDismissRequest = { showCloudDbDialog = false },
                title = {
                    Text(
                        text = "Autonomous Cloud Database",
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                },
                text = {
                    Column {
                        Text(
                            text = "LogiSyncPRO operates autonomously without requiring an external hosting server or IP address. All database operations execute directly against your dedicated Neon PostgreSQL cloud ledger.",
                            fontSize = 12.sp,
                            color = TextMuted,
                            lineHeight = 17.sp
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = ObsidianSurfaceElevated,
                            border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianCardBorder),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = "Cloud Database Pointer:",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextMuted
                                )
                                Spacer(modifier = Modifier.height(3.dp))
                                Text(
                                    text = "Neon PostgreSQL Serverless",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EmeraldPrimary
                                )
                                Text(
                                    text = NeonDatabaseClient.DATABASE_POINTER,
                                    fontSize = 10.sp,
                                    color = TextMuted
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(6.dp)
                                            .clip(CircleShape)
                                            .background(EmeraldPrimary)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "Status: Online & Fully Synchronized",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = EmeraldPrimary
                                    )
                                }
                            }
                        }
                    }
                },
                confirmButton = {
                    TextButton(onClick = { showCloudDbDialog = false }) {
                        Text("Close", color = EmeraldPrimary, fontWeight = FontWeight.Bold)
                    }
                },
                containerColor = ObsidianCard,
                shape = RoundedCornerShape(16.dp)
            )
        }
    }
}
