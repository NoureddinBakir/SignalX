// =============================================================
// Signal X — Tweet Intelligence HUD
// Zero API calls. Intercepts X's own timeline data.
// =============================================================

// ── Follower Tier System ──

const TIERS = [
  { min: 10000, label: '10K+', color: '#D4A017', bg: 'rgba(212, 160, 23, 0.08)', border: 'rgba(212, 160, 23, 0.5)', glow: 'rgba(212, 160, 23, 0.12)' },
  { min: 5000,  label: '5K+',  color: '#E8590C', bg: 'rgba(232, 89, 12, 0.07)',   border: 'rgba(232, 89, 12, 0.45)',  glow: 'rgba(232, 89, 12, 0.10)' },
  { min: 3000,  label: '3K+',  color: '#2F9E44', bg: 'rgba(47, 158, 68, 0.06)',   border: 'rgba(47, 158, 68, 0.40)',  glow: 'rgba(47, 158, 68, 0.08)' },
  { min: 2000,  label: '2K+',  color: '#1C7ED6', bg: 'rgba(28, 126, 214, 0.06)',  border: 'rgba(28, 126, 214, 0.35)', glow: 'rgba(28, 126, 214, 0.07)' },
  { min: 1500,  label: '1.5K+',color: '#868E96', bg: 'rgba(134, 142, 150, 0.05)', border: 'rgba(134, 142, 150, 0.25)',glow: 'rgba(134, 142, 150, 0.05)' },
  { min: 0,     label: '',     color: '#495057', bg: 'transparent',                border: 'transparent',              glow: 'transparent' },
];

function getTier(followers) {
  return TIERS.find(t => followers >= t.min) || TIERS[TIERS.length - 1];
}

// ── View / Interaction Tiers ──
// Cool → hot scale so a viral post stands out at a glance.
const VIEW_TIERS = [
  { min: 500000, label: '500K+', color: '#E03131', bg: 'rgba(224, 49, 49, 0.12)',  border: 'rgba(224, 49, 49, 0.55)' },
  { min: 300000, label: '300K+', color: '#FD7E14', bg: 'rgba(253, 126, 20, 0.10)', border: 'rgba(253, 126, 20, 0.50)' },
  { min: 100000, label: '100K+', color: '#FAB005', bg: 'rgba(250, 176, 5, 0.10)',  border: 'rgba(250, 176, 5, 0.50)' },
  { min: 10000,  label: '10K+',  color: '#2F9E44', bg: 'rgba(47, 158, 68, 0.08)',  border: 'rgba(47, 158, 68, 0.40)' },
  { min: 5000,   label: '5K+',   color: '#1098AD', bg: 'rgba(16, 152, 173, 0.07)', border: 'rgba(16, 152, 173, 0.35)' },
  { min: 1000,   label: '1K+',   color: '#1C7ED6', bg: 'rgba(28, 126, 214, 0.06)', border: 'rgba(28, 126, 214, 0.30)' },
  { min: 0,      label: '<1K',   color: '#868E96', bg: 'rgba(134, 142, 150, 0.05)', border: 'transparent' },
];

function getViewTier(views) {
  const n = Number(views) || 0;
  return VIEW_TIERS.find(t => n >= t.min) || VIEW_TIERS[VIEW_TIERS.length - 1];
}

// ── Bio keyword tags ──

const BIO_KEYWORDS = [
  { pattern: /\bVC\b/i, tag: 'VC' },
  { pattern: /\bventure\s*capital/i, tag: 'VC' },
  { pattern: /\bfounder\b/i, tag: 'Founder' },
  { pattern: /\bco-?founder\b/i, tag: 'Co-Founder' },
  { pattern: /\bCEO\b/i, tag: 'CEO' },
  { pattern: /\bCTO\b/i, tag: 'CTO' },
  { pattern: /\bCOO\b/i, tag: 'COO' },
  { pattern: /\bCFO\b/i, tag: 'CFO' },
  { pattern: /\bpartner\b/i, tag: 'Partner' },
  { pattern: /\bGP\b/, tag: 'GP' },
  { pattern: /\bLP\b/, tag: 'LP' },
  { pattern: /\bangel\s*(investor)?/i, tag: 'Angel' },
  { pattern: /\binvestor\b/i, tag: 'Investor' },
  { pattern: /\bYC\b|Y Combinator/i, tag: 'YC' },
  { pattern: /\ba16z\b|andreessen/i, tag: 'a16z' },
  { pattern: /\bsequoia\b/i, tag: 'Sequoia' },
  { pattern: /\bstartup\b/i, tag: 'Startup' },
  { pattern: /\bengineer\b/i, tag: 'Engineer' },
  { pattern: /\bdeveloper\b/i, tag: 'Dev' },
  { pattern: /\bdesigner\b/i, tag: 'Designer' },
  { pattern: /\bproduct\s*(manager|lead)?\b/i, tag: 'Product' },
  { pattern: /\bbuilding\b/i, tag: 'Builder' },
  { pattern: /\bAI\b/, tag: 'AI' },
  { pattern: /\bML\b/, tag: 'ML' },
  { pattern: /\bcrypto\b/i, tag: 'Crypto' },
  { pattern: /\bweb3\b/i, tag: 'Web3' },
  { pattern: /\bopen\s*source/i, tag: 'OSS' },
  { pattern: /\bauthor\b/i, tag: 'Author' },
  { pattern: /\bjournalist\b/i, tag: 'Journalist' },
  { pattern: /\breporter\b/i, tag: 'Reporter' },
  { pattern: /\bprofessor\b/i, tag: 'Professor' },
  { pattern: /\bresearch/i, tag: 'Research' },
  { pattern: /\bSaaS\b/i, tag: 'SaaS' },
];

function extractBioTags(bio) {
  if (!bio) return [];
  const seen = new Set();
  const tags = [];
  for (const kw of BIO_KEYWORDS) {
    if (kw.pattern.test(bio) && !seen.has(kw.tag)) {
      seen.add(kw.tag);
      tags.push(kw.tag);
    }
  }
  return tags.slice(0, 5); // cap at 5 tags
}

// ── Location Resolution (same as before) ──

