import { INITIAL_RIDES, INITIAL_WAITING_MEMBERS } from '../data/campusState.js';

// Centralized Database Service for User Registration, Authentication, Announcements & Rides
const STORAGE_KEY_SESSION = 'campuscommute_active_session';

// Dedicated university campus administrator seed account
export const DEFAULT_SEED_ADMIN = {
  id: 'usr_admin_1',
  name: 'University Campus Administrator',
  email: 'admin@university.edu',
  password: 'AdminPass2024!',
  role: 'admin',
  major: 'Campus Safety & Transportation Office',
  studentId: 'STAFF-ADMIN-01',
  isVerified: true,
  rating: 5.0,
  completedRides: 0,
  carbonSavedKg: 0,
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
  status: 'Active',
  registeredAt: '2024-01-10',
  lastLoginAt: 'Just Now',
  isOnline: true
};

export const DEFAULT_SEED_USERS = [DEFAULT_SEED_ADMIN];

// Initial seed campus announcements
const DEFAULT_SEED_ANNOUNCEMENTS = [
  { id: 'ann_1', title: 'Spring Campus Carpool Week: Double Eco-Credits!', date: 'Oct 20', target: 'All Campus' },
  { id: 'ann_2', title: 'Construction Notice: East Gate Closed for Repaving', date: 'Oct 22', target: 'Drivers' }
];

// In-memory master state caches synced from Central Server
let inMemoryUsers = [...DEFAULT_SEED_USERS];
let inMemoryAnnouncements = [...DEFAULT_SEED_ANNOUNCEMENTS];
let inMemoryRides = [...INITIAL_RIDES];
let inMemoryWaitingMembers = [...INITIAL_WAITING_MEMBERS];
let inMemorySession = null;

// Subscribers sets
const userListeners = new Set();
const announcementListeners = new Set();
const rideListeners = new Set();
let sseSource = null;

function getApiUrl(endpoint) {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return endpoint;
  }
  return `http://localhost:5174${endpoint}`;
}

// Connect to Centralized SSE stream for real-time cross-device updates
function initRealtimeSSE() {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
  if (sseSource) return;

  try {
    sseSource = new EventSource('/api/events');

    sseSource.addEventListener('users_updated', (e) => {
      try {
        const users = JSON.parse(e.data);
        if (Array.isArray(users)) {
          inMemoryUsers = users;
          database._notify();
        }
      } catch (err) {
        console.error('[SSE] users_updated parse error:', err);
      }
    });

    sseSource.addEventListener('announcements_updated', (e) => {
      try {
        const list = JSON.parse(e.data);
        if (Array.isArray(list)) {
          inMemoryAnnouncements = list;
          database._notifyAnnouncements();
        }
      } catch (err) {
        console.error('[SSE] announcements_updated parse error:', err);
      }
    });

    sseSource.addEventListener('rides_updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.rides && Array.isArray(data.rides)) {
          inMemoryRides = data.rides;
        }
        if (data.waitingMembers && Array.isArray(data.waitingMembers)) {
          inMemoryWaitingMembers = data.waitingMembers;
        }
        database._notifyRides();
      } catch (err) {
        console.error('[SSE] rides_updated parse error:', err);
      }
    });

    sseSource.addEventListener('user_login', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('campuscommute:user_login', { detail: data }));
        }
      } catch (err) {}
    });

    sseSource.addEventListener('user_registered', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('campuscommute:user_registered', { detail: data }));
        }
      } catch (err) {}
    });

    sseSource.addEventListener('new_announcement', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('campuscommute:new_announcement', { detail: data }));
        }
      } catch (err) {}
    });

    sseSource.addEventListener('new_ride', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('campuscommute:new_ride', { detail: data }));
        }
      } catch (err) {}
    });

    sseSource.onerror = () => {
      // Automatic reconnection handled by browser EventSource
    };
  } catch (err) {
    console.warn('[SSE] Connection initialization error:', err);
  }
}

