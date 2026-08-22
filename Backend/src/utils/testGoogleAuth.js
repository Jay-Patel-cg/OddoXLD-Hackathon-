const http = require('http');

// Mock a JWT structure payload for Google ID Token
const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
const payload = Buffer.from(JSON.stringify({
  iss: 'https://accounts.google.com',
  sub: '109823091823901',
  email: 'google.traveler@musafir.com',
  email_verified: true,
  name: 'Google Traveler',
  picture: 'https://lh3.googleusercontent.com/a/mock_photo'
})).toString('base64');
const mockCredential = `${header}.${payload}.mock_signature`;

const postData = JSON.stringify({ credential: mockCredential });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/google',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Google Auth Status:', res.statusCode);
    console.log('Google Auth Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Google Auth Error:', e.message);
});

req.write(postData);
req.end();
