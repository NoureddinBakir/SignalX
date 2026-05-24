const { getTier, getViewTier, compact, accountAge, VIEW_TIERS } = require('../src/tiers');

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

describe('getViewTier', () => {
  test('500K+ tier for viral posts', () => {
    expect(getViewTier(500000).label).toBe('500K+');
    expect(getViewTier(1_200_000).label).toBe('500K+');
    expect(getViewTier(500000).color).toBe('#E03131');
  });

  test('300K+ tier', () => {
    expect(getViewTier(300000).label).toBe('300K+');
    expect(getViewTier(499999).label).toBe('300K+');
  });

  test('100K+ tier', () => {
    expect(getViewTier(100000).label).toBe('100K+');
    expect(getViewTier(299999).label).toBe('100K+');
  });

  test('10K+ tier', () => {
    expect(getViewTier(10000).label).toBe('10K+');
    expect(getViewTier(99999).label).toBe('10K+');
  });

  test('5K+ tier', () => {
    expect(getViewTier(5000).label).toBe('5K+');
    expect(getViewTier(9999).label).toBe('5K+');
  });

  test('1K+ tier', () => {
    expect(getViewTier(1000).label).toBe('1K+');
    expect(getViewTier(4999).label).toBe('1K+');
  });

  test('<1K baseline tier', () => {
    expect(getViewTier(0).label).toBe('<1K');
    expect(getViewTier(999).label).toBe('<1K');
  });

  test('coerces strings (views.count arrives as a string)', () => {
    expect(getViewTier('150000').label).toBe('100K+');
    expect(getViewTier('not-a-number').label).toBe('<1K');
  });

  test('exact boundary values', () => {
    expect(getViewTier(500000).label).toBe('500K+');
    expect(getViewTier(499999).label).toBe('300K+');
    expect(getViewTier(100000).label).toBe('100K+');
    expect(getViewTier(99999).label).toBe('10K+');
    expect(getViewTier(1000).label).toBe('1K+');
    expect(getViewTier(999).label).toBe('<1K');
  });

  test('VIEW_TIERS are sorted descending by min', () => {
    for (let i = 1; i < VIEW_TIERS.length; i++) {
      expect(VIEW_TIERS[i - 1].min).toBeGreaterThan(VIEW_TIERS[i].min);
    }
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
