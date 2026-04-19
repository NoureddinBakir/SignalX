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

// ── User Cache ──

const userCache = new Map(); // screenName -> full user data object

function findUsersInResponse(obj, depth) {
  if (!obj || typeof obj !== 'object' || depth > 15) return;
  if (Array.isArray(obj)) {
    for (const item of obj) findUsersInResponse(item, depth + 1);
    return;
  }
  if (obj.__typename === 'User' && obj.core?.screen_name) {
    const sn = obj.core.screen_name;
    if (!userCache.has(sn)) {
      const loc = obj.location?.location || '';
      const country = resolveLocationToCountry(loc);
      const bio = obj.legacy?.description || obj.profile_bio?.description || '';
      const followers = obj.legacy?.followers_count ?? 0;
      const following = obj.legacy?.friends_count ?? 0;
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
        createdAt: obj.core?.created_at || '',
        age: accountAge(obj.core?.created_at),
        isBlueVerified: obj.is_blue_verified || false,
        isVerified: obj.verification?.verified || false,
        professionalType: obj.professional?.professional_type || '',
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

function makePill(text, bg, color) {
  const s = document.createElement('span');
  s.textContent = text;
  s.style.cssText = `padding:0 5px;border-radius:4px;font-size:10px;font-weight:600;background:${bg};color:${color};line-height:1.6;white-space:nowrap;`;
  return s;
}

function makeDot() {
  const d = document.createElement('span');
  d.style.cssText = 'color:#6B7280;font-size:10px;margin:0 1px;';
  d.textContent = '\u00B7';
  return d;
}

function makeStrip(side) {
  const el = document.createElement('div');
  el.setAttribute('data-signalx-hud', side);
  el.style.cssText = `
    display:flex; align-items:center; flex-wrap:wrap; gap:4px;
    padding:4px 12px;
    font-family:-apple-system,BlinkMacSystemFont,sans-serif;
    border-${side === 'top' ? 'bottom' : 'top'}:1px solid rgba(134,142,150,0.12);
  `;
  return el;
}

function injectHUD(tweetEl, screenName) {
  if (hasHUD(tweetEl)) return;
  const u = userCache.get(screenName);
  if (!u) return;

  const tier = getTier(u.followers);
  const flag = u.country ? (COUNTRY_FLAGS[u.country] || '') : '';
  const HIGH_VALUE = new Set(['VC','Founder','Co-Founder','CEO','Angel','Investor','YC','a16z','Sequoia','Partner','GP']);

  // ── Find the cellInnerDiv wrapper ABOVE the article ──
  // X structure: div[data-testid="cellInnerDiv"] > div > article
  const cellInner = tweetEl.closest('[data-testid="cellInnerDiv"]');
  if (!cellInner) return;

  // ── Left border = follower tier color ──
  cellInner.style.borderLeft = tier.min > 0 ? `3px solid ${tier.border}` : '';

  // ══════════════════════════════════════
  //  TOP STRIP: flag, followers, ratio, tags
  // ══════════════════════════════════════
  const top = makeStrip('top');

  // Flag + country
  if (flag || u.location) {
    const loc = document.createElement('span');
    loc.style.cssText = `font-size:11px;font-weight:600;color:${u.country === 'United States' ? '#1D9BF0' : '#8B98A5'};white-space:nowrap;`;
    loc.textContent = flag ? `${flag} ${u.country}` : u.location;
    top.appendChild(loc);
  }

  // Follower count (tier-colored)
  const fc = document.createElement('span');
  fc.style.cssText = `font-size:11px;font-weight:700;color:${tier.color};display:inline-flex;align-items:center;gap:3px;`;
  fc.textContent = compact(u.followers);
  if (tier.min >= 1500) {
    const dot = document.createElement('span');
    dot.style.cssText = `width:5px;height:5px;border-radius:50%;background:${tier.color};display:inline-block;`;
    fc.appendChild(dot);
  }
  top.appendChild(fc);

  // Ratio
  if (u.ratio >= 2) {
    const r = document.createElement('span');
    r.style.cssText = 'font-size:10px;color:#8B98A5;font-weight:500;';
    r.textContent = `${u.ratio.toFixed(1)}x ratio`;
    top.appendChild(r);
  }

  // Bio tags
  for (const tag of u.bioTags) {
    const isHV = HIGH_VALUE.has(tag);
    top.appendChild(makePill(
      tag,
      isHV ? 'rgba(212,160,23,0.15)' : 'rgba(134,142,150,0.10)',
      isHV ? '#D4A017' : '#8B98A5',
    ));
  }

  // ══════════════════════════════════════
  //  BOTTOM STRIP: age, lists, tweets, relationship, verification
  // ══════════════════════════════════════
  const bot = makeStrip('bottom');

  if (u.age) {
    const age = document.createElement('span');
    age.style.cssText = 'font-size:10px;color:#6B7280;';
    age.textContent = `\u{1F4C5} ${u.age} old`;
    bot.appendChild(age);
  }

  if (u.listed > 0) {
    bot.appendChild(makeDot());
    const ls = document.createElement('span');
    ls.style.cssText = 'font-size:10px;color:#6B7280;';
    ls.textContent = `${compact(u.listed)} lists`;
    bot.appendChild(ls);
  }

  bot.appendChild(makeDot());
  const tw = document.createElement('span');
  tw.style.cssText = 'font-size:10px;color:#6B7280;';
  tw.textContent = `${compact(u.tweets)} tweets`;
  bot.appendChild(tw);

  if (u.media > 0) {
    bot.appendChild(makeDot());
    const md = document.createElement('span');
    md.style.cssText = 'font-size:10px;color:#6B7280;';
    md.textContent = `${compact(u.media)} media`;
    bot.appendChild(md);
  }

  // Spacer pushes badges to the right
  const spacer = document.createElement('span');
  spacer.style.cssText = 'flex:1;';
  bot.appendChild(spacer);

  // Relationship & verification badges (right-aligned)
  if (u.followsYou) bot.appendChild(makePill('Follows you', 'rgba(47,158,68,0.12)', '#2F9E44'));
  if (u.isBlueVerified) bot.appendChild(makePill('\u2713 Blue', 'rgba(29,155,240,0.12)', '#1D9BF0'));
  if (u.professionalType) bot.appendChild(makePill(u.professionalType, 'rgba(134,142,150,0.10)', '#8B98A5'));
  if (u.defaultAvatar) bot.appendChild(makePill('\u26A0 No pic', 'rgba(232,89,12,0.12)', '#E8590C'));

  // ── Insert: top strip before article, bottom strip after article ──
  observerPaused = true;
  cellInner.insertBefore(top, cellInner.firstChild);
  cellInner.appendChild(bot);
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
        const before = userCache.size;
        findUsersInResponse(data, 0);
        const added = userCache.size - before;
        if (added > 0) {
          console.log(`[Signal X] +${added} users cached (total: ${userCache.size})`);
          requestAnimationFrame(hudAllTweets);
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
        const before = userCache.size;
        findUsersInResponse(data, 0);
        const added = userCache.size - before;
        if (added > 0) {
          console.log(`[Signal X][fetch] +${added} users cached (total: ${userCache.size})`);
          requestAnimationFrame(hudAllTweets);
        }
      }).catch(() => {});
    } catch {}
  }
  return response;
};

// ── MutationObserver (debounced, pauses during injection) ──

let observerPaused = false;
const observer = new MutationObserver(() => {
  if (!observerPaused) hudAllTweets();
});
if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

console.log('[Signal X] HUD active — zero API calls, full intel on every tweet');
