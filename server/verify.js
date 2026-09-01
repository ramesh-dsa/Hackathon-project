// Lightweight verification script to ensure the backend foundation works correctly.
const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    console.log(`Starting verification against ${BASE_URL}...\n`);

    // 1. Test Root Endpoint
    const rootRes = await fetch(`${BASE_URL}/api/v1`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200, 'GET /api/v1 returns 200 OK');
    assert(rootData.success === true, 'GET /api/v1 returns success: true');

    // 2. Test Health Endpoint
    const healthRes = await fetch(`${BASE_URL}/api/v1/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/v1/health returns 200 OK');
    assert(healthData.status === 'OK', 'GET /api/v1/health returns status: OK');

    // 3. Test 404 Handler
    const notFoundRes = await fetch(`${BASE_URL}/api/v1/unknown-route`);
    const notFoundData = await notFoundRes.json();
    assert(notFoundRes.status === 404, 'GET /api/v1/unknown-route returns 404 Not Found');
    assert(notFoundData.success === false, '404 handler returns success: false');
    assert(notFoundData.error.message.includes('Route not found'), '404 handler returns correct error message');

    // 4. Test CORS
    const corsRes = await fetch(`${BASE_URL}/api/v1`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
      }
    });
    const allowOrigin = corsRes.headers.get('access-control-allow-origin');
    assert(allowOrigin === 'http://localhost:3000', `CORS allows configured origin (Got: ${allowOrigin})`);

    console.log(`\nVerification Complete: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`\n❌ Could not connect to the server. Is it running on port ${PORT}?`);
    console.error(error);
    process.exit(1);
  }
}

runTests();
