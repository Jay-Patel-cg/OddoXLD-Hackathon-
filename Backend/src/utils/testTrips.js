const BASE_URL = 'http://localhost:5000/api';

async function runTripTests() {
  console.log('====================================================================');
  console.log('  MUSAFIR BUDDY - PHASE 3 TRIP MANAGEMENT VERIFICATION SUITE       ');
  console.log('====================================================================\n');

  const ts = Date.now();
  const userAData = {
    name: 'User A Organizer',
    email: `usera_${ts}@example.com`,
    password: 'Password123'
  };

  const userBData = {
    name: 'User B Participant',
    email: `userb_${ts}@example.com`,
    password: 'Password123'
  };

  let tokenA = '';
  let userAId = '';
  let tokenB = '';
  let userBId = '';
  let createdTripId = '';
  let privateTripId = '';

  // Setup: Register User A & User B
  try {
    const resA = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAData)
    });
    const dataA = await resA.json();
    tokenA = dataA.data.token;
    userAId = dataA.data.user.id;

    const resB = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userBData)
    });
    const dataB = await resB.json();
    tokenB = dataB.data.token;
    userBId = dataB.data.user.id;
  } catch (err) {
    console.error('Setup Registration Error:', err.message);
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

  // TEST 1 — Create a trip with User A
  try {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Goa Weekend Getaway',
        description: 'Beach holiday with college friends',
        destination: 'Goa',
        startDate: '2026-09-10',
        endDate: '2026-09-14',
        budget: 25000,
        currency: 'INR'
      })
    });
    const data = await res.json();
    if (data.success && data.data && data.data.trip) {
      createdTripId = data.data.trip._id;
    }
    logTestResult(1, 'Create Trip (User A)', '201 Created', res.status, res.status === 201);
  } catch (err) {
    logTestResult(1, 'Create Trip (User A)', '201 Created', err.message, false);
  }

  // TEST 2 — Get User A's trips
  try {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const data = await res.json();
    const found = data.data && data.data.trips && data.data.trips.some(t => t._id === createdTripId);
    logTestResult(2, "Get User A's Trips", '200 OK (Trip listed)', `${res.status} (Count: ${data.count})`, res.status === 200 && found);
  } catch (err) {
    logTestResult(2, "Get User A's Trips", '200 OK', err.message, false);
  }

  // TEST 3 — Get created trip by ID as User A
  try {
    const res = await fetch(`${BASE_URL}/trips/${createdTripId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const data = await res.json();
    logTestResult(3, 'Get Trip by ID (User A)', '200 OK', res.status, res.status === 200 && data.data.trip._id === createdTripId);
  } catch (err) {
    logTestResult(3, 'Get Trip by ID (User A)', '200 OK', err.message, false);
  }

  // TEST 4 — Update trip as organizer (User A)
  try {
    const res = await fetch(`${BASE_URL}/trips/${createdTripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Goa Grand Beach Trip',
        budget: 30000
      })
    });
    const data = await res.json();
    logTestResult(4, 'Update Trip as Organizer (User A)', '200 OK', res.status, res.status === 200 && data.data.trip.title === 'Goa Grand Beach Trip');
  } catch (err) {
    logTestResult(4, 'Update Trip as Organizer (User A)', '200 OK', err.message, false);
  }

  // TEST 5 — User B attempts to access User A's trip (Not a participant yet)
  try {
    const res = await fetch(`${BASE_URL}/trips/${createdTripId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    logTestResult(5, "User B accesses User A's trip (Non-participant)", '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(5, "User B accesses User A's trip", '403 Forbidden', err.message, false);
  }

  // TEST 6 — Add User B as participant to trip & verify User B can list trip
  try {
    // User A adds User B to participants
    const updateRes = await fetch(`${BASE_URL}/trips/${createdTripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        participants: [userBId]
      })
    });
    await updateRes.json();

    // User B fetches their trips
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const data = await res.json();
    const found = data.data && data.data.trips && data.data.trips.some(t => t._id === createdTripId);
    logTestResult(6, 'Add User B as Participant & List Trips as User B', '200 OK (Includes trip)', `${res.status} (Count: ${data.count})`, res.status === 200 && found);
  } catch (err) {
    logTestResult(6, 'Add User B as Participant', '200 OK', err.message, false);
  }

  // TEST 7 — User B fetches trip by ID as participant
  try {
    const res = await fetch(`${BASE_URL}/trips/${createdTripId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    logTestResult(7, 'Get Trip by ID as Participant (User B)', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(7, 'Get Trip by ID as Participant (User B)', '200 OK', err.message, false);
  }

  // TEST 8 — User B attempts to update trip as participant
  try {
    const res = await fetch(`${BASE_URL}/trips/${createdTripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        title: 'Hacked Title by Participant'
      })
    });
    logTestResult(8, 'Update Trip as Participant (User B)', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(8, 'Update Trip as Participant (User B)', '403 Forbidden', err.message, false);
  }

  // TEST 9 — User B attempts to delete trip as participant
  try {
    const res = await fetch(`${BASE_URL}/trips/${createdTripId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    logTestResult(9, 'Delete Trip as Participant (User B)', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(9, 'Delete Trip as Participant (User B)', '403 Forbidden', err.message, false);
  }

  // TEST 10 — Organizer (User A) deletes trip
  try {
    const res = await fetch(`${BASE_URL}/trips/${createdTripId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    logTestResult(10, 'Delete Trip as Organizer (User A)', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(10, 'Delete Trip as Organizer (User A)', '200 OK', err.message, false);
  }

  // TEST 11 — Try to access deleted trip
  try {
    const res = await fetch(`${BASE_URL}/trips/${createdTripId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    logTestResult(11, 'Get Deleted Trip by ID', '404 Not Found', res.status, res.status === 404);
  } catch (err) {
    logTestResult(11, 'Get Deleted Trip by ID', '404 Not Found', err.message, false);
  }

  // TEST 12 — Create trip with endDate < startDate
  try {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Invalid Dates Trip',
        destination: 'Manali',
        startDate: '2026-10-10',
        endDate: '2026-10-05',
        budget: 10000
      })
    });
    logTestResult(12, 'Create Trip with Invalid Date Range (endDate < startDate)', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(12, 'Create Trip with Invalid Date Range', '400 Bad Request', err.message, false);
  }

  // TEST 13 — Create trip with negative budget
  try {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Negative Budget Trip',
        destination: 'Dubai',
        startDate: '2026-11-01',
        endDate: '2026-11-05',
        budget: -5000
      })
    });
    logTestResult(13, 'Create Trip with Negative Budget', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(13, 'Create Trip with Negative Budget', '400 Bad Request', err.message, false);
  }

  // TEST 14 — Try creating trip without JWT token
  try {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'No Token Trip',
        destination: 'Paris',
        startDate: '2026-12-01',
        endDate: '2026-12-10'
      })
    });
    logTestResult(14, 'Create Trip without JWT Token', '401 Unauthorized', res.status, res.status === 401);
  } catch (err) {
    logTestResult(14, 'Create Trip without JWT Token', '401 Unauthorized', err.message, false);
  }

  // Setup for TEST 15: Create a new private trip by User A without User B as participant
  try {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'User A Private Trip',
        destination: 'Tokyo',
        startDate: '2027-01-10',
        endDate: '2027-01-20',
        budget: 150000
      })
    });
    const data = await res.json();
    privateTripId = data.data.trip._id;
  } catch (err) {
    console.error('Test 15 Setup Error:', err.message);
  }

  // TEST 15 — Try accessing another user's private trip
  try {
    const res = await fetch(`${BASE_URL}/trips/${privateTripId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    logTestResult(15, "Access another user's private trip (User B)", '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(15, "Access another user's private trip", '403 Forbidden', err.message, false);
  }

  // REGRESSION TESTS
  console.log('--- REGRESSION TESTS (Phase 1 & Phase 2 Endpoints) ---');
  try {
    const resH = await fetch(`${BASE_URL}/health`);
    logTestResult('R1', 'GET /api/health', '200 OK', resH.status, resH.status === 200);

    const resMe = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    logTestResult('R2', 'GET /api/auth/me', '200 OK', resMe.status, resMe.status === 200);
  } catch (err) {
    console.error('Regression Test Error:', err.message);
  }

  console.log('====================================================================');
  console.log('                  PHASE 3 TEST SUMMARY TABLE                        ');
  console.log('====================================================================');
  console.table(resultsTable);
}

runTripTests();
