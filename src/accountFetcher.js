// US state abbreviations
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

// Country name variants -> canonical name
const COUNTRY_ALIASES = {
  'usa': 'United States', 'us': 'United States', 'united states': 'United States',
  'united states of america': 'United States', 'america': 'United States',
  'uk': 'United Kingdom', 'united kingdom': 'United Kingdom', 'england': 'United Kingdom',
  'britain': 'United Kingdom', 'great britain': 'United Kingdom', 'scotland': 'United Kingdom',
  'wales': 'United Kingdom',
  'japan': 'Japan', 'brazil': 'Brazil', 'canada': 'Canada',
  'germany': 'Germany', 'france': 'France', 'australia': 'Australia', 'mexico': 'Mexico',
  'south korea': 'South Korea', 'korea': 'South Korea',
  'indonesia': 'Indonesia', 'turkey': 'Turkey', 'türkiye': 'Turkey',
  'saudi arabia': 'Saudi Arabia', 'nigeria': 'Nigeria', 'pakistan': 'Pakistan',
  'philippines': 'Philippines', 'spain': 'Spain', 'italy': 'Italy',
  'netherlands': 'Netherlands', 'holland': 'Netherlands',
  'russia': 'Russia', 'china': 'China', 'israel': 'Israel',
  'uae': 'United Arab Emirates', 'united arab emirates': 'United Arab Emirates',
  'argentina': 'Argentina', 'colombia': 'Colombia', 'thailand': 'Thailand',
  'egypt': 'Egypt', 'south africa': 'South Africa', 'poland': 'Poland',
  'ukraine': 'Ukraine', 'kenya': 'Kenya', 'vietnam': 'Vietnam',
  'malaysia': 'Malaysia', 'singapore': 'Singapore', 'ireland': 'Ireland',
  'sweden': 'Sweden', 'portugal': 'Portugal', 'chile': 'Chile',
  'bangladesh': 'Bangladesh', 'ghana': 'Ghana', 'ethiopia': 'Ethiopia',
  'morocco': 'Morocco', 'taiwan': 'Taiwan', 'new zealand': 'New Zealand',
  'switzerland': 'Switzerland', 'austria': 'Austria', 'belgium': 'Belgium',
  'denmark': 'Denmark', 'norway': 'Norway', 'finland': 'Finland',
  'czech republic': 'Czech Republic', 'czechia': 'Czech Republic',
  'romania': 'Romania', 'peru': 'Peru', 'iraq': 'Iraq', 'iran': 'Iran',
  'sri lanka': 'Sri Lanka', 'nepal': 'Nepal',
};

