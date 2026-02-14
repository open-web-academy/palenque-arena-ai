import { log } from "./logger";

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    name?: string;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    name = "operation",
  } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts;
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);

      if (isLastAttempt) {
        log(
          `${name} failed after ${maxAttempts} attempts: ${error}`,
          "error"
        );
        throw error;
      }

      log(
        `${name} attempt ${attempt}/${maxAttempts} failed: ${error}. Retrying in ${delay}ms...`,
        "warn"
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`${name} failed: no attempts executed`);
}

export async function withTimeoutRetry<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  options: Omit<Parameters<typeof withRetry>[1], "name"> & { name?: string } = {}
): Promise<T> {
  return withRetry(
    () =>
      Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error("Operation timeout")), timeoutMs)
        ),
      ]),
    options
  );
}
