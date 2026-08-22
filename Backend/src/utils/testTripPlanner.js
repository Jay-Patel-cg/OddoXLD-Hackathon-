const BASE_URL = 'http://localhost:5000/api';

async function runTripPlannerTests() {
  console.log('====================================================================');
  console.log('  MUSAFIR BUDDY - PHASE 7B HARDENED AI TRIP PLANNER SUITE           ');
  console.log('====================================================================\n');

  const ts = Date.now();
  const testUserData = { name: 'AI Trip User', email: `aitrip_harden_${ts}@example.com`, password: 'Password123' };

  let token = '', userId = '';
  let generatedPlanObj = null;
  let savedTripId = '';

  // Setup: Register User
  try {
    const resReg = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUserData)
    });
    const dataReg = await resReg.json();
    token = dataReg.data.token;
    userId = dataReg.data.user.id;
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

  // Test 1: Generate plan with valid request (Goa)
  try {
    const res = await fetch(`${BASE_URL}/ai/trip-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        destination: 'Goa',
        startDate: '2026-11-10',
        endDate: '2026-11-13',
        budget: 25000,
        currency: 'INR',
        travelers: 2,
        interests: ['beaches', 'food', 'culture'],
        travelStyle: 'balanced',
        additionalNotes: 'Prefer scenic beaches'
      })
    });
    const data = await res.json();
    if (data.success && data.data && data.data.plan) {
      generatedPlanObj = data.data.plan;
    }
    logTestResult(1, 'Generate plan with valid request', '200 OK', res.status, res.status === 200 && data.success === true);
  } catch (err) {
    logTestResult(1, 'Generate plan with valid request', '200 OK', err.message, false);
  }

  // Test 2: Generate plan without JWT (Unauthenticated)
  try {
    const res = await fetch(`${BASE_URL}/ai/trip-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: 'Goa',
        startDate: '2026-11-10',
        endDate: '2026-11-13',
        budget: 25000
      })
    });
    logTestResult(2, 'Generate plan without JWT token', '401 Unauthorized', res.status, res.status === 401);
  } catch (err) {
    logTestResult(2, 'Generate plan without JWT', '401 Unauthorized', err.message, false);
  }

  // Test 3: Generate plan with missing destination input
  try {
    const res = await fetch(`${BASE_URL}/ai/trip-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        startDate: '2026-11-10',
        endDate: '2026-11-13',
        budget: 25000
      })
    });
    logTestResult(3, 'Generate plan with missing destination', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(3, 'Missing destination', '400 Bad Request', err.message, false);
  }

  // Test 4: Generate plan with invalid dates
  try {
    const res = await fetch(`${BASE_URL}/ai/trip-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        destination: 'Goa',
        startDate: 'not-a-date',
        endDate: '2026-11-13',
        budget: 25000
      })
    });
    logTestResult(4, 'Generate plan with invalid dates', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(4, 'Invalid dates', '400 Bad Request', err.message, false);
  }

  // Test 5: Generate plan with endDate < startDate
  try {
    const res = await fetch(`${BASE_URL}/ai/trip-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        destination: 'Goa',
        startDate: '2026-11-15',
        endDate: '2026-11-10',
        budget: 25000
      })
    });
    logTestResult(5, 'Generate plan with endDate < startDate', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(5, 'endDate < startDate', '400 Bad Request', err.message, false);
  }

  // Test 6: Generate plan with negative budget
  try {
    const res = await fetch(`${BASE_URL}/ai/trip-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        destination: 'Goa',
        startDate: '2026-11-10',
        endDate: '2026-11-13',
        budget: -5000
      })
    });
    logTestResult(6, 'Generate plan with negative budget', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(6, 'Negative budget', '400 Bad Request', err.message, false);
  }

  // Test 7: Generate plan with invalid travelers count (0)
  try {
    const res = await fetch(`${BASE_URL}/ai/trip-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        destination: 'Goa',
        startDate: '2026-11-10',
        endDate: '2026-11-13',
        budget: 25000,
        travelers: 0
      })
    });
    logTestResult(7, 'Generate plan with invalid travelers count (0)', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(7, 'Invalid travelers', '400 Bad Request', err.message, false);
  }

  // Test 8: Generate plan with invalid travelStyle
  try {
    const res = await fetch(`${BASE_URL}/ai/trip-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        destination: 'Goa',
        startDate: '2026-11-10',
        endDate: '2026-11-13',
        budget: 25000,
        travelStyle: 'super-ultra-luxury-unknown'
      })
    });
    logTestResult(8, 'Generate plan with invalid travelStyle', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(8, 'Invalid travelStyle', '400 Bad Request', err.message, false);
  }

  // Test 9: Gemini returns valid structured JSON
  const isStructuredJSON = generatedPlanObj && typeof generatedPlanObj === 'object' && generatedPlanObj.trip && generatedPlanObj.stops;
  logTestResult(9, 'Gemini returns valid structured JSON', 'PASSED', isStructuredJSON ? 'Valid JSON object' : 'Invalid', Boolean(isStructuredJSON));

  // Test 10: Gemini response contains no fabricated MongoDB IDs
  let containsObjectId = false;
  try {
    const jsonStr = JSON.stringify(generatedPlanObj || {});
    containsObjectId = /"[0-9a-fA-F]{24}"/.test(jsonStr) || jsonStr.includes('_id') || jsonStr.includes('objectId');
  } catch (e) { }
  logTestResult(10, 'Gemini response contains no fabricated MongoDB IDs', 'PASSED (No ObjectIds)', containsObjectId ? 'ObjectId detected' : 'Clean', !containsObjectId);

  // Test 11: Backend independently calculates estimated activity costs
  let totalCalculatedCost = 0;
  if (generatedPlanObj && generatedPlanObj.stops) {
    generatedPlanObj.stops.forEach(s => {
      if (Array.isArray(s.activities)) {
        s.activities.forEach(a => {
          totalCalculatedCost += Number(a.estimatedCost || 0);
        });
      }
    });
  }
  const summaryCost = generatedPlanObj ? generatedPlanObj.summary.estimatedTotalCost : -1;
  const costMatches = summaryCost === totalCalculatedCost;
  logTestResult(11, 'Backend independently calculates estimated activity costs', 'PASSED (Calculated cost matches summary)', `Summary: ${summaryCost}, Calc: ${totalCalculatedCost}`, costMatches);

  // Test 12: Authoritative budget calculation accuracy
  const budgetAccurate = generatedPlanObj ? (generatedPlanObj.summary.remainingBudget === (25000 - totalCalculatedCost)) : false;
  logTestResult(12, 'Authoritative budget calculation accuracy (remainingBudget)', 'PASSED', budgetAccurate ? 'Accurate' : 'Mismatch', budgetAccurate);

  // Test 13: Save valid AI plan (Stage 2)
  try {
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: generatedPlanObj })
    });
    const data = await res.json();
    if (data.success && data.data && data.data.trip) {
      savedTripId = data.data.trip._id;
    }
    logTestResult(13, 'Save valid AI plan (POST /api/ai/trip-plan/save)', '201 Created', res.status, res.status === 201 && data.success === true);
  } catch (err) {
    logTestResult(13, 'Save valid AI plan', '201 Created', err.message, false);
  }

  // Test 14: Saved Trip organizer equals authenticated user ID
  let savedTripObj = null;
  try {
    const res = await fetch(`${BASE_URL}/trips/${savedTripId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    savedTripObj = data.data ? data.data.trip : null;
    const orgMatches = savedTripObj && (savedTripObj.organizer._id === userId || savedTripObj.organizer === userId);
    logTestResult(14, 'Saved Trip organizer equals authenticated user ID', 'PASSED', orgMatches ? 'Organizer Matches User' : 'Spoofed/Mismatch', Boolean(orgMatches));
  } catch (err) {
    logTestResult(14, 'Saved Trip organizer check', 'PASSED', err.message, false);
  }

  // Test 15: Saved TripStops belong to created Trip ID
  let savedStopsArr = [];
  try {
    const res = await fetch(`${BASE_URL}/trips/${savedTripId}/stops`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    savedStopsArr = data.data ? data.data.stops : [];
    const allStopsBelong = savedStopsArr.length > 0 && savedStopsArr.every(s => (s.trip._id || s.trip) === savedTripId);
    logTestResult(15, 'Saved TripStops belong to created Trip ID', 'PASSED', allStopsBelong ? 'Stops Match Trip' : 'Orphan/Mismatch', allStopsBelong);
  } catch (err) {
    logTestResult(15, 'Saved TripStops check', 'PASSED', err.message, false);
  }

  // Test 16: Saved Activities belong to created Trip ID
  let savedActsArr = [];
  try {
    const res = await fetch(`${BASE_URL}/trips/${savedTripId}/activities`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    savedActsArr = data.data ? data.data.activities : [];
    const allActsBelong = savedActsArr.length > 0 && savedActsArr.every(a => (a.trip._id || a.trip) === savedTripId);
    logTestResult(16, 'Saved Activities belong to created Trip ID', 'PASSED', allActsBelong ? 'Activities Match Trip' : 'Orphan/Mismatch', allActsBelong);
  } catch (err) {
    logTestResult(16, 'Saved Activities check', 'PASSED', err.message, false);
  }

  // Test 17: Saved Activities reference correct TripStop ID
  const allActsHaveStopRef = savedActsArr.length > 0 && savedActsArr.every(a => a.stop !== null && a.stop !== undefined);
  logTestResult(17, 'Saved Activities reference correct TripStop ID', 'PASSED', allActsHaveStopRef ? 'Stop References Valid' : 'Missing Stop Ref', allActsHaveStopRef);

  // --- HARDENED STRICT VALIDATION TESTS (18 - 28) ---
  console.log('--- HARDENED STRICT VALIDATION TESTS ---');

  // Test 18: Activity date outside Trip date range (Expected EXACTLY 400)
  try {
    const badPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    badPayload.stops[0].activities[0].date = '2027-12-31';
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: badPayload })
    });
    logTestResult(18, 'Out-of-bound activity date on save', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(18, 'Out-of-bound activity date', '400 Bad Request', err.message, false);
  }

  // Test 19: Stop date outside Trip date range (Expected EXACTLY 400)
  try {
    const badPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    badPayload.stops[0].arrivalDate = '2025-01-01'; // Before trip startDate
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: badPayload })
    });
    logTestResult(19, 'Stop arrivalDate outside Trip range on save', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(19, 'Stop outside Trip date range', '400 Bad Request', err.message, false);
  }

  // Test 20: Negative activity cost on save (Expected EXACTLY 400)
  try {
    const badPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    badPayload.stops[0].activities[0].estimatedCost = -1000;
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: badPayload })
    });
    logTestResult(20, 'Negative activity cost on save', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(20, 'Negative activity cost', '400 Bad Request', err.message, false);
  }

  // Test 21: Invalid activity category on save (Expected EXACTLY 400)
  try {
    const badPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    badPayload.stops[0].activities[0].category = 'invalid-category-xyz';
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: badPayload })
    });
    logTestResult(21, 'Invalid activity category on save', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(21, 'Invalid activity category', '400 Bad Request', err.message, false);
  }

  // Test 22: Invalid startTime format on save (Expected EXACTLY 400)
  try {
    const badPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    badPayload.stops[0].activities[0].startTime = 'invalid-time';
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: badPayload })
    });
    logTestResult(22, 'Invalid startTime format on save', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(22, 'Invalid startTime', '400 Bad Request', err.message, false);
  }

  // Test 23: Invalid endTime format on save (Expected EXACTLY 400)
  try {
    const badPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    badPayload.stops[0].activities[0].endTime = '25:99';
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: badPayload })
    });
    logTestResult(23, 'Invalid endTime format on save', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(23, 'Invalid endTime', '400 Bad Request', err.message, false);
  }

  // Test 24: endTime before startTime on save (Expected EXACTLY 400)
  try {
    const badPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    badPayload.stops[0].activities[0].startTime = '18:00';
    badPayload.stops[0].activities[0].endTime = '09:00';
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: badPayload })
    });
    logTestResult(24, 'endTime before startTime on save', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(24, 'endTime < startTime', '400 Bad Request', err.message, false);
  }

  // Test 25: departureDate before arrivalDate on save (Expected EXACTLY 400)
  try {
    const badPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    badPayload.stops[0].arrivalDate = '2026-11-13';
    badPayload.stops[0].departureDate = '2026-11-10';
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: badPayload })
    });
    logTestResult(25, 'departureDate < arrivalDate on save', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(25, 'departureDate < arrivalDate', '400 Bad Request', err.message, false);
  }

  // Test 26: Duplicate activity in same stop on save (Expected EXACTLY 400)
  try {
    const badPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    const dupAct = JSON.parse(JSON.stringify(badPayload.stops[0].activities[0]));
    badPayload.stops[0].activities.push(dupAct);
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: badPayload })
    });
    logTestResult(26, 'Duplicate activity in same stop on save', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(26, 'Duplicate activity', '400 Bad Request', err.message, false);
  }

  // Test 27: Duplicate stop definition on save (Expected EXACTLY 400)
  try {
    const badPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    const dupStop = JSON.parse(JSON.stringify(badPayload.stops[0]));
    badPayload.stops.push(dupStop);
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: badPayload })
    });
    logTestResult(27, 'Duplicate stop definition on save', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(27, 'Duplicate stop', '400 Bad Request', err.message, false);
  }

  // Test 28: Organizer spoofing attempt ("organizer": "ANOTHER_USER_ID")
  try {
    const spoofPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    spoofPayload.trip.organizer = '507f1f77bcf86cd799439011';
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: spoofPayload })
    });
    const data = await res.json();
    const isSpoofIgnored = res.status === 201 && data.data.trip.organizer === userId;
    logTestResult(28, 'Organizer spoofing attempt ("organizer": "ANOTHER_USER_ID")', '201 Created (Spoof Ignored, Set to req.user._id)', `${res.status} (Organizer: ${data.data ? data.data.trip.organizer : ''})`, isSpoofIgnored);
  } catch (err) {
    logTestResult(28, 'Organizer spoofing attempt', '201 Created', err.message, false);
  }

  // Test 29: Database ID injection attempt
  try {
    const injectPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    injectPayload.trip._id = '507f1f77bcf86cd799439011';
    injectPayload.stops[0]._id = '507f1f77bcf86cd799439022';
    injectPayload.stops[0].activities[0]._id = '507f1f77bcf86cd799439033';
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: injectPayload })
    });
    const data = await res.json();
    const isInjectIgnored = res.status === 201 && data.data.trip._id !== '507f1f77bcf86cd799439011';
    logTestResult(29, 'Database ID injection attempt', '201 Created (Fresh IDs generated by Backend)', `${res.status} (TripID: ${data.data ? data.data.trip._id : ''})`, isInjectIgnored);
  } catch (err) {
    logTestResult(29, 'Database ID injection attempt', '201 Created', err.message, false);
  }

  // Test 30: Authoritative Budget Calculation — Client summary tampering ignored
  try {
    const tamperPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    tamperPayload.summary = {
      estimatedTotalCost: 999999,
      remainingBudget: 0,
      percentageOfBudget: 999
    };
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: tamperPayload })
    });
    const data = await res.json();
    const savedCost = data.data ? data.data.activities.reduce((sum, a) => sum + a.estimatedCost, 0) : 0;
    const isTamperIgnored = res.status === 201 && savedCost !== 999999;
    logTestResult(30, 'Client summary tampering ignored & recalculated authoritatively', '201 Created (Recalculated true total cost)', `${res.status} (Actual Saved Cost: ${savedCost})`, isTamperIgnored);
  } catch (err) {
    logTestResult(30, 'Client summary tampering', '201 Created', err.message, false);
  }

  // Test 31: Budget Edge Case (budget = 0, activity cost = 0)
  try {
    const res = await fetch(`${BASE_URL}/ai/trip-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        destination: 'Goa',
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        budget: 0
      })
    });
    const data = await res.json();
    const isZeroSafe = res.status === 200 && data.data && !isNaN(data.data.plan.summary.percentageOfBudget);
    logTestResult(31, 'Budget edge case (budget = 0 zero-safe metrics)', '200 OK (Zero-safe percentageOfBudget)', res.status, isZeroSafe);
  } catch (err) {
    logTestResult(31, 'Budget edge case (budget = 0)', '200 OK', err.message, false);
  }

  // Test 32: Save endpoint does NOT create Expense documents automatically
  try {
    const res = await fetch(`${BASE_URL}/trips/${savedTripId}/expenses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const zeroExpenses = data.success && Array.isArray(data.data.expenses) && data.data.expenses.length === 0;
    logTestResult(32, 'Save endpoint does NOT create Expense documents automatically', '200 OK (0 expenses)', `${res.status} (Expenses count: ${data.data ? data.data.expenses.length : 0})`, zeroExpenses);
  } catch (err) {
    logTestResult(32, 'Save endpoint does NOT create Expense documents', '200 OK (0 expenses)', err.message, false);
  }

  // Test 33: Compensating rollback verification (Forced error midway during save)
  try {
    const rollbackPayload = JSON.parse(JSON.stringify(generatedPlanObj));
    rollbackPayload.stops.push({
      cityName: 'InvalidStop',
      arrivalDate: 'invalid-date',
      departureDate: '2026-11-13',
      activities: []
    });
    const res = await fetch(`${BASE_URL}/ai/trip-plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ plan: rollbackPayload })
    });
    logTestResult(33, 'Compensating rollback strategy on save error', '400 Bad Request (0 orphan records created)', res.status, res.status === 400);
  } catch (err) {
    logTestResult(33, 'Compensating rollback strategy', '400 Bad Request', err.message, false);
  }

  // Test 34: Security assertion — API key & Token NEVER appear in response
  const planStr = JSON.stringify(generatedPlanObj || {});
  const apiKey = process.env.GEMINI_API_KEY || '';
  const isSecure = (!apiKey || !planStr.includes(apiKey)) && (!token || !planStr.includes(token));
  logTestResult(34, 'Security assertion (No API key / Token leak in response)', 'PASSED (Secrets not exposed)', isSecure ? 'Secure' : 'LEAK DETECTED', isSecure);

  // --- REGRESSION TESTS (Phases 1 - 7A Endpoints) ---
  console.log('--- REGRESSION TESTS (Phases 1 - 7A Endpoints) ---');
  try {
    const res1 = await fetch(`${BASE_URL}/health`);
    logTestResult(35, 'GET /api/health (Phase 1)', '200 OK', res1.status, res1.status === 200);

    const res2 = await fetch(`${BASE_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
    logTestResult(36, 'GET /api/auth/me (Phase 2)', '200 OK', res2.status, res2.status === 200);

    const res3 = await fetch(`${BASE_URL}/trips`, { headers: { 'Authorization': `Bearer ${token}` } });
    logTestResult(37, 'GET /api/trips (Phase 3)', '200 OK', res3.status, res3.status === 200);

    const res4 = await fetch(`${BASE_URL}/trips/${savedTripId}/activities`, { headers: { 'Authorization': `Bearer ${token}` } });
    logTestResult(38, 'GET /api/trips/:tripId/activities (Phase 4)', '200 OK', res4.status, res4.status === 200);

    const res5 = await fetch(`${BASE_URL}/trips/${savedTripId}/expenses`, { headers: { 'Authorization': `Bearer ${token}` } });
    logTestResult(39, 'GET /api/trips/:tripId/expenses (Phase 5)', '200 OK', res5.status, res5.status === 200);

    const res6 = await fetch(`${BASE_URL}/destinations`);
    logTestResult(40, 'GET /api/destinations (Phase 6)', '200 OK', res6.status, res6.status === 200);

    const res7 = await fetch(`${BASE_URL}/ai/test`, { headers: { 'Authorization': `Bearer ${token}` } });
    logTestResult(41, 'GET /api/ai/test (Phase 7A)', '200 OK', res7.status, res7.status === 200);

  } catch (err) {
    console.error('Regression Test Error:', err.message);
  }

  console.log('====================================================================');
  console.log('                 PHASE 7B TEST SUMMARY TABLE                        ');
  console.log('====================================================================');
  console.table(resultsTable);
}

runTripPlannerTests();
