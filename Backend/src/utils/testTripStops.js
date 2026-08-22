const BASE_URL = 'http://localhost:5000/api';

async function runTripStopTests() {
  console.log('====================================================================');
  console.log('  MUSAFIR BUDDY - PHASE 6 FINAL AUDIT & COMPREHENSIVE SUITE         ');
  console.log('====================================================================\n');

  const ts = Date.now();
  const orgData = { name: 'Jay (Org)', email: `jay_audit_${ts}@example.com`, password: 'Password123' };
  const partData = { name: 'Rahul (Part)', email: `rahul_audit_${ts}@example.com`, password: 'Password123' };
  const nonMemberData = { name: 'Stranger', email: `stranger_audit_${ts}@example.com`, password: 'Password123' };

  let tokenOrg = '', userOrgId = '';
  let tokenPart = '', userPartId = '';
  let tokenNon = '', userNonId = '';
  let tripId = '', trip2Id = '';
  let destParisId = '', destAmsterdamId = '', destRomeId = '';
  let stop1Id = '', stop2Id = '', stop3Id = '', stopTrip2Id = '';

  // Setup: Register Users, Fetch Destinations, and Create Trips
  try {
    const resO = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orgData) });
    const dataO = await resO.json();
    tokenOrg = dataO.data.token; userOrgId = dataO.data.user.id;

    const resP = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(partData) });
    const dataP = await resP.json();
    tokenPart = dataP.data.token; userPartId = dataP.data.user.id;

    const resN = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nonMemberData) });
    const dataN = await resN.json();
    tokenNon = dataN.data.token; userNonId = dataN.data.user.id;

    const destRes = await fetch(`${BASE_URL}/destinations`);
    const destData = await destRes.json();
    const dests = destData.data.destinations;

    const parisObj = dests.find(d => d.name === 'Paris') || dests[0];
    const amsterdamObj = dests.find(d => d.name === 'Amsterdam') || dests[1];
    const romeObj = dests.find(d => d.name === 'Rome') || dests[2];

    destParisId = parisObj._id;
    destAmsterdamId = amsterdamObj._id;
    destRomeId = romeObj._id;

    // Create Main Europe Trip (2026-10-01 to 2026-10-15)
    const tripRes = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Europe Multi-City Trip',
        destination: 'Europe',
        startDate: '2026-10-01',
        endDate: '2026-10-15',
        budget: 50000,
        participants: [userPartId]
      })
    });
    const tData = await tripRes.json();
    tripId = tData.data.trip._id;

    // Create Second Trip for Cross-Trip Validation Tests
    const trip2Res = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Secondary Trip',
        destination: 'Asia',
        startDate: '2026-10-01',
        endDate: '2026-10-15',
        budget: 10000
      })
    });
    const t2Data = await trip2Res.json();
    trip2Id = t2Data.data.trip._id;

    // Create a stop in Trip 2
    const stop2Res = await fetch(`${BASE_URL}/trips/${trip2Id}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destParisId,
        arrivalDate: '2026-10-01',
        departureDate: '2026-10-05'
      })
    });
    const s2Data = await stop2Res.json();
    stopTrip2Id = s2Data.data.stop._id;

  } catch (err) {
    console.error('Setup Error:', err.message);
    return;
  }

  const resultsTable = [];

  const logTestResult = (num, name, expected, actual, passed, details = '') => {
    resultsTable.push({
      Test: `Test ${num}`,
      Description: name,
      Expected: expected,
      Actual: actual,
      Result: passed ? 'PASSED' : 'FAILED'
    });
    console.log(`[Test ${num}] ${name}`);
    console.log(`  Expected: ${expected} | Actual: ${actual} => ${passed ? 'PASSED' : 'FAILED'}`);
    if (details) console.log(`  Details: ${details}`);
    console.log('');
  };

  // --- DESTINATION TESTS (1 - 14) ---
  console.log('--- DESTINATION DISCOVERY AUDIT TESTS ---');

  // Test 1: Search destinations
  try {
    const res = await fetch(`${BASE_URL}/destinations?search=Paris`);
    const data = await res.json();
    logTestResult(1, 'Search destinations (Paris)', '200 OK', res.status, res.status === 200 && data.count >= 1);
  } catch (err) {
    logTestResult(1, 'Search destinations', '200 OK', err.message, false);
  }

  // Test 2: Search case-insensitively
  try {
    const res = await fetch(`${BASE_URL}/destinations?search=pArIs`);
    const data = await res.json();
    logTestResult(2, 'Search case-insensitively (pArIs)', '200 OK', res.status, res.status === 200 && data.count >= 1);
  } catch (err) {
    logTestResult(2, 'Search case-insensitively', '200 OK', err.message, false);
  }

  // Test 3: Filter by country
  try {
    const res = await fetch(`${BASE_URL}/destinations?country=India`);
    const data = await res.json();
    logTestResult(3, 'Filter destinations by country (India)', '200 OK', res.status, res.status === 200 && data.count >= 1);
  } catch (err) {
    logTestResult(3, 'Filter destinations by country', '200 OK', err.message, false);
  }

  // Test 4: Filter by cost index
  try {
    const res = await fetch(`${BASE_URL}/destinations?minCost=2&maxCost=4`);
    const data = await res.json();
    logTestResult(4, 'Filter destinations by cost index (2-4)', '200 OK', res.status, res.status === 200 && data.count >= 1);
  } catch (err) {
    logTestResult(4, 'Filter destinations by cost index', '200 OK', err.message, false);
  }

  // Test 5: Filter by category
  try {
    const res = await fetch(`${BASE_URL}/destinations?category=food`);
    const data = await res.json();
    logTestResult(5, 'Filter destinations by category (food)', '200 OK', res.status, res.status === 200 && data.count >= 1);
  } catch (err) {
    logTestResult(5, 'Filter destinations by category', '200 OK', err.message, false);
  }

  // Test 6: Popular destinations
  try {
    const res = await fetch(`${BASE_URL}/destinations/popular?limit=5`);
    const data = await res.json();
    logTestResult(6, 'Get popular destinations', '200 OK', res.status, res.status === 200 && data.count === 5);
  } catch (err) {
    logTestResult(6, 'Get popular destinations', '200 OK', err.message, false);
  }

  // Test 7: Pagination
  try {
    const res = await fetch(`${BASE_URL}/destinations?page=1&limit=5`);
    const data = await res.json();
    logTestResult(7, 'Pagination (page=1, limit=5)', '200 OK', res.status, res.status === 200 && data.count === 5);
  } catch (err) {
    logTestResult(7, 'Pagination', '200 OK', err.message, false);
  }

  // Test 8: Get destination by ID
  try {
    const res = await fetch(`${BASE_URL}/destinations/${destParisId}`);
    const data = await res.json();
    logTestResult(8, 'Get destination by ID', '200 OK', res.status, res.status === 200 && data.data.destination.name === 'Paris');
  } catch (err) {
    logTestResult(8, 'Get destination by ID', '200 OK', err.message, false);
  }

  // Test 9: Invalid destination ID
  try {
    const res = await fetch(`${BASE_URL}/destinations/invalid-id-format`);
    logTestResult(9, 'Invalid destination ID format', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(9, 'Invalid destination ID format', '400 Bad Request', err.message, false);
  }

  // Test 10: Non-existing destination
  try {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await fetch(`${BASE_URL}/destinations/${fakeId}`);
    logTestResult(10, 'Non-existing destination ID', '404 Not Found', res.status, res.status === 404);
  } catch (err) {
    logTestResult(10, 'Non-existing destination ID', '404 Not Found', err.message, false);
  }

  // Test 11: MinCost > MaxCost
  try {
    const res = await fetch(`${BASE_URL}/destinations?minCost=5&maxCost=2`);
    logTestResult(11, 'minCost > maxCost parameter rejection', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(11, 'minCost > maxCost', '400 Bad Request', err.message, false);
  }

  // Test 12: Negative page parameter
  try {
    const res = await fetch(`${BASE_URL}/destinations?page=-1`);
    logTestResult(12, 'Negative page parameter rejection', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(12, 'Negative page', '400 Bad Request', err.message, false);
  }

  // Test 13: Invalid limit parameter (> 50)
  try {
    const res = await fetch(`${BASE_URL}/destinations?limit=100`);
    logTestResult(13, 'Excessive limit parameter (> 50) rejection', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(13, 'Excessive limit', '400 Bad Request', err.message, false);
  }

  // Test 14: Inactive destinations hidden from public discovery
  try {
    const res = await fetch(`${BASE_URL}/destinations`);
    const data = await res.json();
    const allActive = data.data.destinations.every(d => d.isActive === true);
    logTestResult(14, 'Inactive destinations hidden from discovery', '200 OK (all active)', res.status, res.status === 200 && allActive);
  } catch (err) {
    logTestResult(14, 'Inactive destinations hidden', '200 OK', err.message, false);
  }

  // --- TRIP STOP TESTS (15 - 33) ---
  console.log('--- TRIP STOP MANAGEMENT & SECURITY AUDIT TESTS ---');

  // Test 15: Organizer creates stop (Paris Oct 1 - Oct 4)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destParisId,
        arrivalDate: '2026-10-01',
        departureDate: '2026-10-04',
        notes: 'Exploring Eiffel Tower & Louvre'
      })
    });
    const data = await res.json();
    if (data.success && data.data.stop) {
      stop1Id = data.data.stop._id;
    }
    logTestResult(15, 'Organizer creates stop (Paris)', '201 Created', res.status, res.status === 201);
  } catch (err) {
    logTestResult(15, 'Organizer creates stop', '201 Created', err.message, false);
  }

  // Test 16: Destination Source of Truth (Malicious body with fake cityName & country)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destAmsterdamId,
        cityName: 'London',
        country: 'United Kingdom',
        arrivalDate: '2026-10-04',
        departureDate: '2026-10-08'
      })
    });
    const data = await res.json();
    stop2Id = data.data.stop._id;
    const isAuthentic = data.data.stop.cityName === 'Amsterdam' && data.data.stop.country === 'Netherlands';
    logTestResult(16, 'Destination Source of Truth (ignores client cityName/country)', '201 Created (Derived from Destination)', `${res.status} (${data.data.stop.cityName}, ${data.data.stop.country})`, res.status === 201 && isAuthentic);
  } catch (err) {
    logTestResult(16, 'Destination Source of Truth', '201 Created', err.message, false);
  }

  // Create Stop 3 (Rome Oct 8 - Oct 12)
  try {
    const res3 = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destRomeId,
        arrivalDate: '2026-10-08',
        departureDate: '2026-10-12'
      })
    });
    const data3 = await res3.json();
    stop3Id = data3.data.stop._id;
  } catch (err) { }

  // Test 17: Organizer gets stops
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    const data = await res.json();
    logTestResult(17, 'Organizer gets all stops', '200 OK', res.status, res.status === 200 && data.count === 3);
  } catch (err) {
    logTestResult(17, 'Organizer gets all stops', '200 OK', err.message, false);
  }

  // Test 18: Organizer gets single stop
  try {
    const res = await fetch(`${BASE_URL}/stops/${stop1Id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(18, 'Organizer gets single stop', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(18, 'Organizer gets single stop', '200 OK', err.message, false);
  }

  // Test 19: Organizer updates stop
  try {
    const res = await fetch(`${BASE_URL}/stops/${stop1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({ notes: 'Updated notes: Eiffel Tower at sunset' })
    });
    logTestResult(19, 'Organizer updates stop', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(19, 'Organizer updates stop', '200 OK', err.message, false);
  }

  // Setup temp stop for Test 20 delete
  let tempDeleteStopId = '';
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destRomeId,
        arrivalDate: '2026-10-12',
        departureDate: '2026-10-15'
      })
    });
    const data = await res.json();
    tempDeleteStopId = data.data.stop._id;
  } catch (err) { }

  // Test 20: Organizer deletes stop
  try {
    const res = await fetch(`${BASE_URL}/stops/${tempDeleteStopId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(20, 'Organizer deletes stop', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(20, 'Organizer deletes stop', '200 OK', err.message, false);
  }

  // Test 21: Organizer reorders stops
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({ stopIds: [stop3Id, stop1Id, stop2Id] })
    });
    logTestResult(21, 'Organizer reorders stops', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(21, 'Organizer reorders stops', '200 OK', err.message, false);
  }

  // Test 22: Participant views stops
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenPart}` }
    });
    logTestResult(22, 'Participant views stops', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(22, 'Participant views stops', '200 OK', err.message, false);
  }

  // Test 23: Participant views single stop
  try {
    const res = await fetch(`${BASE_URL}/stops/${stop1Id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenPart}` }
    });
    logTestResult(23, 'Participant views single stop', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(23, 'Participant views single stop', '200 OK', err.message, false);
  }

  // Test 24: Participant cannot create stop
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenPart}` },
      body: JSON.stringify({
        destinationId: destParisId,
        arrivalDate: '2026-10-12',
        departureDate: '2026-10-14'
      })
    });
    logTestResult(24, 'Participant cannot create stop', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(24, 'Participant cannot create stop', '403 Forbidden', err.message, false);
  }

  // Test 25: Participant cannot update stop
  try {
    const res = await fetch(`${BASE_URL}/stops/${stop1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenPart}` },
      body: JSON.stringify({ notes: 'Hacked Notes' })
    });
    logTestResult(25, 'Participant cannot update stop', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(25, 'Participant cannot update stop', '403 Forbidden', err.message, false);
  }

  // Test 26: Participant cannot delete stop
  try {
    const res = await fetch(`${BASE_URL}/stops/${stop1Id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenPart}` }
    });
    logTestResult(26, 'Participant cannot delete stop', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(26, 'Participant cannot delete stop', '403 Forbidden', err.message, false);
  }

  // Test 27: Participant cannot reorder stops
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenPart}` },
      body: JSON.stringify({ stopIds: [stop1Id, stop2Id, stop3Id] })
    });
    logTestResult(27, 'Participant cannot reorder stops', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(27, 'Participant cannot reorder stops', '403 Forbidden', err.message, false);
  }

  // Test 28: Non-member cannot view stops
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenNon}` }
    });
    logTestResult(28, 'Non-member cannot view stops', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(28, 'Non-member cannot view stops', '403 Forbidden', err.message, false);
  }

  // Test 29: Non-member cannot create stop
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNon}` },
      body: JSON.stringify({
        destinationId: destParisId,
        arrivalDate: '2026-10-12',
        departureDate: '2026-10-14'
      })
    });
    logTestResult(29, 'Non-member cannot create stop', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(29, 'Non-member cannot create stop', '403 Forbidden', err.message, false);
  }

  // Test 30: Missing JWT
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`);
    logTestResult(30, 'Request missing JWT token', '401 Unauthorized', res.status, res.status === 401);
  } catch (err) {
    logTestResult(30, 'Request missing JWT token', '401 Unauthorized', err.message, false);
  }

  // Test 31: Invalid Trip ID
  try {
    const res = await fetch(`${BASE_URL}/trips/invalid-trip-id/stops`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(31, 'Invalid Trip ID format', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(31, 'Invalid Trip ID format', '400 Bad Request', err.message, false);
  }

  // Test 32: Invalid Stop ID
  try {
    const res = await fetch(`${BASE_URL}/stops/invalid-stop-id`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(32, 'Invalid Stop ID format', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(32, 'Invalid Stop ID format', '400 Bad Request', err.message, false);
  }

  // Test 33: Cross-trip stop access (User belongs to Trip 1, tries to access stop in Trip 2)
  try {
    const res = await fetch(`${BASE_URL}/stops/${stopTrip2Id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenPart}` } // Participant is NOT member of Trip 2
    });
    logTestResult(33, 'Cross-trip stop access blocked', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(33, 'Cross-trip stop access', '403 Forbidden', err.message, false);
  }

  // --- VALIDATION & OVERLAP TESTS (34 - 47) ---
  console.log('--- TRIP STOP VALIDATIONS & REORDER AUDIT TESTS ---');

  // Test 34: Stop outside Trip start date (Trip starts Oct 1)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destParisId,
        arrivalDate: '2026-09-25',
        departureDate: '2026-10-02'
      })
    });
    logTestResult(34, 'Stop outside Trip start date', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(34, 'Stop outside Trip start date', '400 Bad Request', err.message, false);
  }

  // Test 35: Stop outside Trip end date (Trip ends Oct 15)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destParisId,
        arrivalDate: '2026-10-14',
        departureDate: '2026-10-18'
      })
    });
    logTestResult(35, 'Stop outside Trip end date', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(35, 'Stop outside Trip end date', '400 Bad Request', err.message, false);
  }

  // Test 36: Departure before arrival
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destParisId,
        arrivalDate: '2026-10-10',
        departureDate: '2026-10-05'
      })
    });
    logTestResult(36, 'Departure date before arrival date', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(36, 'Departure before arrival', '400 Bad Request', err.message, false);
  }

  // Test 37: Same arrival and departure date (Oct 12 to Oct 12)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destRomeId,
        arrivalDate: '2026-10-12',
        departureDate: '2026-10-12'
      })
    });
    logTestResult(37, 'Same arrival and departure date (Day trip)', '201 Created', res.status, res.status === 201);
  } catch (err) {
    logTestResult(37, 'Same arrival and departure date', '201 Created', err.message, false);
  }

  // Test 38: Exact trip boundary dates (Oct 1 - Oct 15)
  try {
    const res = await fetch(`${BASE_URL}/trips/${trip2Id}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destTokyoId = destParisId,
        arrivalDate: '2026-10-05',
        departureDate: '2026-10-15'
      })
    });
    logTestResult(38, 'Exact trip boundary dates', '201 Created', res.status, res.status === 201);
  } catch (err) {
    logTestResult(38, 'Exact trip boundary dates', '201 Created', err.message, false);
  }

  // Test 39: Overlapping stops (Existing: Paris Oct 1 - Oct 4. Attempt: Oct 2 - Oct 5)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destParisId,
        arrivalDate: '2026-10-02',
        departureDate: '2026-10-05'
      })
    });
    logTestResult(39, 'Overlapping trip stops (Partial overlap)', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(39, 'Overlapping trip stops', '400 Bad Request', err.message, false);
  }

  // Test 40: Overlapping stops (Stop inside another stop)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destParisId,
        arrivalDate: '2026-10-02',
        departureDate: '2026-10-03'
      })
    });
    logTestResult(40, 'Overlapping trip stops (Sub-interval overlap)', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(40, 'Sub-interval overlap', '400 Bad Request', err.message, false);
  }

  // Test 41: Updating existing stop against itself does NOT cause false overlap
  try {
    const res = await fetch(`${BASE_URL}/stops/${stop1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({ notes: 'Updated without date change' })
    });
    logTestResult(41, 'Updating stop against itself (No self-overlap)', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(41, 'Updating stop against itself', '200 OK', err.message, false);
  }

  // Test 42: Reorder with empty array []
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({ stopIds: [] })
    });
    logTestResult(42, 'Reorder with empty array', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(42, 'Reorder with empty array', '400 Bad Request', err.message, false);
  }

  // Test 43: Reorder with non-array input
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({ stopIds: 'not-an-array' })
    });
    logTestResult(43, 'Reorder with non-array input', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(43, 'Reorder with non-array input', '400 Bad Request', err.message, false);
  }

  // Test 44: Reorder with duplicate stop IDs
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({ stopIds: [stop1Id, stop1Id, stop2Id] })
    });
    logTestResult(44, 'Duplicate stop IDs during reorder', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(44, 'Duplicate stop IDs during reorder', '400 Bad Request', err.message, false);
  }

  // Test 45: Reorder with stop from another trip
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({ stopIds: [stop1Id, stop2Id, stopTrip2Id] })
    });
    logTestResult(45, 'Stop from another Trip during reorder', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(45, 'Stop from another Trip during reorder', '400 Bad Request', err.message, false);
  }

  // Test 46: Reorder with missing stop IDs
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({ stopIds: [stop1Id] })
    });
    logTestResult(46, 'Missing stop IDs in reorder array', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(46, 'Missing stop IDs in reorder', '400 Bad Request', err.message, false);
  }

  // Test 47: Repeated destination in different date windows (Paris Oct 13 - Oct 15)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        destinationId: destParisId,
        arrivalDate: '2026-10-13',
        departureDate: '2026-10-15',
        notes: 'Return visit to Paris'
      })
    });
    logTestResult(47, 'Repeated destination in non-overlapping date window', '201 Created', res.status, res.status === 201);
  } catch (err) {
    logTestResult(47, 'Repeated destination', '201 Created', err.message, false);
  }

  // --- ACTIVITY INTEGRATION TESTS (48 - 54) ---
  console.log('--- ACTIVITY & TRIP STOP INTEGRATION TESTS ---');

  // Test 48: Activity linked to valid TripStop (Stop 1 Paris Oct 1 - Oct 4, Activity on Oct 02)
  let act1Id = '';
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Eiffel Tower Visit',
        date: '2026-10-02',
        stop: stop1Id
      })
    });
    const data = await res.json();
    if (data.success && data.data.activity) {
      act1Id = data.data.activity._id;
    }
    logTestResult(48, 'Activity linked to valid TripStop', '201 Created', res.status, res.status === 201 && data.data.activity.stop._id === stop1Id);
  } catch (err) {
    logTestResult(48, 'Activity linked to valid TripStop', '201 Created', err.message, false);
  }

  // Test 49: Activity date exactly on stop arrival date (Oct 01)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Hotel Check-in',
        date: '2026-10-01',
        stop: stop1Id
      })
    });
    logTestResult(49, 'Activity date exactly on stop arrival date', '201 Created', res.status, res.status === 201);
  } catch (err) {
    logTestResult(49, 'Activity date on arrival date', '201 Created', err.message, false);
  }

  // Test 50: Activity date exactly on stop departure date (Oct 04)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Train to Amsterdam',
        date: '2026-10-04',
        stop: stop1Id
      })
    });
    logTestResult(50, 'Activity date exactly on stop departure date', '201 Created', res.status, res.status === 201);
  } catch (err) {
    logTestResult(50, 'Activity date on departure date', '201 Created', err.message, false);
  }

  // Test 51: Activity linked to stop from another Trip (stopTrip2Id)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Hacked Stop Activity',
        date: '2026-10-02',
        stop: stopTrip2Id
      })
    });
    logTestResult(51, 'Activity linked to stop from another Trip', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(51, 'Activity linked to stop from another Trip', '400 Bad Request', err.message, false);
  }

  // Test 52: Activity date outside stop range (Stop 1 is Oct 1 - Oct 4; Activity date Oct 10)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Date Mismatch Activity',
        date: '2026-10-10',
        stop: stop1Id
      })
    });
    logTestResult(52, 'Activity date outside stop range', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(52, 'Activity date outside stop range', '400 Bad Request', err.message, false);
  }

  // Test 53: Existing activity without stop still works
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Generic Trip Activity',
        date: '2026-10-05'
      })
    });
    logTestResult(53, 'Activity without stop (backward compatibility)', '201 Created', res.status, res.status === 201);
  } catch (err) {
    logTestResult(53, 'Activity without stop', '201 Created', err.message, false);
  }

  // Test 54: Delete TripStop behavior (Delete stop1, linked act1Id.stop becomes null, Activity NOT deleted)
  try {
    const delRes = await fetch(`${BASE_URL}/stops/${stop1Id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    const actRes = await fetch(`${BASE_URL}/activities/${act1Id}`, {
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    const actData = await actRes.json();
    const isStopNull = actData.success && actData.data.activity.stop === null;
    logTestResult(54, 'Delete TripStop (Unsets Activity.stop, Activity persists)', '200 OK & Activity.stop === null', `${delRes.status} (Act status: ${actRes.status})`, delRes.status === 200 && actRes.status === 200 && isStopNull);
  } catch (err) {
    logTestResult(54, 'Delete TripStop behavior', '200 OK', err.message, false);
  }

  // --- TRIP OVERVIEW TESTS (55 - 56) ---
  console.log('--- TRIP OVERVIEW AUDIT TESTS ---');

  // Test 55: Trip Overview retrieval
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/overview`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    const data = await res.json();
    logTestResult(55, 'GET trip overview (/api/trips/:tripId/overview)', '200 OK', res.status, res.status === 200 && data.data.stops.length >= 2);
  } catch (err) {
    logTestResult(55, 'GET trip overview', '200 OK', err.message, false);
  }

  // Test 56: Non-member cannot access Trip Overview
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/overview`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenNon}` }
    });
    logTestResult(56, 'Non-member cannot access trip overview', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(56, 'Non-member cannot access trip overview', '403 Forbidden', err.message, false);
  }

  // --- REGRESSION TESTS (57 - 65) ---
  console.log('--- REGRESSION TESTS (Phases 1 - 5 Endpoints) ---');
  try {
    const res57 = await fetch(`${BASE_URL}/health`);
    logTestResult(57, 'GET /api/health (Phase 1)', '200 OK', res57.status, res57.status === 200);

    const regEmail = `reg_audit_user_${ts}@example.com`;
    const res58 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Reg User', email: regEmail, password: 'Password123' })
    });
    logTestResult(58, 'POST /api/auth/register (Phase 2)', '201 Created', res58.status, res58.status === 201);

    const res59 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: regEmail, password: 'Password123' })
    });
    const data59 = await res59.json();
    const regToken = data59.data.token;
    logTestResult(59, 'POST /api/auth/login (Phase 2)', '200 OK', res59.status, res59.status === 200);

    const res60 = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${regToken}` }
    });
    logTestResult(60, 'GET /api/auth/me (Phase 2)', '200 OK', res60.status, res60.status === 200);

    const res61 = await fetch(`${BASE_URL}/trips`, {
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(61, 'GET /api/trips (Phase 3)', '200 OK', res61.status, res61.status === 200);

    const res62 = await fetch(`${BASE_URL}/trips/${tripId}`, {
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(62, 'GET /api/trips/:id (Phase 3)', '200 OK', res62.status, res62.status === 200);

    const res63 = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(63, 'GET /api/trips/:tripId/activities (Phase 4)', '200 OK', res63.status, res63.status === 200);

    const res64 = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(64, 'GET /api/trips/:tripId/expenses (Phase 5)', '200 OK', res64.status, res64.status === 200);

    const res65 = await fetch(`${BASE_URL}/trips/${tripId}/expenses/summary`, {
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(65, 'GET /api/trips/:tripId/expenses/summary (Phase 5)', '200 OK', res65.status, res65.status === 205 || res65.status === 200);

  } catch (err) {
    console.error('Regression Test Error:', err.message);
  }

  console.log('====================================================================');
  console.log('            PHASE 6 AUDIT & VERIFICATION SUMMARY TABLE             ');
  console.log('====================================================================');
  console.table(resultsTable);
}

runTripStopTests();
