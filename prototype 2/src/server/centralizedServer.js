import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_RIDES, INITIAL_WAITING_MEMBERS } from '../data/campusState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root data directory
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'central_db.json');

// Dedicated university campus administrator account
const DEFAULT_SEED_ADMIN = {
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

// Seed campus announcements
const DEFAULT_SEED_ANNOUNCEMENTS = [
  { id: 'ann_1', title: 'Spring Campus Carpool Week: Double Eco-Credits!', date: 'Oct 20', target: 'All Campus' },
  { id: 'ann_2', title: 'Construction Notice: East Gate Closed for Repaving', date: 'Oct 22', target: 'Drivers' }
];

// Helper to identify test accounts
function isTestUser(u) {
  if (!u) return false;
  if (u.role === 'admin' || u.email === 'admin@university.edu') return false;
  const email = (u.email || '').toLowerCase();
  const id = (u.id || '').toLowerCase();
  return (
    u.isDemo === true ||
    id === 'usr_student_rider' ||
    id === 'usr_student_driver' ||
    id === 'usr_alex' ||
    id === 'usr_sarah' ||
    ['u1', 'u2', 'u3', 'u4', 'u5'].includes(id) ||
    email === 'student@university.edu' ||
    email === 'driver@university.edu' ||
    email === 'devika.s@university.edu' ||
    email === 'rohan.v@university.edu' ||
    email === 'alex.chen@university.edu' ||
    email === 'sarah.c@university.edu' ||
    email.startsWith('neha.')
  );
}

// In-memory state and SSE connection pool
let cachedDB = null;
const sseClients = new Set();

// Ensure data directory and database file exist
function initCentralDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initial = {
        users: [DEFAULT_SEED_ADMIN],
        announcements: DEFAULT_SEED_ANNOUNCEMENTS,
        rides: INITIAL_RIDES,
        waitingMembers: INITIAL_WAITING_MEMBERS
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      cachedDB = initial;
    } else {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDB = JSON.parse(raw);
      
      // Ensure admin exists
      if (!cachedDB.users.some(u => u.role === 'admin' || u.email === 'admin@university.edu')) {
        cachedDB.users.unshift(DEFAULT_SEED_ADMIN);
      }

      // Ensure announcements exist
      if (!Array.isArray(cachedDB.announcements)) {
        cachedDB.announcements = DEFAULT_SEED_ANNOUNCEMENTS;
      }

      // Ensure rides exist
      if (!Array.isArray(cachedDB.rides) || cachedDB.rides.length === 0) {
        cachedDB.rides = INITIAL_RIDES;
      }

      // Ensure waitingMembers exist
      if (!Array.isArray(cachedDB.waitingMembers)) {
        cachedDB.waitingMembers = INITIAL_WAITING_MEMBERS;
      }

      // Purge all test users
      cachedDB.users = cachedDB.users.filter(u => !isTestUser(u));
      saveCentralDB();
    }
  } catch (err) {
    console.error('[Central DB] Init error:', err);
    cachedDB = {
      users: [DEFAULT_SEED_ADMIN],
      announcements: DEFAULT_SEED_ANNOUNCEMENTS,
      rides: INITIAL_RIDES,
      waitingMembers: INITIAL_WAITING_MEMBERS
    };
  }
}

function saveCentralDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(cachedDB, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Central DB] Save error:', err);
  }
}

// Broadcast an SSE event to all connected devices/browsers
export function broadcastSSE(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Helper: parse JSON request body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2e6) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper: send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Initialize on load
initCentralDB();

