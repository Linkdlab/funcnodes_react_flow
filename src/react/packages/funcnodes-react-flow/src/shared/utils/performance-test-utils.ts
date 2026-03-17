export interface RetryPerformanceAssertionOptions {
  attempts?: number;
  afterFailure?: (attempt: number, error: unknown) => void | Promise<void>;
}

export async function retryPerformanceAssertion(
  assertion: (attempt: number) => void | Promise<void>,
  options: RetryPerformanceAssertionOptions = {}
): Promise<void> {
  const { attempts = 3, afterFailure } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await assertion(attempt);
      return;
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await afterFailure?.(attempt, error);
      }
    }
  }

  throw lastError;
}
