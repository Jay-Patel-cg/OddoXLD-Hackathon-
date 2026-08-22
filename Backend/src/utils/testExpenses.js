const BASE_URL = 'http://localhost:5000/api';

async function runExpenseTests() {
  console.log('====================================================================');
  console.log('  MUSAFIR BUDDY - PHASE 5 SECURITY AUDIT & VERIFICATION SUITE       ');
  console.log('====================================================================\n');

  const ts = Date.now();
  const orgData = { name: 'Jay (Org)', email: `jay_exp_${ts}@example.com`, password: 'Password123' };
  const part1Data = { name: 'Rahul (Part 1)', email: `rahul_exp_${ts}@example.com`, password: 'Password123' };
  const part2Data = { name: 'Amit (Part 2)', email: `amit_exp_${ts}@example.com`, password: 'Password123' };
  const nonMemberData = { name: 'Stranger', email: `stranger_exp_${ts}@example.com`, password: 'Password123' };

  let tokenOrg = '', userOrgId = '';
  let tokenP1 = '', userP1Id = '';
  let tokenP2 = '', userP2Id = '';
  let tokenNon = '', userNonId = '';
  let tripId = '';
  let zeroBudgetTripId = '';
  let exp1Id = '';
  let expP1Id = '';
  let expP2Id = '';

  // Setup: Register Users & Create Trips
  try {
    const resO = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orgData) });
    const dataO = await resO.json();
    tokenOrg = dataO.data.token; userOrgId = dataO.data.user.id;

    const resP1 = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(part1Data) });
    const dataP1 = await resP1.json();
    tokenP1 = dataP1.data.token; userP1Id = dataP1.data.user.id;

    const resP2 = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(part2Data) });
    const dataP2 = await resP2.json();
    tokenP2 = dataP2.data.token; userP2Id = dataP2.data.user.id;

    const resN = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nonMemberData) });
    const dataN = await resN.json();
    tokenNon = dataN.data.token; userNonId = dataN.data.user.id;

    // Create Main Trip (Budget: 30000 INR, Dates: 2026-09-10 to 2026-09-15)
    const tripRes = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Goa Budget Trip',
        destination: 'Goa',
        startDate: '2026-09-10',
        endDate: '2026-09-15',
        budget: 30000,
        currency: 'INR',
        participants: [userP1Id, userP2Id]
      })
    });
    const tripData = await tripRes.json();
    tripId = tripData.data.trip._id;

    // Create Zero-Budget Trip
    const zTripRes = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Zero Budget Trip',
        destination: 'Local',
        startDate: '2026-09-10',
        endDate: '2026-09-15',
        budget: 0
      })
    });
    const zTripData = await zTripRes.json();
    zeroBudgetTripId = zTripData.data.trip._id;
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

  // TEST 1 — Organizer creates equal-split expense
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Hotel Booking',
        amount: 12000,
        category: 'hotel',
        paidBy: userOrgId,
        splitType: 'equal',
        date: '2026-09-10'
      })
    });
    const data = await res.json();
    if (data.success && data.data && data.data.expense) {
      exp1Id = data.data.expense._id;
    }
    logTestResult(1, 'Organizer creates equal-split expense', '201 Created', res.status, res.status === 201);
  } catch (err) {
    logTestResult(1, 'Organizer creates equal-split expense', '201 Created', err.message, false);
  }

  // TEST 2 — Organizer gets Trip expenses
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    const data = await res.json();
    logTestResult(2, 'Organizer gets Trip expenses', '200 OK', res.status, res.status === 200 && data.count >= 1);
  } catch (err) {
    logTestResult(2, 'Organizer gets Trip expenses', '200 OK', err.message, false);
  }

  // TEST 3 — Participant gets Trip expenses
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenP1}` }
    });
    const data = await res.json();
    logTestResult(3, 'Participant gets Trip expenses', '200 OK', res.status, res.status === 200 && data.count >= 1);
  } catch (err) {
    logTestResult(3, 'Participant gets Trip expenses', '200 OK', err.message, false);
  }

  // TEST 4 — Participant gets single expense
  try {
    const res = await fetch(`${BASE_URL}/expenses/${exp1Id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenP1}` }
    });
    logTestResult(4, 'Participant gets single expense', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(4, 'Participant gets single expense', '200 OK', err.message, false);
  }

  // TEST 5 — Participant creates an expense
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenP1}` },
      body: JSON.stringify({
        title: 'Beach Bar Drinks',
        amount: 3000,
        category: 'food',
        paidBy: userP1Id,
        splitType: 'equal',
        date: '2026-09-11'
      })
    });
    const data = await res.json();
    if (data.success && data.data && data.data.expense) {
      expP1Id = data.data.expense._id;
    }
    logTestResult(5, 'Participant creates an expense', '201 Created', res.status, res.status === 201);
  } catch (err) {
    logTestResult(5, 'Participant creates an expense', '201 Created', err.message, false);
  }

  // TEST 6 — Participant updates their own expense
  try {
    const res = await fetch(`${BASE_URL}/expenses/${expP1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenP1}` },
      body: JSON.stringify({
        title: 'Beach Bar Drinks & Snacks',
        amount: 3500
      })
    });
    logTestResult(6, 'Participant updates their own expense', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(6, 'Participant updates their own expense', '200 OK', err.message, false);
  }

  // TEST 7 — Participant attempts to update another user's expense (P2 tries to update P1's expense)
  try {
    const res = await fetch(`${BASE_URL}/expenses/${expP1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenP2}` },
      body: JSON.stringify({ title: 'Hacked Expense Title' })
    });
    logTestResult(7, "Participant updates another user's expense", '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(7, "Participant updates another user's expense", '403 Forbidden', err.message, false);
  }

  // Setup: Create a temp expense for P1 to delete in Test 8
  let tempP1ExpId = '';
  try {
    const tempRes = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenP1}` },
      body: JSON.stringify({
        title: 'Temp Expense to Delete',
        amount: 500,
        paidBy: userP1Id,
        date: '2026-09-12'
      })
    });
    const tempData = await tempRes.json();
    tempP1ExpId = tempData.data.expense._id;
  } catch (err) { }

  // TEST 8 — Participant deletes their own expense
  try {
    const res = await fetch(`${BASE_URL}/expenses/${tempP1ExpId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenP1}` }
    });
    logTestResult(8, 'Participant deletes their own expense', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(8, 'Participant deletes their own expense', '200 OK', err.message, false);
  }

  // TEST 9 — Participant attempts to delete another user's expense (P2 tries to delete exp1Id paid by Org)
  try {
    const res = await fetch(`${BASE_URL}/expenses/${exp1Id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenP2}` }
    });
    logTestResult(9, "Participant deletes another user's expense", '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(9, "Participant deletes another user's expense", '403 Forbidden', err.message, false);
  }

  // TEST 10 — Organizer updates another user's expense (Org updates expP1Id paid by P1)
  try {
    const res = await fetch(`${BASE_URL}/expenses/${expP1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({ notes: 'Approved by organizer' })
    });
    logTestResult(10, "Organizer updates another user's expense", '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(10, "Organizer updates another user's expense", '200 OK', err.message, false);
  }

  // Setup: Create a temp expense paid by P2 for Org to delete in Test 11
  let tempP2ExpId = '';
  try {
    const tempRes = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenP2}` },
      body: JSON.stringify({
        title: 'Taxi Ride',
        amount: 1500,
        category: 'transport',
        paidBy: userP2Id,
        date: '2026-09-13'
      })
    });
    const tempData = await tempRes.json();
    tempP2ExpId = tempData.data.expense._id;
  } catch (err) { }

  // TEST 11 — Organizer deletes another user's expense (Org deletes tempP2ExpId paid by P2)
  try {
    const res = await fetch(`${BASE_URL}/expenses/${tempP2ExpId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(11, "Organizer deletes another user's expense", '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(11, "Organizer deletes another user's expense", '200 OK', err.message, false);
  }

  // TEST 12 — Non-participant attempts to view expenses
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenNon}` }
    });
    logTestResult(12, 'Non-participant attempts to view expenses', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(12, 'Non-participant attempts to view expenses', '403 Forbidden', err.message, false);
  }

  // TEST 13 — Non-participant attempts to create expense
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNon}` },
      body: JSON.stringify({
        title: 'Stranger Expense',
        amount: 1000,
        paidBy: userNonId,
        date: '2026-09-12'
      })
    });
    logTestResult(13, 'Non-participant attempts to create expense', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(13, 'Non-participant attempts to create expense', '403 Forbidden', err.message, false);
  }

  // TEST 14 — Negative amount
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Negative Amount',
        amount: -500,
        paidBy: userOrgId,
        date: '2026-09-12'
      })
    });
    logTestResult(14, 'Create expense with negative amount', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(14, 'Create expense with negative amount', '400 Bad Request', err.message, false);
  }

  // TEST 15 — Invalid category
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Invalid Category',
        amount: 1000,
        category: 'crypto-mining',
        paidBy: userOrgId,
        date: '2026-09-12'
      })
    });
    logTestResult(15, 'Create expense with invalid category', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(15, 'Create expense with invalid category', '400 Bad Request', err.message, false);
  }

  // TEST 16 — Invalid splitType
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Invalid SplitType',
        amount: 1000,
        paidBy: userOrgId,
        splitType: 'random',
        date: '2026-09-12'
      })
    });
    logTestResult(16, 'Create expense with invalid splitType', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(16, 'Create expense with invalid splitType', '400 Bad Request', err.message, false);
  }

  // TEST 17 — Custom split total does not equal expense amount (amount = 3000, splits = 1500 + 500 = 2000)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Custom Split Mismatch',
        amount: 3000,
        paidBy: userOrgId,
        splitType: 'custom',
        splits: [
          { user: userOrgId, amount: 1500 },
          { user: userP1Id, amount: 500 }
        ],
        date: '2026-09-12'
      })
    });
    logTestResult(17, 'Custom split total does not equal expense amount', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(17, 'Custom split total mismatch', '400 Bad Request', err.message, false);
  }

  // TEST 18 — Equal split calculation (3000 / 3 -> 1000, 1000, 1000)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Dinner at Panjim',
        amount: 3000,
        category: 'food',
        paidBy: userOrgId,
        splitType: 'equal',
        splitBetween: [userOrgId, userP1Id, userP2Id],
        date: '2026-09-12'
      })
    });
    const data = await res.json();
    const isExactSplit = data.success && data.data && data.data.expense.splits.every(s => s.amount === 1000);
    logTestResult(18, 'Equal split calculation (3000 / 3 -> 1000 each)', '201 Created', res.status, res.status === 201 && isExactSplit);
  } catch (err) {
    logTestResult(18, 'Equal split calculation', '201 Created', err.message, false);
  }

  // TEST 19 — Expense with paidBy user who is not a Trip member
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Paid by Non-Member',
        amount: 1000,
        paidBy: userNonId,
        date: '2026-09-12'
      })
    });
    logTestResult(19, 'Expense with paidBy user who is not a Trip member', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(19, 'Expense with paidBy non-member', '400 Bad Request', err.message, false);
  }

  // TEST 20 — Expense with split user who is not a Trip member
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Split with Non-Member',
        amount: 1000,
        paidBy: userOrgId,
        splitType: 'equal',
        splitBetween: [userOrgId, userNonId],
        date: '2026-09-12'
      })
    });
    logTestResult(20, 'Expense with split user who is not a Trip member', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(20, 'Expense with split user non-member', '400 Bad Request', err.message, false);
  }

  // TEST 21 — Expense date outside Trip date range (Trip: 2026-09-10 to 2026-09-15)
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Outside Date Range Expense',
        amount: 500,
        paidBy: userOrgId,
        date: '2026-09-01'
      })
    });
    logTestResult(21, 'Expense date outside Trip date range', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(21, 'Expense date outside Trip date range', '400 Bad Request', err.message, false);
  }

  // TEST 22 — Missing JWT
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'GET'
    });
    logTestResult(22, 'Request missing JWT token', '401 Unauthorized', res.status, res.status === 401);
  } catch (err) {
    logTestResult(22, 'Request missing JWT token', '401 Unauthorized', err.message, false);
  }

  // TEST 23 — Invalid Expense ID
  try {
    const res = await fetch(`${BASE_URL}/expenses/invalid-expense-id-123`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    logTestResult(23, 'Fetch expense with invalid ID format', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(23, 'Fetch expense with invalid ID format', '400 Bad Request', err.message, false);
  }

  // TEST 24 — Expense summary
  let summaryData = null;
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses/summary`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    const data = await res.json();
    if (data.success && data.data) {
      summaryData = data.data;
    }
    logTestResult(24, 'Expense summary retrieval', '200 OK', res.status, res.status === 200 && summaryData !== null);
  } catch (err) {
    logTestResult(24, 'Expense summary retrieval', '200 OK', err.message, false);
  }

  // TEST 25 — Verify category totals equal totalSpent
  try {
    if (summaryData) {
      const breakdownSum = Object.values(summaryData.categoryBreakdown).reduce((a, b) => a + b, 0);
      const categorySumRounded = Math.round(breakdownSum * 100) / 100;
      const isMatch = Math.abs(categorySumRounded - summaryData.totalSpent) < 0.01;
      logTestResult(25, 'Verify category totals equal totalSpent', 'PASSED', `Sum: ${categorySumRounded}, Spent: ${summaryData.totalSpent}`, isMatch);
    } else {
      logTestResult(25, 'Verify category totals equal totalSpent', 'PASSED', 'No summary data', false);
    }
  } catch (err) {
    logTestResult(25, 'Verify category totals equal totalSpent', 'PASSED', err.message, false);
  }

  // TEST 26 — Verify member balances sum to approximately zero
  try {
    if (summaryData && summaryData.memberBalances) {
      const totalBalanceSum = summaryData.memberBalances.reduce((acc, m) => acc + m.balance, 0);
      const isZeroSum = Math.abs(totalBalanceSum) < 0.05;
      logTestResult(26, 'Verify member balances sum to zero', 'PASSED', `Total Balance Sum: ${totalBalanceSum}`, isZeroSum);
    } else {
      logTestResult(26, 'Verify member balances sum to zero', 'PASSED', 'No summary data', false);
    }
  } catch (err) {
    logTestResult(26, 'Verify member balances sum to zero', 'PASSED', err.message, false);
  }

  // TEST 27 — Budget = 0 summary check (no Infinity/NaN)
  try {
    const res = await fetch(`${BASE_URL}/trips/${zeroBudgetTripId}/expenses/summary`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenOrg}` }
    });
    const data = await res.json();
    const isValidPct = data.success && !isNaN(data.data.percentageUsed) && isFinite(data.data.percentageUsed);
    logTestResult(27, 'Budget = 0 summary check (Zero-safe percentageUsed)', '200 OK (no NaN/Infinity)', res.status, res.status === 200 && isValidPct);
  } catch (err) {
    logTestResult(27, 'Budget = 0 summary check', '200 OK', err.message, false);
  }

  // HARDENING SECURITY AUDIT TESTS
  console.log('--- SECURITY AUDIT & HARDENING TESTS ---');

  // TEST 28 — Security: Participant attempts to change paidBy ownership of expense to bypass ownership rules
  try {
    const res = await fetch(`${BASE_URL}/expenses/${expP1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenP1}` },
      body: JSON.stringify({ paidBy: userP2Id })
    });
    logTestResult(28, 'Participant attempts to transfer paidBy ownership', '403 Forbidden', res.status, res.status === 403);
  } catch (err) {
    logTestResult(28, 'Participant attempts to transfer paidBy ownership', '403 Forbidden', err.message, false);
  }

  // TEST 29 — Security: Custom split with duplicate users
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Duplicate Users Custom Split',
        amount: 2000,
        paidBy: userOrgId,
        splitType: 'custom',
        splits: [
          { user: userOrgId, amount: 1000 },
          { user: userOrgId, amount: 1000 }
        ],
        date: '2026-09-12'
      })
    });
    logTestResult(29, 'Custom split with duplicate users', '400 Bad Request', res.status, res.status === 400);
  } catch (err) {
    logTestResult(29, 'Custom split with duplicate users', '400 Bad Request', err.message, false);
  }

  // TEST 30 — Equal splitting awkward amount: 100 / 3
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Awkward Split 100 / 3',
        amount: 100,
        paidBy: userOrgId,
        splitType: 'equal',
        splitBetween: [userOrgId, userP1Id, userP2Id],
        date: '2026-09-12'
      })
    });
    const data = await res.json();
    const sum = data.data.expense.splits.reduce((acc, s) => acc + s.amount, 0);
    const isExactSum = Math.abs(sum - 100) < 0.001;
    logTestResult(30, 'Awkward amount equal split (100 / 3)', '201 Created (Sum === 100)', `${res.status} (Sum: ${sum})`, res.status === 201 && isExactSum);
  } catch (err) {
    logTestResult(30, 'Awkward amount equal split (100 / 3)', '201 Created', err.message, false);
  }

  // TEST 31 — Equal splitting awkward amount: 10 / 6
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Awkward Split 10 / 6',
        amount: 10,
        paidBy: userOrgId,
        splitType: 'equal',
        splitBetween: [userOrgId, userP1Id, userP2Id],
        date: '2026-09-12'
      })
    });
    const data = await res.json();
    const sum = data.data.expense.splits.reduce((acc, s) => acc + s.amount, 0);
    const isExactSum = Math.abs(sum - 10) < 0.001;
    logTestResult(31, 'Awkward amount equal split (10 / 3 members)', '201 Created (Sum === 10)', `${res.status} (Sum: ${sum})`, res.status === 201 && isExactSum);
  } catch (err) {
    logTestResult(31, 'Awkward amount equal split (10 / 3)', '201 Created', err.message, false);
  }

  // TEST 32 — Equal splitting awkward amount: 999 / 7
  try {
    const res = await fetch(`${BASE_URL}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenOrg}` },
      body: JSON.stringify({
        title: 'Awkward Split 999 / 3',
        amount: 999,
        paidBy: userOrgId,
        splitType: 'equal',
        splitBetween: [userOrgId, userP1Id, userP2Id],
        date: '2026-09-12'
      })
    });
    const data = await res.json();
    const sum = data.data.expense.splits.reduce((acc, s) => acc + s.amount, 0);
    const isExactSum = Math.abs(sum - 999) < 0.001;
    logTestResult(32, 'Awkward amount equal split (999 / 3 members)', '201 Created (Sum === 999)', `${res.status} (Sum: ${sum})`, res.status === 201 && isExactSum);
  } catch (err) {
    logTestResult(32, 'Awkward amount equal split (999 / 3)', '201 Created', err.message, false);
  }

  // REGRESSION TESTS (Phases 1, 2, 3, 4)
  console.log('--- REGRESSION TESTS (Phases 1, 2, 3, 4 Endpoints) ---');
  try {
    const resH = await fetch(`${BASE_URL}/health`);
    logTestResult('R1', 'GET /api/health (Phase 1)', '200 OK', resH.status, resH.status === 200);

    const resMe = await fetch(`${BASE_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${tokenOrg}` } });
    logTestResult('R2', 'GET /api/auth/me (Phase 2)', '200 OK', resMe.status, resMe.status === 200);

    const resTrip = await fetch(`${BASE_URL}/trips/${tripId}`, { headers: { 'Authorization': `Bearer ${tokenOrg}` } });
    logTestResult('R3', 'GET /api/trips/:id (Phase 3)', '200 OK', resTrip.status, resTrip.status === 200);

    const resAct = await fetch(`${BASE_URL}/trips/${tripId}/activities`, { headers: { 'Authorization': `Bearer ${tokenOrg}` } });
    logTestResult('R4', 'GET /api/trips/:tripId/activities (Phase 4)', '200 OK', resAct.status, resAct.status === 200);
  } catch (err) {
    console.error('Regression Test Error:', err.message);
  }

  console.log('====================================================================');
  console.log('            PHASE 5 AUDIT & SECURITY TEST SUMMARY TABLE             ');
  console.log('====================================================================');
  console.table(resultsTable);
}

runExpenseTests();
