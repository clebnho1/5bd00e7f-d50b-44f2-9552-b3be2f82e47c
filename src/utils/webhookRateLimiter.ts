
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class WebhookRateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly maxRequests = 10; // 10 requests per minute
  private readonly windowMs = 60000; // 1 minuto

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (entry.count < this.maxRequests) {
      entry.count++;
      return true;
    }

    return false;
  }

  getRemainingRequests(key: string): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return 0;
    }
    return entry.resetTime;
  }
}

export const webhookRateLimiter = new WebhookRateLimiter();
