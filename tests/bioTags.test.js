const { extractBioTags } = require('../src/bioTags');

describe('extractBioTags', () => {
  test('extracts VC from bio', () => {
    expect(extractBioTags('Partner at a VC firm')).toContain('VC');
  });

  test('extracts venture capital as VC', () => {
    expect(extractBioTags('Venture Capital investor')).toContain('VC');
  });

  test('extracts Founder', () => {
    expect(extractBioTags('Founder & CEO of Acme')).toContain('Founder');
    expect(extractBioTags('Founder & CEO of Acme')).toContain('CEO');
  });

  test('extracts Co-Founder', () => {
    expect(extractBioTags('Co-founder of something cool')).toContain('Co-Founder');
  });

  test('extracts YC', () => {
    expect(extractBioTags('YC S21 founder')).toContain('YC');
    expect(extractBioTags('Y Combinator alum')).toContain('YC');
  });

  test('extracts a16z', () => {
    expect(extractBioTags('building with a16z')).toContain('a16z');
  });

  test('extracts multiple tags', () => {
    const tags = extractBioTags('CEO & Founder, AI startups, YC W22');
    expect(tags).toContain('CEO');
    expect(tags).toContain('Founder');
    expect(tags).toContain('AI');
    expect(tags).toContain('YC');
  });

  test('caps at 5 tags', () => {
    const tags = extractBioTags('CEO Founder Angel investor AI ML Crypto Web3 YC startup engineer');
    expect(tags.length).toBeLessThanOrEqual(5);
  });

  test('returns empty array for empty bio', () => {
    expect(extractBioTags('')).toEqual([]);
    expect(extractBioTags(null)).toEqual([]);
    expect(extractBioTags(undefined)).toEqual([]);
  });

  test('does not duplicate tags', () => {
    const tags = extractBioTags('VC at a VC firm doing VC things');
    const vcCount = tags.filter(t => t === 'VC').length;
    expect(vcCount).toBe(1);
  });

  test('extracts Engineer and Designer', () => {
    expect(extractBioTags('Software Engineer')).toContain('Engineer');
    expect(extractBioTags('Product Designer')).toContain('Designer');
  });

  test('extracts Builder from "building"', () => {
    expect(extractBioTags('building the future')).toContain('Builder');
  });
});
