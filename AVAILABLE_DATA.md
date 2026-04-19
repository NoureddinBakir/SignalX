# Signal X — Available Data Per User (from HomeTimeline)

All of this data comes from intercepting X's own timeline responses. Zero extra API calls.

## Identity & Profile

| Field | Path | Example |
|---|---|---|
| Display name | `core.name` | `Kaito \| 海斗` |
| Handle | `core.screen_name` | `_kaitodev` |
| Bio | `legacy.description` | `building the missing piece of video...` |
| Location | `location.location` | `San Francisco, CA` |
| Account created | `core.created_at` | `Wed Feb 21 21:31:42 +0000 2018` |
| Profile language | `profile_description_language` | `en` |
| Website URL | `legacy.url` | `https://t.co/kr3EttVvx1` |
| Avatar URL | `avatar.image_url` | `https://pbs.twimg.com/...` |
| Default avatar? | `legacy.default_profile_image` | `false` |
| Profile shape | `profile_image_shape` | `Circle` |

## Social Metrics

| Field | Path | Example |
|---|---|---|
| Followers | `legacy.followers_count` | `7499` |
| Following | `legacy.friends_count` | `1689` |
| Follower/Following ratio | computed | `4.4x` |
| Listed count | `legacy.listed_count` | `42` |
| Total tweets | `legacy.statuses_count` | `4712` |
| Total likes given | `legacy.favourites_count` | `8733` |
| Media posted | `legacy.media_count` | `945` |

## Verification & Status

| Field | Path | Example |
|---|---|---|
| Blue verified (paid) | `is_blue_verified` | `true` |
| Legacy verified | `verification.verified` | `false` |
| Professional type | `professional.professional_type` | `Creator` |
| Parody/fan label | `parody_commentary_fan_label` | `None` |
| Possibly sensitive | `legacy.possibly_sensitive` | `false` |
| Protected account | `privacy.protected` | `false` |

## Relationship (relative to you)

| Field | Path | Example |
|---|---|---|
| You follow them | `relationship_perspectives.following` | `true` |
| They follow you | `relationship_perspectives.followed_by` | `false` |
| You're muting them | `relationship_perspectives.muting` | `false` |
| You're blocking them | `relationship_perspectives.blocking` | `false` |

## Affiliations

| Field | Path | Notes |
|---|---|---|
| Affiliates label | `affiliates_highlighted_label` | Company affiliations (object) |
| Pinned tweets | `legacy.pinned_tweet_ids_str` | Array of tweet IDs |
