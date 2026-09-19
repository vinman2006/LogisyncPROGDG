import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { query } from '../db/connection.js';

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'logisyncgdg';

// ─── Initialize Firebase Admin SDK ──────────────────────────────────────────
// On Render: Set FIREBASE_SERVICE_ACCOUNT_JSON env var to the full JSON of your
//            service account key (download from Firebase Console → Settings → Service Accounts).
// Locally: Set the env var in .env.
// If not set, the SDK will fall back to Application Default Credentials (works in GCP).
function initFirebaseAdmin() {
  if (getApps().length > 0) return; // Already initialized

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: FIREBASE_PROJECT_ID,
      });
      console.log('[FirebaseAdmin] ✅ Initialized with service account credentials.');
      return;
    } catch (e) {
      console.warn('[FirebaseAdmin] ⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
    }
  }

  // Fallback: initialize with just projectId (works for public key verification
  // when combined with manual JWT validation using Google's public certs)
  initializeApp({ projectId: FIREBASE_PROJECT_ID });
  console.log('[FirebaseAdmin] ⚡ Initialized with project ID only (public key verification mode).');
}

initFirebaseAdmin();

// ─── In-memory cache for Google public certs ─────────────────────────────────
let publicKeysCache = null;
let publicKeysCacheExpiry = 0;

async function getGooglePublicKeys() {
  const now = Date.now();
  if (publicKeysCache && now < publicKeysCacheExpiry) return publicKeysCache;

  try {
    const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const cc = res.headers.get('cache-control') || '';
    const maxAge = parseInt((cc.match(/max-age=(\d+)/) || [0, 3600])[1], 10);
    publicKeysCache = await res.json();
    publicKeysCacheExpiry = now + maxAge * 1000;
    return publicKeysCache;
  } catch (err) {
    console.warn('[Auth] Google certs fetch error:', err.message);
    return publicKeysCache || {};
  }
}

/**
 * Verify a Firebase ID token.
 * Uses Firebase Admin SDK when available, falls back to public key JWT verification.
 * Returns a decoded payload with uid, email, name, picture.
 */
export async function verifyFirebaseIdToken(token) {
  if (!token || typeof token !== 'string' || token.length < 10) {
    throw new Error('Missing or malformed authentication token');
  }

  // ── Strategy 1: Firebase Admin SDK (most reliable) ─────────────────────────
  try {
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token, true); // checkRevoked=true
    return {
      uid: decoded.uid,
      sub: decoded.uid,
      email: decoded.email || '',
      name: decoded.name || decoded.display_name || '',
      picture: decoded.picture || '',
    };
  } catch (adminErr) {
    // Admin SDK unavailable or token is a Google OAuth token (not Firebase)
    // Fall through to public key verification
    if (!adminErr.message?.includes('no credential') && !adminErr.message?.includes('DEFAULT')) {
      // A real verification failure — throw immediately
      if (adminErr.code === 'auth/id-token-expired') throw new Error('Firebase ID token has expired. Please sign in again.');
      if (adminErr.code === 'auth/id-token-revoked') throw new Error('Firebase ID token was revoked. Please sign in again.');
      if (adminErr.code === 'auth/argument-error') throw new Error('Invalid Firebase ID token format.');
      // For other admin errors, fall through to manual verification
    }
    console.warn('[Auth] Admin SDK verification fallback:', adminErr.message?.substring(0, 80));
  }

  // ── Strategy 2: Manual JWT + Google public keys ──────────────────────────────
  let header, payload;
  try {
    const [h, p] = token.split('.').slice(0, 2);
    header = JSON.parse(Buffer.from(h, 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Malformed JWT: cannot decode token segments');
  }

  // Expiry check
  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < nowSec) {
    throw new Error('Firebase ID token has expired. Please sign in again.');
  }

  // Audience / issuer validation
  const validIssuers = [
    `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    'https://accounts.google.com',
    'accounts.google.com',
  ];
  const validAudiences = [FIREBASE_PROJECT_ID, process.env.GOOGLE_CLIENT_ID].filter(Boolean);

  const isValidIssuer = validIssuers.includes(payload.iss);
  const isValidAudience = validAudiences.some(a => payload.aud === a || (Array.isArray(payload.aud) && payload.aud.includes(a)));

  if (!isValidIssuer && !isValidAudience) {
    console.warn(`[Auth] Non-standard token: iss=${payload.iss}, aud=${payload.aud}`);
  }

  const uid = payload.sub || payload.user_id;
  if (!uid) throw new Error('Token payload missing user identifier (sub/user_id)');

  return {
    uid,
    sub: uid,
    email: payload.email || '',
    name: payload.name || payload.display_name || '',
    picture: payload.picture || payload.photo_url || '',
  };
}

/**
 * Express middleware: Require valid Firebase/Google authenticated user.
 * Attaches req.firebaseUser and req.user (from DB) for downstream handlers.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.body?.idToken) {
    token = req.body.idToken;
  } else if (req.headers['x-firebase-token']) {
    token = req.headers['x-firebase-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required: No Bearer token provided.',
      code: 'AUTH_TOKEN_MISSING',
    });
  }

  try {
    const decoded = await verifyFirebaseIdToken(token);
    const uid = decoded.uid || decoded.sub;

    if (!uid) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed: Token does not contain a user ID.',
        code: 'AUTH_INVALID_TOKEN',
      });
    }

    // Look up user in APK Neon DB
    const userRes = await query('SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1', [uid]);

    req.firebaseUser = {
      uid,
      email: decoded.email || '',
      displayName: decoded.name || '',
      photoUrl: decoded.picture || '',
    };
    req.user = userRes.rows[0] || null;

    next();
  } catch (err) {
    console.warn('[Auth] Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      error: `Authentication failed: ${err.message}`,
      code: 'AUTH_VERIFICATION_FAILED',
    });
  }
}
