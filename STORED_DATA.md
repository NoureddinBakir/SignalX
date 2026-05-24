# Signal X — What We Read & What We Store

**Confirming the architecture:** Signal X never calls the X API. It only reads
the GraphQL payloads that your browser is *already* downloading to render the
timeline. Same bytes X sends to its own UI, parsed by the extension before they
hit the page.

This document is **empirically verified** — captured from real `HomeTimeline`
responses on 2026‑05‑24 by patching `window.fetch` in a logged-in session and
walking every `User` and `Tweet` object across ~1MB of payload (176 user
objects, 147 tweet objects, 844 unique field paths). It is the ground truth of
what X ships to your browser per request, not a guess from reading the
extension code.

## How the data reaches us

The page fires GraphQL requests like:

- `HomeTimeline` (your main feed, ~330KB per page)
- `UserTweets` (a profile's tweets)
- `SearchTimeline` (search results)
- `TweetDetail` (a thread)
- `ListLatestTweetsTimeline` (List feeds)
- `UserByScreenName` (a profile lookup)

Signal X wraps `XMLHttpRequest.send` and `window.fetch` in the page's MAIN
world so it sees the response bodies as they arrive. The extension walks the
JSON tree, pulls out every `User` and `Tweet` object it finds, and stores them
in two in-memory `Map`s.

- **No outbound network calls** are issued by the extension.
- **No `chrome.storage`, no IndexedDB, no localStorage** writes — the caches die when the tab closes.
- **No data leaves the browser.** Content script runs in MAIN world. Manifest declares no `permissions:` at all and only `host_permissions` for x.com / twitter.com.

## The shape of a HomeTimeline page

```
data.home.home_timeline_urt.instructions[…].entries[…]
  └─ content.itemContent.tweet_results.result  ← __typename: "Tweet" | "TweetWithVisibilityResults"
                                                  (with .core.user_results.result = User)
                                                  (with .quoted_status_result.result = Tweet if quote-tweet)
```

`TimelineTweet`, `TimelineTimelineItem`, `TimelineTimelineModule`, and
`TimelineTimelineCursor` wrap the structure. We walk past them and pull out
the actual `User` and `Tweet` objects.

### `TweetWithVisibilityResults` (currently skipped — should not be)

These wrap algorithmically limited tweets:
`{ __typename: "TweetWithVisibilityResults", limitedActionResults, tweet }`.
The inner `tweet` is a regular `Tweet` object. X's own visibility filter
already flagged the content, so this wrapper is itself a strong noise signal.

## Per-user data — what X actually ships

Every `User` object has the same fields filled in. The 83 unique paths below
are present in **100%** of user objects unless flagged otherwise. We currently
extract ~15 of them.

### Identity & profile (always present)

| Field | Path | Example |
|---|---|---|
| Internal ID | `id` (base64 of `User:<rest_id>`) | `VXNlcjoxMjA2Mjg2NzE3MDcxODMxMDQy` |
| Numeric ID | `rest_id` | `1206286717071831042` |
| Display name | `core.name` | `zam` |
| Handle | `core.screen_name` | `zamdoteth` |
| Created | `core.created_at` | `Sun Dec 15 18:55:51 +0000 2019` |
| Avatar URL | `avatar.image_url` | pbs.twimg.com/profile_images/… |
| Banner URL | `legacy.profile_banner_url` | pbs.twimg.com/profile_banners/… |
| Profile shape | `profile_image_shape` | `Circle` / `Square` |
| Default avatar? | `legacy.default_profile_image` | bool |
| Default banner? | `legacy.default_profile` | bool |
| Bio | `legacy.description` | (also mirrored at `profile_bio.description`) |
| Bio language | `profile_description_language` (77% present) | `en` |
| Location | `location.location` | `Become Legend` |
| Website (raw t.co) | `legacy.url` | `https://t.co/…` |
| Website (expanded) | `legacy.entities.url.urls[0].expanded_url` (87%) | `https://valet.fund` |
| Bio link entities | `legacy.entities.description.urls[]` (26%) | array of expanded URLs in bio |
| Pinned tweet IDs | `legacy.pinned_tweet_ids_str[]` (80%) | `["1234…"]` |

### Social metrics

| Field | Path |
|---|---|
| Followers | `legacy.followers_count` |
| Following | `legacy.friends_count` |
| Fast followers | `legacy.fast_followers_count` — high-engagement subset |
| Normal followers | `legacy.normal_followers_count` — usually mirrors `followers_count` |
| Lists | `legacy.listed_count` |
| Total tweets | `legacy.statuses_count` |
| Total likes given | `legacy.favourites_count` |
| Media posted | `legacy.media_count` |

### Verification & status

| Field | Path | Notes |
|---|---|---|
| Blue verified (paid) | `is_blue_verified` | bool |
| Verified type | `verification.verified_type` (5% present) | `Business` |
| Legacy verified | `verification.verified` | bool |
| Has graduated | `has_graduated_access` | full-tier account |
| Professional type | `professional.professional_type` (55%) | `Creator` |
| Professional rest_id | `professional.rest_id` (55%) | numeric |
| Parody label | `parody_commentary_fan_label` | `None` / `Parody` / `Fan` / `Commentary` |
| Possibly sensitive | `legacy.possibly_sensitive` | bool |
| Protected | `privacy.protected` | bool |
| Translator | `legacy.is_translator` / `legacy.translator_type` | bool / string |

### Affiliations (22% of users)

`affiliates_highlighted_label.label.*`:
- `description` — company / parent org name (e.g. `Polsia`, `OpenClaw🦞`)
- `badge.url` — affiliated badge image URL
- `url.url` / `url.urlType` — link to affiliated account (`DeepLink` typically)
- `userLabelDisplayType` — `Badge`
- `userLabelType` — `BusinessLabel`

This is a *real* org-affiliation signal — `OpenClaw` employees show that badge,
`Polsia` employees show theirs. Useful for community filtering.

### Relationship (relative to you)

| Field | Path |
|---|---|
| You follow them | `relationship_perspectives.following` |
| They follow you | `relationship_perspectives.followed_by` |
| You're muting | `relationship_perspectives.muting` |
| You're blocking | `relationship_perspectives.blocking` |
| They block you | `relationship_perspectives.blocked_by` |
| Super-following | `super_following` / `super_followed_by` / `super_follow_eligible` |
| Follow request sent | `follow_request_sent` |

### Permissions & switches

| Field | Path |
|---|---|
| Can DM you them | `dm_permissions.can_dm` |
| Can media-tag | `media_permissions.can_media_tag` |
| Has custom timelines | `legacy.has_custom_timelines` |
| Wants retweets | `legacy.want_retweets` |
| Needs phone | `legacy.needs_phone_verification` |

## Per-tweet data — what X actually ships

Every `Tweet` object includes a **full embedded `User`** under
`core.user_results.result`. If it's a quote-tweet, the quoted tweet is fully
nested under `quoted_status_result.result` (recursive).

### Identity & content

| Field | Path | Notes |
|---|---|---|
| Tweet ID | `rest_id` | string |
| Tweet ID (mirror) | `legacy.id_str` | same as `rest_id` |
| Author ID | `legacy.user_id_str` | numeric string |
| Created | `legacy.created_at` | `Sun May 24 08:53:31 +0000 2026` |
| Conversation ID | `legacy.conversation_id_str` | thread root ID |
| **Full text** | `legacy.full_text` | **the actual tweet body — unlocks content scoring** |
| Display range | `legacy.display_text_range` | `[start, end]` char indices |
| Language | `legacy.lang` | `en` etc |
| Source client | `source` | `<a href="…">Twitter for iPhone</a>` |

### Engagement metrics

| Field | Path |
|---|---|
| Views | `views.count` (string, may be missing) |
| Views state | `views.state` | `EnabledWithCount` / `EnabledWithoutCount` |
| Likes | `legacy.favorite_count` |
| Retweets | `legacy.retweet_count` |
| Replies | `legacy.reply_count` |
| Quotes | `legacy.quote_count` |
| Bookmarks | `legacy.bookmark_count` |

### Quote / reply structure

| Field | Path |
|---|---|
| Is quote-tweet | `legacy.is_quote_status` |
| Quoted tweet ID | `legacy.quoted_status_id_str` (20% of tweets) |
| Quoted permalink | `legacy.quoted_status_permalink.{url,expanded,display}` |
| Quoted tweet (full) | `quoted_status_result.result` — entire nested Tweet+User |

### Media & entities

| Field | Path | Notes |
|---|---|---|
| Inline media | `legacy.entities.media[]` (59%) | photo / video / animated_gif |
| Extended media | `legacy.extended_entities.media[]` (59%) | full media URLs, sizes |
| @mentions | `legacy.entities.user_mentions[]` (21%) | array of mentioned users |
| Cashtag attachments | `cashtag_attachments` (82%) | $TICKER chip data |

### Edit, moderation, flags

| Field | Path |
|---|---|
| Edit eligible | `edit_control.is_edit_eligible` |
| Edits remaining | `edit_control.edits_remaining` (string) |
| Editable until | `edit_control.editable_until_msecs` |
| Edit version IDs | `edit_control.edit_tweet_ids[]` |
| Possibly sensitive | `legacy.possibly_sensitive` |
| Sensitive editable | `legacy.possibly_sensitive_editable` |
| Limited actions | `TweetWithVisibilityResults.limitedActionResults` (wraps the tweet) |
| Your bookmark | `legacy.bookmarked` |
| Your like | `legacy.favorited` |
| Your retweet | `legacy.retweeted` |

### Grok integration

| Field | Path |
|---|---|
| Show "Analyze" button | `grok_analysis_button` |
| Grok-translated availability | `grok_translated_post_with_availability.is_available` |
| Image editable by Grok | `grok_annotations.is_image_editable_by_grok` |

## What we currently consume vs what's available

| Source | Available | Consumed today | Missed signal |
|---|---|---|---|
| User identity | 83 fields | ~12 | Banner, fast/normal followers split, super-follow flags, business labels |
| User affiliation | `affiliates_highlighted_label` | 0 | Company badges (OpenClaw, Polsia, etc.) |
| Tweet content | `legacy.full_text` | 0 | **Content scoring impossible without this** |
| Tweet quote depth | `quoted_status_result.result` | 0 | Can't analyse who's being quoted / how nested |
| Tweet media | `entities.media[]` | 0 | Can't distinguish text post vs media post |
| Algorithmic flag | `TweetWithVisibilityResults` wrapper | skipped | X already told us this is limited — strongest noise signal |
| Tweet engagement | 6 metrics | 1 (views only) | Replies/retweets/quotes/bookmarks unused |

## Per-tweet cache shape (current)

Keyed by `rest_id` → `{ views, likes, retweets, replies, quotes, bookmarks }`.
We keep the highest-views entry per ID so later impressions only grow.

## Per-user cache shape (current)

Keyed by `screen_name` → the subset of fields the HUD reads. Live source:
`extension/content.js` `findUsersInResponse`.

## View tier color scale

| Tier | Color | Meaning |
|---|---|---|
| 500K+ | red `#E03131` | Viral |
| 300K+ | orange `#FD7E14` | Trending |
| 100K+ | gold `#FAB005` | Hot |
| 10K+ | green `#2F9E44` | Strong |
| 5K+ | teal `#1098AD` | Solid |
| 1K+ | blue `#1C7ED6` | Above baseline |
| <1K | gray `#868E96` | Baseline |

## What we explicitly do NOT store

- Tweet media URLs / images / video bytes (paths exist in the payload; we don't keep them).
- DM contents, notifications, search history (those come over different endpoints we don't intercept).
- Accounts whose `User` object never appeared in a response you loaded.

## Lifetime

Both `userCache` and `tweetCache` live for the lifetime of the tab. Reloading
the page wipes both. No persistence layer, no exfiltration path.

## Reproducing this discovery

To re-capture and verify field availability:

```js
// In x.com console, before scrolling:
window.__sx = [];
const RX = /HomeTimeline|UserTweets|SearchTimeline|TweetDetail/;
const f = window.fetch;
window.fetch = async function(...a) {
  const r = await f.apply(this, a);
  const u = typeof a[0] === 'string' ? a[0] : a[0]?.url || '';
  if (RX.test(u)) r.clone().text().then(t => window.__sx.push({u, t}));
  return r;
};
// Scroll a few pages, then:
copy(window.__sx.map(x => x.t).join('\n---\n'));
```
