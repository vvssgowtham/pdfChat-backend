import axios from "axios";

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isRetryableError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true;
  return error.response.status === 429 || error.response.status >= 500;
};

const MAX_RETRY_AFTER_MS = 30_000;

export const retryDelayMs = (error: unknown, attempt: number): number => {
  if (axios.isAxiosError(error)) {
    const raw = error.response?.headers?.["retry-after"];
    const retryAfter = Number(raw);
    if (Number.isFinite(retryAfter) && retryAfter > 0) {
      return Math.min(retryAfter * 1000, MAX_RETRY_AFTER_MS);
    }
  }
  return 1000 * 2 ** attempt;
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts = 4
): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts - 1 || !isRetryableError(error)) {
        throw error;
      }
      await sleep(retryDelayMs(error, attempt));
    }
  }
  throw lastError;
};
