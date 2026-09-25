const CACHE_KEY = "courses:all";
const TTL = 60;
const cache: Record<string, { data: unknown; expires: number }> = {};

export function getCachedCourses<T>(): T | undefined {
  const hit = cache[CACHE_KEY];
  if (hit && hit.expires > Date.now()) return hit.data as T;
  return undefined;
}

export function setCachedCourses<T>(data: T) {
  cache[CACHE_KEY] = { data, expires: Date.now() + TTL * 1000 };
}

export function invalidateCoursesCache() {
  delete cache[CACHE_KEY];
}
