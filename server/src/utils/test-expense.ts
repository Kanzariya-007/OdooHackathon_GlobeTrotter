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
  console.log('Starting Expense & Summary integration tests against PostgreSQL database...');
  
  if (process.env.MOCK_DB === 'true') {
    throw new Error('Expense integration tests require a live database, MOCK_DB must not be true');
  }

  // Fetch a real city and activity from seeded DB for summary statistics testing
  const cityAhmedabad = await prisma.city.findFirst({ where: { name: 'Ahmedabad' } });
  if (!cityAhmedabad) {
    throw new Error('Ahmedabad city not found in seeded DB. Please run seed script first.');
  }

  const actAhmedabad = await prisma.activity.findFirst({ where: { cityId: cityAhmedabad.id } });
  if (!actAhmedabad) {
    throw new Error('Ahmedabad activity not found in seeded DB. Please run seed script first.');
  }

  // Clean up any stale test users/trips from previous runs
  const testEmails = [
    'expense_tester_a@globetrotter.com',
    'expense_tester_b@globetrotter.com'
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
  let expenseIdA = '';

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

  // Setup: Create Users, Trip A, TripStop, and Activity for User A
  await executeTest('Setup: Create Users, Trip A, Stop, and Activity for A', async () => {
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
        title: 'Summary Stats Trip',
        startDate: '2026-11-01',
        endDate: '2026-11-10'
      })
    });
    const dataTrip: any = await resTrip.json();
    tripIdA = dataTrip.trip.id;

    // Create TripStop for A
    const resStop = await fetch(`${tripBaseUrl}/${tripIdA}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        cityId: cityAhmedabad.id,
        order: 1
      })
    });
    const dataStop: any = await resStop.json();
    stopIdA = dataStop.stop.id;

    // Assign Activity to Stop for A
    await fetch(`${tripBaseUrl}/${tripIdA}/stops/${stopIdA}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        activityId: actAhmedabad.id,
        order: 1
      })
    });
  });

  // 1. Create valid expense
  await executeTest('1. Create valid expense', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Flight tickets',
        amount: 450.50,
        currency: 'USD',
        category: 'transport',
        date: '2026-11-02'
      })
    });
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected success to be true');
    assert(!!data.expense.id, 'Expected expense ID to be returned');
    assert(data.expense.title === 'Flight tickets', 'Expected matching title');
    assert(data.expense.amount === 450.50, `Expected matching amount, got ${data.expense.amount}`);
    expenseIdA = data.expense.id;
  });

  // 2. Create expense without JWT → 401
  await executeTest('2. Create expense without JWT → 401', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Unauthorized expense',
        amount: 100,
        currency: 'USD',
        category: 'food',
        date: '2026-11-02'
      })
    });
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
  });

  // 3. Create expense for non-existent trip → appropriate error
  await executeTest('3. Create expense for non-existent trip → 404', async () => {
    const res = await fetch(`${tripBaseUrl}/some-non-existent-uuid/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Non-existent trip expense',
        amount: 100,
        currency: 'USD',
        category: 'food',
        date: '2026-11-02'
      })
    });
    assert(res.status === 404, `Expected status 404, got ${res.status}`);
  });

  // 4. Invalid amount → rejected
  await executeTest('4. Invalid amount → rejected', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Negative expense',
        amount: -50, // Negative amount
        currency: 'USD',
        category: 'food',
        date: '2026-11-02'
      })
    });
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
  });

  // 5. Invalid date → rejected
  await executeTest('5. Invalid date → rejected', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Invalid Date expense',
        amount: 50,
        currency: 'USD',
        category: 'food',
        date: 'not-a-valid-date' // Bad date format
      })
    });
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
  });

  // 6. Get expenses
  await executeTest('6. Get expenses', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/expenses`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const expenses: any = await res.json();
    assert(Array.isArray(expenses), 'Expected array response');
    assert(expenses.length === 1, `Expected 1 expense, got ${expenses.length}`);
    assert(expenses[0].id === expenseIdA, 'Expected correct expense ID');
  });

  // 7. Update expense
  await executeTest('7. Update expense', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/expenses/${expenseIdA}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Upgraded Flight ticket',
        amount: 500
      })
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected update success');
    assert(data.expense.title === 'Upgraded Flight ticket', 'Expected updated title');
    assert(data.expense.amount === 500, `Expected updated amount, got ${data.expense.amount}`);
  });

  // 8. User B cannot read User A\'s expenses
  await executeTest("8. User B cannot read User A's expenses", async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/expenses`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(res.status === 404, `Expected status 404 (hidden), got ${res.status}`);
  });

  // 9. User B cannot create expense on User A\'s trip
  await executeTest("9. User B cannot create expense on User A's trip", async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        title: 'Hacker expense',
        amount: 100,
        currency: 'USD',
        category: 'food',
        date: '2026-11-02'
      })
    });
    assert(res.status === 404, `Expected status 404, got ${res.status}`);
  });

  // 10. User B cannot update User A\'s expense
  await executeTest("10. User B cannot update User A's expense", async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/expenses/${expenseIdA}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({ title: 'Hacked Title' })
    });
    assert(res.status === 404, `Expected status 404, got ${res.status}`);
  });

  // 11. User B cannot delete User A\'s expense
  await executeTest("11. User B cannot delete User A's expense", async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/expenses/${expenseIdA}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(res.status === 404, `Expected status 404, got ${res.status}`);
  });

  // 12. User B cannot access User A\'s summary
  await executeTest("12. User B cannot access User A's summary", async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/summary`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(res.status === 404, `Expected status 404, got ${res.status}`);
  });

  // Add another expense to A's trip (in a different category) for summary test
  await executeTest('Setup: Create second expense for User A', async () => {
    await fetch(`${tripBaseUrl}/${tripIdA}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Hotel stay',
        amount: 250,
        currency: 'USD',
        category: 'hotel',
        date: '2026-11-03'
      })
    });
  });

  // 13. Trip summary returns correct stop count
  // 14. Trip summary returns correct activity count
  // 15. Trip summary returns correct expense total
  // 16. Trip summary groups expenses by category
  await executeTest('13-16. Verify Trip Summary aggregations', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/summary`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const body: any = await res.json();
    assert(body.success === true, 'Expected success to be true');

    const data = body.data;
    assert(data.trip.id === tripIdA, 'Expected correct trip ID');
    assert(data.statistics.totalStops === 1, `Expected 1 stop, got ${data.statistics.totalStops}`);
    assert(data.statistics.totalActivities === 1, `Expected 1 activity, got ${data.statistics.totalActivities}`);
    assert(data.statistics.totalExpenses === 750, `Expected 750 total expenses (500 + 250), got ${data.statistics.totalExpenses}`);
    assert(data.statistics.expenseCount === 2, `Expected 2 expenseCount, got ${data.statistics.expenseCount}`);
    
    // Grouping checks
    assert(data.expensesByCategory.transport === 500, `Expected 500 for transport, got ${data.expensesByCategory.transport}`);
    assert(data.expensesByCategory.hotel === 250, `Expected 250 for hotel, got ${data.expensesByCategory.hotel}`);
  });

  // 17. Delete own expense
  await executeTest('17. Delete own expense', async () => {
    const res = await fetch(`${tripBaseUrl}/${tripIdA}/expenses/${expenseIdA}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    const data: any = await res.json();
    assert(data.success === true, 'Expected delete success');

    // Verify it is removed
    const checkList = await fetch(`${tripBaseUrl}/${tripIdA}/expenses`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const expenses: any = await checkList.json();
    assert(expenses.length === 1, `Expected remaining expenses to be 1, got ${expenses.length}`);
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
    console.log('All expense and summary integration tests passed successfully!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
