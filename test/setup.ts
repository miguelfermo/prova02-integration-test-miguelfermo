import pactum from 'pactum';

// Increase default timeout for CI environments where network can be slower.
// 60s is a safe upper bound for flaky external APIs.
pactum.request.setDefaultTimeout(60000);

// Optional: reduce logging noise in CI by turning off detailed request/response printing
// but keep reporter hooks intact.
// pactum.settings.set('print', false); // uncomment if needed

// Export nothing; this file is executed by Jest before tests run.
