import { INITIAL_RIDES, INITIAL_WAITING_MEMBERS } from '../src/data/campusState.js';
import { matchesTimeSlot } from '../src/services/timeMatcher.js';

console.log('=== STARTING DEPARTURE TIME SEARCH & TIME-SLOT FILTERING TESTS ===\n');

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

// 1. Test All Rides count initially
assert(INITIAL_RIDES.length === 13, `Initial available rides count is 13 (got ${INITIAL_RIDES.length})`);
assert(INITIAL_WAITING_MEMBERS.length === 6, `Initial waiting members count is 6 (got ${INITIAL_WAITING_MEMBERS.length})`);

// 2. Search for "8:15 AM" slot across corridors
const timeSlot815Rides = INITIAL_RIDES.filter(r => matchesTimeSlot(r.departureTime, '8:15 AM', 0));
assert(timeSlot815Rides.length === 5, `Searching '8:15 AM' returns strictly exact 8:15 AM rides for all corridors (got ${timeSlot815Rides.length})`);
assert(timeSlot815Rides.every(r => r.departureTime === '8:15 AM'), `All 8:15 AM search results have exact departureTime '8:15 AM'`);
assert(timeSlot815Rides.some(r => r.driver?.name === 'Kevin Zhang'), `Includes Kevin Zhang from Dormitory North`);

const timeSlot815Waiting = INITIAL_WAITING_MEMBERS.filter(m => matchesTimeSlot(m.desiredTime, '8:15 AM', 0));
assert(timeSlot815Waiting.length === 1, `Searching '8:15 AM' returns strictly exact 8:15 AM waiting rider (got ${timeSlot815Waiting.length})`);
assert(timeSlot815Waiting.some(m => m.passenger?.name === 'Aiden Brooks'), `8:15 AM rider is Aiden Brooks`);

// 3. Search for "Today, 8:15 AM" (from quick search card input)
const today815Rides = INITIAL_RIDES.filter(r => matchesTimeSlot(r.departureTime, 'Today, 8:15 AM', 0));
assert(today815Rides.length === 5, `Searching 'Today, 8:15 AM' returns strictly 5 rides (got ${today815Rides.length})`);
assert(today815Rides.every(r => r.departureTime === '8:15 AM'), `Searching 'Today, 8:15 AM' strictly returns exact 8:15 AM rides`);

// 4. Search for "8:30 AM"
const timeSlot830Rides = INITIAL_RIDES.filter(r => matchesTimeSlot(r.departureTime, '8:30 AM', 0));
assert(timeSlot830Rides.length === 3, `Searching '8:30 AM' returns strictly exact 8:30 AM rides (got ${timeSlot830Rides.length})`);
assert(timeSlot830Rides.every(r => r.departureTime === '8:30 AM'), `All 8:30 AM search results have exact departureTime '8:30 AM'`);
assert(timeSlot830Rides.some(r => r.driver?.name === 'Sarah Chen'), `8:30 AM includes Sarah Chen`);

const timeSlot830Waiting = INITIAL_WAITING_MEMBERS.filter(m => matchesTimeSlot(m.desiredTime, '8:30 AM', 0));
assert(timeSlot830Waiting.length === 1 && timeSlot830Waiting[0]?.passenger?.name === 'Maya Lin', `8:30 AM rider is Maya Lin`);

// 5. Search for "8:45 AM"
const timeSlot845Rides = INITIAL_RIDES.filter(r => matchesTimeSlot(r.departureTime, '8:45 AM', 0));
assert(timeSlot845Rides.length === 2, `Searching '8:45 AM' returns strictly exact 8:45 AM rides (got ${timeSlot845Rides.length})`);
assert(timeSlot845Rides.every(r => r.departureTime === '8:45 AM'), `All 8:45 AM search results have exact departureTime '8:45 AM'`);
assert(timeSlot845Rides.some(r => r.driver?.name === 'Marcus Miller'), `8:45 AM includes Marcus Miller`);

const timeSlot845Waiting = INITIAL_WAITING_MEMBERS.filter(m => matchesTimeSlot(m.desiredTime, '8:45 AM', 0));
assert(timeSlot845Waiting.length === 1 && timeSlot845Waiting[0]?.passenger?.name === 'Rohan Sharma', `8:45 AM rider is Rohan Sharma`);

// 6. Search for "9:00 AM"
const timeSlot900Rides = INITIAL_RIDES.filter(r => matchesTimeSlot(r.departureTime, '9:00 AM', 0));
assert(timeSlot900Rides.length === 2, `Searching '9:00 AM' returns strictly exact 9:00 AM rides (got ${timeSlot900Rides.length})`);
assert(timeSlot900Rides.every(r => r.departureTime === '9:00 AM'), `All 9:00 AM search results have exact departureTime '9:00 AM'`);
assert(timeSlot900Rides.some(r => r.driver?.name === 'Elena Rostova'), `9:00 AM includes Elena Rostova`);

const timeSlot900Waiting = INITIAL_WAITING_MEMBERS.filter(m => matchesTimeSlot(m.desiredTime, '9:00 AM', 0));
assert(timeSlot900Waiting.length === 1 && timeSlot900Waiting[0]?.passenger?.name === 'Chloe Vance', `9:00 AM rider is Chloe Vance`);

// 7. Search for "9:15 AM"
const timeSlot915Rides = INITIAL_RIDES.filter(r => matchesTimeSlot(r.departureTime, '9:15 AM', 0));
assert(timeSlot915Rides.length === 1 && timeSlot915Rides[0]?.driver?.name === 'Ananya Patel', `9:15 AM ride is Ananya Patel`);
assert(timeSlot915Rides[0]?.departureTime === '9:15 AM', `9:15 AM has exact departureTime '9:15 AM'`);

const timeSlot915Waiting = INITIAL_WAITING_MEMBERS.filter(m => matchesTimeSlot(m.desiredTime, '9:15 AM', 0));
assert(timeSlot915Waiting.length === 1 && timeSlot915Waiting[0]?.passenger?.name === 'Kevin Patel', `9:15 AM rider is Kevin Patel`);

// 8. Range slot: "8:00 AM - 9:00 AM" (morning commute window)
const morningSlotRides = INITIAL_RIDES.filter(r => matchesTimeSlot(r.departureTime, '8:00 AM - 9:00 AM'));
assert(morningSlotRides.length === 12, `Morning slot 8:00-9:00 returns 12 rides (got ${morningSlotRides.length})`);
assert(!morningSlotRides.some(r => r.departureTime === '9:15 AM'), `Morning slot 8:00-9:00 excludes 9:15 AM ride`);

// 9. Clearing time filter / "All Times" returns all 13 rides
const allRides = INITIAL_RIDES.filter(r => matchesTimeSlot(r.departureTime, ''));
assert(allRides.length === 13, `Empty time query returns all 13 rides`);
const allTimesRides = INITIAL_RIDES.filter(r => matchesTimeSlot(r.departureTime, 'All Times'));
assert(allTimesRides.length === 13, `'All Times' returns all 13 rides`);

// 10. Non-existent time slot e.g. "11:30 PM"
const lateNightRides = INITIAL_RIDES.filter(r => matchesTimeSlot(r.departureTime, '11:30 PM', 0));
assert(lateNightRides.length === 0, `No rides returned for late night 11:30 PM slot`);

console.log('\n======================================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('======================================================');

if (failed > 0) process.exit(1);
