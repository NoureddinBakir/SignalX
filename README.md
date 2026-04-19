# Signal X

A Chrome extension that surfaces high-signal posts and creators on X (Twitter) by injecting a lightweight intelligence HUD into your timeline.

Zero extra API calls — Signal X reads the data X already sends to your browser.

## What it shows

For every tweet in your feed, Signal X adds two thin strips around the article:

**Top strip**
- Country flag and location (when resolvable from the user's profile location)
- Follower count, color-coded by tier (1.5K → 10K+)
- Follower / following ratio
- Bio tags (Founder, VC, Engineer, AI, OSS, etc.)

**Bottom strip**
- Account age
- Listed count, total tweets, media count
- Verification, professional type, "Follows you" badge
- "No pic" warning for default avatars

The article itself gets a thin colored left border matching the follower tier — so high-signal accounts catch your eye without you having to read the strip.

## Install (developer mode)

1. Clone this repo.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `extension/` folder.
5. Open [x.com](https://x.com) and scroll your feed — the HUD will activate.

## How it works

Signal X patches `XMLHttpRequest` and `fetch` in the page's MAIN world to observe X's own GraphQL responses (HomeTimeline, UserTweets, SearchTimeline, etc.). It walks the response, caches every `User` object it finds, and renders a HUD for any tweet whose author is in the cache.

No network calls are made by the extension itself. No data leaves your browser.

## Project layout

```
extension/        # The actual loaded extension (manifest.json, content.js)
src/              # Modular source used by the test suite
tests/            # Jest tests
AVAILABLE_DATA.md # Reference for what fields X exposes per user
```

The `extension/content.js` is currently a single bundled file. The `src/*.js` modules mirror its logic so they can be unit-tested under jsdom.

## Development

```bash
npm install
npm test
```

## Contributing

Issues and PRs welcome. Keep changes small and focused — the extension's value is in being lightweight and predictable.

## License

MIT — see [LICENSE](LICENSE).
