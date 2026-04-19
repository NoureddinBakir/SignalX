const { getTier, compact, accountAge } = require('../src/tiers');

describe('getTier', () => {
  test('10K+ tier for >= 10000 followers', () => {
    const tier = getTier(15000);
    expect(tier.label).toBe('10K+');
    expect(tier.color).toBe('#D4A017');
  });

  test('5K+ tier for >= 5000 followers', () => {
    expect(getTier(5000).label).toBe('5K+');
    expect(getTier(7999).label).toBe('5K+');
  });

  test('3K+ tier', () => {
    expect(getTier(3000).label).toBe('3K+');
    expect(getTier(4999).label).toBe('3K+');
  });

  test('2K+ tier', () => {
    expect(getTier(2000).label).toBe('2K+');
    expect(getTier(2999).label).toBe('2K+');
  });

  test('1.5K+ tier', () => {
    expect(getTier(1500).label).toBe('1.5K+');
    expect(getTier(1999).label).toBe('1.5K+');
  });

  test('no tier for < 1500', () => {
    const tier = getTier(500);
    expect(tier.label).toBe('');
    expect(tier.min).toBe(0);
  });

  test('exact boundary values', () => {
    expect(getTier(1500).label).toBe('1.5K+');
    expect(getTier(1499).label).toBe('');
    expect(getTier(10000).label).toBe('10K+');
    expect(getTier(9999).label).toBe('5K+');
  });
});

describe('compact', () => {
  test('formats millions', () => {
    expect(compact(1500000)).toBe('1.5M');
    expect(compact(1000000)).toBe('1M');
    expect(compact(2300000)).toBe('2.3M');
  });

  test('formats thousands', () => {
    expect(compact(7500)).toBe('7.5K');
    expect(compact(1000)).toBe('1K');
    expect(compact(42000)).toBe('42K');
    expect(compact(1200)).toBe('1.2K');
  });

  test('leaves small numbers as-is', () => {
    expect(compact(999)).toBe('999');
    expect(compact(0)).toBe('0');
    expect(compact(42)).toBe('42');
  });
});

describe('accountAge', () => {
  test('returns years for old accounts', () => {
    // 5 years ago
    const date = new Date();
    date.setFullYear(date.getFullYear() - 5);
    date.setMonth(date.getMonth() - 1); // ensure we're clearly past 5 years
    expect(accountAge(date.toUTCString())).toBe('5yr');
  });

  test('returns months for young accounts', () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    expect(accountAge(date.toUTCString())).toMatch(/^\d+mo$/);
  });

  test('returns empty string for falsy input', () => {
    expect(accountAge('')).toBe('');
    expect(accountAge(null)).toBe('');
    expect(accountAge(undefined)).toBe('');
  });
});