const US_STATES = new Set([
  'al','ak','az','ar','ca','co','ct','de','fl','ga','hi','id','il','in','ia',
  'ks','ky','la','me','md','ma','mi','mn','ms','mo','mt','ne','nv','nh','nj',
  'nm','ny','nc','nd','oh','ok','or','pa','ri','sc','sd','tn','tx','ut','vt',
  'va','wa','wv','wi','wy','dc',
]);
const US_STATE_NAMES = new Set([
  'alabama','alaska','arizona','arkansas','california','colorado','connecticut',
  'delaware','florida','georgia','hawaii','idaho','illinois','indiana','iowa',
  'kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan',
  'minnesota','mississippi','missouri','montana','nebraska','nevada',
  'new hampshire','new jersey','new mexico','new york','north carolina',
  'north dakota','ohio','oklahoma','oregon','pennsylvania','rhode island',
  'south carolina','south dakota','tennessee','texas','utah','vermont',
  'virginia','washington','west virginia','wisconsin','wyoming',
]);
const COUNTRY_ALIASES = {
  'usa':'United States','us':'United States','united states':'United States',
  'united states of america':'United States','america':'United States',
  'uk':'United Kingdom','united kingdom':'United Kingdom','england':'United Kingdom',
  'britain':'United Kingdom','great britain':'United Kingdom','scotland':'United Kingdom','wales':'United Kingdom',
  'japan':'Japan','brazil':'Brazil','canada':'Canada',
  'germany':'Germany','france':'France','australia':'Australia','mexico':'Mexico',
  'south korea':'South Korea','korea':'South Korea',
  'indonesia':'Indonesia','turkey':'Turkey','türkiye':'Turkey',
  'saudi arabia':'Saudi Arabia','nigeria':'Nigeria','pakistan':'Pakistan',
  'philippines':'Philippines','spain':'Spain','italy':'Italy',
  'netherlands':'Netherlands','holland':'Netherlands',
  'russia':'Russia','china':'China','israel':'Israel',
  'uae':'United Arab Emirates','united arab emirates':'United Arab Emirates',
  'argentina':'Argentina','colombia':'Colombia','thailand':'Thailand',
  'egypt':'Egypt','south africa':'South Africa','poland':'Poland',
  'ukraine':'Ukraine','kenya':'Kenya','vietnam':'Vietnam',
  'malaysia':'Malaysia','singapore':'Singapore','ireland':'Ireland',
  'sweden':'Sweden','portugal':'Portugal','chile':'Chile',
  'bangladesh':'Bangladesh','ghana':'Ghana','ethiopia':'Ethiopia',
  'morocco':'Morocco','taiwan':'Taiwan','new zealand':'New Zealand',
  'switzerland':'Switzerland','austria':'Austria','belgium':'Belgium',
  'denmark':'Denmark','norway':'Norway','finland':'Finland',
  'czech republic':'Czech Republic','czechia':'Czech Republic',
  'romania':'Romania','peru':'Peru','iraq':'Iraq','iran':'Iran',
  'sri lanka':'Sri Lanka','nepal':'Nepal',
};
const CITY_TO_COUNTRY = {
  'new york':'United States','nyc':'United States','los angeles':'United States',
  'la':'United States','chicago':'United States','houston':'United States',
  'phoenix':'United States','san francisco':'United States','sf':'United States',
  'seattle':'United States','austin':'United States','boston':'United States',
  'miami':'United States','denver':'United States','atlanta':'United States',
  'san diego':'United States','dallas':'United States','portland':'United States',
  'nashville':'United States','detroit':'United States','san jose':'United States',
  'philadelphia':'United States','washington dc':'United States',
  'silicon valley':'United States','bay area':'United States','brooklyn':'United States','manhattan':'United States',
  'london':'United Kingdom','manchester':'United Kingdom','edinburgh':'United Kingdom','glasgow':'United Kingdom','bristol':'United Kingdom',
  'toronto':'Canada','vancouver':'Canada','montreal':'Canada','ottawa':'Canada','calgary':'Canada',
  'tokyo':'Japan','osaka':'Japan','kyoto':'Japan',
  'paris':'France','lyon':'France','marseille':'France',
  'berlin':'Germany','munich':'Germany','hamburg':'Germany','frankfurt':'Germany',
  'sydney':'Australia','melbourne':'Australia','brisbane':'Australia',
  'são paulo':'Brazil','sao paulo':'Brazil','rio de janeiro':'Brazil','rio':'Brazil',
  'mexico city':'Mexico','cdmx':'Mexico',
  'seoul':'South Korea','busan':'South Korea',
  'jakarta':'Indonesia','istanbul':'Turkey','dubai':'United Arab Emirates',
  'abu dhabi':'United Arab Emirates','riyadh':'Saudi Arabia','jeddah':'Saudi Arabia',
  'lagos':'Nigeria','karachi':'Pakistan','lahore':'Pakistan','islamabad':'Pakistan',
  'manila':'Philippines','madrid':'Spain','barcelona':'Spain',
  'rome':'Italy','milan':'Italy','amsterdam':'Netherlands',
  'moscow':'Russia','beijing':'China','shanghai':'China','shenzhen':'China',
  'tel aviv':'Israel','buenos aires':'Argentina','bogota':'Colombia','bangkok':'Thailand',
  'cairo':'Egypt','cape town':'South Africa','johannesburg':'South Africa',
  'warsaw':'Poland','kyiv':'Ukraine','nairobi':'Kenya',
  'ho chi minh':'Vietnam','hanoi':'Vietnam','kuala lumpur':'Malaysia',
  'lisbon':'Portugal','dublin':'Ireland','stockholm':'Sweden',
  'taipei':'Taiwan','auckland':'New Zealand','zurich':'Switzerland',
  'vienna':'Austria','brussels':'Belgium','copenhagen':'Denmark',
  'oslo':'Norway','helsinki':'Finland','casablanca':'Morocco',
  'lima':'Peru','santiago':'Chile','dhaka':'Bangladesh','accra':'Ghana',
};
const COUNTRY_FLAGS = {
  'United States':'\u{1F1FA}\u{1F1F8}','Japan':'\u{1F1EF}\u{1F1F5}',
  'Brazil':'\u{1F1E7}\u{1F1F7}','United Kingdom':'\u{1F1EC}\u{1F1E7}','Canada':'\u{1F1E8}\u{1F1E6}',
  'Germany':'\u{1F1E9}\u{1F1EA}','France':'\u{1F1EB}\u{1F1F7}','Australia':'\u{1F1E6}\u{1F1FA}',
  'Mexico':'\u{1F1F2}\u{1F1FD}','South Korea':'\u{1F1F0}\u{1F1F7}','Indonesia':'\u{1F1EE}\u{1F1E9}',
  'Turkey':'\u{1F1F9}\u{1F1F7}','Saudi Arabia':'\u{1F1F8}\u{1F1E6}','Nigeria':'\u{1F1F3}\u{1F1EC}',
  'Pakistan':'\u{1F1F5}\u{1F1F0}','Philippines':'\u{1F1F5}\u{1F1ED}','Spain':'\u{1F1EA}\u{1F1F8}',
  'Italy':'\u{1F1EE}\u{1F1F9}','Netherlands':'\u{1F1F3}\u{1F1F1}','Russia':'\u{1F1F7}\u{1F1FA}',
  'China':'\u{1F1E8}\u{1F1F3}','Israel':'\u{1F1EE}\u{1F1F1}','United Arab Emirates':'\u{1F1E6}\u{1F1EA}',
  'Argentina':'\u{1F1E6}\u{1F1F7}','Colombia':'\u{1F1E8}\u{1F1F4}','Thailand':'\u{1F1F9}\u{1F1ED}',
  'Egypt':'\u{1F1EA}\u{1F1EC}','South Africa':'\u{1F1FF}\u{1F1E6}','Poland':'\u{1F1F5}\u{1F1F1}',
  'Ukraine':'\u{1F1FA}\u{1F1E6}','Kenya':'\u{1F1F0}\u{1F1EA}','Vietnam':'\u{1F1FB}\u{1F1F3}',
  'Malaysia':'\u{1F1F2}\u{1F1FE}','Singapore':'\u{1F1F8}\u{1F1EC}','Ireland':'\u{1F1EE}\u{1F1EA}',
  'Sweden':'\u{1F1F8}\u{1F1EA}','Portugal':'\u{1F1F5}\u{1F1F9}','Chile':'\u{1F1E8}\u{1F1F1}',
  'Bangladesh':'\u{1F1E7}\u{1F1E9}','Ghana':'\u{1F1EC}\u{1F1ED}','Ethiopia':'\u{1F1EA}\u{1F1F9}',
  'Morocco':'\u{1F1F2}\u{1F1E6}','Taiwan':'\u{1F1F9}\u{1F1FC}','New Zealand':'\u{1F1F3}\u{1F1FF}',
  'Switzerland':'\u{1F1E8}\u{1F1ED}','Austria':'\u{1F1E6}\u{1F1F9}','Belgium':'\u{1F1E7}\u{1F1EA}',
  'Denmark':'\u{1F1E9}\u{1F1F0}','Norway':'\u{1F1F3}\u{1F1F4}','Finland':'\u{1F1EB}\u{1F1EE}',
  'Czech Republic':'\u{1F1E8}\u{1F1FF}','Romania':'\u{1F1F7}\u{1F1F4}',
  'Peru':'\u{1F1F5}\u{1F1EA}','Iraq':'\u{1F1EE}\u{1F1F6}','Iran':'\u{1F1EE}\u{1F1F7}',
  'Sri Lanka':'\u{1F1F1}\u{1F1F0}','Nepal':'\u{1F1F3}\u{1F1F5}',
};

function resolveLocationToCountry(location) {
  if (!location || typeof location !== 'string') return null;
  const lower = location.trim().toLowerCase();
  if (!lower) return null;
  if (COUNTRY_ALIASES[lower]) return COUNTRY_ALIASES[lower];
  if (CITY_TO_COUNTRY[lower]) return CITY_TO_COUNTRY[lower];
  const parts = location.split(',').map(p => p.trim().toLowerCase());
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    if (US_STATES.has(last)) return 'United States';
    if (US_STATE_NAMES.has(last)) return 'United States';
    if (COUNTRY_ALIASES[last]) return COUNTRY_ALIASES[last];
    if (CITY_TO_COUNTRY[parts[0]]) return CITY_TO_COUNTRY[parts[0]];
  }
  return null;
}

// ── Helpers ──

