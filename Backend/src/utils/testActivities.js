const BASE_URL = 'http://localhost:5000/api';

async function runActivityTests() {
  console.log('====================================================================');
  console.log('  MUSAFIR BUDDY - PHASE 4 ACTIVITY & ITINERARY VERIFICATION SUITE  ');
  console.log('====================================================================\n');

  const ts = Date.now();
  const organizerData = {
    name: 'Org User',
    email: `org_${ts}@example.com`,
    password: 'Password123'
  };

  const participantData = {
    name: 'Part User',
    email: `part_${ts}@example.com`,
    password: 'Password123'
  };

  const nonMemberData = {
    name: 'NonMember User',
    email: `non_${ts}@example.com`,
    password: 'Password123'
  };

  let tokenOrg = '';
  let tokenPart = '';
  let tokenNon = '';
  let participantId = '';
  let tripId = '';
  let trip2Id = '';
  let activity1Id = '';
  let activity2Id = '';
  let activity3Id = '';
  let otherTripActivityId = '';

  // Setup: Register Users & Create Trip
  try {
    const resO = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(organizerData)
    });
    const dataO = await resO.json();
    tokenOrg = dataO.data.token;

    const resP = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participantData)
    });
    const dataP = await resP.json();
    tokenPart = dataP.data.token;
    participantId = dataP.data.user.id;

    const resN = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nonMemberData)
    });
    const dataN = await resN.json();
    tokenNon = dataN.data.token;

    // Create primary trip (Dates: 2026-09-10 to 2026-09-14)
    const tripRes = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Manali Adventure',
        destination: 'Manali',
        startDate: '2026-09-10',
        endDate: '2026-09-14',
        budget: 40000,
        participants: [participantId]
      })
    });
    const tripData = await tripRes.json();
    tripId = tripData.data.trip._id;

    // Create a second trip for isolation testing
    const trip2Res = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Kerala Chill Trip',
        destination: 'Kochi',
        startDate: '2026-10-01',
        endDate: '2026-10-05'
      })
    });
    const trip2Data = await trip2Res.json();
    trip2Id = trip2Data.data.trip._id;

    // Create an activity in trip2
    const otherActRes = await fetch(`${BASE_URL}/trips/${trip2Id}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Kochi Backwaters Boat Tour',
        date: '2026-10-02',
        startTime: '10:00'
      })
    });
    const otherActData = await otherActRes.json();
    otherTripActivityId = otherActData.data.activity._id;
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

  // TEST 1 — Organizer creates Activity
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Morning Breakfast at Old Manali',
        description: 'Pancakes and hot coffee',
        date: '2026-09-10',
        startTime: '09:00',
        endTime: '10:00',
        location: 'Old Manali Cafe',
        estimatedCost: 600,
        category: 'food',
        order: 0
      })
    });
    const data = await res.json();
    if (data.success && data.data && data.data.activity) {
      activity1Id = data.data.activity._id;
    }
    logTestResult(1, 'Organizer creates Activity', '201 Created', res.status, res.status === 201);
  } catch (err) {
    logTestResult(1, 'Organizer creates Activity', '201 Created', err.message, false);
  }

  // Create additional activities for reordering tests
  try {
    const res2 = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Solang Valley Paragliding',
        date: '2026-09-11',
        startTime: '11:00',
        endTime: '14:00',
        category: 'adventure',
        order: 1
      })
    });
    const data2 = await res2.json();
    activity2Id = data2.data.activity._id;

    const res3 = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Hadimba Temple Visit',
        date: '2026-09-10',
        startTime: '15:00',
        endTime: '17:00',
        category: 'sightseeing',
        order: 2
      })
    });
    const data3 = await res3.json();
    activity3Id = data3.data.activity._id;
  } catch (err) {
    console.error('Activity Setup Error:', err.message);
  }

  // TEST 2 — Organizer gets Trip Activities
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    const data = await res.json();
    logTestResult(2, 'Organizer gets Trip Activities', '200 OK', res.status, res.status === 200 && data.count >= 3);
  } catch (err) {
    logTestResult(2, 'Organizer gets Trip Activities', '200 OK', err.message, false);
  }

  // TEST 3 — Organizer gets single Activity
  try {
    const res = await fetch(`${BASE_URL}/activities/${activity1Id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    const data = await res.json();
    logTestResult(3, 'Organizer gets single Activity', '200 OK', res.status, res.status === 200 && data.data.activity._id === activity1Id);
  } catch (err) {
    logTestResult(3, 'Organizer gets single Activity', '200 OK', err.message, false);
  }

  // TEST 4 — Organizer updates Activity
  try {
    const res = await fetch(`${BASE_URL}/activities/${activity1Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Grand Breakfast at Old Manali',
        estimatedCost: 750
      })
    });
    const data = await res.json();
    logTestResult(4, 'Organizer updates Activity', '200 OK', res.status, res.status === 200 && data.data.activity.title === 'Grand Breakfast at Old Manali');
  } catch (err) {
    logTestResult(4, 'Organizer updates Activity', '200 OK', err.message, false);
  }

  // TEST 5 — Organizer deletes Activity (We create a temp activity to delete so we keep activity1Id intact)
  let tempActId = '';
  try {
    const tempRes = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Temp Activity to Delete',
        date: '2026-09-12'
      })
    });
    const tempData = await tempRes.json();
    tempActId = tempData.data.activity._id;

    const delRes = await fetch(`${BASE_URL}/activities/${tempActId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(5, 'Organizer deletes Activity', '200 OK', delRes.status, delRes.status === 200);
  } catch (err) {
    logTestResult(5, 'Organizer deletes Activity', '200 OK', err.message, false);
  }

  // TEST 6 — Participant can view Trip Activities
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenPart}` }
    });
    const data = await res.json();
    logTestResult(6, 'Participant views Trip Activities', '200 OK', res.status, res.status === 200 && data.count >= 3);
  } catch (err) {
    logTestResult(6, 'Participant views Trip Activities', '200 OK', err.message, false);
  }

  // TEST 7 — Participant can view single Activity
  try {
    const res = await fetch(`${BASE_URL}/activities/${activity1Id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenPart}` }
    });
    logTestResult(7, 'Participant views single Activity', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(7, 'Participant views single Activity', '200 OK', err.message, false);
  }

  // TEST 8 — Participant cannot create Activity
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenPart}`
      },
      body: JSON.stringify({
        title: 'Unauthorized Activity by Participant',
        date: '2026-09-12'
      })
    });
    logTestResult(8, 'Participant attempts to create Activity', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(8, 'Participant attempts to create Activity', '403 Forbidden', err.message, false);
  }

  // TEST 9 — Participant cannot update Activity
  try {
    const res = await fetch(`${BASE_URL}/activities/${activity1Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenPart}`
      },
      body: JSON.stringify({ title: 'Hacked Title' })
    });
    logTestResult(9, 'Participant attempts to update Activity', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(9, 'Participant attempts to update Activity', '403 Forbidden', err.message, false);
  }

  // TEST 10 — Participant cannot delete Activity
  try {
    const res = await fetch(`${BASE_URL}/activities/${activity1Id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenPart}` }
    });
    logTestResult(10, 'Participant attempts to delete Activity', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(10, 'Participant attempts to delete Activity', '403 Forbidden', err.message, false);
  }

  // TEST 11 — Participant cannot reorder Activities
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenPart}`
      },
      body: JSON.stringify({ activityIds: [activity3Id, activity1Id, activity2Id] })
    });
    logTestResult(11, 'Participant attempts to reorder Activities', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(11, 'Participant attempts to reorder Activities', '403 Forbidden', err.message, false);
  }

  // TEST 12 — Non-participant cannot view activities
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenNon}` }
    });
    logTestResult(12, 'Non-participant attempts to view activities', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(12, 'Non-participant attempts to view activities', '403 Forbidden', err.message, false);
  }

  // TEST 13 — Activity date outside Trip date range (Trip dates: 2026-09-10 to 2026-09-14)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Early Activity Outside Range',
        date: '2026-09-08'
      })
    });
    logTestResult(13, 'Activity date outside Trip date range (2026-09-08)', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(13, 'Activity date outside Trip date range', '400 Bad Request', err.message, false);
  }

  // TEST 14 — Negative estimated cost
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Negative Cost Activity',
        date: '2026-09-11',
        estimatedCost: -250
      })
    });
    logTestResult(14, 'Create Activity with Negative Cost', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(14, 'Create Activity with Negative Cost', '400 Bad Request', err.message, false);
  }

  // TEST 15 — Invalid category
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Invalid Category Activity',
        date: '2026-09-11',
        category: 'space-travel'
      })
    });
    logTestResult(15, 'Create Activity with Invalid Category', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(15, 'Create Activity with Invalid Category', '400 Bad Request', err.message, false);
  }

  // TEST 16 — Invalid time range (startTime = 18:00, endTime = 15:00)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({
        title: 'Invalid Time Range Activity',
        date: '2026-09-11',
        startTime: '18:00',
        endTime: '15:00'
      })
    });
    logTestResult(16, 'Create Activity with Invalid Time Range (startTime > endTime)', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(16, 'Create Activity with Invalid Time Range', '400 Bad Request', err.message, false);
  }

  // TEST 17 — Missing JWT
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities`, {
      method: 'GET'
    });
    logTestResult(17, 'Request Missing JWT Token', '401 Unauthorized', res.status, res.status === 401);
  } catch (err) {
    logTestResult(17, 'Request Missing JWT Token', '401 Unauthorized', err.message, false);
  }

  // TEST 18 — Invalid Activity ID
  try {
    const res = await fetch(`${BASE_URL}/activities/invalid-id-999`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(18, 'Fetch Activity with Invalid ID Format', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(18, 'Fetch Activity with Invalid ID Format', '400 Bad Request', err.message, false);
  }

  // TEST 19 — Reorder activities successfully
  try {
    const newOrderArray = [activity3Id, activity1Id, activity2Id];
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({ activityIds: newOrderArray })
    });
    const data = await res.json();
    const isReordered = data.success && data.data && data.data.activities &&
      data.data.activities.find(a => a._id === activity3Id).order === 0 &&
      data.data.activities.find(a => a._id === activity1Id).order === 1 &&
      data.data.activities.find(a => a._id === activity2Id).order === 2;

    logTestResult(19, 'Reorder Activities Successfully', '200 OK (Orders set 0,1,2)', res.status, res.status === 200 && isReordered);
  } catch (err) {
    logTestResult(19, 'Reorder Activities Successfully', '200 OK', err.message, false);
  }

  // TEST 20 — Attempt to reorder activities belonging to another Trip
  try {
    const mixedArray = [activity1Id, otherTripActivityId];
    const res = await fetch(`${BASE_URL}/trips/${tripId}/activities/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenOrg}`
      },
      body: JSON.stringify({ activityIds: mixedArray })
    });
    logTestResult(20, 'Reorder Activities with activity belonging to another Trip', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(20, 'Reorder Activities with activity belonging to another Trip', '400 Bad Request', err.message, false);
  }

  // REGRESSION TESTS
  console.log('--- REGRESSION TESTS (Phase 1, Phase 2, Phase 3 Endpoints) ---');
  try {
    const resH = await fetch(`${BASE_URL}/health`);
    logTestResult('R1', 'GET /api/health', '200 OK', resH.status, resH.status === 200);

    const resMe = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult('R2', 'GET /api/auth/me', '200 OK', resMe.status, resMe.status === 200);

    const resTrip = await fetch(`${BASE_URL}/trips/${tripId}`, {
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult('R3', 'GET /api/trips/:id', '200 OK', resTrip.status, resTrip.status === 200);
  } catch (err) {
    console.error('Regression Test Error:', err.message);
  }

  console.log('====================================================================');
  console.log('                 PHASE 4 TEST SUMMARY TABLE                         ');
  console.log('====================================================================');
  console.table(resultsTable);
}

runActivityTests();
