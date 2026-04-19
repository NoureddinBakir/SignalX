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
  return tags.slice(0, 5);
}

module.exports = { extractBioTags, BIO_KEYWORDS };
