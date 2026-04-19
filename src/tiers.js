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

module.exports = { getTier, compact, accountAge, TIERS };
