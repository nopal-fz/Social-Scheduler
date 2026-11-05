export type RateLimiter = {
  consume(key: string, now?: number): boolean;
};

export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}): RateLimiter {
  // shortcut: in-memory per process; move to Postgres if the app ever runs more than one instance.
  const hits = new Map<string, number[]>();

  return {
    consume(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);

      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }

      recent.push(now);
      hits.set(key, recent);
      return true;
    },
  };
}
