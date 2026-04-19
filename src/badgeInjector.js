const COUNTRY_FLAGS = {
  'United States': '\u{1F1FA}\u{1F1F8}',
  'Japan': '\u{1F1EF}\u{1F1F5}',
  'Brazil': '\u{1F1E7}\u{1F1F7}',
  'United Kingdom': '\u{1F1EC}\u{1F1E7}',
  'Canada': '\u{1F1E8}\u{1F1E6}',
  'Germany': '\u{1F1E9}\u{1F1EA}',
  'France': '\u{1F1EB}\u{1F1F7}',
  'Australia': '\u{1F1E6}\u{1F1FA}',
  'Mexico': '\u{1F1F2}\u{1F1FD}',
  'South Korea': '\u{1F1F0}\u{1F1F7}',
  'Indonesia': '\u{1F1EE}\u{1F1E9}',
  'Turkey': '\u{1F1F9}\u{1F1F7}',
  'Saudi Arabia': '\u{1F1F8}\u{1F1E6}',
  'Nigeria': '\u{1F1F3}\u{1F1EC}',
  'Pakistan': '\u{1F1F5}\u{1F1F0}',
  'Philippines': '\u{1F1F5}\u{1F1ED}',
  'Spain': '\u{1F1EA}\u{1F1F8}',
  'Italy': '\u{1F1EE}\u{1F1F9}',
  'Netherlands': '\u{1F1F3}\u{1F1F1}',
  'Russia': '\u{1F1F7}\u{1F1FA}',
  'China': '\u{1F1E8}\u{1F1F3}',
  'Israel': '\u{1F1EE}\u{1F1F1}',
  'United Arab Emirates': '\u{1F1E6}\u{1F1EA}',
  'Argentina': '\u{1F1E6}\u{1F1F7}',
  'Colombia': '\u{1F1E8}\u{1F1F4}',
  'Thailand': '\u{1F1F9}\u{1F1ED}',
  'Egypt': '\u{1F1EA}\u{1F1EC}',
  'South Africa': '\u{1F1FF}\u{1F1E6}',
  'Poland': '\u{1F1F5}\u{1F1F1}',
  'Ukraine': '\u{1F1FA}\u{1F1E6}',
  'Kenya': '\u{1F1F0}\u{1F1EA}',
  'Vietnam': '\u{1F1FB}\u{1F1F3}',
  'Malaysia': '\u{1F1F2}\u{1F1FE}',
  'Singapore': '\u{1F1F8}\u{1F1EC}',
  'Ireland': '\u{1F1EE}\u{1F1EA}',
  'Sweden': '\u{1F1F8}\u{1F1EA}',
  'Portugal': '\u{1F1F5}\u{1F1F9}',
  'Chile': '\u{1F1E8}\u{1F1F1}',
  'Bangladesh': '\u{1F1E7}\u{1F1E9}',
  'Ghana': '\u{1F1EC}\u{1F1ED}',
  'Ethiopia': '\u{1F1EA}\u{1F1F9}',
};

function getFlag(country) {
  if (!country) return '\u{1F310}'; // globe
  return COUNTRY_FLAGS[country] || '\u{1F3F3}\u{FE0F}'; // white flag fallback
}

function hasBadge(tweetElement) {
  return !!tweetElement.querySelector('[data-signalx-badge]');
}

function injectBadge(tweetElement, country) {
  if (hasBadge(tweetElement)) return;

  const badge = document.createElement('span');
  badge.setAttribute('data-signalx-badge', 'true');
  badge.style.display = 'inline-flex';
  badge.style.alignItems = 'center';
  badge.style.gap = '3px';
  badge.style.marginLeft = '6px';
  badge.style.padding = '1px 6px';
  badge.style.borderRadius = '9999px';
  badge.style.fontSize = '12px';
  badge.style.fontWeight = '500';
  badge.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
  badge.style.color = 'rgb(29, 155, 240)';
  badge.style.lineHeight = '1.4';

  const flag = getFlag(country);
  const label = country || 'Unknown';
  badge.textContent = `${flag} ${label}`;

  // Insert after the username link
  const usernameLink = tweetElement.querySelector('a[role="link"] span');
  if (usernameLink) {
    usernameLink.closest('a').after(badge);
  } else {
    tweetElement.prepend(badge);
  }
}

module.exports = { injectBadge, hasBadge, COUNTRY_FLAGS };
