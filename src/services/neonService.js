/**
 * NeonDB Client Service
 * Interacts with the backend NeonDB API to query and persist user profiles,
 * transport requests, carrier assignments, and shipment lifecycle events.
 * NeonDB is the primary application database for LogiSyncPRO.
 */

async function getAuthHeaders(firebaseUser) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (firebaseUser) {
    headers['x-firebase-uid'] = firebaseUser.uid;
    try {
      if (typeof firebaseUser.getIdToken === 'function') {
        const token = await firebaseUser.getIdToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.warn('[NeonService] Could not retrieve ID token:', e.message);
    }
  }

  return headers;
}

export async function checkUserExistsInNeon(firebaseUid) {
  if (!firebaseUid) return { exists: false, user: null };

  try {
    const res = await fetch(`/api/user/profile?uid=${encodeURIComponent(firebaseUid)}`);
    if (!res.ok) {
      const cached = localStorage.getItem(`logisync_neondb_${firebaseUid}`);
      if (cached) {
        return { exists: true, user: JSON.parse(cached) };
      }
      return { exists: false, user: null };
    }

    const data = await res.json();
    if (data.exists && data.user) {
      localStorage.setItem(`logisync_neondb_${firebaseUid}`, JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    console.warn('[NeonService] Network error checking NeonDB profile:', err);
    const cached = localStorage.getItem(`logisync_neondb_${firebaseUid}`);
    if (cached) {
      return { exists: true, user: JSON.parse(cached) };
    }
    return { exists: false, user: null };
  }
}

export async function saveUserProfileToNeon(profileData) {
  const {
    firebase_uid,
    email,
    name,
    photo_url,
    country,
    state,
    city,
    role,
  } = profileData;

  if (!firebase_uid || !email) {
    throw new Error('firebase_uid and email are required to save to NeonDB');
  }

  const res = await fetch('/api/user/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-firebase-uid': firebase_uid,
    },
    body: JSON.stringify({
      firebase_uid,
      email,
      name: name || null,
      photo_url: photo_url || null,
      country: country || null,
      state: state || null,
      city: city || null,
      role: role || 'REQUESTER',
    }),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `HTTP error ${res.status} saving to NeonDB`);
  }

  const result = await res.json();
  if (result.user) {
    localStorage.setItem(`logisync_neondb_${firebase_uid}`, JSON.stringify(result.user));
    localStorage.setItem('logisync_active_user', JSON.stringify(result.user));
  }
  return result.user;
}

/**
 * Fetch transport requests for the authenticated user from NeonDB
 * filter: 'all' | 'available' | 'my_requests' | 'my_shipments'
 */
export async function fetchTransportRequests(firebaseUser, filter = 'all') {
  if (!firebaseUser) return [];

  const headers = await getAuthHeaders(firebaseUser);
  const res = await fetch(
    `/api/transport-requests?filter=${encodeURIComponent(filter)}&uid=${encodeURIComponent(firebaseUser.uid)}`,
    {
      method: 'GET',
      headers,
    }
  );

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `HTTP error ${res.status} fetching requests`);
  }

  const data = await res.json();
  return data.requests || [];
}

/**
 * Create a new Transport Request in NeonDB (Requester)
 */
export async function createTransportRequest(firebaseUser, requestPayload) {
  if (!firebaseUser) {
    throw new Error('User must be authenticated to create a transport request');
  }

  const headers = await getAuthHeaders(firebaseUser);
  const res = await fetch(`/api/transport-requests?uid=${encodeURIComponent(firebaseUser.uid)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestPayload),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `HTTP error ${res.status} creating transport request`);
  }

  const data = await res.json();
  return data.request;
}

/**
 * Atomically accept a transport request in NeonDB (Transport Provider)
 */
export async function acceptTransportRequest(firebaseUser, requestId) {
  if (!firebaseUser) {
    throw new Error('User must be authenticated to accept a request');
  }

  const headers = await getAuthHeaders(firebaseUser);
  const res = await fetch(
    `/api/transport-requests/${requestId}/accept?uid=${encodeURIComponent(firebaseUser.uid)}`,
    {
      method: 'POST',
      headers,
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || `HTTP error ${res.status} accepting request`);
  }

  return data.request;
}

/**
 * Update shipment status through its lifecycle in NeonDB
 */
export async function updateTransportStatus(firebaseUser, requestId, status, description = '') {
  if (!firebaseUser) {
    throw new Error('User must be authenticated to update status');
  }

  const headers = await getAuthHeaders(firebaseUser);
  const res = await fetch(
    `/api/transport-requests/${requestId}/status?uid=${encodeURIComponent(firebaseUser.uid)}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ status, description }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || `HTTP error ${res.status} updating status`);
  }

  return data.request;
}

/**
 * Fetch chronological audit event history for a shipment
 */
export async function fetchShipmentEvents(firebaseUser, requestId) {
  if (!firebaseUser) return [];

  const headers = await getAuthHeaders(firebaseUser);
  const res = await fetch(
    `/api/transport-requests/${requestId}/events?uid=${encodeURIComponent(firebaseUser.uid)}`,
    {
      method: 'GET',
      headers,
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.events || [];
}
