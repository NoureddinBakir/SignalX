/**
 * @jest-environment jsdom
 */
const { injectBadge, hasBadge } = require('../src/badgeInjector');

function createTweetArticle(username) {
  const article = document.createElement('article');
  article.setAttribute('data-testid', 'tweet');

  const link = document.createElement('a');
  link.setAttribute('href', `/${username}`);
  link.setAttribute('role', 'link');

  const span = document.createElement('span');
  span.textContent = `@${username}`;
  link.appendChild(span);
  article.appendChild(link);

  return article;
}

describe('badgeInjector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('injects a country badge into a tweet element', () => {
    const tweet = createTweetArticle('testuser');
    document.body.appendChild(tweet);

    injectBadge(tweet, 'United States');

    const badge = tweet.querySelector('[data-signalx-badge]');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toContain('United States');
  });

  test('badge displays country flag emoji for known countries', () => {
    const tweet = createTweetArticle('testuser');
    document.body.appendChild(tweet);

    injectBadge(tweet, 'United States');

    const badge = tweet.querySelector('[data-signalx-badge]');
    expect(badge.textContent).toContain('\u{1F1FA}\u{1F1F8}');
  });

  test('does not inject duplicate badges', () => {
    const tweet = createTweetArticle('testuser');
    document.body.appendChild(tweet);

    injectBadge(tweet, 'Japan');
    injectBadge(tweet, 'Japan');

    const badges = tweet.querySelectorAll('[data-signalx-badge]');
    expect(badges).toHaveLength(1);
  });

  test('hasBadge returns false for tweet without badge', () => {
    const tweet = createTweetArticle('testuser');
    expect(hasBadge(tweet)).toBe(false);
  });

  test('hasBadge returns true for tweet with badge', () => {
    const tweet = createTweetArticle('testuser');
    injectBadge(tweet, 'Japan');
    expect(hasBadge(tweet)).toBe(true);
  });

  test('injects "Unknown" badge when country is null', () => {
    const tweet = createTweetArticle('testuser');
    injectBadge(tweet, null);

    const badge = tweet.querySelector('[data-signalx-badge]');
    expect(badge.textContent).toContain('Unknown');
  });

  test('badge is styled as an inline element', () => {
    const tweet = createTweetArticle('testuser');
    injectBadge(tweet, 'Brazil');

    const badge = tweet.querySelector('[data-signalx-badge]');
    expect(badge.style.display).toBe('inline-flex');
  });
});
