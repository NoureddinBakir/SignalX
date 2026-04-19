const { extractUsersFromTimeline, resolveLocationToCountry } = require('../src/accountFetcher');

describe('extractUsersFromTimeline', () => {
  test('extracts user screen_name and location from timeline response', () => {
    const timelineData = makeTimeline([
      makeUser('_kaitodev', 'Kaito', 'San Francisco, CA'),
      makeUser('elonmusk', 'Elon Musk', 'Mars & Austin'),
    ]);

    const users = extractUsersFromTimeline(timelineData);
    expect(users).toHaveLength(2);
    expect(users[0]).toEqual({ screenName: '_kaitodev', location: 'San Francisco, CA' });
    expect(users[1]).toEqual({ screenName: 'elonmusk', location: 'Mars & Austin' });
  });

  test('handles user with empty location', () => {
    const timelineData = makeTimeline([
      makeUser('noLocation', 'Ghost', ''),
    ]);

    const users = extractUsersFromTimeline(timelineData);
    expect(users[0]).toEqual({ screenName: 'noLocation', location: '' });
  });

  test('handles user with no location object', () => {
    const timelineData = makeTimeline([
      makeUserNoLocation('minimal', 'Min'),
    ]);

    const users = extractUsersFromTimeline(timelineData);
    expect(users[0]).toEqual({ screenName: 'minimal', location: '' });
  });

  test('returns empty array for empty/malformed data', () => {
    expect(extractUsersFromTimeline({})).toEqual([]);
    expect(extractUsersFromTimeline(null)).toEqual([]);
    expect(extractUsersFromTimeline({ data: {} })).toEqual([]);
  });

  test('deduplicates users by screen_name', () => {
    const timelineData = makeTimeline([
      makeUser('same', 'Same User', 'NYC'),
      makeUser('same', 'Same User', 'NYC'),
      makeUser('other', 'Other', 'LA'),
    ]);

    const users = extractUsersFromTimeline(timelineData);
    const screenNames = users.map(u => u.screenName);
    expect(screenNames.filter(n => n === 'same')).toHaveLength(1);
  });
});

describe('resolveLocationToCountry', () => {
  test('resolves US city + state to United States', () => {
    expect(resolveLocationToCountry('San Francisco, CA')).toBe('United States');
    expect(resolveLocationToCountry('New York, NY')).toBe('United States');
    expect(resolveLocationToCountry('Austin, TX')).toBe('United States');
    expect(resolveLocationToCountry('Los Angeles, California')).toBe('United States');
  });

  test('resolves country names directly', () => {
    expect(resolveLocationToCountry('Japan')).toBe('Japan');
    expect(resolveLocationToCountry('United Kingdom')).toBe('United Kingdom');
    expect(resolveLocationToCountry('Brazil')).toBe('Brazil');
  });

  test('resolves city, country format', () => {
    expect(resolveLocationToCountry('London, UK')).toBe('United Kingdom');
    expect(resolveLocationToCountry('Tokyo, Japan')).toBe('Japan');
    expect(resolveLocationToCountry('Paris, France')).toBe('France');
  });

  test('resolves well-known cities without country', () => {
    expect(resolveLocationToCountry('London')).toBe('United Kingdom');
    expect(resolveLocationToCountry('Tokyo')).toBe('Japan');
    expect(resolveLocationToCountry('Paris')).toBe('France');
    expect(resolveLocationToCountry('Berlin')).toBe('Germany');
  });

  test('returns null for empty or joke locations', () => {
    expect(resolveLocationToCountry('')).toBeNull();
    expect(resolveLocationToCountry('Mars')).toBeNull();
    expect(resolveLocationToCountry('The Internet')).toBeNull();
    expect(resolveLocationToCountry('Everywhere')).toBeNull();
  });

  test('is case-insensitive', () => {
    expect(resolveLocationToCountry('san francisco, ca')).toBe('United States');
    expect(resolveLocationToCountry('TOKYO')).toBe('Japan');
    expect(resolveLocationToCountry('london, uk')).toBe('United Kingdom');
  });
});

// ── Test helpers to build realistic timeline structures ──

function makeUser(screenName, name, location) {
  return {
    __typename: 'User',
    core: { created_at: 'Wed Feb 21 21:31:42 +0000 2018', name, screen_name: screenName },
    location: { location },
    legacy: { description: 'test bio' },
    rest_id: '123456',
  };
}

function makeUserNoLocation(screenName, name) {
  return {
    __typename: 'User',
    core: { created_at: 'Wed Feb 21 21:31:42 +0000 2018', name, screen_name: screenName },
    legacy: { description: 'test bio' },
    rest_id: '789',
  };
}

function makeTimeline(users) {
  // Simulate the nested timeline structure — users are buried deep
  return {
    data: {
      home: {
        home_timeline_urt: {
          instructions: [
            {
              type: 'TimelineAddEntries',
              entries: users.map((user, i) => ({
                content: {
                  entryType: 'TimelineTimelineItem',
                  itemContent: {
                    tweet_results: {
                      result: {
                        core: { user_results: { result: user } },
                      },
                    },
                  },
                },
              })),
            },
          ],
        },
      },
    },
  };
}