// Authoritative snapshot sync from central server
export async function syncFromCentralServer() {
  if (typeof fetch === 'undefined') return;
  try {
    const res = await fetch(getApiUrl('/api/sync'));
    if (res.ok) {
      const data = await res.json();
      let usersChanged = false;
      let annChanged = false;
      let ridesChanged = false;

      if (data.users && Array.isArray(data.users)) {
        inMemoryUsers = data.users;
        usersChanged = true;

        // Keep active session synchronized with authoritative server records
        const active = database.getActiveSession();
        if (active) {
          const fresh = inMemoryUsers.find(u => u.id === active.id || (u.email && u.email.toLowerCase() === (active.email || '').toLowerCase()));
          if (!fresh || fresh.status === 'Suspended') {
            database.logout();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('campuscommute:session_expired', {
                detail: { user: active, reason: fresh ? 'Suspended' : 'Removed' }
              }));
            }
          } else {
            database.setActiveSession(fresh);
          }
        }
      }
      if (data.announcements && Array.isArray(data.announcements)) {
        inMemoryAnnouncements = data.announcements;
        annChanged = true;
      }
      if (data.rides && Array.isArray(data.rides)) {
        inMemoryRides = data.rides;
        ridesChanged = true;
      }
      if (data.waitingMembers && Array.isArray(data.waitingMembers)) {
        inMemoryWaitingMembers = data.waitingMembers;
        ridesChanged = true;
      }

      if (usersChanged) database._notify();
      if (annChanged) database._notifyAnnouncements();
      if (ridesChanged) database._notifyRides();
    }
  } catch {}
}

// Initialize live connections and continuous sync in browser
if (typeof window !== 'undefined') {
  initRealtimeSSE();
  syncFromCentralServer();
  // Continuous real-time synchronization heartbeat across all connected devices
  setInterval(syncFromCentralServer, 3500);
}