function compact(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function accountAge(createdAt) {
  if (!createdAt) return '';
  const created = new Date(createdAt);
  const now = new Date();
  const years = Math.floor((now - created) / (365.25 * 24 * 60 * 60 * 1000));
  const months = Math.floor((now - created) / (30.44 * 24 * 60 * 60 * 1000));
  if (years >= 1) return `${years}yr`;
  return `${months}mo`;
}

// ── User + Tweet Cache ──

const userCache = new Map(); // screenName -> full user data object
const tweetCache = new Map(); // tweet id_str -> engagement + content + flags

function accountAgeMonths(createdAt) {
  if (!createdAt) return 9999;
  const created = new Date(createdAt);
  if (isNaN(created)) return 9999;
  return Math.floor((Date.now() - created) / (30.44 * 24 * 60 * 60 * 1000));
}

function cacheTweet(obj, flags) {
  const id = obj.rest_id || obj.legacy?.id_str;
  if (!id) return;
  const views = Number(obj.views?.count ?? 0) || 0;
  const data = {
    views,
    likes: obj.legacy?.favorite_count ?? 0,
    retweets: obj.legacy?.retweet_count ?? 0,
    replies: obj.legacy?.reply_count ?? 0,
    quotes: obj.legacy?.quote_count ?? 0,
    bookmarks: obj.legacy?.bookmark_count ?? 0,
    fullText: obj.legacy?.full_text || '',
    lang: obj.legacy?.lang || '',
    isQuote: obj.legacy?.is_quote_status || false,
    hasMedia: !!(obj.legacy?.entities?.media?.length || obj.legacy?.extended_entities?.media?.length),
    sensitive: obj.legacy?.possibly_sensitive || false,
    visibilityLimited: !!(flags && flags.visibilityLimited),
  };
  const existing = tweetCache.get(id);
  // Keep the richest entry: highest views, OR add visibility flag if discovered later
  if (existing && existing.views >= views && !data.visibilityLimited) return;
  tweetCache.set(id, { ...existing, ...data });
}

function findUsersInResponse(obj, depth) {
  if (!obj || typeof obj !== 'object' || depth > 15) return;
  if (Array.isArray(obj)) {
    for (const item of obj) findUsersInResponse(item, depth + 1);
    return;
  }
  // X wraps algorithmically-limited tweets in TweetWithVisibilityResults.
  // The inner .tweet is a real Tweet object — record it with the limit flag.
  if (obj.__typename === 'TweetWithVisibilityResults' && obj.tweet) {
    cacheTweet(obj.tweet, { visibilityLimited: true });
    // fall through to walk children (nested users / quoted tweets)
  }
  if (obj.__typename === 'Tweet' && (obj.rest_id || obj.legacy?.id_str)) {
    cacheTweet(obj);
    // fall through — a tweet object can still nest user objects (quoted authors etc.)
  }
  if (obj.__typename === 'User' && obj.core?.screen_name) {
    const sn = obj.core.screen_name;
    if (!userCache.has(sn)) {
      const loc = obj.location?.location || '';
      const country = resolveLocationToCountry(loc);
      const bio = obj.legacy?.description || obj.profile_bio?.description || '';
      const followers = obj.legacy?.followers_count ?? 0;
      const following = obj.legacy?.friends_count ?? 0;
      const createdAt = obj.core?.created_at || '';
      userCache.set(sn, {
        screenName: sn,
        name: obj.core.name || '',
        location: loc,
        country,
        bio,
        bioTags: extractBioTags(bio),
        followers,
        following,
        ratio: following > 0 ? (followers / following) : followers,
        listed: obj.legacy?.listed_count ?? 0,
        tweets: obj.legacy?.statuses_count ?? 0,
        media: obj.legacy?.media_count ?? 0,
        likes: obj.legacy?.favourites_count ?? 0,
        createdAt,
        age: accountAge(createdAt),
        ageMonths: accountAgeMonths(createdAt),
        isBlueVerified: obj.is_blue_verified || false,
        isVerified: obj.verification?.verified || false,
        verifiedType: obj.verification?.verified_type || '',
        professionalType: obj.professional?.professional_type || '',
        affiliateLabel: obj.affiliates_highlighted_label?.label?.description || '',
        followsYou: obj.relationship_perspectives?.followed_by || false,
        youFollow: obj.relationship_perspectives?.following || false,
        defaultAvatar: obj.legacy?.default_profile_image || false,
        sensitive: obj.legacy?.possibly_sensitive || false,
        lang: obj.profile_description_language || '',
      });
    }
    return;
  }
  for (const val of Object.values(obj)) findUsersInResponse(val, depth + 1);
}

// ── Signal scoring ──
// Computes 0-10 trust/quality score per tweet from the data we cache.
// Low scores fade the card so your eye skips it.

const SHOCK_REGEX = /\b(BREAKING|MIRACLE|EXPOSED|REVEALED|SHOCKING|UNBELIEVABLE|INSANE|YOU WON'T BELIEVE|MUST SEE|GONE WRONG|GUYS|🚨|⚠️|🔥🔥)\b/i;
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

function computeSignal(u, t) {
  let score = 5;
  const reasons = [];
  if (!u) return { score: 5, opacity: 1.0, reasons: [] };

  // ── Negative signals ──
  if (t && t.visibilityLimited) { score -= 4; reasons.push('X-limited'); }
  if (u.defaultAvatar) { score -= 3; reasons.push('no pic'); }
  if (u.isBlueVerified && u.followers < 5000) { score -= 2; reasons.push('blue+low-followers'); }
  if (u.ageMonths < 6) { score -= 2; reasons.push('new acct'); }
  if (u.following > 0 && u.followers / u.following < 0.5 && u.tweets > 5000) {
    score -= 2; reasons.push('follow-farm');
  }
  if (!u.bio && u.isBlueVerified) { score -= 2; reasons.push('empty bio + blue'); }
  if (t && u.followers > 0 && t.views > 0 && t.views / u.followers > 50) {
    score -= 3; reasons.push('algo boost');
  }
  if (t && t.fullText) {
    const text = t.fullText;
    if (SHOCK_REGEX.test(text)) { score -= 2; reasons.push('shock words'); }
    const words = text.split(/\s+/).filter(w => w.length > 1 && /[A-Za-z]/.test(w));
    if (words.length > 5) {
      const caps = words.filter(w => w === w.toUpperCase()).length;
      if (caps / words.length > 0.5) { score -= 2; reasons.push('shouting'); }
    }
    const emojis = (text.match(EMOJI_REGEX) || []).length;
    if (text.length > 0 && emojis / text.length > 0.05) { score -= 1; reasons.push('emoji spam'); }
  }

  // ── Positive signals ──
  if (u.verifiedType === 'Business') { score += 1; reasons.push('business'); }
  if (u.affiliateLabel) { score += 1; reasons.push(`@${u.affiliateLabel}`); }
  if (u.followsYou) { score += 2; reasons.push('follows you'); }
  if (u.youFollow) { score += 3; reasons.push('you follow'); }
  if (u.isVerified) { score += 1; reasons.push('legacy verified'); }

  score = Math.max(0, Math.min(10, score));
  const opacity = score >= 5 ? 1.0 : score >= 3 ? 0.65 : 0.4;
  return { score, opacity, reasons };
}

// ── HUD Injection ──

function hasHUD(el) {
  // Check both the article and its cellInnerDiv wrapper
  if (el.querySelector('[data-signalx-hud]')) return true;
  const cell = el.closest('[data-testid="cellInnerDiv"]');
  return cell ? !!cell.querySelector('[data-signalx-hud]') : false;
}

function extractUsername(tweet) {
  const spans = tweet.querySelectorAll('a[role="link"] span');
  for (const span of spans) {
    if (span.textContent.startsWith('@')) return span.textContent.slice(1);
  }
  return null;
}

function extractTweetId(tweet) {
  // The outer article's first <time> sits inside <a href="/user/status/ID">.
  // Inner articles (quote tweets) come after, so the first match is the tweet itself.
  const timeEl = tweet.querySelector('time');
  const link = timeEl?.closest('a[href*="/status/"]');
  if (!link) return null;
  const match = link.getAttribute('href').match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

// ── Signal HUD (AI Studio design, ported verbatim) ──
// Tier-shaded container above each tweet. Two-row strip + conditional
// level-3 reasoning bar. Inline SVG icons (lucide). One-time stylesheet
// injection so we don't need a build step.

const SX_STYLE_ID = 'signalx-stylesheet';
function ensureStyles() {
  if (document.getElementById(SX_STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = SX_STYLE_ID;
  s.textContent = `
  @keyframes sx-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
  @keyframes sx-ping  {
    75%, 100% { transform: scale(2); opacity: 0 }
  }
  .sx-hud {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;
    user-select: none;
    padding: 6px 16px;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    display: flex; flex-direction: column; gap: 6px;
    transition: all 150ms ease;
  }
  .sx-hud--mid  { background: rgba(22, 24, 28, 0.95); border-bottom: 1px solid #2f3336; color: #71767b; }
  .sx-hud--high { background: rgba(59, 130, 246, 0.10); border-bottom: 1px solid rgba(59, 130, 246, 0.30); color: #60a5fa; }
  .sx-hud--low  { background: rgba(127, 29, 29, 0.20); border-bottom: 1px solid rgba(127, 29, 29, 0.20); color: #f87171; }
  .sx-row {
    display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
    font-size: 11px; letter-spacing: -0.01em;
  }
  .sx-row--secondary { font-size: 10px; color: rgba(163, 163, 163, 0.8); gap: 4px 12px; }
  .sx-row--spread { justify-content: space-between; }
  .sx-pill {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 1px 6px; border-radius: 6px; border: 1px solid transparent;
    white-space: nowrap;
  }
  .sx-pill--score {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-weight: 700; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase;
  }
  .sx-pill--score-high { background: rgba(16, 185, 129, 0.10); color: #34d399; border-color: rgba(16, 185, 129, 0.20); }
  .sx-pill--score-low  { background: rgba(244, 63, 94, 0.10);  color: #fb7185; border-color: rgba(244, 63, 94, 0.20); }
  .sx-pill--score-mid  { background: rgba(115, 115, 115, 0.10); color: #a3a3a3; border-color: rgba(115, 115, 115, 0.20); }
  .sx-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; }
  .sx-dot--pulse { animation: sx-pulse 1.6s ease-in-out infinite; }
  .sx-pill--legacy  { background: rgba(245, 158, 11, 0.10); color: #f59e0b; border-color: rgba(245, 158, 11, 0.20); font-weight: 500; font-size: 10px; padding: 1px 4px; }
  .sx-pill--blue    { background: rgba(14, 165, 233, 0.10); color: #38bdf8; border-color: rgba(14, 165, 233, 0.25); font-size: 10px; padding: 1px 4px; }
  .sx-pill--rel     { background: rgba(14, 165, 233, 0.10); color: #38bdf8; border-color: rgba(14, 165, 233, 0.15); font-weight: 500; font-size: 10px; padding: 1px 4px; }
  .sx-pill--org     { background: rgba(245, 158, 11, 0.10); color: #fbbf24; border-color: rgba(245, 158, 11, 0.20); font-weight: 600; font-size: 10px; padding: 1px 4px; }
  .sx-pill--flag    { background: rgba(115, 115, 115, 0.05); color: #a3a3a3; border-color: rgba(115, 115, 115, 0.10); font-size: 10px; padding: 1px 4px; }
  .sx-pill--prof    { background: rgba(115, 115, 115, 0.05); color: #d4d4d4; border-color: rgba(115, 115, 115, 0.10); font-size: 9px; padding: 1px 4px; }
  .sx-pill--view {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: 0.05em; font-size: 11px;
  }
  .sx-tag { font-size: 9px; padding: 0 4px; border-radius: 4px; border: 1px solid; text-transform: uppercase; letter-spacing: 0.04em; }
  .sx-tag--hv  { background: rgba(251, 191, 36, 0.10); color: #fbbf24; border-color: rgba(251, 191, 36, 0.20); font-weight: 600; }
  .sx-tag--reg { background: rgba(115, 115, 115, 0.05); color: #a3a3a3; border-color: rgba(115, 115, 115, 0.10); }
  .sx-stat { display: inline-flex; align-items: center; gap: 3px; }
  .sx-stat-label { color: #737373; }
  .sx-stat-val   { color: #d4d4d4; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 500; }
  .sx-stat-val--accent { color: #2dd4bf; font-weight: 600; }
  .sx-l3 {
    margin-top: 4px;
    display: flex; justify-content: space-between; align-items: center; gap: 8px;
    padding: 4px 6px; border-radius: 4px; font-size: 10px;
    line-height: 1.25;
  }
  .sx-l3--low  { background: rgba(244, 63, 94, 0.05);  border: 1px solid rgba(244, 63, 94, 0.12);  color: rgba(252, 165, 165, 1); }
  .sx-l3--high { background: rgba(16, 185, 129, 0.04); border: 1px solid rgba(16, 185, 129, 0.10); color: rgba(52, 211, 153, 0.9); }
  .sx-l3-label  { font-weight: 600; text-transform: uppercase; font-size: 9px; letter-spacing: 0.07em; flex-shrink: 0; }
  .sx-l3-label--low  { color: rgba(251, 113, 133, 0.9); }
  .sx-l3-label--high { color: #10b981; }
  .sx-l3-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 9px; letter-spacing: -0.02em; flex-shrink: 0; user-select: none; }
  .sx-l3-mono--low  { color: rgba(244, 63, 94, 0.6); }
  .sx-l3-mono--high { color: rgba(16, 185, 129, 0.5); }
  .sx-ping-wrap { position: relative; display: inline-block; width: 6px; height: 6px; flex-shrink: 0; }
  .sx-ping-wrap > .sx-dot { position: absolute; inset: 0; }
  .sx-ping-wrap > .sx-ping { position: absolute; inset: 0; border-radius: 50%; background: #10b981; opacity: 0.75; animation: sx-ping 1.6s cubic-bezier(0,0,0.2,1) infinite; }
  .sx-icon { width: 11px; height: 11px; stroke: currentColor; stroke-width: 2.2; fill: none; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
  .sx-icon--sm { width: 10px; height: 10px; }
  .sx-icon--xs { width: 8px;  height: 8px;  }
  `;
  (document.head || document.documentElement).appendChild(s);
}

// Lucide-style inline SVGs. Just the paths we use.
const SX_ICONS = {
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  shieldAlert: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  alertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  userCheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  award: '<circle cx="12" cy="8" r="6"/><polyline points="15.477 12.89 17 22 12 19 7 22 8.523 12.89"/>',
};
function sxIcon(name, sizeClass) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'sx-icon' + (sizeClass ? ' ' + sizeClass : ''));
  svg.innerHTML = SX_ICONS[name] || '';
  return svg;
}

function sxEl(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

// View tier label + class — matches AI Studio design.
function getViewTierBadge(views) {
  if (views < 1000)   return { label: '<1K views',   cls: 'sx-tier-views-0', color: '#9ca3af', bg: 'rgba(156,163,175,0.05)', bd: 'rgba(156,163,175,0.10)', hero: false };
  if (views < 5000)   return { label: '1K+ views',   cls: 'sx-tier-views-1', color: '#38bdf8', bg: 'rgba(56,189,248,0.05)',  bd: 'rgba(56,189,248,0.10)',  hero: false };
  if (views < 10000)  return { label: '5K+ views',   cls: 'sx-tier-views-2', color: '#38bdf8', bg: 'rgba(56,189,248,0.10)',  bd: 'rgba(56,189,248,0.20)',  hero: false };
  if (views < 100000) return { label: '10K+ views',  cls: 'sx-tier-views-3', color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', bd: 'rgba(167,139,250,0.20)', hero: false };
  if (views < 300000) return { label: '100K+ views', cls: 'sx-tier-views-4', color: '#c084fc', bg: 'rgba(192,132,252,0.15)', bd: 'rgba(192,132,252,0.30)', hero: true };
  if (views < 500000) return { label: '300K+ views', cls: 'sx-tier-views-5', color: '#f472b6', bg: 'rgba(244,114,182,0.15)', bd: 'rgba(244,114,182,0.30)', hero: true };
  return                      { label: '500K+ views', cls: 'sx-tier-views-6', color: '#fb7185', bg: 'rgba(251,113,133,0.20)', bd: 'rgba(244,63,94,0.30)',   hero: true };
}
function getFollowerTierBadge(count) {
  if (count < 1500)  return { label: '<1.5K', color: '#f87171', bg: 'rgba(239,68,68,0.10)',  bd: 'rgba(239,68,68,0.20)' };
  if (count < 2000)  return { label: '1.5K+', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', bd: 'rgba(245,158,11,0.20)' };
  if (count < 3000)  return { label: '2K+',   color: '#eab308', bg: 'rgba(234,179,8,0.10)',  bd: 'rgba(234,179,8,0.20)' };
  if (count < 5000)  return { label: '3K+',   color: '#10b981', bg: 'rgba(16,185,129,0.05)', bd: 'rgba(16,185,129,0.10)' };
  if (count < 10000) return { label: '5K+',   color: '#34d399', bg: 'rgba(16,185,129,0.10)', bd: 'rgba(16,185,129,0.20)' };
  return                      { label: '10K+', color: '#2dd4bf', bg: 'rgba(20,184,166,0.10)', bd: 'rgba(20,184,166,0.20)' };
}

function injectHUD(tweetEl, screenName) {
  if (hasHUD(tweetEl)) return;
  const u = userCache.get(screenName);
  if (!u) return;

  const cellInner = tweetEl.closest('[data-testid="cellInnerDiv"]');
  if (!cellInner) return;

  ensureStyles();

  const tweetId = extractTweetId(tweetEl);
  const engagement = tweetId ? tweetCache.get(tweetId) : null;
  const sig = computeSignal(u, engagement);
  const tier = sig.score >= 8 ? 'high' : sig.score < 3 ? 'low' : 'mid';
  const followerTier = getFollowerTierBadge(u.followers);
  const viewTier = engagement ? getViewTierBadge(engagement.views) : null;
  const flag = u.country ? (COUNTRY_FLAGS[u.country] || '') : '';

  // Clear any old border/opacity styling from previous builds.
  cellInner.style.borderLeft = '';
  cellInner.style.borderRight = '';
  cellInner.style.opacity = '';

  const hud = sxEl('div', `sx-hud sx-hud--${tier}`);
  hud.setAttribute('data-signalx-hud', 'strip');

  // ── Primary row ──
  const r1 = sxEl('div', 'sx-row sx-row--spread');

  const left1 = sxEl('div', 'sx-row');
  // Signal score pill — the headline.
  const scorePill = sxEl('div', `sx-pill sx-pill--score sx-pill--score-${tier}`);
  const scoreDot = sxEl('span', 'sx-dot' + (tier === 'high' ? ' sx-dot--pulse' : ''));
  scoreDot.style.background = tier === 'high' ? '#34d399' : tier === 'low' ? '#fb7185' : '#a3a3a3';
  scorePill.appendChild(scoreDot);
  scorePill.appendChild(document.createTextNode('SIG: ' + sig.score));
  left1.appendChild(scorePill);

  // Verification: legacy = amber, blue = cyan.
  if (u.isVerified) {
    left1.appendChild(sxEl('span', 'sx-pill sx-pill--legacy', 'Legacy ✓'));
  } else if (u.isBlueVerified) {
    left1.appendChild(sxEl('span', 'sx-pill sx-pill--blue', 'Premium Blue'));
  }

  // Relationship
  const relLabel = u.followsYou && u.youFollow ? 'mutual follows' : u.youFollow ? 'you follow' : u.followsYou ? 'follows you' : null;
  if (relLabel) {
    const relPill = sxEl('span', 'sx-pill sx-pill--rel');
    relPill.appendChild(sxIcon('userCheck', 'sx-icon--sm'));
    relPill.appendChild(document.createTextNode(relLabel));
    left1.appendChild(relPill);
  }

  // Org affiliation
  if (u.affiliateLabel) {
    const org = sxEl('span', 'sx-pill sx-pill--org');
    org.appendChild(sxIcon('award', 'sx-icon--sm'));
    org.appendChild(document.createTextNode(u.affiliateLabel));
    left1.appendChild(org);
  }

  // Country flag
  if (flag) {
    const f = sxEl('span', 'sx-pill sx-pill--flag');
    f.appendChild(document.createTextNode(flag + ' ' + (u.country || '')));
    left1.appendChild(f);
  }

  r1.appendChild(left1);

  // Right: view pill (hero)
  if (viewTier) {
    const right1 = sxEl('div', 'sx-row');
    const v = sxEl('div', 'sx-pill sx-pill--view');
    v.style.color = viewTier.color;
    v.style.background = viewTier.bg;
    v.style.borderColor = viewTier.bd;
    if (viewTier.hero) v.style.fontWeight = '700';
    v.appendChild(sxIcon('eye', 'sx-icon--sm'));
    v.appendChild(document.createTextNode(viewTier.label));
    right1.appendChild(v);
    r1.appendChild(right1);
  }

  hud.appendChild(r1);

  // ── Secondary row ──
  const r2 = sxEl('div', 'sx-row sx-row--secondary sx-row--spread');
  const left2 = sxEl('div', 'sx-row sx-row--secondary');

  // Audience
  const aud = sxEl('span', 'sx-stat');
  aud.appendChild(sxEl('span', 'sx-stat-label', 'Audience:'));
  const audPill = sxEl('span', 'sx-pill');
  audPill.style.color = followerTier.color;
  audPill.style.background = followerTier.bg;
  audPill.style.borderColor = followerTier.bd;
  audPill.style.fontSize = '9px';
  audPill.style.padding = '1px 4px';
  audPill.textContent = compact(u.followers) + ' (' + followerTier.label + ')';
  aud.appendChild(audPill);
  left2.appendChild(aud);

  // Ratio (only ≥ 2x)
  if (u.ratio >= 2) {
    const r = sxEl('span', 'sx-stat');
    r.appendChild(sxEl('span', 'sx-stat-label', 'Ratio:'));
    r.appendChild(sxEl('span', 'sx-stat-val--accent', u.ratio.toFixed(1) + 'x'));
    left2.appendChild(r);
  }

  // Age
  if (u.age) {
    const age = sxEl('span', 'sx-stat');
    age.appendChild(sxIcon('calendar', 'sx-icon--sm'));
    age.appendChild(sxEl('span', 'sx-stat-label', 'Age:'));
    age.appendChild(sxEl('span', 'sx-stat-val', u.age));
    left2.appendChild(age);
  }

  // Listed (≥10)
  if (u.listed >= 10) {
    const l = sxEl('span', 'sx-stat');
    l.appendChild(sxEl('span', 'sx-stat-label', 'Listed:'));
    l.appendChild(sxEl('span', 'sx-stat-val', String(u.listed)));
    left2.appendChild(l);
  }

  // Media (≥100)
  if (u.media >= 100) {
    const m = sxEl('span', 'sx-stat');
    m.appendChild(sxEl('span', 'sx-stat-label', 'Media:'));
    m.appendChild(sxEl('span', 'sx-stat-val', compact(u.media)));
    left2.appendChild(m);
  }

  // Professional type
  if (u.professionalType) {
    const p = sxEl('span', 'sx-pill sx-pill--prof');
    p.appendChild(sxIcon('briefcase', 'sx-icon--xs'));
    p.appendChild(document.createTextNode(u.professionalType));
    left2.appendChild(p);
  } else if (u.verifiedType === 'Business') {
    const p = sxEl('span', 'sx-pill sx-pill--prof');
    p.appendChild(sxIcon('briefcase', 'sx-icon--xs'));
    p.appendChild(document.createTextNode('Business'));
    left2.appendChild(p);
  }

  r2.appendChild(left2);

  // Right: bio tags
  const right2 = sxEl('div', 'sx-row');
  right2.style.gap = '6px';
  const HV = new Set(['VC', 'Founder', 'CEO', 'YC', 'Engineer', 'Researcher']);
  for (const tag of u.bioTags) {
    const t = sxEl('span', 'sx-tag ' + (HV.has(tag) ? 'sx-tag--hv' : 'sx-tag--reg'), tag);
    right2.appendChild(t);
  }
  r2.appendChild(right2);

  hud.appendChild(r2);

  // ── Level 3 bar (conditional) ──
  if (tier === 'low' || (engagement && engagement.visibilityLimited)) {
    const l3 = sxEl('div', 'sx-l3 sx-l3--low');
    const l3l = sxEl('div', 'sx-row');
    const limited = engagement && engagement.visibilityLimited;
    const icon = limited ? sxIcon('shieldAlert', 'sx-icon--sm') : sxIcon('alertTriangle', 'sx-icon--sm');
    if (limited) icon.style.animation = 'sx-pulse 1.6s ease-in-out infinite';
    l3l.appendChild(icon);
    const inner = sxEl('div', 'sx-row');
    inner.style.gap = '4px';
    inner.appendChild(sxEl('span', 'sx-l3-label sx-l3-label--low', limited ? 'LIMIT ACTIVE:' : 'NOISE WARNING:'));
    inner.appendChild(sxEl('span', null, sig.reasons.slice(0, 3).join(', ') || 'low credibility profile'));
    l3l.appendChild(inner);
    l3.appendChild(l3l);
    l3.appendChild(sxEl('span', 'sx-l3-mono sx-l3-mono--low', 'x_api_intercept'));
    hud.appendChild(l3);
  } else if (tier === 'high') {
    const l3 = sxEl('div', 'sx-l3 sx-l3--high');
    const l3l = sxEl('div', 'sx-row');
    const pingWrap = sxEl('span', 'sx-ping-wrap');
    pingWrap.appendChild(sxEl('span', 'sx-ping'));
    const innerDot = sxEl('span', 'sx-dot');
    innerDot.style.background = '#10b981';
    pingWrap.appendChild(innerDot);
    l3l.appendChild(pingWrap);
    const msg = sxEl('span', null, '');
    msg.appendChild(document.createTextNode('High-Signal verified route: '));
    const strong = sxEl('strong', null, sig.reasons.slice(0, 2).join(' & ') || 'established reputation');
    msg.appendChild(strong);
    l3l.appendChild(msg);
    l3.appendChild(l3l);
    l3.appendChild(sxEl('span', 'sx-l3-mono sx-l3-mono--high', 'vetted_account'));
    hud.appendChild(l3);
  }

  observerPaused = true;
  cellInner.insertBefore(hud, cellInner.firstChild);
  observerPaused = false;
}
let hudPending = false;
function hudAllTweets() {
  if (hudPending) return;
  hudPending = true;
  requestAnimationFrame(() => {
    hudPending = false;
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    for (const tweet of tweets) {
      try {
        if (hasHUD(tweet)) continue;
        const username = extractUsername(tweet);
        if (username && userCache.has(username)) {
          injectHUD(tweet, username);
        }
      } catch (e) {
        console.warn('[Signal X] HUD inject error:', e.message);
      }
    }
  });
}

// ── Sidebar replacement + stats panel ──
// Hides Articles / Bookmarks / Premium Plus / Explore from X's left nav and
// drops in our own panel. All stats are derived from the in-memory caches.

const SX_NAV_STYLE_ID = 'signalx-nav-stylesheet';
function ensureNavStyles() {
  if (document.getElementById(SX_NAV_STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = SX_NAV_STYLE_ID;
  s.textContent = `
    /* Hide the four sidebar items the user reclaimed for our panel. */
    nav[role="navigation"] a[role="link"][href="/explore"],
    nav[role="navigation"] a[role="link"][href^="/explore"],
    nav[role="navigation"] a[role="link"][href="/i/bookmarks"],
    nav[role="navigation"] a[role="link"][href^="/i/bookmarks"],
    nav[role="navigation"] a[role="link"][href="/i/articles"],
    nav[role="navigation"] a[role="link"][href^="/i/premium"],
    nav[role="navigation"] a[role="link"][href="/i/verified-orgs"] {
      display: none !important;
    }
    .sx-stats {
      margin: 12px 4px;
      padding: 12px;
      border-radius: 14px;
      background: rgba(22, 24, 28, 0.9);
      border: 1px solid #2f3336;
      color: #e7e9ea;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;
      font-size: 12px;
      line-height: 1.35;
      display: flex; flex-direction: column; gap: 10px;
      user-select: none;
    }
    .sx-stats__title {
      font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
      color: #71767b; font-weight: 600;
      display: flex; align-items: center; justify-content: space-between;
    }
    .sx-stats__title .sx-stats__pulse {
      display: inline-block; width: 6px; height: 6px; border-radius: 50%;
      background: #10b981; animation: sx-pulse 1.6s ease-in-out infinite;
    }
    .sx-stats__section {
      display: flex; flex-direction: column; gap: 6px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(47, 51, 54, 0.7);
    }
    .sx-stats__section:last-child { border-bottom: none; padding-bottom: 0; }
    .sx-stats__section-h {
      font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em;
      color: #71767b; font-weight: 600; margin-bottom: 2px;
    }
    .sx-stats__row {
      display: flex; align-items: baseline; justify-content: space-between;
      gap: 8px;
    }
    .sx-stats__label { color: #71767b; font-size: 11px; }
    .sx-stats__val   {
      color: #e7e9ea; font-weight: 600;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
    }
    .sx-stats__val--accent { color: #1D9BF0; }
    .sx-stats__val--good   { color: #34d399; }
    .sx-stats__val--bad    { color: #fb7185; }
    .sx-stats__val--warn   { color: #fbbf24; }
    .sx-stats__bar {
      width: 100%; height: 4px; border-radius: 4px;
      background: rgba(47, 51, 54, 0.7); position: relative; overflow: hidden;
    }
    .sx-stats__bar > span {
      display: block; height: 100%; border-radius: 4px;
      transition: width 200ms ease;
    }
    .sx-stats__chip-row {
      display: flex; flex-wrap: wrap; gap: 4px;
    }
    .sx-stats__chip {
      font-size: 10px;
      padding: 1px 6px; border-radius: 4px;
      background: rgba(245, 158, 11, 0.10); color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.20);
      white-space: nowrap;
    }
    .sx-stats__empty {
      color: #71767b; font-style: italic; font-size: 11px; line-height: 1.4;
    }
    .sx-stats__footer {
      font-size: 9px; color: #536471; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: 0.04em; text-align: right;
    }
  `;
  (document.head || document.documentElement).appendChild(s);
}

function getCurrentHandle() {
  // X exposes the signed-in user's profile link in the bottom nav.
  const a = document.querySelector('a[data-testid="AppTabBar_Profile_Link"]')
         || document.querySelector('a[aria-label="Profile"][role="link"]');
  if (!a) return null;
  const href = a.getAttribute('href') || '';
  const m = href.match(/^\/([A-Za-z0-9_]{1,15})$/);
  return m ? m[1] : null;
}

function computeFeedHealth(currentHandle) {
  let totalUsers = 0, mutuals = 0, youFollow = 0, followsYou = 0, strangers = 0;
  const affiliations = new Map();
  for (const u of userCache.values()) {
    if (currentHandle && u.screenName.toLowerCase() === currentHandle.toLowerCase()) continue;
    totalUsers += 1;
    if (u.youFollow && u.followsYou) mutuals += 1;
    else if (u.youFollow) youFollow += 1;
    else if (u.followsYou) followsYou += 1;
    else strangers += 1;
    if (u.affiliateLabel) affiliations.set(u.affiliateLabel, (affiliations.get(u.affiliateLabel) || 0) + 1);
  }

  let totalTweets = 0, totalViews = 0, sigSum = 0, sigCount = 0;
  let noise = 0, high = 0, limited = 0;
  for (const t of tweetCache.values()) {
    totalTweets += 1;
    totalViews += t.views || 0;
    if (t.visibilityLimited) limited += 1;
    // We need to score against the author — find them in userCache via the tweet's user_id_str? We don't store that.
    // Approximation: score using a generic user shell. Or skip if we can't pair.
  }
  // Score by walking userCache and matching to tweets — but we don't link them.
  // Alternative: re-score by checking every tweet's nearest user. For now use a heuristic:
  // count low-signal as tweets where visibilityLimited OR (no relationship author).
  // This is rough — for a precise feed score we'd need tweet→user mapping (todo).
  // For now: count visibilityLimited as low-signal proxy + Premium-blue-low-followers in cache.
  for (const u of userCache.values()) {
    if (currentHandle && u.screenName.toLowerCase() === currentHandle.toLowerCase()) continue;
    // Build a fake tweet shell so computeSignal runs (it accepts no-tweet too).
    const sig = computeSignal(u, null);
    sigSum += sig.score;
    sigCount += 1;
    if (sig.score < 3) noise += 1;
    else if (sig.score >= 8) high += 1;
  }
  const avgSig = sigCount ? sigSum / sigCount : 5;
  const noisePct = sigCount ? Math.round((noise / sigCount) * 100) : 0;
  const highPct  = sigCount ? Math.round((high / sigCount) * 100) : 0;

  const topAffil = [...affiliations.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return {
    totalUsers, mutuals, youFollow, followsYou, strangers,
    totalTweets, totalViews, limited,
    avgSig, noisePct, highPct,
    topAffil,
  };
}

function findSidebarMountPoint() {
  // Inject inside the same nav so it sticks (X's nav is position: sticky).
  return document.querySelector('header[role="banner"] nav[role="navigation"]');
}

let statsPanelEl = null;
function renderStatsPanel() {
  ensureNavStyles();
  const mount = findSidebarMountPoint();
  if (!mount) return;

  // Re-attach if X re-rendered the sidebar and detached us.
  if (statsPanelEl && !document.contains(statsPanelEl)) statsPanelEl = null;
  if (!statsPanelEl) {
    statsPanelEl = document.createElement('aside');
    statsPanelEl.className = 'sx-stats';
    statsPanelEl.setAttribute('data-signalx-stats', '1');
    observerPaused = true;
    mount.appendChild(statsPanelEl);
    observerPaused = false;
  }

  const handle = getCurrentHandle();
  const me = handle ? userCache.get(handle) : null;
  const f = computeFeedHealth(handle);

  observerPaused = true;
  statsPanelEl.innerHTML = '';

  // Title
  const title = document.createElement('div');
  title.className = 'sx-stats__title';
  const titleLeft = document.createElement('span');
  titleLeft.style.cssText = 'display:flex;align-items:center;gap:7px;';
  titleLeft.appendChild(Object.assign(document.createElement('span'), { textContent: 'Signal X · Live' }));
  titleLeft.appendChild(Object.assign(document.createElement('span'), { className: 'sx-stats__pulse' }));
  title.appendChild(titleLeft);
  const zenBtn = document.createElement('button');
  zenBtn.textContent = '⊕ Zen';
  zenBtn.style.cssText = 'background:rgba(29,155,240,0.12);color:#1D9BF0;border:1px solid rgba(29,155,240,0.25);border-radius:999px;padding:2px 10px;font-size:10px;font-weight:700;cursor:pointer;text-transform:none;letter-spacing:0;';
  zenBtn.title = 'Enter Zen mode (or press Z)';
  zenBtn.onclick = () => window.__signalxToggleZen && window.__signalxToggleZen();
  title.appendChild(zenBtn);
  statsPanelEl.appendChild(title);

  // ── Your profile ──
  const meSec = document.createElement('div');
  meSec.className = 'sx-stats__section';
  const meH = Object.assign(document.createElement('div'), { className: 'sx-stats__section-h', textContent: 'Your profile' });
  meSec.appendChild(meH);
  if (me) {
    const rows = [
      ['Followers', compact(me.followers)],
      ['Following', compact(me.following)],
      ['Posts', compact(me.tweets)],
      ['Lists', compact(me.listed)],
      ['Media', compact(me.media)],
      ['Age', me.age || '—'],
    ];
    for (const [k, v] of rows) {
      const r = document.createElement('div'); r.className = 'sx-stats__row';
      r.appendChild(Object.assign(document.createElement('span'), { className: 'sx-stats__label', textContent: k }));
      r.appendChild(Object.assign(document.createElement('span'), { className: 'sx-stats__val', textContent: v }));
      meSec.appendChild(r);
    }
  } else {
    const empty = document.createElement('div');
    empty.className = 'sx-stats__empty';
    empty.textContent = handle
      ? `Visit @${handle} once to populate.`
      : 'Sign in to populate your profile stats.';
    meSec.appendChild(empty);
  }
  statsPanelEl.appendChild(meSec);

  // ── Feed health ──
  const fh = document.createElement('div');
  fh.className = 'sx-stats__section';
  fh.appendChild(Object.assign(document.createElement('div'), { className: 'sx-stats__section-h', textContent: 'Feed health (session)' }));

  // Avg signal with color bar
  const sigRow = document.createElement('div'); sigRow.className = 'sx-stats__row';
  sigRow.appendChild(Object.assign(document.createElement('span'), { className: 'sx-stats__label', textContent: 'Avg signal' }));
  const sigVal = document.createElement('span');
  sigVal.className = 'sx-stats__val ' + (f.avgSig >= 7 ? 'sx-stats__val--good' : f.avgSig < 4 ? 'sx-stats__val--bad' : 'sx-stats__val--warn');
  sigVal.textContent = f.avgSig.toFixed(1) + ' / 10';
  sigRow.appendChild(sigVal);
  fh.appendChild(sigRow);

  const bar = document.createElement('div'); bar.className = 'sx-stats__bar';
  const fill = document.createElement('span');
  fill.style.width = Math.min(100, Math.round(f.avgSig * 10)) + '%';
  fill.style.background = f.avgSig >= 7 ? '#10b981' : f.avgSig < 4 ? '#fb7185' : '#fbbf24';
  bar.appendChild(fill);
  fh.appendChild(bar);

  const rows2 = [
    ['Posts scanned', String(f.totalTweets)],
    ['Total reach', compact(f.totalViews) + ' views'],
    ['High signal', f.highPct + '%', 'good'],
    ['Noise', f.noisePct + '%', f.noisePct > 25 ? 'bad' : 'warn'],
    ['X-limited', String(f.limited), f.limited > 0 ? 'bad' : null],
  ];
  for (const [k, v, mod] of rows2) {
    const r = document.createElement('div'); r.className = 'sx-stats__row';
    r.appendChild(Object.assign(document.createElement('span'), { className: 'sx-stats__label', textContent: k }));
    const vv = Object.assign(document.createElement('span'), { textContent: v });
    vv.className = 'sx-stats__val' + (mod ? ' sx-stats__val--' + mod : '');
    r.appendChild(vv);
    fh.appendChild(r);
  }
  statsPanelEl.appendChild(fh);

  // ── Network ──
  const net = document.createElement('div'); net.className = 'sx-stats__section';
  net.appendChild(Object.assign(document.createElement('div'), { className: 'sx-stats__section-h', textContent: 'Network this session' }));
  const netRows = [
    ['Mutuals', f.mutuals, 'accent'],
    ['You follow', f.youFollow, 'accent'],
    ['Follows you', f.followsYou, null],
    ['Strangers', f.strangers, null],
  ];
  for (const [k, v, mod] of netRows) {
    const r = document.createElement('div'); r.className = 'sx-stats__row';
    r.appendChild(Object.assign(document.createElement('span'), { className: 'sx-stats__label', textContent: k }));
    const vv = Object.assign(document.createElement('span'), { textContent: String(v) });
    vv.className = 'sx-stats__val' + (mod ? ' sx-stats__val--' + mod : '');
    r.appendChild(vv);
    net.appendChild(r);
  }
  statsPanelEl.appendChild(net);

  // ── Top affiliations ──
  if (f.topAffil.length) {
    const aff = document.createElement('div'); aff.className = 'sx-stats__section';
    aff.appendChild(Object.assign(document.createElement('div'), { className: 'sx-stats__section-h', textContent: 'Top affiliations' }));
    const chips = document.createElement('div'); chips.className = 'sx-stats__chip-row';
    for (const [name, n] of f.topAffil) {
      chips.appendChild(Object.assign(document.createElement('span'), { className: 'sx-stats__chip', textContent: `${name} · ${n}` }));
    }
    aff.appendChild(chips);
    statsPanelEl.appendChild(aff);
  }

  // Footer
  statsPanelEl.appendChild(Object.assign(document.createElement('div'), { className: 'sx-stats__footer', textContent: 'zero_api_calls · in_memory_only' }));
  observerPaused = false;
}

// Re-render on relevant DOM changes (sidebar re-mounts on route change).
let statsPending = false;
function scheduleStatsRender() {
  if (statsPending) return;
  statsPending = true;
  requestAnimationFrame(() => {
    statsPending = false;
    try { renderStatsPanel(); } catch (e) { console.warn('[Signal X] stats render error:', e.message); }
  });
}

// ── Intercept X's XHR ──

const origOpen = XMLHttpRequest.prototype.open;
const origSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  this._signalxUrl = url;
  return origOpen.call(this, method, url, ...rest);
};
XMLHttpRequest.prototype.send = function (...args) {
  this.addEventListener('load', function () {
    const url = this._signalxUrl || '';
    if (url.includes('HomeTimeline') || url.includes('UserTweets') ||
        url.includes('ListLatestTweetsTimeline') || url.includes('SearchTimeline') ||
        url.includes('TweetDetail') || url.includes('UserByScreenName')) {
      try {
        const data = JSON.parse(this.responseText);
        const uBefore = userCache.size;
        const tBefore = tweetCache.size;
        findUsersInResponse(data, 0);
        const uAdded = userCache.size - uBefore;
        const tAdded = tweetCache.size - tBefore;
        if (uAdded > 0 || tAdded > 0) {
          console.log(`[Signal X] +${uAdded} users, +${tAdded} tweets (totals: ${userCache.size}u / ${tweetCache.size}t)`);
          requestAnimationFrame(hudAllTweets);
          scheduleStatsRender();
        }
      } catch {}
    }
  });
  return origSend.apply(this, args);
};

// Patch fetch as fallback
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const response = await originalFetch.apply(this, args);
  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
  if (url.includes('HomeTimeline') || url.includes('UserTweets') ||
      url.includes('ListLatestTweetsTimeline') || url.includes('SearchTimeline') ||
      url.includes('TweetDetail') || url.includes('UserByScreenName')) {
    try {
      const clone = response.clone();
      clone.json().then(data => {
        const uBefore = userCache.size;
        const tBefore = tweetCache.size;
        findUsersInResponse(data, 0);
        const uAdded = userCache.size - uBefore;
        const tAdded = tweetCache.size - tBefore;
        if (uAdded > 0 || tAdded > 0) {
          console.log(`[Signal X][fetch] +${uAdded} users, +${tAdded} tweets (totals: ${userCache.size}u / ${tweetCache.size}t)`);
          requestAnimationFrame(hudAllTweets);
          scheduleStatsRender();
        }
      }).catch(() => {});
    } catch {}
  }
  return response;
};

// ── MutationObserver (debounced, pauses during injection) ──

let observerPaused = false;
const observer = new MutationObserver(() => {
  if (observerPaused) return;
  hudAllTweets();
  // Re-attach the stats panel if X re-rendered the sidebar (route change).
  if (!document.querySelector('[data-signalx-stats]')) scheduleStatsRender();
});
if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// ═══════════════════════════════════════════════════════════════════════
//  ZEN MODE — full-screen, one post at a time, inline reply, blank the rest
// ═══════════════════════════════════════════════════════════════════════

const SX_ZEN_STYLE_ID = 'signalx-zen-stylesheet';
function ensureZenStyles() {
  if (document.getElementById(SX_ZEN_STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = SX_ZEN_STYLE_ID;
  s.textContent = `
    @keyframes sx-zen-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    #sx-zen {
      position: fixed; inset: 0; z-index: 2147483600;
      background: #000;
      color: #e7e9ea;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;
      display: flex; flex-direction: column; align-items: center;
      overflow: hidden;
    }
    #sx-zen * { box-sizing: border-box; }
    .sx-zen__stage {
      flex: 1; width: 100%; display: flex; align-items: center; justify-content: center;
      padding: 24px 20px; overflow-y: auto;
    }
    .sx-zen__card {
      width: 100%; max-width: 640px;
      animation: sx-zen-in 200ms ease;
    }
    .sx-zen__author { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .sx-zen__avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; background: #1a1a1a; flex-shrink: 0; filter: grayscale(1); }
    .sx-zen__name { font-weight: 600; font-size: 15px; color: #e7e9ea; display: flex; align-items: center; gap: 5px; }
    .sx-zen__handle { color: #6e6e6e; font-size: 14px; }
    .sx-zen__text {
      font-size: 24px; line-height: 1.45; color: #f4f4f4; margin: 20px 0 24px;
      white-space: pre-wrap; word-wrap: break-word; font-weight: 400;
    }
    .sx-zen__text--long { font-size: 20px; }
    .sx-zen__text--vlong { font-size: 17px; }
    .sx-zen__media { width: 100%; border-radius: 12px; border: 1px solid #222; margin: 0 0 24px; max-height: 340px; object-fit: cover; filter: grayscale(1); }
    .sx-zen__engage { display: flex; gap: 20px; font-size: 13px; color: #6e6e6e; margin-bottom: 10px; font-variant-numeric: tabular-nums; }
    .sx-zen__engage b { color: #cfcfcf; font-weight: 500; }
    .sx-zen__meta { font-size: 12px; color: #6e6e6e; margin-top: 4px; letter-spacing: 0.01em; }
    .sx-zen__reply {
      width: 100%; max-width: 640px; flex-shrink: 0;
      padding: 16px 20px 26px;
    }
    .sx-zen__replybox {
      width: 100%; min-height: 52px; max-height: 160px; resize: none;
      background: #0a0a0a; border: 1px solid #262626; border-radius: 12px;
      color: #f4f4f4; font-size: 16px; line-height: 1.4; padding: 14px 16px;
      font-family: inherit; outline: none; transition: border-color 120ms ease;
    }
    .sx-zen__replybox:focus { border-color: #4d4d4d; }
    .sx-zen__replybox::placeholder { color: #4d4d4d; }
    .sx-zen__replyrow { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
    .sx-zen__hint { font-size: 12px; color: #4d4d4d; }
    .sx-zen__hint kbd { font-family: ui-monospace, monospace; background: #141414; border: 1px solid #262626; border-radius: 4px; padding: 1px 5px; color: #6e6e6e; }
    .sx-zen__send {
      background: #e7e9ea; color: #000; border: none; border-radius: 999px;
      padding: 8px 20px; font-size: 14px; font-weight: 600; cursor: pointer;
      transition: opacity 120ms ease;
    }
    .sx-zen__send:hover { opacity: 0.85; }
    .sx-zen__send:disabled { opacity: 0.3; cursor: default; }
    .sx-zen__count { font-size: 12px; color: #6e6e6e; font-variant-numeric: tabular-nums; margin-right: 12px; }
    .sx-zen__count--warn { color: #9e9e9e; }
    .sx-zen__count--over { color: #e7e9ea; }
    .sx-zen__toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #0a0a0a; border: 1px solid #262626; color: #e7e9ea;
      padding: 10px 18px; border-radius: 10px; font-size: 14px; z-index: 2147483601;
      opacity: 0; transition: opacity 160ms ease;
    }
    .sx-zen__toast--show { opacity: 1; }
    .sx-zen__empty { color: #4d4d4d; font-size: 16px; text-align: center; }
    /* Hide X's native composer modal while we drive it from Zen. */
    body.sx-zen-posting div[aria-labelledby][role="dialog"],
    body.sx-zen-posting [data-testid="mask"] { opacity: 0 !important; pointer-events: none !important; }
    body.sx-zen-on { overflow: hidden !important; }
  `;
  (document.head || document.documentElement).appendChild(s);
}

// ── small async helpers ──
const sxSleep = (ms) => new Promise(r => setTimeout(r, ms));
function sxWaitFor(selector, timeout = 4000) {
  return new Promise((resolve, reject) => {
    const found = document.querySelector(selector);
    if (found) return resolve(found);
    const t0 = Date.now();
    const iv = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) { clearInterval(iv); resolve(el); }
      else if (Date.now() - t0 > timeout) { clearInterval(iv); reject(new Error('timeout: ' + selector)); }
    }, 60);
  });
}
function sxWaitGone(selector, timeout = 5000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (!document.querySelector(selector) || Date.now() - t0 > timeout) { clearInterval(iv); resolve(); }
    }, 80);
  });
}

// ── Zen state ──
let zenActive = false;
let zenPosts = [];   // [{ article, handle }]
let zenIndex = 0;
let zenEl = null;

function extractPostData(article) {
  const handle = extractUsername(article);
  const nameEl = article.querySelector('[data-testid="User-Name"]');
  let name = '';
  if (nameEl) {
    const span = [...nameEl.querySelectorAll('span')].find(s => s.textContent && !s.textContent.startsWith('@'));
    name = span ? span.textContent : '';
  }
  const textEl = article.querySelector('[data-testid="tweetText"]');
  const text = textEl ? textEl.innerText : '';
  const avatar = article.querySelector('img[src*="profile_images"]')?.src || '';
  const media = article.querySelector('[data-testid="tweetPhoto"] img')?.src || '';
  const tweetId = extractTweetId(article);
  const engagement = tweetId ? tweetCache.get(tweetId) : null;
  const user = handle ? userCache.get(handle) : null;
  return { handle, name, text, avatar, media, tweetId, engagement, user, article };
}

function collectZenPosts() {
  const articles = [...document.querySelectorAll('article[data-testid="tweet"]')];
  const seen = new Set();
  const posts = [];
  for (const a of articles) {
    const id = extractTweetId(a);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    posts.push({ article: a, id });
  }
  return posts;
}

function zenToast(msg, kind) {
  let t = zenEl.querySelector('.sx-zen__toast');
  if (!t) { t = document.createElement('div'); t.className = 'sx-zen__toast'; zenEl.appendChild(t); }
  t.className = 'sx-zen__toast' + (kind ? ' sx-zen__toast--' + kind : '');
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('sx-zen__toast--show'));
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('sx-zen__toast--show'), 2600);
}

