/**
 * @jest-environment jsdom
 */
const { scanFeedForUsernames } = require('../src/feedScanner');

function createTweetArticle(username, displayName = 'Test User') {
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

describe('feedScanner', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('extracts a single username from a tweet in the feed', () => {
    const tweet = createTweetArticle('elonmusk');
    document.body.appendChild(tweet);

    const usernames = scanFeedForUsernames(document);
    expect(usernames).toContain('elonmusk');
  });

  test('extracts multiple unique usernames from multiple tweets', () => {
    document.body.appendChild(createTweetArticle('_its_not_real_'));
    document.body.appendChild(createTweetArticle('jack'));
    document.body.appendChild(createTweetArticle('_its_not_real_')); // duplicate

    const usernames = scanFeedForUsernames(document);
    expect(usernames).toEqual(['_its_not_real_', 'jack']);
    expect(usernames).toHaveLength(2);
  });

  test('returns empty array when no tweets are present', () => {
    const usernames = scanFeedForUsernames(document);
    expect(usernames).toEqual([]);
  });

  test('ignores links that are not username links (e.g. hashtags)', () => {
    const article = document.createElement('article');
    article.setAttribute('data-testid', 'tweet');

    const hashtagLink = document.createElement('a');
    hashtagLink.setAttribute('href', '/hashtag/trending');
    hashtagLink.textContent = '#trending';
    article.appendChild(hashtagLink);

    const userLink = document.createElement('a');
    userLink.setAttribute('href', '/realuser');
    userLink.setAttribute('role', 'link');
    const span = document.createElement('span');
    span.textContent = '@realuser';
    userLink.appendChild(span);
    article.appendChild(userLink);

    document.body.appendChild(article);

    const usernames = scanFeedForUsernames(document);
    expect(usernames).toEqual(['realuser']);
  });

  test('returns usernames associated with their tweet elements', () => {
    const tweet1 = createTweetArticle('user_one');
    const tweet2 = createTweetArticle('user_two');
    document.body.appendChild(tweet1);
    document.body.appendChild(tweet2);

    const usernames = scanFeedForUsernames(document);
    expect(usernames).toContain('user_one');
    expect(usernames).toContain('user_two');
  });
});
