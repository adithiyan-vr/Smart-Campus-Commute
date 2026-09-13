import assert from 'assert';
import { database, findUserFlexible } from '../src/services/database.js';

console.log('=== STARTING EXTENSIVE LOGIN & AUTH SYSTEM VALIDATION ===\n');

async function runTests() {
  // 1. Verify Seed Accounts
  console.log('1. Checking Seed Accounts Availability...');
  const users = database.getUsers();
  console.log(`   Found ${users.length} users in database.`);
  
  const admin = findUserFlexible(users, 'admin');
  assert(admin, 'Admin account not found');
  assert(admin.role === 'admin', 'Admin account must have admin role');
  console.log('   ✓ Admin found:', admin.name, `(${admin.email})`);

  const driver = findUserFlexible(users, 'sarah');
  assert(driver, 'Driver Sarah Chen not found');
  assert(driver.role === 'driver', 'Sarah Chen must have driver role');
  console.log('   ✓ Driver found:', driver.name, `(${driver.email})`);

  const rider = findUserFlexible(users, 'jordan');
  assert(rider, 'Rider Jordan Hayes not found');
  assert(rider.role === 'rider', 'Jordan Hayes must have rider role');
  console.log('   ✓ Rider found:', rider.name, `(${rider.email})`);

  // 2. Admin Login Tests
  console.log('\n2. Testing Admin Login with various inputs...');
  const loginAdminEmail = await database.loginUser({
    email: 'admin@university.edu',
    password: 'AdminPass2024!'
  });
  assert(loginAdminEmail.role === 'admin', 'Login via admin email failed');
  console.log('   ✓ Signed in as Admin via full email');

  const loginAdminUser = await database.loginUser({
    email: 'admin',
    password: 'admin'
  });
  assert(loginAdminUser.role === 'admin', 'Login via admin username failed');
  console.log('   ✓ Signed in as Admin via shorthand "admin" and password "admin"');

  // 3. Driver Login Tests
  console.log('\n3. Testing Driver (Sarah Chen) Login...');
  const loginDriverFull = await database.loginUser({
    email: 'sarah.c@university.edu',
    password: 'password123'
  });
  assert(loginDriverFull.id === driver.id, 'Driver login via email failed');
  console.log('   ✓ Driver signed in via full email: sarah.c@university.edu');

  const loginDriverShort = await database.loginUser({
    email: 'sarah',
    password: 'password123'
  });
  assert(loginDriverShort.id === driver.id, 'Driver login via shorthand failed');
  console.log('   ✓ Driver signed in via shorthand "sarah"');

  const loginDriverAlias = await database.loginUser({
    email: 'driver',
    password: 'password123'
  });
  assert(loginDriverAlias.id === driver.id, 'Driver login via role alias "driver" failed');
  console.log('   ✓ Driver signed in via alias "driver"');

  // 4. Rider Login Tests
  console.log('\n4. Testing Rider (Jordan Hayes) Login...');
  const loginRiderFull = await database.loginUser({
    email: 'jordan.h@university.edu',
    password: 'password123'
  });
  assert(loginRiderFull.id === rider.id, 'Rider login via full email failed');
  console.log('   ✓ Rider signed in via full email: jordan.h@university.edu');

  const loginRiderShort = await database.loginUser({
    email: 'jordan',
    password: 'password123'
  });
  assert(loginRiderShort.id === rider.id, 'Rider login via shorthand "jordan" failed');
  console.log('   ✓ Rider signed in via shorthand "jordan"');

  const loginRiderStudentId = await database.loginUser({
    email: 'STU-98124',
    password: 'password123'
  });
  assert(loginRiderStudentId.id === rider.id, 'Rider login via student ID failed');
  console.log('   ✓ Rider signed in via student ID "STU-98124"');

  // 5. Register New User
  console.log('\n5. Testing New User Registration & Immediate Login...');
  const testEmail = `alex.rivera.${Date.now()}`;
  const testPass = 'RiveraPassSecure2026!';
  const newUser = await database.registerUser({
    name: 'Alex Rivera',
    email: testEmail,
    password: testPass,
    role: 'both',
    major: 'Environmental Science',
    studentId: 'STU-88992'
  });
  assert(newUser && newUser.name === 'Alex Rivera', 'Registration failed');
  console.log('   ✓ Registered new user:', newUser.name, `(${newUser.email})`);

  // Logout and login with new user
  database.logout();
  const sessionAfterLogout = database.getActiveSession();
  assert(sessionAfterLogout === null, 'Session should be null after logout');
  console.log('   ✓ Clean logout confirmed');

  const loginNewUser = await database.loginUser({
    email: testEmail,
    password: testPass
  });
  assert(loginNewUser.id === newUser.id, 'Login with newly registered user failed');
  console.log('   ✓ Signed in as newly registered user:', loginNewUser.name);

  // Login new user via student ID
  database.logout();
  const loginNewUserById = await database.loginUser({
    email: 'STU-88992',
    password: testPass
  });
  assert(loginNewUserById.id === newUser.id, 'Login with newly registered user via student ID failed');
  console.log('   ✓ Signed in as newly registered user via student ID: STU-88992');

  // 6. Security Rejections
  console.log('\n6. Testing Security Rejections...');
  let wrongPassRejected = false;
  try {
    await database.loginUser({
      email: testEmail,
      password: 'WrongPassword999!'
    });
  } catch (err) {
    wrongPassRejected = true;
    console.log('   ✓ Wrong password rejected:', err.message);
  }
  assert(wrongPassRejected, 'Wrong password was not rejected!');

  let nonExistentRejected = false;
  try {
    await database.loginUser({
      email: 'nonexistent_account_xyz_123',
      password: 'somepassword'
    });
  } catch (err) {
    nonExistentRejected = true;
    console.log('   ✓ Non-existent account rejected:', err.message);
  }
  assert(nonExistentRejected, 'Non-existent account was not rejected!');

  // 7. Gatekeeper Admin Login
  console.log('\n7. Testing Dedicated Gatekeeper Admin Login...');
  const gatekeeper = await database.adminLogin({
    email: 'admin',
    password: 'admin'
  });
  assert(gatekeeper.role === 'admin', 'Admin gatekeeper login failed');
  console.log('   ✓ Gatekeeper authenticated admin successfully');

  let studentGatekeeperBlocked = false;
  try {
    await database.adminLogin({
      email: testEmail,
      password: testPass
    });
  } catch (err) {
    studentGatekeeperBlocked = true;
    console.log('   ✓ Non-admin blocked from gatekeeper:', err.message);
  }
  assert(studentGatekeeperBlocked, 'Non-admin was not blocked from gatekeeper!');

  // Cleanup test user
  await database.deleteUser(newUser.id);
  console.log('   ✓ Cleaned up test user account');

  console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY! LOGIN SYSTEM FULLY VERIFIED! ===');
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
