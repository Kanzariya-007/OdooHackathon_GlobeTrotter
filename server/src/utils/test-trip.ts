import app from '../app';
import http from 'http';
import { prisma } from './db';

// Helper to make assertions
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ Pass: ${message}`);
}

async function runTests() {
  console.log('Starting Trip integration tests against PostgreSQL database...');
  
  if (process.env.MOCK_DB === 'true') {
    throw new Error('Trip integration tests require a live database, MOCK_DB must not be true');
  }

  // Clean up any stale test users/trips from previous runs
  const testEmails = [
    'trip_tester_a@globetrotter.com',
    'trip_tester_b@globetrotter.com'
  ];
  try {
    await prisma.trip.deleteMany({
      where: {
        user: { email: { in: testEmails } }
      }
    });
    await prisma.user.deleteMany({
      where: { email: { in: testEmails } }
    });
  } catch (dbErr) {
    console.warn('Pre-test database cleanup warning (tables might be empty):', dbErr);
  }

  // Start the server on an ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Could not determine server address');
  }
  
  const port = address.port;
  const authBaseUrl = `http://localhost:${port}/api/auth`;
  const tripBaseUrl = `http://localhost:${port}/api/trips`;
  console.log(`Server listening on ephemeral port ${port}`);

  let tokenA = '';
  let tokenB = '';
  let tripIdA = '';

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

  // Setup: Create User A and User B
  await executeTest('Setup: Create User A and User B', async () => {
    // Register User A
    const resA = await fetch(`${authBaseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester A', email: testEmails[0], password: 'Password123' })
    });
    assert(resA.status === 201, `Failed to register User A: ${resA.status}`);
    const dataA: any = await resA.json();
    tokenA = dataA.token;

    // Register User B
    const resB = await fetch(`${authBaseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester B', email: testEmails[1], password: 'Password123' })
    });
    assert(resB.status === 201, `Failed to register User B: ${resB.status}`);
    const dataB: any = await resB.json();
    tokenB = dataB.token;
  });

  // 1. Create trip with valid JWT
  await executeTest('1. Create trip with valid JWT', async () => {
    const res = await fetch(tripBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Summer Paris getaway',
        description: 'Enjoying the lights of Paris',
        startDate: '2026-07-15',
        endDate: '2026-07-25'
      })
    });
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected success to be true');
    assert(!!data.trip.id, 'Expected trip ID to be returned');
    assert(data.trip.title === 'Summer Paris getaway', 'Expected matching title');
    assert(data.trip.name === 'Summer Paris getaway', 'Expected matching name for frontend');
    tripIdA = data.trip.id;
  });

  // 2. Create trip without JWT → 401
  await executeTest('2. Create trip without JWT → 401', async () => {
    const res = await fetch(tripBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Unauthorized Trip',
        startDate: '2026-07-15',
        endDate: '2026-07-25'
      })
    });
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === false, 'Expected success to be false');
  });

  // 3. Get user\'s trips
  await executeTest("3. Get user's trips", async () => {
    // User A fetches their trips
    const resA = await fetch(tripBaseUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(resA.status === 200, `Expected status 200, got ${resA.status}`);
    const tripsA: any = await resA.json();
    assert(Array.isArray(tripsA), 'Expected response to be array');
    assert(tripsA.length === 1, `Expected 1 trip, got ${tripsA.length}`);
    assert(tripsA[0].id === tripIdA, 'Expected matching trip ID');

    // User B fetches their trips (should have 0)
    const resB = await fetch(tripBaseUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(resB.status === 200, `Expected status 200, got ${resB.status}`);
    const tripsB: any = await resB.json();
    assert(tripsB.length === 0, `Expected 0 trips, got ${tripsB.length}`);
  });

  // 4. Get single trip
  await executeTest('4. Get single trip', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const trip: any = await res.json();
    assert(trip.id === tripIdA, 'Expected correct trip details returned');
    assert(trip.name === 'Summer Paris getaway', 'Expected name compatibility key');
  });

  // 5. Update own trip
  await executeTest('5. Update own trip', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Updated Paris Trip',
        description: 'New Description',
        startDate: '2026-07-16'
      })
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected update success');
    assert(data.trip.title === 'Updated Paris Trip', 'Expected updated title');
    assert(data.trip.description === 'New Description', 'Expected updated description');
    assert(data.trip.startDate === '2026-07-16', 'Expected updated start date');
  });

  // 6. Access another user\'s trip → rejected
  await executeTest("6. Access another user's trip → rejected", async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(res.status === 404, `Expected status 404 (securely hidden), got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === false, 'Expected success to be false');
  });

  // 7. Update another user\'s trip → rejected
  await executeTest("7. Update another user's trip → rejected", async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({ title: 'Hacked Trip' })
    });
    assert(res.status === 404, `Expected status 404, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === false, 'Expected success to be false');
  });

  // 8. Delete another user\'s trip → rejected
  await executeTest("8. Delete another user's trip → rejected", async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(res.status === 404, `Expected status 404, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === false, 'Expected success to be false');
  });

  // 9. Invalid date validation
  await executeTest('9. Invalid date validation', async () => {
    // Test startDate > endDate
    const res1 = await fetch(tripBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Broken Dates Trip',
        startDate: '2026-07-25',
        endDate: '2026-07-15'
      })
    });
    assert(res1.status === 400, `Expected status 400, got ${res1.status}`);
    const data1: any = await res1.json();
    assert(data1.success === false, 'Expected validation failure');
    assert(data1.message === 'Start date cannot be after end date', `Got message: ${data1.message}`);

    // Test bad date strings
    const res2 = await fetch(tripBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Bad Format Trip',
        startDate: 'not-a-date',
        endDate: '2026-07-25'
      })
    });
    assert(res2.status === 400, `Expected status 400, got ${res2.status}`);
  });

  // 10. Delete own trip
  await executeTest('10. Delete own trip', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected delete success');

    // Confirm it is gone
    const resCheck = await fetch(`${tripBaseUrl}/${tripIdA}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(resCheck.status === 404, `Expected status 404 when querying deleted trip, got ${resCheck.status}`);
  });

  // Cleanup database
  console.log('\nCleaning up test database records...');
  try {
    await prisma.trip.deleteMany({
      where: {
        user: { email: { in: testEmails } }
      }
    });
    await prisma.user.deleteMany({
      where: { email: { in: testEmails } }
    });
  } catch (cleanErr) {
    console.warn('Post-test cleanup database warning:', cleanErr);
  }

  // Close server
  console.log('Tearing down server...');
  await new Promise<void>((resolve) => server.close(() => resolve()));

  console.log('\n--- Test Summary ---');
  console.log(`Passed: ${passed}/${passed + failed}`);
  console.log(`Failed: ${failed}/${passed + failed}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All trip integration tests passed successfully!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
