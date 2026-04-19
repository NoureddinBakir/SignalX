function scanFeedForUsernames(doc) {
  const tweets = doc.querySelectorAll('article[data-testid="tweet"]');
  const seen = new Set();
  const usernames = [];

  tweets.forEach((tweet) => {
    const links = tweet.querySelectorAll('a[role="link"]');
    for (const link of links) {
      const href = link.getAttribute('href');
      if (!href || href.includes('/') && href.indexOf('/') !== 0) continue;

      const span = link.querySelector('span');
      if (!span || !span.textContent.startsWith('@')) continue;

      const username = span.textContent.slice(1); // remove @
      if (!seen.has(username)) {
        seen.add(username);
        usernames.push(username);
      }
    }
  });

  return usernames;
}

module.exports = { scanFeedForUsernames };
