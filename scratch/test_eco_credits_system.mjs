// Test Suite for CampusCommute Eco-Credits Micro-Economy System
import http from 'http';

function makeRequest(port, method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Eco-Credits System Verification Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(cond, desc) {
    if (cond) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  const TEST_PORT = 5050; // Standalone server on port 5050

  // 1. Check Admin user initial ecoCredits
  try {
    const syncRes = await makeRequest(TEST_PORT, 'GET', '/api/sync');
    assert(syncRes.status === 200, 'GET /api/sync returns 200');
    const admin = (syncRes.body.users || []).find(u => u.role === 'admin' || u.email === 'admin@university.edu');
    assert(admin && admin.ecoCredits >= 500, `Admin account seeded with >= 500 ecoCredits (got ${admin?.ecoCredits})`);
  } catch (err) {
    assert(false, `Sync check failed: ${err.message}`);
  }

  // 2. Register student rider -> should have 120 ecoCredits
  const studentEmail = `student_eco_${Date.now()}@university.edu`;
  let studentUser = null;
  try {
    const regRes = await makeRequest(TEST_PORT, 'POST', '/api/users/register', {
      name: 'Eco Student',
      email: studentEmail,
      password: 'StudentPass123!',
      role: 'rider',
      major: 'Environmental Engineering'
    });
    assert(regRes.status === 201, 'Student registration returns 201 Created');
    studentUser = regRes.body.user;
    assert(studentUser && studentUser.ecoCredits === 120, `Student assigned 120 Eco-Credits on registration (got ${studentUser?.ecoCredits})`);
  } catch (err) {
    assert(false, `Student registration failed: ${err.message}`);
  }

  // 3. Register student driver -> should have 180 ecoCredits
  const driverEmail = `driver_eco_${Date.now()}@university.edu`;
  let driverUser = null;
  try {
    const regRes = await makeRequest(TEST_PORT, 'POST', '/api/users/register', {
      name: 'Eco Driver',
      email: driverEmail,
      password: 'DriverPass123!',
      role: 'driver',
      major: 'Automotive Design'
    });
    assert(regRes.status === 201, 'Driver registration returns 201 Created');
    driverUser = regRes.body.user;
    assert(driverUser && driverUser.ecoCredits === 180, `Driver assigned 180 Eco-Credits on registration (got ${driverUser?.ecoCredits})`);
  } catch (err) {
    assert(false, `Driver registration failed: ${err.message}`);
  }

  // 4. Driver posts a ride
  let newRide = null;
  try {
    const ridePayload = {
      id: `ride_eco_test_${Date.now()}`,
      driver: {
        name: driverUser.name,
        email: driverUser.email,
        gender: 'male',
        rating: 5.0,
        major: driverUser.major,
        avatar: driverUser.avatar
      },
      pickup: 'North Dorms',
      destination: 'Main Campus Gate',
      departureTime: '9:30 AM',
      distanceMiles: '2.0 miles',
      estimatedDuration: '8 mins',
      pricePerSeat: 50,
      availableSeats: 3,
      totalSeats: 4,
      carbonOffsetKg: 3.5,
      vehicleType: 'Hybrid Sedan'
    };
    const pubRes = await makeRequest(TEST_PORT, 'POST', '/api/rides', { ride: ridePayload });
    assert(pubRes.status === 201, 'POST /api/rides returns 201 Created');
    newRide = pubRes.body.ride;
  } catch (err) {
    assert(false, `Posting ride failed: ${err.message}`);
  }

  // 5. Student books seat paying with 25 Eco-Credits
  try {
    const bookRes = await makeRequest(TEST_PORT, 'POST', `/api/rides/${newRide.id}/book`, {
      passengerId: studentUser.id,
      paymentMethod: 'eco_credits',
      creditsPerSeat: 25
    });
    assert(bookRes.status === 200, 'Booking seat with Eco-Credits returns 200');
    assert(bookRes.body.ride.availableSeats === 2, `Available seats decremented from 3 to 2 (got ${bookRes.body.ride.availableSeats})`);
    
    // Check passenger credits
    assert(bookRes.body.user && bookRes.body.user.ecoCredits === 95, `Passenger credits decremented by 25 (120 -> 95, got ${bookRes.body.user?.ecoCredits})`);
    
    // Check driver credits
    assert(bookRes.body.driver && bookRes.body.driver.ecoCredits === 205, `Driver earned +25 credits (180 -> 205, got ${bookRes.body.driver?.ecoCredits})`);
  } catch (err) {
    assert(false, `Booking with Eco-Credits failed: ${err.message}`);
  }

  // 6. Test insufficient Eco-Credits rejection
  try {
    // Deduct remaining credits from student to test failure case
    await makeRequest(TEST_PORT, 'POST', `/api/users/${studentUser.id}/credits`, {
      amount: -85,
      reason: 'Test deduction'
    });
    // Student now has 95 - 85 = 10 credits. Trying to book a 25-credit seat should fail with 400.
    const failBookRes = await makeRequest(TEST_PORT, 'POST', `/api/rides/${newRide.id}/book`, {
      passengerId: studentUser.id,
      paymentMethod: 'eco_credits',
      creditsPerSeat: 25
    });
    assert(failBookRes.status === 400, 'Booking with insufficient Eco-Credits is rejected with 400 Bad Request');
    assert(failBookRes.body.error && failBookRes.body.error.includes('Insufficient'), `Error message mentions insufficient balance: "${failBookRes.body.error}"`);
  } catch (err) {
    assert(false, `Insufficient credits test failed: ${err.message}`);
  }

  // 7. Student books seat with Cash -> Driver earns green bonus (+20 credits)
  try {
    const cashBookRes = await makeRequest(TEST_PORT, 'POST', `/api/rides/${newRide.id}/book`, {
      passengerId: studentUser.id,
      paymentMethod: 'cash'
    });
    assert(cashBookRes.status === 200, 'Booking seat with Cash returns 200');
    assert(cashBookRes.body.driver && cashBookRes.body.driver.ecoCredits === 225, `Driver earned +20 campus green bonus for cash ride (205 -> 225, got ${cashBookRes.body.driver?.ecoCredits})`);
  } catch (err) {
    assert(false, `Cash booking test failed: ${err.message}`);
  }

  // 8. Driver picks up waiting member -> Driver earns +30 Eco-Credits bonus
  try {
    // First add a waiting member
    const waitRes = await makeRequest(TEST_PORT, 'POST', '/api/rides/waiting', {
      member: {
        passenger: { name: 'Stranded Student', gender: 'female' },
        pickup: 'Library Quad',
        destination: 'Main Campus Gate',
        desiredTime: '10:00 AM',
        seatsNeeded: 1,
        offeredContribution: 40
      }
    });
    assert(waitRes.status === 201, 'Waiting member created successfully');
    const waitingMember = waitRes.body.member;

    // Driver accepts waiting member
    const acceptRes = await makeRequest(TEST_PORT, 'POST', `/api/rides/waiting/${waitingMember.id}/accept`, {
      driverId: driverUser.id
    });
    assert(acceptRes.status === 200, 'Accept waiting member returns 200');
    assert(acceptRes.body.driver && acceptRes.body.driver.ecoCredits === 255, `Driver earned +30 Eco-Credits for picking up waiting student (225 -> 255, got ${acceptRes.body.driver?.ecoCredits})`);
    assert(!acceptRes.body.waitingMembers.some(m => m.id === waitingMember.id), 'Picked up member removed from waiting list');
  } catch (err) {
    assert(false, `Waiting pickup bonus test failed: ${err.message}`);
  }

  // 9. Adjust credits endpoint
  try {
    const adjustRes = await makeRequest(TEST_PORT, 'POST', `/api/users/${studentUser.id}/credits`, {
      amount: 50,
      reason: 'Admin Campus Award'
    });
    assert(adjustRes.status === 200, 'Credit adjustment endpoint returns 200');
    assert(adjustRes.body.user && adjustRes.body.user.ecoCredits === 60, `Credits adjusted correctly: 10 + 50 = 60 (got ${adjustRes.body.user?.ecoCredits})`);
  } catch (err) {
    assert(false, `Credit adjustment failed: ${err.message}`);
  }

  // 10. Backward compatibility with parameterless booking (for existing automated tests)
  try {
    const legacyBookRes = await makeRequest(TEST_PORT, 'POST', `/api/rides/${newRide.id}/book`);
    assert(legacyBookRes.status === 200, 'Legacy parameterless POST /api/rides/:id/book succeeds for backward compatibility');
  } catch (err) {
    assert(false, `Legacy book test failed: ${err.message}`);
  }

  // 11. Cleanup test accounts
  try {
    if (studentUser) await makeRequest(TEST_PORT, 'DELETE', `/api/users/${studentUser.id}`);
    if (driverUser) await makeRequest(TEST_PORT, 'DELETE', `/api/users/${driverUser.id}`);
    console.log('[CLEANUP] Test accounts cleanly removed.');
  } catch {}

  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
