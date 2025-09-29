// Lightweight retry helper for pactum requests. No heavy pactum types required here.
type SpecFactory = () => Promise<any> | any;

/**
 * Run a pactum spec factory with retries on network errors (502) or timeouts.
 * Retries are conservative to avoid masking real failures.
 */
export async function requestWithRetry(specFn: () => Promise<any>, opts?: { retries?: number; delayMs?: number }) {
  const retries = opts?.retries ?? 2;
  const delayMs = opts?.delayMs ?? 500;

  let lastErr: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // specFn should return a promise that resolves when the spec completes
      return await specFn();
    } catch (err) {
      lastErr = err;
      // Basic heuristic: if the error looks like a network or 5xx issue, retry
      const status = err?.response?.status || err?.status || err?.statusCode || err?.status_code;
      const isNetworkError = !status || (status >= 500 && status < 600) || /Timeout|ECONNREFUSED|ENOTFOUND|EAI_AGAIN/i.test(String(err));
      if (attempt < retries && isNetworkError) {
        // wait
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
