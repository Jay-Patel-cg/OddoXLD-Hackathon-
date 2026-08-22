const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

function generateMockGoogleCredential(email, name, sub, picture = 'https://lh3.googleusercontent.com/a/mock_photo', email_verified = true) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    iss: 'https://accounts.google.com',
    sub,
    email,
    email_verified,
    name,
    picture
  })).toString('base64');
  return `${header}.${payload}.mock_signature`;
}

async function runGoogleAuthSuite() {
  console.log('====================================================');
  console.log('      MUSAFIR BUDDY - GOOGLE AUTH SUITE             ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
    }
  }

  try {
    // 1. Missing credential -> 400
    const res1 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/google', method: 'POST', headers: { 'Content-Type': 'application/json' } }, {});
    assert(res1.status === 400, 'Test 1: Missing credential returns 400 Bad Request');

    // 2. Malformed credential -> 401
    const res2 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/google', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { credential: 'malformed_jwt' });
    assert(res2.status === 401, 'Test 2: Malformed credential returns 401 Unauthorized');

    // 3. Unverified email -> 403
    const unverifiedCred = generateMockGoogleCredential('unverified@google.com', 'Unverified User', 'google_sub_unverified', 'pic', false);
    const res3 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/google', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { credential: unverifiedCred });
    assert(res3.status === 403, 'Test 3: Unverified email returns 403 Forbidden');

    // 4. New Google User Signup -> 200 / 201
    const timeId = Date.now();
    const newUserEmail = `google_new_${timeId}@musafir.com`;
    const sub1 = `google_sub_1_${timeId}`;
    const newCred = generateMockGoogleCredential(newUserEmail, 'Google Newbie', sub1);
    const res4 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/google', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { credential: newCred });
    assert(res4.status === 200 && res4.data.success && res4.data.data.token, 'Test 4: New Google user signup returns 200 & JWT token');

    const googleToken = res4.data.data.token;

    // 5. Existing Google User Login -> 200
    const res5 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/google', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { credential: newCred });
    assert(res5.status === 200 && res5.data && res5.data.data && res5.data.data.user && res5.data.data.user.email === newUserEmail, 'Test 5: Existing Google user login succeeds without duplicate user');

    // 6. Account Linking by Verified Email -> 200
    // First create standard email user
    const linkEmail = `standard_${timeId}@musafir.com`;
    const regRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { name: 'Standard User', email: linkEmail, password: 'Password123!' });
    assert(regRes.status === 201, 'Test 6a: Created standard email/password user');

    // Now login with Google using same email -> should link account cleanly!
    const sub2 = `google_sub_2_${timeId}`;
    const linkCred = generateMockGoogleCredential(linkEmail, 'Standard User', sub2);
    const linkRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/google', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { credential: linkCred });
    assert(linkRes.status === 200 && linkRes.data && linkRes.data.data && linkRes.data.data.user && linkRes.data.data.user.email === linkEmail, 'Test 6b: Google login links googleId to existing email account');


    // 7. Call /api/auth/me using Google-issued JWT
    const meRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/me', method: 'GET', headers: { 'Authorization': `Bearer ${googleToken}` } });
    assert(meRes.status === 200 && meRes.data.data.user.email === newUserEmail, 'Test 7: /api/auth/me works using Google-issued JWT');

    // 8. Call Protected /api/trips using Google-issued JWT
    const tripsRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/trips', method: 'GET', headers: { 'Authorization': `Bearer ${googleToken}` } });
    assert(tripsRes.status === 200, 'Test 8: Protected /api/trips works using Google-issued JWT');

    // 9. Verify Response Format Consistency
    assert(res4.data.data.user && res4.data.data.token, 'Test 9: Response structure matches standard login format');

    // 10. Security check: No secrets exposed
    assert(!res4.data.data.user.password && !res4.data.data.user.jwtSecret, 'Test 10: No password or secrets returned in payload');

    console.log(`\n====================================================`);
    console.log(`RESULTS: Passed ${passed} / ${total} tests`);
    console.log(`====================================================`);
  } catch (err) {
    console.error('Test Suite Exception:', err);
  }
}

runGoogleAuthSuite();
