import { describe, it, expect } from 'vitest';
import { buildHreflang } from '../../src/i18n/hreflang';

describe('buildHreflang', () => {
  it('returns three language URLs plus x-default', () => {
    const result = buildHreflang({ site: 'https://361robotics.com', pathTail: 'companies/fanuc' });
    expect(result).toEqual([
      { hreflang: 'en', href: 'https://361robotics.com/en/companies/fanuc' },
      { hreflang: 'ru', href: 'https://361robotics.com/ru/companies/fanuc' },
      { hreflang: 'zh', href: 'https://361robotics.com/zh/companies/fanuc' },
      { hreflang: 'x-default', href: 'https://361robotics.com/en/companies/fanuc' },
    ]);
  });

  it('handles empty pathTail (home page)', () => {
    const result = buildHreflang({ site: 'https://361robotics.com', pathTail: '' });
    expect(result.find((r) => r.hreflang === 'en')?.href).toBe('https://361robotics.com/en');
  });

  it('strips leading slash from pathTail', () => {
    const result = buildHreflang({ site: 'https://361robotics.com', pathTail: '/companies' });
    expect(result.find((r) => r.hreflang === 'en')?.href).toBe('https://361robotics.com/en/companies');
  });

  it('strips trailing slash from site', () => {
    const result = buildHreflang({ site: 'https://361robotics.com/', pathTail: 'about' });
    expect(result.find((r) => r.hreflang === 'en')?.href).toBe('https://361robotics.com/en/about');
  });
});
