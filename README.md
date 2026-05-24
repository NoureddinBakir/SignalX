<div align="center">

<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Signal%20X-0d1117?style=for-the-badge&logo=x&logoColor=white&labelColor=000">
    <img alt="Signal X" src="https://img.shields.io/badge/Signal%20X-ffffff?style=for-the-badge&logo=x&logoColor=black&labelColor=fff">
  </picture>
</h1>

<p><strong>An intelligence HUD for your X timeline. Zero API calls.</strong></p>

<p>
  <a href="#install"><img alt="Manifest V3" src="https://img.shields.io/badge/manifest-v3-1D9BF0?style=flat-square&labelColor=15202b"></a>
  <a href="#how-it-works"><img alt="Zero API calls" src="https://img.shields.io/badge/network%20calls-0-10b981?style=flat-square&labelColor=15202b"></a>
  <a href="STORED_DATA.md"><img alt="In-memory only" src="https://img.shields.io/badge/storage-in--memory-71767b?style=flat-square&labelColor=15202b"></a>
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-f59e0b?style=flat-square&labelColor=15202b"></a>
  <img alt="tests" src="https://img.shields.io/badge/tests-66%20passing-10b981?style=flat-square&labelColor=15202b">
</p>

<p>
  <em>Reads the data X already sends your browser. Surfaces who's real, what's organic, and what's noise — without ever phoning home.</em>
</p>

</div>

---

## Why

Your X feed is a firehose. Half the posts are engagement farms with a $8 blue check and a stock-photo bio. The other half are people you'd actually pay to hear from. Today they look identical.

Signal X separates them — in your browser, on the bytes X is already shipping.

## What you get

<table>
<tr>
<td width="50%" valign="top">

### Per author
- Country flag + resolved location
- Follower count, **tiered** (`<1.5K → 10K+`)
- Follower / following ratio
- Account age, lists, total posts, media count
- **Org affiliation** (the real one, from X's API — `@OpenClaw`, `@a16z`, etc.)
- Verification: Legacy ✓ (rare, real) vs Premium Blue (paid)
- Relationship to you: mutual / you follow / follows you
- Bio role tags: `Founder` `VC` `CEO` `YC` `Engineer` …

</td>
<td width="50%" valign="top">

### Per tweet
- **Signal score 0–10** with color-coded tier
- **View count**, tiered (`<1K → 500K+`)
- Visibility-limited flag (X's own algorithmic mute)
- Engagement-farm detection (Premium + low followers + algo boost)
- Content scoring (shock words, ALL-CAPS shouting, emoji spam)
- High-signal reward bar for `you-follow` + affiliated + legacy-verified
- Low-signal noise bar with reasons (`x_api_intercept`)

</td>
</tr>
</table>

### How the signal score reads on a real feed

<details>
<summary><strong>Click to expand — actual scoring against captured X data</strong></summary>

```
Lowest-signal posts (would fade):
  [1/10] @zamdoteth   (3.4K f, 300 v)    blue+low-followers, shock words
    "The lack of education in Silicon Valley is truly insane..."
  [3/10] @Vivek4real_ (257K f, 148K v)   shouting
    "GOOGLE CEO SAID THAT THEY DON'T KNOW HOW AI IS TEACHING ITSE..."
  [4/10] @MKdawah     (17K f, 199 v)     X-limited, you follow
    "سبحان الله وبحمده   Subhan Allah wa bihamdih"

Highest-signal posts:
  [9/10] @Jason        (1.2M f)  @The All-In Podcast, you follow
  [9/10] @vincent_koc  (20K f)   @OpenClaw, you follow
  [9/10] @geoffreywoo  (30K f)   @Anti Fund, you follow
  [8/10] @samuel_spitz (31K f)   you follow
```

</details>

## Install

<table>
<tr><td width="50px" align="center"><strong>1</strong></td><td>Clone this repo</td></tr>
<tr><td align="center"><strong>2</strong></td><td>Open <code>chrome://extensions</code></td></tr>
<tr><td align="center"><strong>3</strong></td><td>Enable <strong>Developer mode</strong> (top right)</td></tr>
<tr><td align="center"><strong>4</strong></td><td>Click <strong>Load unpacked</strong> → pick the <code>extension/</code> folder</td></tr>
<tr><td align="center"><strong>5</strong></td><td>Open <a href="https://x.com">x.com</a> and scroll. The HUD attaches itself.</td></tr>
</table>

No Chrome Web Store yet — this runs in developer mode.

## How it works

Signal X patches `XMLHttpRequest.send` and `window.fetch` in the page's MAIN world to **observe X's own GraphQL responses** (HomeTimeline, UserTweets, SearchTimeline, TweetDetail, ListLatestTweetsTimeline, UserByScreenName). It walks the response, caches every `User` and `Tweet` object it finds, and renders the HUD above each tweet whose data it has seen.

> **Zero network calls leave the browser.** The manifest declares no `permissions:` at all — only `host_permissions` for x.com / twitter.com so the content script can attach.

For a full empirical breakdown of what data X ships and what we cache, see **[STORED_DATA.md](STORED_DATA.md)**.

## Architecture

<table>
<tr>
<td><code>extension/</code></td>
<td>The loaded MV3 extension. <code>manifest.json</code> + a single <code>content.js</code>. No build step.</td>
</tr>
<tr>
<td><code>src/</code></td>
<td>Modular mirrors of the extension's logic (tiers, cache, bio-tags, feed-scanner). Unit-testable under jsdom.</td>
</tr>
<tr>
<td><code>tests/</code></td>
<td>Jest. 66 passing.</td>
</tr>
<tr>
<td><code>STORED_DATA.md</code></td>
<td>Ground-truth doc of what X ships per request — captured from live payloads, not guessed.</td>
</tr>
<tr>
<td><code>AVAILABLE_DATA.md</code></td>
<td>Original field reference (superseded by STORED_DATA.md).</td>
</tr>
</table>

## Development

```bash
npm install
npm test            # 66 tests, ~700ms
```

After editing `extension/content.js`, hit the reload icon on the Signal X card at `chrome://extensions`.

## Privacy

<table>
<tr><td>📡</td><td>No outbound network requests from the extension</td></tr>
<tr><td>💾</td><td>No <code>chrome.storage</code>, no IndexedDB, no <code>localStorage</code> writes</td></tr>
<tr><td>🧠</td><td>Caches live in tab memory only — closing the tab wipes them</td></tr>
<tr><td>🔐</td><td>No permissions beyond host access to x.com / twitter.com</td></tr>
<tr><td>👁️</td><td>The extension can only see the bytes X is already streaming to your tab</td></tr>
</table>

## Contributing

Issues and PRs welcome. Keep changes small and focused — Signal X's value is in being **lightweight and predictable.**

If you're adding a new field to the cache, run the smoke-test workflow in `STORED_DATA.md` to verify X actually ships it.

## License

<a href="LICENSE">MIT</a>