// Well-known cities -> country
const CITY_TO_COUNTRY = {
  'new york': 'United States', 'nyc': 'United States', 'los angeles': 'United States',
  'la': 'United States', 'chicago': 'United States', 'houston': 'United States',
  'phoenix': 'United States', 'san francisco': 'United States', 'sf': 'United States',
  'seattle': 'United States', 'austin': 'United States', 'boston': 'United States',
  'miami': 'United States', 'denver': 'United States', 'atlanta': 'United States',
  'san diego': 'United States', 'dallas': 'United States', 'portland': 'United States',
  'nashville': 'United States', 'detroit': 'United States', 'san jose': 'United States',
  'philadelphia': 'United States', 'washington dc': 'United States',
  'silicon valley': 'United States', 'bay area': 'United States', 'brooklyn': 'United States',
  'manhattan': 'United States',
  'london': 'United Kingdom', 'manchester': 'United Kingdom', 'birmingham': 'United Kingdom',
  'edinburgh': 'United Kingdom', 'glasgow': 'United Kingdom', 'bristol': 'United Kingdom',
  'leeds': 'United Kingdom', 'liverpool': 'United Kingdom',
  'toronto': 'Canada', 'vancouver': 'Canada', 'montreal': 'Canada', 'ottawa': 'Canada',
  'calgary': 'Canada',
  'tokyo': 'Japan', 'osaka': 'Japan', 'kyoto': 'Japan',
  'paris': 'France', 'lyon': 'France', 'marseille': 'France',
  'berlin': 'Germany', 'munich': 'Germany', 'hamburg': 'Germany', 'frankfurt': 'Germany',
  'sydney': 'Australia', 'melbourne': 'Australia', 'brisbane': 'Australia',
  'são paulo': 'Brazil', 'sao paulo': 'Brazil', 'rio de janeiro': 'Brazil', 'rio': 'Brazil',
  'mexico city': 'Mexico', 'cdmx': 'Mexico', 'guadalajara': 'Mexico',
  'seoul': 'South Korea', 'busan': 'South Korea',
  'jakarta': 'Indonesia', 'istanbul': 'Turkey', 'dubai': 'United Arab Emirates',
  'abu dhabi': 'United Arab Emirates', 'riyadh': 'Saudi Arabia', 'jeddah': 'Saudi Arabia',
  'lagos': 'Nigeria', 'abuja': 'Nigeria', 'karachi': 'Pakistan', 'lahore': 'Pakistan',
  'islamabad': 'Pakistan', 'manila': 'Philippines', 'madrid': 'Spain', 'barcelona': 'Spain',
  'rome': 'Italy', 'milan': 'Italy', 'amsterdam': 'Netherlands',
  'moscow': 'Russia', 'beijing': 'China', 'shanghai': 'China', 'shenzhen': 'China',
  'tel aviv': 'Israel', 'jerusalem': 'Israel', 'buenos aires': 'Argentina',
  'bogotá': 'Colombia', 'bogota': 'Colombia', 'bangkok': 'Thailand',
  'cairo': 'Egypt', 'cape town': 'South Africa', 'johannesburg': 'South Africa',
  'warsaw': 'Poland', 'kyiv': 'Ukraine', 'nairobi': 'Kenya',
  'ho chi minh': 'Vietnam', 'hanoi': 'Vietnam', 'kuala lumpur': 'Malaysia',
  'lisbon': 'Portugal', 'dublin': 'Ireland', 'stockholm': 'Sweden',
  'taipei': 'Taiwan', 'auckland': 'New Zealand', 'zurich': 'Switzerland',
  'geneva': 'Switzerland', 'vienna': 'Austria', 'brussels': 'Belgium',
  'copenhagen': 'Denmark', 'oslo': 'Norway', 'helsinki': 'Finland',
  'casablanca': 'Morocco', 'lima': 'Peru', 'santiago': 'Chile',
  'dhaka': 'Bangladesh', 'accra': 'Ghana', 'addis ababa': 'Ethiopia',
  'kathmandu': 'Nepal', 'colombo': 'Sri Lanka',
};

function resolveLocationToCountry(location) {
  if (!location || typeof location !== 'string') return null;

  const trimmed = location.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  // Direct country name match
  if (COUNTRY_ALIASES[lower]) return COUNTRY_ALIASES[lower];

  // Direct city match
  if (CITY_TO_COUNTRY[lower]) return CITY_TO_COUNTRY[lower];

  // "City, State" or "City, Country" format
  const parts = trimmed.split(',').map(p => p.trim().toLowerCase());

  if (parts.length >= 2) {
    const last = parts[parts.length - 1];

    // Check if last part is a US state abbreviation
    if (US_STATES.has(last)) return 'United States';

    // Check if last part is a US state name
    if (US_STATE_NAMES.has(last)) return 'United States';

    // Check if last part is a country
    if (COUNTRY_ALIASES[last]) return COUNTRY_ALIASES[last];

    // Check if first part is a known city
    const city = parts[0];
    if (CITY_TO_COUNTRY[city]) return CITY_TO_COUNTRY[city];
  }

  // Single word — check if it's a known city
  if (CITY_TO_COUNTRY[lower]) return CITY_TO_COUNTRY[lower];

  return null;
}

// Recursively find User objects in the timeline response
function findUsers(obj, out, seen, depth) {
  if (!obj || typeof obj !== 'object' || depth > 15) return;
  if (Array.isArray(obj)) {
    for (const item of obj) findUsers(item, out, seen, depth + 1);
    return;
  }

  if (obj.__typename === 'User' && obj.core?.screen_name) {
    const sn = obj.core.screen_name;
    if (!seen.has(sn)) {
      seen.add(sn);
      out.push({
        screenName: sn,
        location: obj.location?.location || '',
      });
    }
    return;
  }

  for (const val of Object.values(obj)) {
    findUsers(val, out, seen, depth + 1);
  }
}

function extractUsersFromTimeline(data) {
  if (!data || typeof data !== 'object') return [];
  const users = [];
  const seen = new Set();
  findUsers(data, users, seen, 0);
  return users;
}

module.exports = { extractUsersFromTimeline, resolveLocationToCountry };
