import { Router } from 'express';
import { query } from '../db/connection.js';
import { requireAuth, verifyFirebaseIdToken } from '../middleware/auth.js';

const router = Router();

/**
 * Authoritative session endpoint: get current authenticated user profile (Requirement 14)
 * GET /api/v1/auth/me or GET /api/auth/me
 */
router.get('/auth/me', requireAuth, async (req, res) => {
  const { uid, email, displayName, photoUrl } = req.firebaseUser;

  try {
    const userRes = await query('SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1', [uid]);
    const user = userRes.rows[0];

    if (user) {
      return res.json({
        success: true,
        authenticated: true,
        exists: true,
        user: {
          id: user.id,
          firebase_uid: user.firebase_uid,
          email: user.email,
          name: user.display_name,
          role: user.role,
          country: user.country,
          state: user.state,
          city: user.city,
          photo_url: user.photo_url,
          created_at: user.created_at
        }
      });
    }

    return res.json({
      success: true,
      authenticated: true,
      exists: false,
      needs_onboarding: true,
      firebaseUser: {
        uid,
        email,
        name: displayName,
        photo_url: photoUrl
      }
    });
  } catch (err) {
    console.error('[AuthRoutes] /auth/me error:', err.message);
    return res.status(500).json({
      success: false,
      error: `Failed to retrieve user profile: ${err.message}`,
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * Verify Firebase ID token and return user profile
 * POST /api/auth/verify-token
 */
router.post('/auth/verify-token', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer ')) 
    ? authHeader.split(' ')[1] 
    : (req.body && req.body.idToken);

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Missing Firebase ID token',
      code: 'AUTH_TOKEN_MISSING'
    });
  }

  try {
    const decoded = await verifyFirebaseIdToken(token);
    const firebaseUid = decoded.sub || decoded.uid;
    const email = decoded.email || '';
    const name = decoded.name || decoded.display_name || '';
    const photoUrl = decoded.picture || decoded.photo_url || '';

    // Query logisync_apk_db
    const userRes = await query('SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1', [firebaseUid]);
    const user = userRes.rows[0];

    if (user) {
      return res.json({
        success: true,
        exists: true,
        needs_onboarding: false,
        user: {
          id: user.id,
          firebase_uid: user.firebase_uid,
          email: user.email,
          name: user.display_name,
          role: user.role,
          country: user.country,
          state: user.state,
          city: user.city,
          photo_url: user.photo_url,
          created_at: user.created_at
        }
      });
    } else {
      // First-time Google login: needs onboarding
      return res.json({
        success: true,
        exists: false,
        needs_onboarding: true,
        googleProfile: {
          uid: firebaseUid,
          email,
          name,
          photo_url: photoUrl
        }
      });
    }
  } catch (err) {
    console.error('[AuthRoutes] Token verification error:', err.message);
    return res.status(401).json({
      success: false,
      error: `Invalid Firebase token: ${err.message}`,
      code: 'AUTH_INVALID_TOKEN'
    });
  }
});

/**
 * Save user profile after onboarding
 * POST /api/user/onboarding
 */
router.post('/user/onboarding', requireAuth, async (req, res) => {
  const { name, role, country, state, city, photoUrl } = req.body;
  const { uid, email, displayName: googleName, photoUrl: googlePhoto } = req.firebaseUser;

  const finalName = (name && name.trim()) || googleName || 'Logistics User';
  const finalRole = (role && role.toUpperCase() === 'TRANSPORT_PROVIDER') ? 'TRANSPORT_PROVIDER' : 'REQUESTER';
  const finalCountry = (country && country.trim()) || 'India';
  const finalState = (state && state.trim()) || 'Maharashtra';
  const finalCity = (city && city.trim()) || 'Nagpur';
  const finalPhoto = photoUrl || googlePhoto || '';

  try {
    const upsertRes = await query(`
      INSERT INTO users (firebase_uid, email, display_name, photo_url, country, state, city, role, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (firebase_uid) 
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
        country = EXCLUDED.country,
        state = EXCLUDED.state,
        city = EXCLUDED.city,
        role = EXCLUDED.role,
        updated_at = NOW()
      RETURNING *;
    `, [uid, email, finalName, finalPhoto, finalCountry, finalState, finalCity, finalRole]);

    const savedUser = upsertRes.rows[0];

    return res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: savedUser.id,
        firebase_uid: savedUser.firebase_uid,
        email: savedUser.email,
        name: savedUser.display_name,
        role: savedUser.role,
        country: savedUser.country,
        state: savedUser.state,
        city: savedUser.city,
        photo_url: savedUser.photo_url,
        created_at: savedUser.created_at
      }
    });
  } catch (err) {
    console.error('[AuthRoutes] Onboarding save error:', err.message);
    return res.status(500).json({
      success: false,
      error: `Failed to save user profile: ${err.message}`,
      code: 'DB_SAVE_ERROR'
    });
  }
});

