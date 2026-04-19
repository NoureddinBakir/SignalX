const { CountryCache } = require('../src/cache');

describe('CountryCache', () => {
  let cache;

  beforeEach(() => {
    cache = new CountryCache();
  });

  test('stores and retrieves a country for a username', () => {
    cache.set('elonmusk', 'United States');
    expect(cache.get('elonmusk')).toBe('United States');
  });

  test('returns undefined for unknown username', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  test('has() returns true for cached username', () => {
    cache.set('jack', 'United States');
    expect(cache.has('jack')).toBe(true);
  });

  test('has() returns false for uncached username', () => {
    expect(cache.has('unknown')).toBe(false);
  });

  test('can cache null country (looked up but not found)', () => {
    cache.set('private_user', null);
    expect(cache.has('private_user')).toBe(true);
    expect(cache.get('private_user')).toBeNull();
  });

  test('respects max size and evicts oldest entries', () => {
    const smallCache = new CountryCache(3);
    smallCache.set('user1', 'US');
    smallCache.set('user2', 'Germany');
    smallCache.set('user3', 'Japan');
    smallCache.set('user4', 'Brazil'); // should evict user1

    expect(smallCache.has('user1')).toBe(false);
    expect(smallCache.has('user4')).toBe(true);
    expect(smallCache.size()).toBe(3);
  });

  test('size() returns current cache size', () => {
    expect(cache.size()).toBe(0);
    cache.set('a', 'US');
    cache.set('b', 'UK');
    expect(cache.size()).toBe(2);
  });

  test('clear() empties the cache', () => {
    cache.set('a', 'US');
    cache.set('b', 'UK');
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.has('a')).toBe(false);
  });
});
