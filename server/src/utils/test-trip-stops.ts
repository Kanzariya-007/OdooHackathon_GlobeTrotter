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
  console.log('Starting Trip Stops & Activities integration tests against PostgreSQL database...');
  
  if (process.env.MOCK_DB === 'true') {
    throw new Error('Trip stops integration tests require a live database, MOCK_DB must not be true');
  }

  // Fetch real cities and activities from seeded DB
  const cityAhmedabad = await prisma.city.findFirst({ where: { name: 'Ahmedabad' } });
  const cityMumbai = await prisma.city.findFirst({ where: { name: 'Mumbai' } });

  if (!cityAhmedabad || !cityMumbai) {
    throw new Error('Required seeded cities (Ahmedabad, Mumbai) not found. Please run seed script first.');
  }

  const actAhmedabad = await prisma.activity.findFirst({ where: { cityId: cityAhmedabad.id } });
  const actMumbai = await prisma.activity.findFirst({ where: { cityId: cityMumbai.id } });

  if (!actAhmedabad || !actMumbai) {
    throw new Error('Required seeded activities not found. Please run seed script first.');
  }

  // Clean up any stale test users/trips from previous runs
  const testEmails = [
    'stop_tester_a@globetrotter.com',
    'stop_tester_b@globetrotter.com'
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
  let stopIdA = '';

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

  // Setup: Create Users and Trip A
  await executeTest('Setup: Create Users and Trip A', async () => {
    // User A
    const resA = await fetch(`${authBaseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester A', email: testEmails[0], password: 'Password123' })
    });
    const dataA: any = await resA.json();
    tokenA = dataA.token;

    // User B
    const resB = await fetch(`${authBaseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester B', email: testEmails[1], password: 'Password123' })
    });
    const dataB: any = await resB.json();
    tokenB = dataB.token;

    // Create Trip for A
    const resTrip = await fetch(tripBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'India Tour',
        startDate: '2026-10-01',
        endDate: '2026-10-15'
      })
    });
    const dataTrip: any = await resTrip.json();
    tripIdA = dataTrip.trip.id;
  });

  // 1. Create trip stop with valid JWT
  await executeTest('1. Create trip stop with valid JWT', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        cityId: cityAhmedabad.id,
        arrivalDate: '2026-10-01',
        departureDate: '2026-10-05',
        order: 1
      })
    });
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected success to be true');
    assert(!!data.stop.id, 'Expected stop ID to be returned');
    assert(data.stop.cityId === cityAhmedabad.id, 'Expected matching city ID');
    assert(data.stop.city.name === 'Ahmedabad', 'Expected embedded city info');
    stopIdA = data.stop.id;
  });

  // 2. Create stop without JWT → 401
  await executeTest('2. Create stop without JWT → 401', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cityId: cityAhmedabad.id,
        order: 2
      })
    });
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
  });

  // 3. Invalid city → rejected
  await executeTest('3. Invalid city → rejected', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        cityId: 999999, // Non-existent city
        order: 2
      })
    });
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === false, 'Expected validation success status to be false');
    assert(data.message === 'Referenced city does not exist', `Got message: ${data.message}`);
  });

  // 4. Invalid dates → rejected
  await executeTest('4. Invalid dates → rejected', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        cityId: cityAhmedabad.id,
        arrivalDate: '2026-10-05',
        departureDate: '2026-10-01', // Arrival > Departure
        order: 2
      })
    });
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const data: any = await res.json();
    assert(data.message === 'arrivalDate cannot be after departureDate', `Got message: ${data.message}`);
  });

  // 5. Get trip stops
  await executeTest('5. Get trip stops', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const stops: any = await res.json();
    assert(Array.isArray(stops), 'Expected array response');
    assert(stops.length === 1, `Expected 1 stop, got ${stops.length}`);
    assert(stops[0].id === stopIdA, 'Expected correct stop ID');
    assert(stops[0].city.name === 'Ahmedabad', 'Expected included city info');
  });

  // 6. Update trip stop
  await executeTest('6. Update trip stop', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops/${stopIdA}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        arrivalDate: '2026-10-02',
        order: 5
      })
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected update success');
    assert(data.stop.order === 5, 'Expected updated order');
  });

  // 7. User B cannot access User A\'s trip stops
  await executeTest("7. User B cannot access User A's trip stops", async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(res.status === 404, `Expected status 404 (hidden), got ${res.status}`);
  });

  // 8. Add valid activity to stop
  await executeTest('8. Add valid activity to stop', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops/${stopIdA}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        activityId: actAhmedabad.id,
        order: 1,
        notes: 'Visit Gandhi Ashram'
      })
    });
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected assignment success');
    assert(data.stopActivity.activityId === actAhmedabad.id, 'Expected correct activity ID');
    assert(data.stopActivity.activity.name === actAhmedabad.name, 'Expected embedded activity info');
  });

  // 9. Get stop activities
  await executeTest('9. Get stop activities', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops/${stopIdA}/activities`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const activities: any = await res.json();
    assert(Array.isArray(activities), 'Expected array response');
    assert(activities.length === 1, `Expected 1 activity, got ${activities.length}`);
    assert(activities[0].activityId === actAhmedabad.id, 'Expected correct activity ID');
  });

  // 10. Prevent duplicate activity assignment
  await executeTest('10. Prevent duplicate activity assignment', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops/${stopIdA}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        activityId: actAhmedabad.id,
        order: 2
      })
    });
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const data: any = await res.json();
    assert(data.message === 'Activity is already assigned to this stop', `Got message: ${data.message}`);
  });

  // 11. Reject activity belonging to another city
  await executeTest('11. Reject activity belonging to another city', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops/${stopIdA}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        activityId: actMumbai.id, // Mumbai activity in Ahmedabad stop
        order: 3
      })
    });
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const data: any = await res.json();
    assert(data.message === 'Activity must belong to the same city as the trip stop', `Got message: ${data.message}`);
  });

  // 12. User B cannot modify User A\'s stop/activity
  await executeTest("12. User B cannot modify User A's stop/activity", async () => {
    // Attempt assignment
    const resAssign = await fetch(`${tripBaseUrl}/${tripIdA}/stops/${stopIdA}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        activityId: actAhmedabad.id,
        order: 2
      })
    });
    assert(resAssign.status === 404, `Expected status 404 for User B modify attempt, got ${resAssign.status}`);
  });

  // 13. Delete assigned activity
  await executeTest('13. Delete assigned activity', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops/${stopIdA}/activities/${actAhmedabad.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected delete success status to be true');

    // Verify underlying activity still exists in catalog
    const checkCatalog = await prisma.activity.findUnique({
      where: { id: actAhmedabad.id }
    });
    assert(!!checkCatalog, 'Expected catalog activity to still exist');
  });

  // 14. Delete own trip stop
  await executeTest('14. Delete own trip stop', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/stops/${stopIdA}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected delete success');

    // Verify it is removed
    const checkStop = await prisma.tripStop.findUnique({
      where: { id: stopIdA }
    });
    assert(!checkStop, 'Expected trip stop record to be deleted');
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
    console.log('All trip stops integration tests passed successfully!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
