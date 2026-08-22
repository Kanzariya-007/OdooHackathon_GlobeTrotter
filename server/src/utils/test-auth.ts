process.env.MOCK_DB = 'true';
import app from '../app';
import http from 'http';

// Helper to make assertions
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ Pass: ${message}`);
}

async function runTests() {
  console.log('Starting authentication integration tests...');

  // Start the server on a random port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Could not determine server address');
  }
  
  const port = address.port;
  const baseUrl = `http://localhost:${port}/api/auth`;
  console.log(`Server listening on ephemeral port ${port}`);

  const testEmail = `traveler_${Date.now()}_${Math.floor(Math.random() * 1000)}@globetrotter.com`;
  const testPassword = 'SecretPassword123';
  const testName = 'Alice Traveler';
  let validToken = '';

  let passed = 0;
  let failed = 0;

  async function executeTest(name: string, fn: () => Promise<void>) {
    console.log(`\nRunning test: ${name}`);
    try {
      await fn();
      passed++;
    } catch (err: any) {
      console.error(`  ✗ Fail: ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Register valid user
  await executeTest('1. Register valid user', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
    });
    
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected success to be true');
    assert(!!data.token, 'Expected JWT token to be returned');
    assert(data.user.email === testEmail.toLowerCase(), 'Expected email match');
    assert(data.user.name === testName, 'Expected name match');
    assert(!data.user.password, 'Expected password field to be omitted');
    validToken = data.token;
  });

  // 2. Register duplicate email
  await executeTest('2. Register duplicate email', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob Traveler', email: testEmail, password: 'DifferentPassword' }),
    });

    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === false, 'Expected success to be false');
    assert(data.message === 'Email already registered', `Expected "Email already registered", got "${data.message}"`);
  });

  // 3. Register missing fields
  await executeTest('3. Register missing fields', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'no_name@globetrotter.com', password: 'password123' }),
    });

    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === false, 'Expected success to be false');
  });

  // 4. Login valid credentials
  await executeTest('4. Login valid credentials', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected success to be true');
    assert(!!data.token, 'Expected JWT token');
    assert(data.user.email === testEmail.toLowerCase(), 'Expected email match');
    assert(!data.user.password, 'Expected password to be omitted');
  });

  // 5. Login invalid password
  await executeTest('5. Login invalid password', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'wrong_password' }),
    });

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === false, 'Expected success false');
    assert(data.message === 'Invalid email or password', `Expected "Invalid email or password", got "${data.message}"`);
  });

  // 6. Login unknown email
  await executeTest('6. Login unknown email', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown_traveler@globetrotter.com', password: testPassword }),
    });

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === false, 'Expected success false');
  });

  // 7. /me with valid token
  await executeTest('7. /me with valid token', async () => {
    const res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${validToken}` },
    });

    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected success true');
    assert(data.user.email === testEmail.toLowerCase(), 'Expected matching email');
    assert(!data.user.password, 'Expected password to be omitted');
  });

  // 8. /me without token
  await executeTest('8. /me without token', async () => {
    const res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
    });

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === false, 'Expected success false');
  });

  // 9. /me with invalid token
  await executeTest('9. /me with invalid token', async () => {
    const res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer some-fake-token-value' },
    });

    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === false, 'Expected success false');
  });

  // Tear down server
  console.log('\nTearing down server...');
  await new Promise<void>((resolve) => server.close(() => resolve()));
  
  console.log('\n--- Test Summary ---');
  console.log(`Passed: ${passed}/${passed + failed}`);
  console.log(`Failed: ${failed}/${passed + failed}`);
  
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All tests passed successfully!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
