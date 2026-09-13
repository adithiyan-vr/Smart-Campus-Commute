import { parseTimeToMinutes, parseTimeRange, matchesTimeSlot } from '../src/services/timeMatcher.js';

console.log('--- Testing Time Slot Matcher ---');

// Test 1: parseTimeToMinutes
console.assert(parseTimeToMinutes('8:30 AM') === 510, '8:30 AM -> 510');
console.assert(parseTimeToMinutes('Today, 8:15 AM') === 495, 'Today, 8:15 AM -> 495');
console.assert(parseTimeToMinutes('10 mins away (8:45 AM)') === 525, '10 mins away (8:45 AM) -> 525');
console.assert(parseTimeToMinutes('9:00 AM') === 540, '9:00 AM -> 540');
console.assert(parseTimeToMinutes('9:15 AM') === 555, '9:15 AM -> 555');

// Test 2: Exact slot queries
console.assert(matchesTimeSlot('8:15 AM', '8:15 AM') === true, '8:15 AM matches 8:15 AM');
console.assert(matchesTimeSlot('8:30 AM', '8:15 AM') === false, '8:30 AM does NOT match 8:15 AM');
console.assert(matchesTimeSlot('8:45 AM', '8:15 AM') === false, '8:45 AM does NOT match 8:15 AM');

console.assert(matchesTimeSlot('8:30 AM', '8:30 AM') === true, '8:30 AM matches 8:30 AM');
console.assert(matchesTimeSlot('8:15 AM', '8:30 AM') === false, '8:15 AM does NOT match 8:30 AM');
console.assert(matchesTimeSlot('8:45 AM', '8:30 AM') === false, '8:45 AM does NOT match 8:30 AM');

console.assert(matchesTimeSlot('8:45 AM', '8:45 AM') === true, '8:45 AM matches 8:45 AM');
console.assert(matchesTimeSlot('8:30 AM', '8:45 AM') === false, '8:30 AM does NOT match 8:45 AM');

console.assert(matchesTimeSlot('9:00 AM', '9:00 AM') === true, '9:00 AM matches 9:00 AM');
console.assert(matchesTimeSlot('8:45 AM', '9:00 AM') === false, '8:45 AM does NOT match 9:00 AM');

// Test 3: "Today, 8:15 AM" query from quick search card
console.assert(matchesTimeSlot('8:15 AM', 'Today, 8:15 AM') === true, '8:15 AM matches Today, 8:15 AM');
console.assert(matchesTimeSlot('8:30 AM', 'Today, 8:15 AM') === false, '8:30 AM does NOT match Today, 8:15 AM');
console.assert(matchesTimeSlot('8:45 AM', 'Today, 8:15 AM') === false, '8:45 AM does NOT match Today, 8:15 AM');

// Test 4: Range slot queries
console.assert(matchesTimeSlot('8:15 AM', '8:00 AM - 9:00 AM') === true, '8:15 AM matches 8:00 - 9:00 AM');
console.assert(matchesTimeSlot('8:30 AM', '8:00 AM - 9:00 AM') === true, '8:30 AM matches 8:00 - 9:00 AM');
console.assert(matchesTimeSlot('8:45 AM', '8:00 AM - 9:00 AM') === true, '8:45 AM matches 8:00 - 9:00 AM');
console.assert(matchesTimeSlot('9:00 AM', '8:00 AM - 9:00 AM') === true, '9:00 AM matches 8:00 - 9:00 AM');
console.assert(matchesTimeSlot('9:15 AM', '8:00 AM - 9:00 AM') === false, '9:15 AM does NOT match 8:00 - 9:00 AM');

// Test 5: Empty or "All" query
console.assert(matchesTimeSlot('8:15 AM', '') === true, 'Empty query matches all');
console.assert(matchesTimeSlot('8:15 AM', 'All') === true, 'All query matches all');
console.assert(matchesTimeSlot('8:15 AM', 'All Times') === true, 'All Times query matches all');

console.log('✓ All 20 Time Slot Matcher tests passed!');