function enterZen() {
  if (zenActive) return;
  ensureZenStyles();
  zenPosts = collectZenPosts();
  zenIndex = 0;
  zenActive = true;
  document.body.classList.add('sx-zen-on');

  zenEl = document.createElement('div');
  zenEl.id = 'sx-zen';
  observerPaused = true;
  document.body.appendChild(zenEl);
  observerPaused = false;
  zenRender();
}

function exitZen() {
  if (!zenActive) return;
  zenActive = false;
  document.body.classList.remove('sx-zen-on');
  if (zenEl && zenEl.parentNode) zenEl.parentNode.removeChild(zenEl);
  zenEl = null;
}

function zenNext() {
  if (zenIndex < zenPosts.length - 1) { zenIndex += 1; zenRender(); }
  // Grow the queue when near the end by nudging the real timeline to paginate.
  if (zenIndex >= zenPosts.length - 3) {
    const y = window.scrollY;
    window.scrollTo(0, document.body.scrollHeight);
    setTimeout(() => {
      window.scrollTo(0, y);
      const fresh = collectZenPosts();
      if (fresh.length > zenPosts.length) zenPosts = fresh;
    }, 700);
  }
}
function zenPrev() { if (zenIndex > 0) { zenIndex -= 1; zenRender(); } }

function zenRender() {
  if (!zenEl) return;
  observerPaused = true;
  zenEl.innerHTML = '';

  const stage = document.createElement('div'); stage.className = 'sx-zen__stage';
  zenEl.appendChild(stage);

  if (!zenPosts.length) {
    const empty = document.createElement('div'); empty.className = 'sx-zen__empty';
    empty.textContent = 'No posts loaded yet. Scroll your timeline once, then open Zen.';
    stage.appendChild(empty);
    observerPaused = false;
    return;
  }

  const post = extractPostData(zenPosts[zenIndex].article);
  const u = post.user;
  const sig = computeSignal(u, post.engagement);
  const tier = sig.score >= 8 ? 'high' : sig.score < 3 ? 'low' : 'mid';

  const card = document.createElement('div'); card.className = 'sx-zen__card';

  // Author
  const author = document.createElement('div'); author.className = 'sx-zen__author';
  if (post.avatar) {
    const img = document.createElement('img'); img.className = 'sx-zen__avatar'; img.src = post.avatar; author.appendChild(img);
  }
  const idCol = document.createElement('div');
  const nm = document.createElement('div'); nm.className = 'sx-zen__name';
  nm.appendChild(document.createTextNode(post.name || post.handle || 'Unknown'));
  if (u && (u.isVerified || u.isBlueVerified)) nm.appendChild(Object.assign(document.createElement('span'), { textContent: '✓', style: 'color:#6e6e6e' }));
  idCol.appendChild(nm);
  idCol.appendChild(Object.assign(document.createElement('div'), { className: 'sx-zen__handle', textContent: post.handle ? '@' + post.handle : '' }));
  author.appendChild(idCol);
  card.appendChild(author);

  // Text
  const txt = document.createElement('div');
  const len = post.text.length;
  txt.className = 'sx-zen__text' + (len > 280 ? ' sx-zen__text--vlong' : len > 140 ? ' sx-zen__text--long' : '');
  txt.textContent = post.text || '(no text)';
  card.appendChild(txt);

  // Media (single image preview)
  if (post.media) {
    const m = document.createElement('img'); m.className = 'sx-zen__media'; m.src = post.media; card.appendChild(m);
  }

  // Engagement
  if (post.engagement) {
    const e = post.engagement;
    const eng = document.createElement('div'); eng.className = 'sx-zen__engage';
    const items = [['views', e.views], ['likes', e.likes], ['RT', e.retweets], ['replies', e.replies]];
    for (const [label, val] of items) {
      const sp = document.createElement('span');
      sp.innerHTML = `<b>${compact(val || 0)}</b> ${label}`;
      eng.appendChild(sp);
    }
    card.appendChild(eng);
  }

  // Signal meta — one quiet gray line, no chips, no color.
  if (u) {
    const bits = [];
    bits.push('signal ' + sig.score + '/10');
    bits.push(compact(u.followers) + ' followers');
    if (u.age) bits.push(u.age);
    if (u.affiliateLabel) bits.push('@' + u.affiliateLabel);
    const relLabel = u.followsYou && u.youFollow ? 'mutual' : u.youFollow ? 'you follow' : u.followsYou ? 'follows you' : '';
    if (relLabel) bits.push(relLabel);
    if (sig.score < 3 && sig.reasons.length) bits.push('noise: ' + sig.reasons.slice(0, 2).join(', '));
    const meta = document.createElement('div'); meta.className = 'sx-zen__meta';
    meta.textContent = bits.join('   ·   ');
    card.appendChild(meta);
  }

  stage.appendChild(card);

  // Reply box
  const replyWrap = document.createElement('div'); replyWrap.className = 'sx-zen__reply';
  const box = document.createElement('textarea');
  box.className = 'sx-zen__replybox';
  box.placeholder = post.handle ? `Reply to @${post.handle}…` : 'Reply…';
  box.rows = 1;
  box.addEventListener('input', () => {
    box.style.height = 'auto';
    box.style.height = Math.min(box.scrollHeight, 160) + 'px';
    updateCount();
  });
  replyWrap.appendChild(box);

  const row = document.createElement('div'); row.className = 'sx-zen__replyrow';
  const hint = document.createElement('div'); hint.className = 'sx-zen__hint';
  hint.innerHTML = '<kbd>J</kbd>/<kbd>K</kbd> navigate · <kbd>⌘↵</kbd> reply &amp; next · <kbd>S</kbd> skip · <kbd>Esc</kbd> exit';
  const rightSide = document.createElement('div'); rightSide.style.cssText = 'display:flex;align-items:center;';
  const count = document.createElement('span'); count.className = 'sx-zen__count'; count.textContent = '280';
  const send = document.createElement('button'); send.className = 'sx-zen__send'; send.textContent = 'Reply';
  send.disabled = true;
  rightSide.appendChild(count); rightSide.appendChild(send);
  row.appendChild(hint); row.appendChild(rightSide);
  replyWrap.appendChild(row);
  zenEl.appendChild(replyWrap);

  function updateCount() {
    const remaining = 280 - box.value.length;
    count.textContent = String(remaining);
    count.className = 'sx-zen__count' + (remaining < 0 ? ' sx-zen__count--over' : remaining < 20 ? ' sx-zen__count--warn' : '');
    send.disabled = box.value.trim().length === 0 || remaining < 0;
  }

  async function doSend() {
    const text = box.value.trim();
    if (!text || text.length > 280) return;
    send.disabled = true; send.textContent = 'Posting…';
    try {
      await postReply(zenPosts[zenIndex].article, text);
      zenToast('Replied');
      box.value = '';
      setTimeout(() => zenNext(), 350);
    } catch (e) {
      console.warn('[Signal X] reply failed:', e.message);
      zenToast('Reply failed — ' + e.message);
      send.disabled = false; send.textContent = 'Reply';
    }
  }
  send.onclick = doSend;
  box._doSend = doSend;

  // Autofocus so the user can start typing immediately.
  setTimeout(() => box.focus(), 60);
  observerPaused = false;
}

