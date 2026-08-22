const BASE_URL = 'http://localhost:5000/api';

async function runGeminiTests() {
  console.log('====================================================================');
  console.log('  MUSAFIR BUDDY - PHASE 7A GEMINI AI CONNECTIVITY TEST SUITE        ');
  console.log('====================================================================\n');

  const ts = Date.now();
  const testUserData = { name: 'AI Tester', email: `aitest_${ts}@example.com`, password: 'Password123' };

  let token = '';

  // Setup: Register User
  try {
    const resReg = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUserData)
    });
    const dataReg = await resReg.json();
    token = dataReg.data.token;
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

  // Test 1: Health Check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    logTestResult(1, 'GET /api/health (Phase 1)', '200 OK', res.status, res.status === 200);
  } catch (err) {
    logTestResult(1, 'GET /api/health', '200 OK', err.message, false);
  }

  // Test 2: Unauthenticated /api/ai/test (No JWT Token)
  try {
    const res = await fetch(`${BASE_URL}/ai/test`, { method: 'GET' });
    logTestResult(2, 'Unauthenticated GET /api/ai/test', '401 Unauthorized', res.status, res.status === 401);
  } catch (err) {
    logTestResult(2, 'Unauthenticated GET /api/ai/test', '401 Unauthorized', err.message, false);
  }

  // Test 3: Authenticated /api/ai/test (With valid JWT Token)
  let aiResponseText = '';
  try {
    const res = await fetch(`${BASE_URL}/ai/test`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && data.data && data.data.response) {
      aiResponseText = data.data.response;
    }
    const isSuccess = res.status === 200 && data.success === true && typeof aiResponseText === 'string' && aiResponseText.length > 0;
    logTestResult(3, 'Authenticated GET /api/ai/test', '200 OK with non-empty Gemini response', `${res.status} (Text Length: ${aiResponseText.length})`, isSuccess, `AI Output: "${aiResponseText}"`);
  } catch (err) {
    logTestResult(3, 'Authenticated GET /api/ai/test', '200 OK', err.message, false);
  }

  // Test 4: Security assertion — Ensure API Key & Authorization Token are NOT leaked in response
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const keyLeaked = apiKey.length > 5 && aiResponseText.includes(apiKey);
    const tokenLeaked = token.length > 5 && aiResponseText.includes(token);
    const isSecure = !keyLeaked && !tokenLeaked;
    logTestResult(4, 'Security assertion (No API key / Token leak in response)', 'PASSED (Secrets not exposed)', isSecure ? 'Secure' : 'LEAK DETECTED', isSecure);
  } catch (err) {
    logTestResult(4, 'Security assertion', 'PASSED', err.message, false);
  }

  // --- REGRESSION TESTS (Phases 1 - 6 Endpoints) ---
  console.log('--- REGRESSION TESTS (Phases 1 - 6 Endpoints) ---');
  try {
    const resAuth = await fetch(`${BASE_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
    logTestResult('R1', 'GET /api/auth/me (Phase 2)', '200 OK', resAuth.status, resAuth.status === 200);

    const resTrips = await fetch(`${BASE_URL}/trips`, { headers: { 'Authorization': `Bearer ${token}` } });
    logTestResult('R2', 'GET /api/trips (Phase 3)', '200 OK', resTrips.status, resTrips.status === 200);

    const resDests = await fetch(`${BASE_URL}/destinations`);
    logTestResult('R3', 'GET /api/destinations (Phase 6)', '200 OK', resDests.status, resDests.status === 200);
  } catch (err) {
    console.error('Regression Test Error:', err.message);
  }

  console.log('====================================================================');
  console.log('                 PHASE 7A TEST SUMMARY TABLE                        ');
  console.log('====================================================================');
  console.table(resultsTable);
}

runGeminiTests();