/**
 * Check or retrieve user profile by Firebase UID (query param or path param)
 * GET /api/user/profile or GET /api/user/profile/:uid
 */
router.get('/user/profile', async (req, res) => {
  const uid = req.query.uid || (req.firebaseUser && req.firebaseUser.uid);
  if (!uid) {
    return res.status(400).json({ success: false, error: 'Missing UID query param' });
  }

  try {
    const userRes = await query('SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1', [uid]);
    if (userRes.rows.length === 0) {
      return res.json({ success: true, exists: false, user: null });
    }

    const u = userRes.rows[0];
    return res.json({
      success: true,
      exists: true,
      user: {
        id: u.id,
        firebase_uid: u.firebase_uid,
        email: u.email,
        name: u.display_name,
        role: u.role,
        country: u.country,
        state: u.state,
        city: u.city,
        photo_url: u.photo_url,
        created_at: u.created_at
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/user/profile/:uid', async (req, res) => {
  const { uid } = req.params;
  if (!uid) {
    return res.status(400).json({ success: false, error: 'Missing UID' });
  }

  try {
    const userRes = await query('SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1', [uid]);
    if (userRes.rows.length === 0) {
      return res.json({ success: true, exists: false, user: null });
    }

    const u = userRes.rows[0];
    return res.json({
      success: true,
      exists: true,
      user: {
        id: u.id,
        firebase_uid: u.firebase_uid,
        email: u.email,
        name: u.display_name,
        role: u.role,
        country: u.country,
        state: u.state,
        city: u.city,
        photo_url: u.photo_url,
        created_at: u.created_at
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Save user profile (direct / backward compatible)
 * POST /api/user/profile
 */
router.post('/user/profile', async (req, res) => {
  const { firebase_uid, email, name, role, country, state, city, photo_url } = req.body;
  if (!firebase_uid || !email) {
    return res.status(400).json({ success: false, error: 'firebase_uid and email are required' });
  }

  const finalRole = (role && role.toUpperCase() === 'TRANSPORT_PROVIDER') ? 'TRANSPORT_PROVIDER' : 'REQUESTER';

  try {
    const upsertRes = await query(`
      INSERT INTO users (firebase_uid, email, display_name, photo_url, country, state, city, role, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (firebase_uid) 
      DO UPDATE SET
        display_name = COALESCE(EXCLUDED.display_name, users.display_name),
        photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
        country = COALESCE(EXCLUDED.country, users.country),
        state = COALESCE(EXCLUDED.state, users.state),
        city = COALESCE(EXCLUDED.city, users.city),
        role = COALESCE(EXCLUDED.role, users.role),
        updated_at = NOW()
      RETURNING *;
    `, [
      firebase_uid, 
      email, 
      name || 'Logistics User', 
      photo_url || '', 
      country || 'India', 
      state || 'Maharashtra', 
      city || 'Nagpur', 
      finalRole
    ]);

    const saved = upsertRes.rows[0];
    return res.json({
      success: true,
      user: {
        id: saved.id,
        firebase_uid: saved.firebase_uid,
        email: saved.email,
        name: saved.display_name,
        role: saved.role,
        country: saved.country,
        state: saved.state,
        city: saved.city,
        photo_url: saved.photo_url,
        created_at: saved.created_at
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Update current user profile (e.g. edit display name)
 * PUT /api/user/profile
 */
router.put('/user/profile', requireAuth, async (req, res) => {
  const { name, city, state, country, role } = req.body;
  const uid = req.firebaseUser.uid;

  try {
    const updateRes = await query(`
      UPDATE users
      SET 
        display_name = COALESCE($1, display_name),
        city = COALESCE($2, city),
        state = COALESCE($3, state),
        country = COALESCE($4, country),
        role = COALESCE($5, role),
        updated_at = NOW()
      WHERE firebase_uid = $6
      RETURNING *;
    `, [name, city, state, country, role, uid]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found in database' });
    }

    const u = updateRes.rows[0];
    return res.json({
      success: true,
      user: {
        id: u.id,
        firebase_uid: u.firebase_uid,
        email: u.email,
        name: u.display_name,
        role: u.role,
        country: u.country,
        state: u.state,
        city: u.city,
        photo_url: u.photo_url,
        created_at: u.created_at
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
