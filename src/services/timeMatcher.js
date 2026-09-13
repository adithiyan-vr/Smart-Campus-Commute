/**
 * Time Slot Matcher Utility
 * Parses and matches ride departure times with user search queries and time slots.
 * Ensures exact departure time matches when users search for specific commute times.
 */

/**
 * Extracts and converts a time string into minutes from midnight (0 - 1439).
 * Examples supported:
 * - "8:30 AM" -> 510
 * - "Today, 8:15 AM" -> 495
 * - "10 mins away (8:45 AM)" -> 525
 * - "8 AM" / "8am" -> 480
 * - "09:00" -> 540
 * - "9:15" -> 555
 * - "1:30 PM" -> 810
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;

  // Search for patterns:
  // 1) (hours):(minutes) optionally followed by AM/PM
  // 2) (hours).(minutes) optionally followed by AM/PM
  // 3) (hours) followed by AM/PM: e.g. "8 AM", "8am"
  const match = timeStr.match(/(?:^|[^\d])(\d{1,2})(?:[:.](\d{2}))?\s*(AM|PM)?(?=$|[^\w])/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3] ? match[3].toUpperCase() : null;

  if (hours > 24 || minutes > 59) return null;

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  } else if (!meridiem) {
    // If no AM/PM provided and hours between 1 and 6, assume afternoon (12+); else assume morning/standard
    if (hours >= 1 && hours <= 6) hours += 12;
  }

  return hours * 60 + minutes;
}

/**
 * Parses time range slots such as "8:00 - 9:00 AM" or "Morning Slot (8:00 - 9:00 AM)"
 * Returns { startMinutes, endMinutes } or null if not a range.
 */
export function parseTimeRange(slotStr) {
  if (!slotStr || typeof slotStr !== 'string') return null;

  // Match e.g. "8:00 - 9:00" or "8:00 AM - 9:00 AM" or "8:00 to 9:00"
  const rangeMatch = slotStr.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*(?:-|to)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i);
  if (!rangeMatch) return null;

  const start = parseTimeToMinutes(rangeMatch[1]);
  const end = parseTimeToMinutes(rangeMatch[2]);

  if (start !== null && end !== null) {
    return { startMinutes: Math.min(start, end), endMinutes: Math.max(start, end) };
  }
  return null;
}

/**
 * Checks if a ride or waiting member's departure time matches the search criteria / time slot.
 * Default tolerance is 0 to guarantee exact depart time matching without showing random timing.
 * @param {string} itemTimeStr - The item's departure/desired time (e.g. "8:15 AM")
 * @param {string} queryTimeStr - The user's requested time/slot (e.g. "Today, 8:15 AM")
 * @param {number} toleranceMinutes - Allowed diff in minutes (default 0 for strict exact matches)
 * @returns {boolean}
 */
export function matchesTimeSlot(itemTimeStr, queryTimeStr, toleranceMinutes = 0) {
  if (!queryTimeStr || typeof queryTimeStr !== 'string') return true;

  const cleanQuery = queryTimeStr.trim().toLowerCase();
  if (!cleanQuery || cleanQuery === 'all' || cleanQuery === 'all times' || cleanQuery === 'any' || cleanQuery === 'any time') {
    return true;
  }

  const itemMinutes = parseTimeToMinutes(itemTimeStr);
  if (itemMinutes === null) return false;

  // 1. Check if query is a range slot e.g. "8:00 - 9:00 AM"
  const range = parseTimeRange(cleanQuery);
  if (range) {
    return itemMinutes >= range.startMinutes && itemMinutes <= range.endMinutes;
  }

  // 2. Check for single time point e.g. "8:15 AM" or "Today, 8:15 AM"
  const queryMinutes = parseTimeToMinutes(cleanQuery);
  if (queryMinutes !== null) {
    const diff = Math.abs(itemMinutes - queryMinutes);
    return diff <= toleranceMinutes;
  }

  // 3. Fallback to clean substring matching for multi-char descriptions
  const simplifiedQuery = cleanQuery.replace(/today,?\s*/i, '').trim();
  if (simplifiedQuery.length >= 4) {
    const simplifiedItem = (itemTimeStr || '').toLowerCase();
    return simplifiedItem.includes(simplifiedQuery) || simplifiedQuery.includes(simplifiedItem);
  }

  return false;
}

/**
 * Sorts rides by proximity to a requested departure time, prioritizing exact matches at the top.
 */
export function sortRidesByTimeProximity(ridesList, queryTimeStr) {
  if (!Array.isArray(ridesList) || !queryTimeStr) return ridesList;
  const targetMinutes = parseTimeToMinutes(queryTimeStr);
  if (targetMinutes === null) return ridesList;

  return [...ridesList].sort((a, b) => {
    const aMins = parseTimeToMinutes(a.departureTime) ?? 9999;
    const bMins = parseTimeToMinutes(b.departureTime) ?? 9999;
    const diffA = Math.abs(aMins - targetMinutes);
    const diffB = Math.abs(bMins - targetMinutes);
    return diffA - diffB;
  });
}

/**
 * Predefined campus commute time slots for quick filtering.
 */
export const CAMPUS_TIME_SLOTS = [
  { id: 'all', label: 'All Times', value: '' },
  { id: '8_15', label: '8:15 AM', value: '8:15 AM' },
  { id: '8_30', label: '8:30 AM', value: '8:30 AM' },
  { id: '8_45', label: '8:45 AM', value: '8:45 AM' },
  { id: '9_00', label: '9:00 AM', value: '9:00 AM' },
  { id: '9_15', label: '9:15 AM', value: '9:15 AM' },
  { id: 'early_morning', label: 'Morning Slot (8:00 - 9:00 AM)', value: '8:00 AM - 9:00 AM' },
  { id: 'mid_morning', label: 'Midday Slot (9:00 - 10:00 AM)', value: '9:00 AM - 10:00 AM' },
];
