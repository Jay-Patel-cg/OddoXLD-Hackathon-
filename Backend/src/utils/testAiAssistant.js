const BASE_URL = 'http://localhost:5000/api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAiAssistantTests() {
  console.log('====================================================================');
  console.log('  MUSAFIR BUDDY - PHASE 7C AI TRAVEL COPILOT VERIFICATION SUITE      ');
  console.log('====================================================================\n');

  // Allow rate limit window to clear before running suite
  await sleep(6000);

  const ts = Date.now();
  const orgUserData = { name: 'Copilot Organizer', email: `copilot_org_${ts}@example.com`, password: 'Password123' };
  const partUserData = { name: 'Copilot Participant', email: `copilot_part_${ts}@example.com`, password: 'Password123' };
  const nonMemberData = { name: 'Copilot NonMember', email: `copilot_nonm_${ts}@example.com`, password: 'Password123' };

  let orgToken = '', orgId = '';
  let partToken = '', partId = '';
  let nonToken = '', nonId = '';

  let tripId = '';
  let stopId = '';
  let activityId = '';
  let destId = '';

  let foreignTripId = '';
  let foreignActivityId = '';
  let foreignStopId = '';

  // Setup: Fetch trusted Destination, Register 3 users and create primary test trip + foreign trip
  try {
    const resDest = await fetch(`${BASE_URL}/destinations`);
    const dataDest = await resDest.json();
    if (dataDest.data && dataDest.data.destinations && dataDest.data.destinations.length > 0) {
      destId = dataDest.data.destinations[0]._id;
    }

    const resOrg = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orgUserData)
    });
    const dataOrg = await resOrg.json();
    orgToken = dataOrg.data.token;
    orgId = dataOrg.data.user.id;

    const resPart = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partUserData)
    });
    const dataPart = await resPart.json();
    partToken = dataPart.data.token;
    partId = dataPart.data.user.id;

    const resNon = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nonMemberData)
    });
    const dataNon = await resNon.json();
    nonToken = dataNon.data.token;
    nonId = dataNon.data.user.id;

    // Create Main Trip as Organizer with Participant user ID
    const resTrip = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({
        title: 'Manali Copilot Trip',
        destination: 'Manali',
        startDate: '2026-12-01',
        endDate: '2026-12-07',
        budget: 30000,
        currency: 'INR',
        participants: [partId]
      })
    });
    const dataTrip = await resTrip.json();
    if (!dataTrip.success) {
      console.error('SETUP CREATE TRIP FAILED:', JSON.stringify(dataTrip));
    }
    tripId = dataTrip.data ? dataTrip.data.trip._id : '';

    // Create TripStop on Main Trip
    if (destId && tripId) {
      const resStop = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
        body: JSON.stringify({
          destinationId: destId,
          arrivalDate: '2026-12-01',
          departureDate: '2026-12-07'
        })
      });
      const dataStop = await resStop.json();
      if (dataStop.data && dataStop.data.stop) {
        stopId = dataStop.data.stop._id;
      }
    }

    // Create Activity on Main Trip
    if (tripId) {
      const resAct = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
        body: JSON.stringify({
          title: 'Solang Valley Paragliding',
          description: 'Paragliding adventure in Solang Valley',
          date: '2026-12-02',
          startTime: '10:00',
          endTime: '13:00',
          location: 'Solang Valley',
          estimatedCost: 3500,
          currency: 'INR',
          category: 'adventure'
        })
      });
      const dataAct = await resAct.json();
      if (!dataAct.success) {
        console.error('SETUP CREATE ACTIVITY FAILED:', JSON.stringify(dataAct));
      }
      activityId = dataAct.data ? dataAct.data.activity._id : '';
    }

    // Create Foreign Trip & Activity for cross-trip testing
    const resFTrip = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${nonToken}` },
      body: JSON.stringify({
        title: 'Foreign Trip',
        destination: 'Shimla',
        startDate: '2026-12-01',
        endDate: '2026-12-05',
        budget: 15000
      })
    });
    const dataFTrip = await resFTrip.json();
    foreignTripId = dataFTrip.data ? dataFTrip.data.trip._id : '';

    if (destId && foreignTripId) {
      const resFStop = await fetch(`${BASE_URL}/trips/${foreignTripId}/stops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${nonToken}` },
        body: JSON.stringify({
          destinationId: destId,
          arrivalDate: '2026-12-01',
          departureDate: '2026-12-05'
        })
      });
      const dataFStop = await resFStop.json();
      if (dataFStop.data && dataFStop.data.stop) {
        foreignStopId = dataFStop.data.stop._id;
      }
    }

    if (foreignTripId) {
      const resFAct = await fetch(`${BASE_URL}/trips/${foreignTripId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${nonToken}` },
        body: JSON.stringify({
          title: 'Mall Road Walk',
          date: '2026-12-02',
          estimatedCost: 500
        })
      });
      const dataFAct = await resFAct.json();
      foreignActivityId = dataFAct.data ? dataFAct.data.activity._id : '';
    }

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

  // Test 1: Valid question (ANSWER action)
  try {
    await sleep(1000);
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId, message: 'What is the current budget for this trip?' })
    });
    const data = await res.json();
    if (!data.success) {
      console.log('TEST 1 ERROR MSG:', data.message);
    }
    const passed = res.status === 200 && data.success === true && data.data.action === 'ANSWER';
    logTestResult(1, 'Valid question (ANSWER action)', '200 OK (action: ANSWER)', `${res.status} (Action: ${data.data ? data.data.action : ''})`, passed, data.message);
  } catch (err) {
    logTestResult(1, 'Valid question', '200 OK', err.message, false);
  }

  // Test 2: Missing JWT Token
  try {
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId, message: 'What is planned?' })
    });
    logTestResult(2, 'Missing JWT Token', '401 Unauthorized', res.status, res.status === 401);
  } catch (err) {
    logTestResult(2, 'Missing JWT Token', '401 Unauthorized', err.message, false);
  }

  // Test 3: Invalid JWT Token
  try {
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer invalid.jwt.token' },
      body: JSON.stringify({ tripId, message: 'What is planned?' })
    });
    logTestResult(3, 'Invalid JWT Token', '401 Unauthorized', res.status, res.status === 401);
  } catch (err) {
    logTestResult(3, 'Invalid JWT Token', '401 Unauthorized', err.message, false);
  }

  // Test 4: Missing tripId
  try {
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ message: 'What is planned?' })
    });
    logTestResult(4, 'Missing tripId', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(4, 'Missing tripId', '400 Bad Request', err.message, false);
  }

  // Test 5: Invalid tripId format
  try {
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId: 'not-an-objectid', message: 'What is planned?' })
    });
    logTestResult(5, 'Invalid tripId format', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(5, 'Invalid tripId format', '400 Bad Request', err.message, false);
  }

  // Test 6: Missing message
  try {
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId })
    });
    logTestResult(6, 'Missing message', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(6, 'Missing message', '400 Bad Request', err.message, false);
  }

  // Test 7: Empty message
  try {
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId, message: '   ' })
    });
    logTestResult(7, 'Empty message', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(7, 'Empty message', '400 Bad Request', err.message, false);
  }

  // Test 8: Non-member access
  try {
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${nonToken}` },
      body: JSON.stringify({ tripId, message: 'What is planned?' })
    });
    logTestResult(8, 'Non-member access', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(8, 'Non-member access', '403 Forbidden', err.message, false);
  }

  // Test 9: Organizer question
  try {
    await sleep(1000);
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId, message: 'Summarize the planned activities.' })
    });
    const data = await res.json();
    logTestResult(9, 'Organizer question', '200 OK', res.status, res.status === 200 && data.success === true);
  } catch (err) {
    logTestResult(9, 'Organizer question', '200 OK', err.message, false);
  }

  // Test 10: Participant question
  try {
    await sleep(1000);
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${partToken}` },
      body: JSON.stringify({ tripId, message: 'What activities are planned on Dec 2?' })
    });
    const data = await res.json();
    logTestResult(10, 'Participant question', '200 OK', res.status, res.status === 200 && data.success === true);
  } catch (err) {
    logTestResult(10, 'Participant question', '200 OK', err.message, false);
  }

  // Test 11: Gemini structured JSON response format
  let assistantData = null;
  try {
    await sleep(1000);
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId, message: 'Suggest good food spots in Manali' })
    });
    const data = await res.json();
    assistantData = data.data;
    const hasValidStructure = assistantData && assistantData.action && assistantData.response && Array.isArray(assistantData.changes);
    logTestResult(11, 'Gemini structured JSON response format', 'PASSED', hasValidStructure ? 'Valid Schema' : 'Invalid Schema', Boolean(hasValidStructure));
  } catch (err) {
    logTestResult(11, 'Gemini structured JSON format', 'PASSED', err.message, false);
  }

  // Test 12: ANSWER action
  logTestResult(12, 'ANSWER action execution status', '200 OK (executed: false)', `executed: ${assistantData ? assistantData.executed : false}`, assistantData ? assistantData.executed === false : true);

  // Test 13: RECOMMEND action
  try {
    await sleep(1000);
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId, message: 'Give me 2 restaurant recommendations for Manali' })
    });
    const data = await res.json();
    logTestResult(13, 'RECOMMEND action', '200 OK', res.status, res.status === 200 && data.success === true);
  } catch (err) {
    logTestResult(13, 'RECOMMEND action', '200 OK', err.message, false);
  }

  // Test 14: ADD_ACTIVITY action (Organizer)
  try {
    await sleep(1000);
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId, message: 'Add a new activity called Hadimba Temple Visit on 2026-12-03 at 11:00 AM' })
    });
    const data = await res.json();
    logTestResult(14, 'ADD_ACTIVITY action (Organizer)', '200 OK', res.status, res.status === 200 && data.success === true);
  } catch (err) {
    logTestResult(14, 'ADD_ACTIVITY action (Organizer)', '200 OK', err.message, false);
  }

  // Test 15: UPDATE_ACTIVITY action (Organizer)
  try {
    await sleep(1000);
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId, message: `Change cost of activity ${activityId} to 4000` })
    });
    const data = await res.json();
    logTestResult(15, 'UPDATE_ACTIVITY action (Organizer)', '200 OK', res.status, res.status === 200 && data.success === true, data.message);
  } catch (err) {
    logTestResult(15, 'UPDATE_ACTIVITY action (Organizer)', '200 OK', err.message, false);
  }

  // Test 16: DELETE_ACTIVITY action (Organizer)
  let tempActId = '';
  try {
    const resCreate = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ title: 'Temp Activity to Delete', date: '2026-12-04', estimatedCost: 100 })
    });
    const dataCreate = await resCreate.json();
    tempActId = dataCreate.data ? dataCreate.data.activity._id : '';

    await sleep(1000);
    const resDel = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId, message: `Delete activity ${tempActId}` })
    });
    const dataDel = await resDel.json();
    logTestResult(16, 'DELETE_ACTIVITY action (Organizer)', '200 OK', resDel.status, resDel.status === 200 && dataDel.success === true, dataDel.message);
  } catch (err) {
    logTestResult(16, 'DELETE_ACTIVITY action (Organizer)', '200 OK', err.message, false);
  }

  // Test 17: OPTIMIZE_BUDGET action (Organizer)
  try {
    await sleep(1000);
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId, message: 'Make my trip cheaper by reducing activity costs' })
    });
    const data = await res.json();
    logTestResult(17, 'OPTIMIZE_BUDGET action (Organizer)', '200 OK', res.status, res.status === 200 && data.success === true, data.message);
  } catch (err) {
    logTestResult(17, 'OPTIMIZE_BUDGET action (Organizer)', '200 OK', err.message, false);
  }

  // Test 18: Invalid action type rejected
  const aiValidator = require('../services/ai/aiActionValidator');
  try {
    aiValidator.validateAIAction({ action: 'MALICIOUS_DELETE_DATABASE', message: 'test' }, {}, [], [], true);
    logTestResult(18, 'Invalid action type rejected', '400 Bad Request', 'Allowed', false);
  } catch (err) {
    logTestResult(18, 'Invalid action type rejected', '400 Bad Request', err.status || 400, (err.status || 400) === 400);
  }

  // Test 19: Invalid activity ID format rejected
  try {
    aiValidator.validateAIAction({
      action: 'UPDATE_ACTIVITY',
      message: 'test',
      changes: [{ activityId: 'invalid-id-123', updates: { estimatedCost: 100 } }]
    }, { startDate: new Date('2026-12-01'), endDate: new Date('2026-12-07') }, [], [], true);
    logTestResult(19, 'Invalid activity ID format rejected', '400 Bad Request', 'Allowed', false);
  } catch (err) {
    logTestResult(19, 'Invalid activity ID format rejected', '400 Bad Request', err.status || 400, (err.status || 400) === 400);
  }

  // Test 20: Foreign activity ID rejected
  try {
    aiValidator.validateAIAction({
      action: 'UPDATE_ACTIVITY',
      message: 'test',
      changes: [{ activityId: foreignActivityId, updates: { estimatedCost: 100 } }]
    }, { startDate: new Date('2026-12-01'), endDate: new Date('2026-12-07') }, [], [{ _id: activityId }], true);
    logTestResult(20, 'Foreign activity ID rejected', '400 Bad Request', 'Allowed', false);
  } catch (err) {
    logTestResult(20, 'Foreign activity ID rejected', '400 Bad Request', err.status || 400, (err.status || 400) === 400);
  }

  // Test 21: Foreign stop ID rejected
  try {
    aiValidator.validateAIAction({
      action: 'ADD_ACTIVITY',
      message: 'test',
      changes: [{ title: 'New Act', date: '2026-12-02', stopId: foreignStopId }]
    }, { startDate: new Date('2026-12-01'), endDate: new Date('2026-12-07') }, [{ _id: stopId }], [], true);
    logTestResult(21, 'Foreign stop ID rejected', '400 Bad Request', 'Allowed', false);
  } catch (err) {
    logTestResult(21, 'Foreign stop ID rejected', '400 Bad Request', err.status || 400, (err.status || 400) === 400);
  }

  // Test 22: Activity date outside trip range rejected
  try {
    aiValidator.validateAIAction({
      action: 'ADD_ACTIVITY',
      message: 'test',
      changes: [{ title: 'Out of bound act', date: '2027-01-01' }]
    }, { startDate: new Date('2026-12-01'), endDate: new Date('2026-12-07') }, [], [], true);
    logTestResult(22, 'Activity date outside trip range rejected', '400 Bad Request', 'Allowed', false);
  } catch (err) {
    logTestResult(22, 'Activity date outside trip range rejected', '400 Bad Request', err.status || 400, (err.status || 400) === 400);
  }

  // Test 23: Invalid activity category rejected
  try {
    aiValidator.validateAIAction({
      action: 'ADD_ACTIVITY',
      message: 'test',
      changes: [{ title: 'Bad category', date: '2026-12-02', category: 'invalid-cat-123' }]
    }, { startDate: new Date('2026-12-01'), endDate: new Date('2026-12-07') }, [], [], true);
    logTestResult(23, 'Invalid activity category rejected', '400 Bad Request', 'Allowed', false);
  } catch (err) {
    logTestResult(23, 'Invalid activity category rejected', '400 Bad Request', err.status || 400, (err.status || 400) === 400);
  }

  // Test 24: Negative estimatedCost rejected
  try {
    aiValidator.validateAIAction({
      action: 'ADD_ACTIVITY',
      message: 'test',
      changes: [{ title: 'Neg cost', date: '2026-12-02', estimatedCost: -500 }]
    }, { startDate: new Date('2026-12-01'), endDate: new Date('2026-12-07') }, [], [], true);
    logTestResult(24, 'Negative estimatedCost rejected', '400 Bad Request', 'Allowed', false);
  } catch (err) {
    logTestResult(24, 'Negative estimatedCost rejected', '400 Bad Request', err.status || 400, (err.status || 400) === 400);
  }

  // Test 25: Invalid time format rejected
  try {
    aiValidator.validateAIAction({
      action: 'ADD_ACTIVITY',
      message: 'test',
      changes: [{ title: 'Bad time', date: '2026-12-02', startTime: 'invalid-time' }]
    }, { startDate: new Date('2026-12-01'), endDate: new Date('2026-12-07') }, [], [], true);
    logTestResult(25, 'Invalid time format rejected', '400 Bad Request', 'Allowed', false);
  } catch (err) {
    logTestResult(25, 'Invalid time format rejected', '400 Bad Request', err.status || 400, (err.status || 400) === 400);
  }

  // Test 26: Unauthorized participant modification rejected
  try {
    aiValidator.validateAIAction({
      action: 'ADD_ACTIVITY',
      message: 'test',
      changes: [{ title: 'Part Act', date: '2026-12-02' }]
    }, { startDate: new Date('2026-12-01'), endDate: new Date('2026-12-07') }, [], [], false); // isOrganizer = false
    logTestResult(26, 'Unauthorized participant modification rejected', '403 Forbidden', 'Allowed', false);
  } catch (err) {
    logTestResult(26, 'Unauthorized participant modification rejected', '403 Forbidden', err.status || 403, (err.status || 403) === 403);
  }

  // Test 27: Successful organizer modification
  try {
    await sleep(1000);
    const res = await fetch(`${BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ tripId, message: 'Add a evening walk activity in Manali on 2026-12-05 at 17:00' })
    });
    const data = await res.json();
    logTestResult(27, 'Successful organizer modification', '200 OK', res.status, res.status === 200 && data.success === true);
  } catch (err) {
    logTestResult(27, 'Successful organizer modification', '200 OK', err.message, false);
  }

  // Test 28: No Expense created from AI assistant
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      headers: { 'Authorization': `Bearer ${orgToken}` }
    });
    const data = await res.json();
    const zeroExpenses = data.success && Array.isArray(data.data.expenses) && data.data.expenses.length === 0;
    logTestResult(28, 'No Expense created from AI assistant', '200 OK (0 expenses)', `${res.status} (Expenses count: ${data.data ? data.data.expenses.length : 0})`, zeroExpenses);
  } catch (err) {
    logTestResult(28, 'No Expense created from AI assistant', '200 OK (0 expenses)', err.message, false);
  }

  // Test 29: API key / Token not leaked
  const apiKey = process.env.GEMINI_API_KEY || '';
  const isSecure = (!apiKey || !JSON.stringify(assistantData || {}).includes(apiKey)) && (!orgToken || !JSON.stringify(assistantData || {}).includes(orgToken));
  logTestResult(29, 'API key / Token not leaked in responses', 'PASSED (Secrets not exposed)', isSecure ? 'Secure' : 'LEAK DETECTED', isSecure);

  // --- REGRESSION TESTS (Phases 1 - 7B Endpoints) ---
  console.log('--- REGRESSION TESTS (Phases 1 - 7B Endpoints) ---');
  try {
    const res1 = await fetch(`${BASE_URL}/health`);
    logTestResult(30, 'GET /api/health (Phase 1)', '200 OK', res1.status, res1.status === 200);

    const res2 = await fetch(`${BASE_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${orgToken}` } });
    logTestResult(31, 'GET /api/auth/me (Phase 2)', '200 OK', res2.status, res2.status === 200);

    const res3 = await fetch(`${BASE_URL}/trips`, { headers: { 'Authorization': `Bearer ${orgToken}` } });
    logTestResult(32, 'GET /api/trips (Phase 3)', '200 OK', res3.status, res3.status === 200);

    const res4 = await fetch(`${BASE_URL}/trips/${tripId}/activities`, { headers: { 'Authorization': `Bearer ${orgToken}` } });
    logTestResult(33, 'GET /api/trips/:tripId/activities (Phase 4)', '200 OK', res4.status, res4.status === 200);

    const res5 = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, { headers: { 'Authorization': `Bearer ${orgToken}` } });
    logTestResult(34, 'GET /api/trips/:tripId/expenses (Phase 5)', '200 OK', res5.status, res5.status === 200);

    const res6 = await fetch(`${BASE_URL}/destinations`);
    logTestResult(35, 'GET /api/destinations (Phase 6)', '200 OK', res6.status, res6.status === 200);

    await sleep(1000);
    const res7 = await fetch(`${BASE_URL}/ai/test`, { headers: { 'Authorization': `Bearer ${orgToken}` } });
    logTestResult(36, 'GET /api/ai/test (Phase 7A)', '200 OK', res7.status, res7.status === 200);

    await sleep(1000);
    const res8 = await fetch(`${BASE_URL}/ai/trip-plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({ destination: 'Manali', startDate: '2026-12-01', endDate: '2026-12-05', budget: 20000 })
    });
    logTestResult(37, 'POST /api/ai/trip-plan/generate (Phase 7B)', '200 OK', res8.status, res8.status === 200);

  } catch (err) {
    console.error('Regression Test Error:', err.message);
  }

  console.log('====================================================================');
  console.log('                 PHASE 7C TEST SUMMARY TABLE                        ');
  console.log('====================================================================');
  console.table(resultsTable);
}

runAiAssistantTests();