export const database = {
  // Subscribe to real-time user changes
  subscribe: (callback) => {
    userListeners.add(callback);
    callback(inMemoryUsers);
    return () => userListeners.delete(callback);
  },

  // Subscribe to real-time announcements updates
  subscribeAnnouncements: (callback) => {
    announcementListeners.add(callback);
    callback(inMemoryAnnouncements);
    return () => announcementListeners.delete(callback);
  },

  // Subscribe to real-time rides & waiting list updates
  subscribeRides: (callback) => {
    rideListeners.add(callback);
    callback({ rides: inMemoryRides, waitingMembers: inMemoryWaitingMembers });
    return () => rideListeners.delete(callback);
  },

  // Notify subscribers
  _notify: () => {
    const users = database.getUsers();
    userListeners.forEach(cb => {
      try { cb(users); } catch (err) { console.error('Subscriber error:', err); }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('campuscommute:users_updated', { detail: users }));
    }
  },

  _notifyAnnouncements: () => {
    const list = database.getAnnouncements();
    announcementListeners.forEach(cb => {
      try { cb(list); } catch (err) { console.error('Announcement subscriber error:', err); }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('campuscommute:announcements_updated', { detail: list }));
    }
  },

  _notifyRides: () => {
    const data = { rides: inMemoryRides, waitingMembers: inMemoryWaitingMembers };
    rideListeners.forEach(cb => {
      try { cb(data); } catch (err) { console.error('Ride subscriber error:', err); }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('campuscommute:rides_updated', { detail: data }));
    }
  },

  // Get all registered users from central cache
  getUsers: () => {
    return inMemoryUsers && inMemoryUsers.length > 0 ? inMemoryUsers : [...DEFAULT_SEED_USERS];
  },

  // Register user directly on Central Server (Broadcasts to all devices)
  registerUser: async ({ name, email, password, role = 'rider', major, studentId, vehicle = null }) => {
    let cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!cleanEmail) throw new Error('Email or username is required.');
    if (!cleanPassword) throw new Error('Password is required.');

    if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail}@university.edu`;
    }

    if (role === 'admin' || cleanEmail === 'admin@university.edu') {
      throw new Error('Security Restriction: Administrative accounts cannot be registered publicly.');
    }

    const res = await fetch(getApiUrl('/api/users/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: cleanEmail, password: cleanPassword, role, major, studentId, vehicle })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success && data.user) {
      database.setActiveSession(data.user);
      await syncFromCentralServer();
      return data.user;
    } else {
      throw new Error(data.error || 'Registration failed.');
    }
  },

  // Log in user on Central Server (Tracks login & alerts admin on all devices)
  loginUser: async ({ email, password }) => {
    let cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      throw new Error('Email/username and password are required.');
    }

    const res = await fetch(getApiUrl('/api/users/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success && data.user) {
      database.setActiveSession(data.user);
      await syncFromCentralServer();
      return data.user;
    } else {
      throw new Error(data.error || 'Invalid credentials.');
    }
  },

  // Dedicated Admin Login on Central Server
  adminLogin: async ({ email, password }) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      throw new Error('Administrator email and security password are required.');
    }

    const res = await fetch(getApiUrl('/api/users/admin-login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success && data.user) {
      database.setActiveSession(data.user);
      await syncFromCentralServer();
      return data.user;
    } else {
      throw new Error(data.error || 'Access Denied: Invalid administrator credentials.');
    }
  },

  // Update user status (Suspend / Reactivate) on Central Server
  updateUserStatus: async (userId, newStatus) => {
    const res = await fetch(getApiUrl(`/api/users/${userId}/status`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.users) {
      inMemoryUsers = data.users;
      database._notify();
      return data.users;
    }
    return inMemoryUsers;
  },

  // Delete user account permanently from Central Server
  deleteUser: async (userId) => {
    const res = await fetch(getApiUrl(`/api/users/${userId}`), { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.users) {
      inMemoryUsers = data.users;
      database._notify();
      return data.users;
    }
    return inMemoryUsers;
  },

  // Update local user profile data
  updateUser: (updatedUser) => {
    inMemoryUsers = inMemoryUsers.map(u => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
    database._notify();
    const active = database.getActiveSession();
    if (active && (active.id === updatedUser.id || active.email === updatedUser.email)) {
      database.setActiveSession({ ...active, ...updatedUser });
    }
    return updatedUser;
  },

  // Announcements API
  getAnnouncements: () => {
    return inMemoryAnnouncements || [...DEFAULT_SEED_ANNOUNCEMENTS];
  },

  broadcastAnnouncement: async ({ title, target = 'All Campus', date = 'Just Now' }) => {
    const cleanTitle = String(title || '').trim();
    if (!cleanTitle) throw new Error('Announcement title cannot be empty.');

    const res = await fetch(getApiUrl('/api/announcements'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: cleanTitle, target, date })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.announcements) {
      inMemoryAnnouncements = data.announcements;
      database._notifyAnnouncements();
      return data.announcement;
    }
    throw new Error(data.error || 'Failed to broadcast announcement.');
  },

  clearAnnouncements: async () => {
    const res = await fetch(getApiUrl('/api/announcements'), { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      inMemoryAnnouncements = [];
      database._notifyAnnouncements();
    }
  },

  // Rides API (Centralized carpool offers & bookings)
  getRides: () => {
    return inMemoryRides && inMemoryRides.length > 0 ? inMemoryRides : [...INITIAL_RIDES];
  },

  publishRide: async (ride) => {
    const res = await fetch(getApiUrl('/api/rides'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ride })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ride) {
      if (data.rides) inMemoryRides = data.rides;
      database._notifyRides();
      return data.ride;
    }
    throw new Error(data.error || 'Failed to publish ride.');
  },

  bookSeat: async (rideId) => {
    const res = await fetch(getApiUrl(`/api/rides/${rideId}/book`), { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ride) {
      if (data.rides) inMemoryRides = data.rides;
      database._notifyRides();
      return data.ride;
    }
    throw new Error(data.error || 'Failed to book seat.');
  },

  getWaitingMembers: () => {
    return inMemoryWaitingMembers && inMemoryWaitingMembers.length > 0 ? inMemoryWaitingMembers : [...INITIAL_WAITING_MEMBERS];
  },

  addWaitingMember: async (member) => {
    const res = await fetch(getApiUrl('/api/rides/waiting'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.member) {
      if (data.waitingMembers) inMemoryWaitingMembers = data.waitingMembers;
      database._notifyRides();
      return data.member;
    }
    throw new Error(data.error || 'Failed to add waiting member.');
  },

  acceptWaitingMember: async (memberId) => {
    const res = await fetch(getApiUrl(`/api/rides/waiting/${memberId}/accept`), { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.waitingMembers) {
      inMemoryWaitingMembers = data.waitingMembers;
      database._notifyRides();
      return data.waitingMembers;
    }
  },

  // Active Session (Stored locally per device so device remembers who is logged in)
  getActiveSession: () => {
    if (typeof localStorage === 'undefined') return inMemorySession || null;
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setActiveSession: (user) => {
    inMemorySession = user;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
      } catch {}
    }
  },

  logout: () => {
    inMemorySession = null;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_SESSION);
      } catch {}
    }
  }
};