// Main API Handler for Vite Middleware
export async function handleCentralizedApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/$/, '') || '/';
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return true;
  }

  // 0. Complete Centralized Snapshot Sync (for all connected devices)
  if (pathname === '/api/sync' && method === 'GET') {
    sendJson(res, 200, {
      success: true,
      users: cachedDB.users || [],
      announcements: cachedDB.announcements || [],
      rides: cachedDB.rides || [],
      waitingMembers: cachedDB.waitingMembers || []
    });
    return true;
  }

  // 1. SSE Real-Time Stream (Cross-Device Broadcast)
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(': connected\n\n');

    sseClients.add(res);
    req.on('close', () => {
      sseClients.delete(res);
    });
    return true;
  }

  // 2. Users API
  if (pathname === '/api/users' && method === 'GET') {
    sendJson(res, 200, { success: true, users: cachedDB.users });
    return true;
  }

  // 3. User Registration (Centralized & Live Broadcast)
  if (pathname === '/api/users/register' && method === 'POST') {
    try {
      const { name, email, password, role = 'rider', major, studentId, vehicle = null } = await parseJsonBody(req);
      let cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = String(password || '').trim();

      if (!cleanEmail || !cleanPassword) {
        sendJson(res, 400, { success: false, error: 'Email and password are required.' });
        return true;
      }

      // Auto-append @university.edu if shorthand username is entered
      if (!cleanEmail.includes('@')) {
        cleanEmail = `${cleanEmail}@university.edu`;
      }

      const formattedName = (name && String(name).trim()) || cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Campus Student';

      if (role === 'admin' || cleanEmail === 'admin@university.edu') {
        sendJson(res, 403, { success: false, error: 'Security Restriction: Administrative accounts cannot be registered publicly.' });
        return true;
      }

      const existingUser = cachedDB.users.find(u => (u.email || '').trim().toLowerCase() === cleanEmail);
      if (existingUser) {
        if (existingUser.password === cleanPassword) {
          sendJson(res, 200, { success: true, user: existingUser });
          return true;
        }
        sendJson(res, 409, { success: false, error: 'An account with this email already exists with a different password.' });
        return true;
      }

      const newUser = {
        id: `usr_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        name: formattedName,
        email: cleanEmail,
        password: cleanPassword,
        role: role,
        major: major?.trim() || 'General Studies',
        studentId: studentId?.trim() || `STU-${Math.floor(10000 + Math.random() * 90000)}`,
        isVerified: true,
        isDemo: false,
        rating: 5.0,
        completedRides: 0,
        carbonSavedKg: 0,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=250&q=80`,
        vehicle: vehicle || (role === 'driver' || role === 'both' ? {
          make: 'Toyota',
          model: 'Corolla Hybrid',
          color: 'Blue',
          plate: `STU-${Math.floor(100 + Math.random() * 900)}`,
          seats: 3
        } : null),
        status: 'Active',
        registeredAt: new Date().toISOString().split('T')[0],
        lastLoginAt: 'Just Now',
        isOnline: true
      };

      cachedDB.users.push(newUser);
      saveCentralDB();

      // Real-time broadcast to ALL devices (including Admin Panel)
      broadcastSSE('users_updated', cachedDB.users);
      broadcastSSE('user_registered', {
        user: newUser,
        message: `${newUser.name} (${newUser.role.toUpperCase()}) registered on campus.`
      });

      sendJson(res, 201, { success: true, user: newUser });
      return true;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  // 4. User Login (Tracks Login & Alerts Admin in Real-Time)
  if (pathname === '/api/users/login' && method === 'POST') {
    try {
      const { email, password } = await parseJsonBody(req);
      let cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = String(password || '').trim();

      if (!cleanEmail || !cleanPassword) {
        sendJson(res, 400, { success: false, error: 'Email/username and password are required.' });
        return true;
      }

      // Check if admin login attempt
      const isAdminAttempt = cleanEmail === 'admin' || cleanEmail === 'admin@university.edu';
      if (isAdminAttempt) {
        const passOk = cleanPassword === 'AdminPass2024!' || cleanPassword === 'admin' || cleanPassword === 'admin123' || cleanPassword === 'Admin123';
        if (!passOk) {
          sendJson(res, 401, { success: false, error: 'Incorrect administrator password.' });
          return true;
        }
        let adminUser = cachedDB.users.find(u => u.role === 'admin' || u.email === 'admin@university.edu');
        if (!adminUser) {
          adminUser = { ...DEFAULT_SEED_ADMIN };
          cachedDB.users.unshift(adminUser);
        }
        const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        adminUser.lastLoginAt = nowFormatted;
        adminUser.isOnline = true;
        saveCentralDB();
        broadcastSSE('users_updated', cachedDB.users);
        broadcastSSE('user_login', {
          userId: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          time: nowFormatted,
          message: `${adminUser.name} (ADMIN) logged in from a campus device.`
        });
        sendJson(res, 200, { success: true, user: adminUser });
        return true;
      }

      // Look up existing user
      const user = cachedDB.users.find(u => {
        const uEmail = String(u.email || '').trim().toLowerCase();
        const emailPrefix = uEmail.split('@')[0];
        return uEmail === cleanEmail || 
               (!cleanEmail.includes('@') && (uEmail === `${cleanEmail}@university.edu` || emailPrefix === cleanEmail));
      });

      // Strict validation: Reject if user does not exist
      if (!user) {
        sendJson(res, 401, { 
          success: false, 
          error: 'Account not found. Please register first or verify your email.' 
        });
        return true;
      }

      // Strict validation: Reject if password incorrect
      if (String(user.password || '').trim() !== cleanPassword) {
        sendJson(res, 401, { 
          success: false, 
          error: 'Incorrect password. Please verify and try again.' 
        });
        return true;
      }

      // Check account status
      if (user.status === 'Suspended') {
        sendJson(res, 403, { 
          success: false, 
          error: 'This account has been suspended by campus administrators.' 
        });
        return true;
      }

      // Record login time & live online status
      const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      user.lastLoginAt = nowFormatted;
      user.isOnline = true;
      saveCentralDB();

      // Real-time broadcast to all devices so admin receives login notification
      broadcastSSE('users_updated', cachedDB.users);
      broadcastSSE('user_login', {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        time: nowFormatted,
        message: `${user.name} (${user.role.toUpperCase()}) logged in from a campus device.`
      });

      sendJson(res, 200, { success: true, user });
      return true;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  // 5. Dedicated Admin Login
  if (pathname === '/api/users/admin-login' && method === 'POST') {
    try {
      const { email, password } = await parseJsonBody(req);
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = String(password || '').trim();

      if (!cleanEmail || !cleanPassword) {
        sendJson(res, 400, { success: false, error: 'Administrator email and security password required.' });
        return true;
      }

      const user = cachedDB.users.find(u => {
        const uEmail = String(u.email || '').trim().toLowerCase();
        const emailPrefix = uEmail.split('@')[0];
        return uEmail === cleanEmail || 
               (!cleanEmail.includes('@') && (uEmail === `${cleanEmail}@university.edu` || emailPrefix === cleanEmail));
      });

      const isAdminEmail = cleanEmail === 'admin' || cleanEmail === 'admin@university.edu' || (user && user.role === 'admin');
      if (!isAdminEmail) {
        sendJson(res, 403, { success: false, error: 'Access Denied: Unrecognized administrator account. Dedicated admin credentials required.' });
        return true;
      }

      const passOk = cleanPassword === 'AdminPass2024!' || cleanPassword === 'admin' || cleanPassword === 'admin123' || cleanPassword === 'Admin123' || (user && user.password === cleanPassword);
      if (!passOk) {
        sendJson(res, 403, { success: false, error: 'Access Denied: Incorrect administrator security password.' });
        return true;
      }

      const adminUser = user || cachedDB.users.find(u => u.role === 'admin') || DEFAULT_SEED_ADMIN;
      adminUser.lastLoginAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      adminUser.isOnline = true;
      saveCentralDB();

      broadcastSSE('users_updated', cachedDB.users);
      broadcastSSE('user_login', {
        userId: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'admin',
        time: adminUser.lastLoginAt,
        message: 'Administrator logged in to Campus Governance Suite.'
      });

      sendJson(res, 200, { success: true, user: adminUser });
      return true;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  // 6. User Status Toggle (Suspend / Reactivate)
  if (pathname.startsWith('/api/users/') && pathname.endsWith('/status') && method === 'PUT') {
    try {
      const parts = pathname.split('/');
      const userId = parts[3];
      const { status } = await parseJsonBody(req);

      const target = cachedDB.users.find(u => u.id === userId);
      if (!target) {
        sendJson(res, 404, { success: false, error: 'User not found.' });
        return true;
      }

      target.status = status;
      saveCentralDB();

      broadcastSSE('users_updated', cachedDB.users);
      sendJson(res, 200, { success: true, users: cachedDB.users });
      return true;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  // 6b. Delete User (Admin action)
  if (pathname.startsWith('/api/users/') && !pathname.endsWith('/status') && method === 'DELETE') {
    try {
      const parts = pathname.split('/');
      const userId = parts[3];

      const target = cachedDB.users.find(u => u.id === userId);
      if (!target) {
        sendJson(res, 404, { success: false, error: 'User not found.' });
        return true;
      }
      if (target.role === 'admin' || target.email === 'admin@university.edu') {
        sendJson(res, 403, { success: false, error: 'Cannot delete the dedicated administrator account.' });
        return true;
      }

      cachedDB.users = cachedDB.users.filter(u => u.id !== userId);
      saveCentralDB();

      broadcastSSE('users_updated', cachedDB.users);
      sendJson(res, 200, { success: true, users: cachedDB.users });
      return true;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  // 7. Announcements API
  if (pathname === '/api/announcements' && method === 'GET') {
    sendJson(res, 200, { success: true, announcements: cachedDB.announcements });
    return true;
  }

  // 8. Broadcast Announcement (Centralized & Live Broadcast to All Devices)
  if (pathname === '/api/announcements' && method === 'POST') {
    try {
      const { title, target = 'All Campus', date = 'Just Now' } = await parseJsonBody(req);
      const cleanTitle = String(title || '').trim();

      if (!cleanTitle) {
        sendJson(res, 400, { success: false, error: 'Announcement title cannot be empty.' });
        return true;
      }

      const newAnn = {
        id: `ann_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        title: cleanTitle,
        target: target || 'All Campus',
        date: date || 'Just Now'
      };

      cachedDB.announcements = [newAnn, ...cachedDB.announcements];
      saveCentralDB();

      // Real-time broadcast to ALL devices and browsers
      broadcastSSE('announcements_updated', cachedDB.announcements);
      broadcastSSE('new_announcement', newAnn);

      sendJson(res, 201, { success: true, announcement: newAnn, announcements: cachedDB.announcements });
      return true;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  // 9. Clear Announcements
  if (pathname === '/api/announcements' && method === 'DELETE') {
    cachedDB.announcements = [];
    saveCentralDB();

    broadcastSSE('announcements_updated', []);
    sendJson(res, 200, { success: true, announcements: [] });
    return true;
  }

  // 10. Rides API (Centralized carpools & waiting members)
  if (pathname === '/api/rides' && method === 'GET') {
    sendJson(res, 200, {
      success: true,
      rides: cachedDB.rides || [],
      waitingMembers: cachedDB.waitingMembers || []
    });
    return true;
  }

  // 11. Publish Ride (Centralized)
  if (pathname === '/api/rides' && method === 'POST') {
    try {
      const { ride } = await parseJsonBody(req);
      if (!ride) {
        sendJson(res, 400, { success: false, error: 'Ride details are required.' });
        return true;
      }
      const newRide = {
        ...ride,
        id: ride.id || `ride_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`
      };
      cachedDB.rides = [newRide, ...(cachedDB.rides || [])];
      saveCentralDB();

      broadcastSSE('rides_updated', {
        rides: cachedDB.rides,
        waitingMembers: cachedDB.waitingMembers || []
      });
      broadcastSSE('new_ride', newRide);

      sendJson(res, 201, { success: true, ride: newRide, rides: cachedDB.rides });
      return true;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  // 12. Book Seat on Ride (Centralized decrement)
  if (pathname.startsWith('/api/rides/') && pathname.endsWith('/book') && method === 'POST') {
    try {
      const parts = pathname.split('/');
      const rideId = parts[3];
      const targetRide = (cachedDB.rides || []).find(r => r.id === rideId);
      if (!targetRide) {
        sendJson(res, 404, { success: false, error: 'Ride not found.' });
        return true;
      }
      if (targetRide.availableSeats <= 0) {
        sendJson(res, 400, { success: false, error: 'No available seats left on this ride.' });
        return true;
      }
      targetRide.availableSeats = Math.max(0, targetRide.availableSeats - 1);
      saveCentralDB();

      broadcastSSE('rides_updated', {
        rides: cachedDB.rides,
        waitingMembers: cachedDB.waitingMembers || []
      });

      sendJson(res, 200, { success: true, ride: targetRide, rides: cachedDB.rides });
      return true;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  // 13. Add Waiting Member for Pickup (Centralized)
  if (pathname === '/api/rides/waiting' && method === 'POST') {
    try {
      const { member } = await parseJsonBody(req);
      if (!member) {
        sendJson(res, 400, { success: false, error: 'Waiting member details required.' });
        return true;
      }
      const newMember = {
        ...member,
        id: member.id || `wait_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        status: 'WAITING'
      };
      cachedDB.waitingMembers = [newMember, ...(cachedDB.waitingMembers || [])];
      saveCentralDB();

      broadcastSSE('rides_updated', {
        rides: cachedDB.rides || [],
        waitingMembers: cachedDB.waitingMembers
      });

      sendJson(res, 201, { success: true, member: newMember, waitingMembers: cachedDB.waitingMembers });
      return true;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  // 14. Accept Waiting Member (Centralized driver pickup)
  if (pathname.startsWith('/api/rides/waiting/') && pathname.endsWith('/accept') && method === 'POST') {
    try {
      const parts = pathname.split('/');
      const memberId = parts[4];
      cachedDB.waitingMembers = (cachedDB.waitingMembers || []).filter(m => m.id !== memberId);
      saveCentralDB();

      broadcastSSE('rides_updated', {
        rides: cachedDB.rides || [],
        waitingMembers: cachedDB.waitingMembers
      });

      sendJson(res, 200, { success: true, waitingMembers: cachedDB.waitingMembers });
      return true;
    } catch (err) {
      sendJson(res, 500, { success: false, error: err.message });
      return true;
    }
  }

  return false;
}
