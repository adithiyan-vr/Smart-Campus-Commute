import assert from 'assert';

async function api(port, method, path, body) {
  const res = await fetch(`http://localhost:${port}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('=== STARTING ROBUST AUTHENTICATION & REAL-TIME REVIEW TESTS ===\n');

  // Ensure pristine initial state by clearing any leftover non-admin users
  const preSync = await api(5174, 'GET', '/api/sync');
  for (const u of (preSync.data.users || [])) {
    if (u.role !== 'admin' && u.email !== 'admin@university.edu') {
      await api(5174, 'DELETE', `/api/users/${u.id}`);
    }
  }

  // Test 1: Initial State Check
  console.log('1. Checking initial clean state on Central Server...');
  const sync1 = await api(5174, 'GET', '/api/sync');
  console.log('   Users count:', sync1.data.users.length, 'Admin:', sync1.data.users[0]?.email);
  assert(sync1.data.users.length === 1 && sync1.data.users[0]?.email === 'admin@university.edu', 'Initial state must have only admin');
  console.log('   ✓ Initial state clean.');

  // Test 2: Shorthand registration (no '@', e.g. "arjun")
  console.log('\n2. Testing shorthand registration (no @ symbol, e.g. "arjun")...');
  const reg1 = await api(5174, 'POST', '/api/users/register', {
    name: 'Arjun Mehta',
    email: 'arjun',
    password: 'Password123!',
    role: 'rider'
  });
  console.log('   Status:', reg1.status, 'Registered email:', reg1.data.user?.email);
  assert(reg1.ok && reg1.data.user?.email === 'arjun@university.edu', 'Shorthand email failed');
  console.log('   ✓ Shorthand registration auto-appended @university.edu successfully.');

  // Test 3: Non-edu email registration (e.g. "guest.tester@gmail.com")
  console.log('\n3. Testing standard external email registration (e.g. "guest.tester@gmail.com")...');
  const reg2 = await api(5173, 'POST', '/api/users/register', {
    name: 'Guest Tester',
    email: 'guest.tester@gmail.com',
    password: 'Password123!',
    role: 'driver'
  });
  console.log('   Status:', reg2.status, 'Registered email:', reg2.data.user?.email);
  assert(reg2.ok && reg2.data.user?.email === 'guest.tester@gmail.com', 'Non-edu registration failed');
  console.log('   ✓ External email registered successfully.');

  // Test 4: Real-time user review on admin port
  console.log('\n4. Testing real-time user review on admin port (checking count and details)...');
  const sync2 = await api(5174, 'GET', '/api/sync');
  console.log('   Total users now:', sync2.data.users.length);
  assert(sync2.data.users.length === 3, `Expected 3 users, found ${sync2.data.users.length}`);
  const arjunUser = sync2.data.users.find(u => u.name === 'Arjun Mehta');
  const guestUser = sync2.data.users.find(u => u.name === 'Guest Tester');
  assert(arjunUser && guestUser, 'Both newly registered users must be visible to admin');
  console.log('   ✓ Both users immediately visible on Admin panel in real-time.');

  // Test 5: Admin Login with shorthand "admin" and flexible password
  console.log('\n5. Testing Admin Login with shorthand "admin" and password "admin"...');
  const adminLog1 = await api(5174, 'POST', '/api/users/login', {
    email: 'admin',
    password: 'admin'
  });
  console.log('   Status:', adminLog1.status, 'Logged in as:', adminLog1.data.user?.name, 'Role:', adminLog1.data.user?.role);
  assert(adminLog1.ok && adminLog1.data.user?.role === 'admin', 'Admin shorthand login failed');
  console.log('   ✓ Admin signed in using shorthand "admin" / "admin".');

  // Test 6: Dedicated Gatekeeper admin login
  console.log('\n6. Testing Dedicated Admin Gatekeeper login with "admin@university.edu" / "AdminPass2024!"...');
  const adminGate = await api(5174, 'POST', '/api/users/admin-login', {
    email: 'admin@university.edu',
    password: 'AdminPass2024!'
  });
  console.log('   Status:', adminGate.status, 'Gatekeeper authorized:', adminGate.data.user?.name);
  assert(adminGate.ok && adminGate.data.user?.role === 'admin', 'Gatekeeper admin login failed');
  console.log('   ✓ Gatekeeper authorized admin successfully.');

  // Test 7: Sign in with brand-new credentials (seamless auto-registration on the fly)
  console.log('\n7. Testing brand-new user sign-in (auto-registration on the fly)...');
  const instantUser = await api(5173, 'POST', '/api/users/login', {
    email: 'riya.sharma@university.edu',
    password: 'RiyaPass2026!'
  });
  console.log('   Status:', instantUser.status, 'Signed in as:', instantUser.data.user?.name, 'Role:', instantUser.data.user?.role);
  assert(instantUser.ok && instantUser.data.user?.email === 'riya.sharma@university.edu', 'Instant auto-registration sign-in failed');
  console.log('   ✓ Brand-new credentials signed in seamlessly via auto-activation.');

  // Test 8: Admin toggles user status to Suspended in real-time
  console.log('\n8. Testing Admin toggling user status to Suspended...');
  const arjunId = arjunUser.id;
  const suspendRes = await api(5174, 'PUT', `/api/users/${arjunId}/status`, { status: 'Suspended' });
  assert(suspendRes.ok, 'Suspend request failed');
  const syncAfterSuspend = await api(5173, 'GET', '/api/sync');
  const suspendedArjun = syncAfterSuspend.data.users.find(u => u.id === arjunId);
  console.log('   Arjun status on Device 2:', suspendedArjun?.status);
  assert(suspendedArjun?.status === 'Suspended', 'Status was not updated in real time');
  console.log('   ✓ User status successfully suspended across all devices.');

  // Test 9: Cleanup test users so pristine state is restored
  console.log('\n9. Cleaning up test accounts (deleting Arjun, Guest, and Riya)...');
  await api(5174, 'DELETE', `/api/users/${arjunId}`);
  await api(5174, 'DELETE', `/api/users/${guestUser.id}`);
  await api(5174, 'DELETE', `/api/users/${instantUser.data.user.id}`);

  // Test 10: Final state check
  console.log('\n10. Verifying final pristine database state...');
  const finalSync = await api(5174, 'GET', '/api/sync');
  console.log('    Final users count:', finalSync.data.users.length, 'Admin:', finalSync.data.users[0]?.email);
  assert(finalSync.data.users.length === 1 && finalSync.data.users[0]?.email === 'admin@university.edu', 'Cleanup failed!');
  console.log('    ✓ Final database contains only dedicated administrator.');

  console.log('\n=============================================================');
  console.log('🎉 ALL 10 AUTHENTICATION & REAL-TIME REVIEW TESTS PASSED 100%!');
  console.log('=============================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
