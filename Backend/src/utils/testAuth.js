const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  MUSAFIR BUDDY - PHASE 2 HARDENING TEST SUITE    ');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testUser = {
    name: 'Jay Patel',
    email: `jay_${timestamp}@example.com`,
    password: 'Password123'
  };

  let token = '';

  // TEST 1 — Health
  console.log('--- TEST 1: GET /api/health ---');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test 1 Error:', err.message);
  }

  // TEST 2 — Register
  console.log('\n--- TEST 2: POST /api/auth/register ---');
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await res.json();
    console.log(`Status: ${res.status} (Expected: 201)`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    if (data.success && data.data && data.data.token) {
      token = data.data.token;
    }
  } catch (err) {
    console.error('Test 2 Error:', err.message);
  }

  // TEST 3 — Duplicate Registration
  console.log('\n--- TEST 3: POST /api/auth/register (Duplicate Email) ---');
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await res.json();
    console.log(`Status: ${res.status} (Expected: 409)`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test 3 Error:', err.message);
  }

  // TEST 4 — Login
  console.log('\n--- TEST 4: POST /api/auth/login (Valid Credentials) ---');
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status} (Expected: 200)`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test 4 Error:', err.message);
  }

  // TEST 5 — Wrong Password Login
  console.log('\n--- TEST 5: POST /api/auth/login (Wrong Password) ---');
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword123'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status} (Expected: 401)`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test 5 Error:', err.message);
  }

  // TEST 6 — Get Current User (Valid Token - standard "Bearer")
  console.log('\n--- TEST 6: GET /api/auth/me (Standard "Bearer" Token) ---');
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    console.log(`Status: ${res.status} (Expected: 200)`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test 6 Error:', err.message);
  }

  // TEST 6b — Get Current User (Case-insensitive "bearer" Token)
  console.log('\n--- TEST 6b: GET /api/auth/me (Case-insensitive "bearer" Token) ---');
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `bearer ${token}`
      }
    });
    const data = await res.json();
    console.log(`Status: ${res.status} (Expected: 200)`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test 6b Error:', err.message);
  }

  // TEST 7 — No Token
  console.log('\n--- TEST 7: GET /api/auth/me (No Authorization Token) ---');
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET'
    });
    const data = await res.json();
    console.log(`Status: ${res.status} (Expected: 401)`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test 7 Error:', err.message);
  }

  // TEST 8 — Invalid Token
  console.log('\n--- TEST 8: GET /api/auth/me (Invalid Authorization Token) ---');
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid_bogus_token_123'
      }
    });
    const data = await res.json();
    console.log(`Status: ${res.status} (Expected: 401)`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test 8 Error:', err.message);
  }

  // TEST 9 — Email Normalization Test
  console.log('\n--- TEST 9: Email Normalization Verification ---');
  const rawEmailUser = {
    name: 'Test User',
    email: '  TEST@Example.COM  ',
    password: 'Password123'
  };
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawEmailUser)
    });
    const data = await res.json();
    console.log(`Status: ${res.status} (Expected: 201)`);
    console.log(`Stored Email: "${data.data.user.email}" (Expected: "test@example.com")`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test 9 Error:', err.message);
  }

  console.log('\n====================================================');
  console.log('     ALL HARDENING VERIFICATION TESTS COMPLETED     ');
  console.log('====================================================');
}

runTests();