// Drive X's own composer to actually post the reply. No tokens, no API guessing.
async function postReply(article, text) {
  const replyBtn = article.querySelector('[data-testid="reply"]');
  if (!replyBtn) throw new Error('no reply control');
  document.body.classList.add('sx-zen-posting');
  try {
    replyBtn.click();
    const box = await sxWaitFor('[data-testid="tweetTextarea_0"]', 5000);
    box.focus();
    // execCommand insertText fires the input events Draft.js needs.
    const ok = document.execCommand('insertText', false, text);
    if (!ok) {
      // Fallback: dispatch a beforeinput/input pair.
      box.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: text, bubbles: true, cancelable: true }));
      box.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: text, bubbles: true }));
    }
    await sxSleep(220);
    const postBtn = await sxWaitFor('[data-testid="tweetButton"]', 3000);
    if (postBtn.getAttribute('aria-disabled') === 'true') {
      await sxSleep(300);
    }
    postBtn.click();
    await sxWaitGone('[data-testid="tweetTextarea_0"]', 6000);
  } finally {
    document.body.classList.remove('sx-zen-posting');
  }
}

// ── Keyboard: toggle + in-Zen navigation ──
document.addEventListener('keydown', (e) => {
  const typingInPage = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;

  // Toggle Zen with 'z' when NOT typing.
  if (!zenActive && (e.key === 'z' || e.key === 'Z') && !typingInPage && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    enterZen();
    return;
  }
  if (!zenActive) return;

  const box = zenEl && zenEl.querySelector('.sx-zen__replybox');
  const inReply = e.target === box;

  if (e.key === 'Escape') { e.preventDefault(); exitZen(); return; }

  // Cmd/Ctrl+Enter posts from the reply box.
  if (inReply && (e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    if (box._doSend) box._doSend();
    return;
  }

  // Navigation keys work when not actively typing (or with no text yet).
  const canNav = !inReply || box.value.length === 0;
  if (canNav) {
    if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); zenNext(); }
    else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); zenPrev(); }
    else if (e.key === 's' || e.key === 'S') { e.preventDefault(); zenNext(); }
  }
}, true);

// Expose a programmatic toggle for the stats-panel button.
window.__signalxToggleZen = () => (zenActive ? exitZen() : enterZen());

console.log('[Signal X] HUD active — zero API calls, full intel on every tweet. Press Z for Zen mode.');
