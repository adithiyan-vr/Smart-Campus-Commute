import assert from 'assert';
import { database } from '../src/services/database.js';

console.log('=== RUNNING COMPREHENSIVE SIGN-IN & AUTH TESTS (CLEAN SEED STATE) ===\n');

async function runTests() {
  // Test 1: Verify Initial Clean State - Only 1 User (Dedicated Admin)
  console.log('1. Testing Initial Clean State...');
  const initialUsers = database.getUsers();
  assert(initialUsers.length === 1, `Expected 1 user, found ${initialUsers.length}`);
  assert(initialUsers[0].email === 'admin@university.edu', 'Initial user must be admin@university.edu');
  assert(initialUsers[0].role === 'admin', 'Initial user role must be admin');
  console.log('   ✓ Success: Clean database state verified. Only administrator exists.');

  // Test 2: Administrator Login via loginUser (Both full email & username)
  console.log('2. Testing Administrator Login via loginUser...');
  const adminViaEmail = await database.loginUser({
    email: 'admin@university.edu',
    password: 'AdminPass2024!'
  });
  assert(adminViaEmail && adminViaEmail.role === 'admin', 'Admin email login failed');
  console.log('   ✓ Success: Administrator signed in via email:', adminViaEmail.name);

  const adminViaUsername = await database.loginUser({
    email: 'admin',
    password: 'AdminPass2024!'
  });
  assert(adminViaUsername && adminViaUsername.email === 'admin@university.edu', 'Admin username login failed');
  console.log('   ✓ Success: Administrator signed in via username shorthand "admin"');

  // Test 3: Dedicated Gatekeeper adminLogin
  console.log('3. Testing Dedicated Gatekeeper adminLogin...');
  const gatekeeperAdmin = await database.adminLogin({
    email: 'admin@university.edu',
    password: 'AdminPass2024!'
  });
  assert(gatekeeperAdmin && gatekeeperAdmin.role === 'admin', 'Gatekeeper admin login failed');
  console.log('   ✓ Success: Gatekeeper authorized dedicated admin:', gatekeeperAdmin.name);

  // Test 4: Real Student Registration & Immediate Login
  console.log('4. Testing Real Student Registration & Sign-In...');
  const studentEmail = `student.${Date.now()}@university.edu`;
  const studentPass = 'StudentSecurePass2026!';
  const newStudent = await database.registerUser({
    name: 'Kavya Rao',
    email: studentEmail,
    password: studentPass,
    role: 'rider',
    major: 'Computer Science',
    studentId: 'STU-99412'
  });
  assert(newStudent && newStudent.email === studentEmail, 'Registration failed');
  console.log('   ✓ Success: Registered student:', newStudent.name, `(${newStudent.email})`);

  // Sign out and sign in with the new student account
  database.logout();
  const studentLogin = await database.loginUser({
    email: studentEmail,
    password: studentPass
  });
  assert(studentLogin && studentLogin.id === newStudent.id, 'Login with new student failed');
  console.log('   ✓ Success: Signed in as newly registered student:', studentLogin.name);

  // Test 5: Security Check - Student attempting gatekeeper adminLogin must be blocked
  console.log('5. Testing Security - Student blocked from gatekeeper adminLogin...');
  let blocked = false;
  try {
    await database.adminLogin({
      email: studentEmail,
      password: studentPass
    });
  } catch (err) {
    blocked = true;
    console.log('   ✓ Security working: Blocked standard user with message:', err.message);
  }
  assert(blocked, 'Security failure: Student was able to authenticate via admin gatekeeper!');

  // Test 6: Invalid password rejection
  console.log('6. Testing Invalid Password rejection...');
  let rejected = false;
  try {
    await database.loginUser({
      email: studentEmail,
      password: 'IncorrectPassword999!'
    });
  } catch (err) {
    rejected = true;
    console.log('   ✓ Clean rejection with message:', err.message);
  }
  assert(rejected, 'Invalid password was not rejected!');

  // Test 7: Non-existent account rejection
  console.log('7. Testing Non-existent Account rejection...');
  let notFound = false;
  try {
    await database.loginUser({
      email: 'nonexistent@university.edu',
      password: 'SomePassword123!'
    });
  } catch (err) {
    notFound = true;
    console.log('   ✓ Clean rejection for unregistered email:', err.message);
  }
  assert(notFound, 'Non-existent account was not rejected!');

  // Test 8: Admin deletes student account (cleanup)
  console.log('8. Testing Admin Delete Account...');
  await database.deleteUser(newStudent.id);
  const remainingUsers = database.getUsers();
  assert(!remainingUsers.some(u => u.id === newStudent.id), 'Deleted student still found in database');
  console.log('   ✓ Success: Student cleanly removed. Only administrator remains.');

  console.log('\n=== ALL TESTS PASSED: CLEAN TEST-USER-FREE PLATFORM VERIFIED! ===');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
