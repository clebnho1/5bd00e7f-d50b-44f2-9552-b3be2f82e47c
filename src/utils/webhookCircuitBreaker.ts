
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

class WebhookCircuitBreaker {
  private states = new Map<string, CircuitBreakerState>();
  private readonly failureThreshold = 3;
  private readonly recoveryTime = 30000; // 30 segundos
  private readonly maxRetries = 2;
  private readonly baseDelay = 1000; // 1 segundo

  getState(url: string): CircuitBreakerState {
    if (!this.states.has(url)) {
      this.states.set(url, {
        failures: 0,
        lastFailure: 0,
        state: 'CLOSED'
      });
    }
    return this.states.get(url)!;
  }

  canExecute(url: string): boolean {
    const state = this.getState(url);
    const now = Date.now();

    if (state.state === 'OPEN') {
      if (now - state.lastFailure > this.recoveryTime) {
        state.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }

    return true;
  }

  recordSuccess(url: string): void {
    const state = this.getState(url);
    state.failures = 0;
    state.state = 'CLOSED';
  }

  recordFailure(url: string): void {
    const state = this.getState(url);
    state.failures++;
    state.lastFailure = Date.now();

    if (state.failures >= this.failureThreshold) {
      state.state = 'OPEN';
    }
  }

  async executeWithRetry<T>(
    url: string,
    operation: () => Promise<T>
  ): Promise<T> {
    if (!this.canExecute(url)) {
      throw new Error('Circuit breaker is OPEN - webhook temporarily disabled');
    }

    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        this.recordSuccess(url);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.log(`Webhook attempt ${attempt + 1} failed:`, error);

        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.recordFailure(url);
    throw lastError!;
  }
}

export const webhookCircuitBreaker = new WebhookCircuitBreaker();
