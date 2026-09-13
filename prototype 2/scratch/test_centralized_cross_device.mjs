import http from 'http';

function connectSSE(port, onEvent) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/api/events',
      method: 'GET',
      headers: { 'Accept': 'text/event-stream' }
    }, (res) => {
      let buffer = '';
      let currentEvent = 'message';

      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last incomplete line

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.replace('event: ', '').trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            try {
              const data = JSON.parse(dataStr);
              onEvent(currentEvent, data);
            } catch (err) {
              onEvent(currentEvent, dataStr);
            }
            currentEvent = 'message';
          }
        }
      });

      resolve(req);
    });

    req.on('error', reject);
    req.end();
  });
}

async function api(port, method, path, body) {
  const res = await fetch(`http://localhost:${port}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runCrossDeviceTests() {
  console.log('--- STARTING MULTI-DEVICE CENTRALIZED ARCHITECTURE TEST ---');

  const client1Events = [];
  const client2Events = [];

  // Connect Client 1 (Port 5174 - e.g. Device 1 / Admin Dashboard)
  const req1 = await connectSSE(5174, (event, data) => {
    client1Events.push({ event, data, time: Date.now() });
    console.log(`[Device 1 (Port 5174) SSE] Event: ${event}`);
  });

  // Connect Client 2 (Port 5173 - e.g. Device 2 / Student Phone)
  const req2 = await connectSSE(5173, (event, data) => {
    client2Events.push({ event, data, time: Date.now() });
    console.log(`[Device 2 (Port 5173) SSE] Event: ${event}`);
  });

  await new Promise(r => setTimeout(r, 600)); // Allow SSE connection to settle

  // 1. Initial State Check
  console.log('\n[TEST 1] Verify Initial Database State');
  const sync1 = await api(5174, 'GET', '/api/sync');
  console.log('Client 1 user count:', sync1.data.users.length, 'Admin:', sync1.data.users[0]?.email);
  if (sync1.data.users.length !== 1 || sync1.data.users[0]?.email !== 'admin@university.edu') {
    throw new Error('Initial state not clean! Expected only admin user.');
  }
  console.log('✓ Initial state clean (1 admin, 0 dummy users)');

  // 2. Cross-device registration: Device 2 registers a new student
  console.log('\n[TEST 2] Device 2 registers a new student user');
  const regRes = await api(5173, 'POST', '/api/users/register', {
    name: 'Maya Lin',
    email: 'maya.lin@university.edu',
    password: 'MayaPassword2024!',
    role: 'rider',
    major: 'Design \'26',
    studentId: 'STU-9901'
  });
  console.log('Device 2 registration response:', regRes.status, regRes.data.user?.email);
  if (!regRes.ok) throw new Error('Registration failed: ' + JSON.stringify(regRes.data));

  await new Promise(r => setTimeout(r, 600));

  // Verify Device 1 received SSE user_registered and users_updated
  const d1RegEvent = client1Events.find(e => e.event === 'user_registered');
  const d1UsersEvent = client1Events.find(e => e.event === 'users_updated');
  console.log('Device 1 received user_registered SSE:', Boolean(d1RegEvent));
  console.log('Device 1 received users_updated SSE:', Boolean(d1UsersEvent));
  if (!d1RegEvent || !d1UsersEvent) throw new Error('Device 1 did NOT receive real-time registration event!');
  console.log('✓ Cross-device registration broadcast verified');

  // 3. Cross-device authentication: Device 2 signs in
  console.log('\n[TEST 3] Device 2 signs in as Maya Lin');
  const loginRes = await api(5173, 'POST', '/api/users/login', {
    email: 'maya.lin@university.edu',
    password: 'MayaPassword2024!'
  });
  console.log('Device 2 login response:', loginRes.status, loginRes.data.user?.name);
  if (!loginRes.ok) throw new Error('Login failed: ' + JSON.stringify(loginRes.data));

  await new Promise(r => setTimeout(r, 600));

  // Verify Device 1 (Admin) received user_login SSE event
  const d1LoginEvent = client1Events.find(e => e.event === 'user_login' && e.data.name === 'Maya Lin');
  console.log('Device 1 received live user_login event for Maya:', Boolean(d1LoginEvent));
  if (!d1LoginEvent) throw new Error('Device 1 did NOT receive real-time login event!');
  console.log('✓ Cross-device live login activity broadcast verified');

  // 4. Admin Privileges: Device 1 (Admin) suspends Maya's account
  console.log('\n[TEST 4] Device 1 (Admin) updates user status to Suspended');
  const mayaId = regRes.data.user.id;
  const statusRes = await api(5174, 'PUT', `/api/users/${mayaId}/status`, { status: 'Suspended' });
  console.log('Status update response:', statusRes.status);
  if (!statusRes.ok) throw new Error('Status update failed');

  await new Promise(r => setTimeout(r, 600));

  // Verify Device 2 received updated users list with Maya Suspended
  const d2LastUsers = client2Events.filter(e => e.event === 'users_updated').pop();
  const suspendedMaya = d2LastUsers?.data.find(u => u.id === mayaId);
  console.log('Device 2 sees Maya status:', suspendedMaya?.status);
  if (suspendedMaya?.status !== 'Suspended') throw new Error('Device 2 did not reflect suspended status in real-time');
  console.log('✓ Cross-device admin privilege update verified');

  // 5. Centralized Announcements: Device 1 broadcasts campus announcement
  console.log('\n[TEST 5] Device 1 (Admin) broadcasts a new campus announcement');
  const annRes = await api(5174, 'POST', '/api/announcements', {
    title: 'Severe Storm Alert: All Evening Carpool Rides Coordinated at Gate 1',
    target: 'All Campus',
    date: 'Just Now'
  });
  console.log('Broadcast announcement response:', annRes.status, annRes.data.announcement?.title);
  if (!annRes.ok) throw new Error('Broadcast failed');

  await new Promise(r => setTimeout(r, 600));

  // Verify Device 2 received new_announcement SSE
  const d2AnnEvent = client2Events.find(e => e.event === 'new_announcement');
  console.log('Device 2 received new_announcement:', d2AnnEvent?.data.title);
  if (!d2AnnEvent) throw new Error('Device 2 did NOT receive real-time announcement!');
  console.log('✓ Cross-device real-time announcement broadcast verified');

  // 6. Centralized Rides & Booking: Device 2 publishes a new ride, Device 1 books it
  console.log('\n[TEST 6] Device 2 publishes a ride, Device 1 books a seat');
  const newRidePayload = {
    id: `ride_test_${Date.now()}`,
    driver: {
      name: 'Maya Lin',
      gender: 'female',
      isFemaleDriver: true,
      major: 'Design \'26',
      rating: 5.0,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      isVerified: true
    },
    pickup: 'Westwood Commons',
    destination: 'Engineering Quad',
    departureTime: '10:30 AM',
    distanceMiles: '2.1 miles',
    estimatedDuration: '7 mins',
    pricePerSeat: 45,
    availableSeats: 3,
    totalSeats: 3,
    carbonOffsetKg: 3.2,
    vehicleType: 'Honda Civic Hybrid',
    femaleOnly: false
  };

  const rideRes = await api(5173, 'POST', '/api/rides', { ride: newRidePayload });
  console.log('Publish ride response:', rideRes.status, rideRes.data.ride?.id);
  if (!rideRes.ok) throw new Error('Publish ride failed');

  await new Promise(r => setTimeout(r, 600));

  // Verify Device 1 received new_ride SSE
  const d1RideEvent = client1Events.find(e => e.event === 'new_ride');
  console.log('Device 1 received new_ride SSE:', d1RideEvent?.data.pickup);
  if (!d1RideEvent) throw new Error('Device 1 did NOT receive new_ride event!');

  // Now Device 1 books a seat
  const bookRes = await api(5174, 'POST', `/api/rides/${newRidePayload.id}/book`);
  console.log('Booking response:', bookRes.status, 'Available seats:', bookRes.data.ride?.availableSeats);
  if (!bookRes.ok || bookRes.data.ride?.availableSeats !== 2) throw new Error('Booking failed or seats not decremented');

  await new Promise(r => setTimeout(r, 600));

  // Verify Device 2 received updated rides with 2 available seats
  const d2RidesEvent = client2Events.filter(e => e.event === 'rides_updated').pop();
  const bookedRideOnD2 = d2RidesEvent?.data.rides.find(r => r.id === newRidePayload.id);
  console.log('Device 2 sees updated available seats:', bookedRideOnD2?.availableSeats);
  if (bookedRideOnD2?.availableSeats !== 2) throw new Error('Device 2 did not reflect booked seat count');
  console.log('✓ Cross-device ride publishing and booking verified');

  // 7. Cleanup test data
  console.log('\n[CLEANUP] Removing test user and restoring clean initial state');
  await api(5174, 'DELETE', `/api/users/${mayaId}`);
  // Also delete test announcement
  if (annRes.data.announcement?.id) {
    // Announcements list in DB will be cleaned or we can reset to seed
  }

  // Close SSE streams
  req1.destroy();
  req2.destroy();

  // Verify final user state
  const finalSync = await api(5174, 'GET', '/api/sync');
  console.log('Final user count:', finalSync.data.users.length, 'Remaining user:', finalSync.data.users[0]?.email);
  if (finalSync.data.users.length !== 1 || finalSync.data.users[0]?.email !== 'admin@university.edu') {
    throw new Error('Cleanup failed! Non-admin users remain.');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL MULTI-DEVICE CENTRALIZED TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

runCrossDeviceTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
