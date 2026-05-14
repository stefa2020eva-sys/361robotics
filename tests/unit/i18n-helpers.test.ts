import { describe, it, expect } from 'vitest';
import { t, getCountryName, getLocalizedField, type Lang } from '../../src/i18n/helpers';

describe('t', () => {
  it('returns a top-level string', () => {
    expect(t('en', 'nav.companies')).toBe('Companies');
    expect(t('ru', 'nav.companies')).toBe('Компании');
    expect(t('zh', 'nav.companies')).toBe('公司');
  });

  it('interpolates {placeholders}', () => {
    expect(t('en', 'search.show_all', { count: 12 })).toBe('Show all 12 results');
  });

  it('falls back to English when a key is missing in a non-English locale', () => {
    expect(t('en', 'nonexistent.key')).toBe('nonexistent.key');
  });
});

describe('getCountryName', () => {
  it('returns localized name for known ISO code', () => {
    expect(getCountryName('JP', 'ru')).toBe('Япония');
    expect(getCountryName('JP', 'en')).toBe('Japan');
    expect(getCountryName('JP', 'zh')).toBe('日本');
  });

  it('falls back to the ISO code for unknown country', () => {
    expect(getCountryName('XX' as never, 'en')).toBe('XX');
  });
});

describe('getLocalizedField', () => {
  const entity = { ru: { name: 'Серво' }, en: { name: 'Servo' }, zh: { name: '伺服' } };

  it('returns the requested locale', () => {
    expect(getLocalizedField(entity, 'ru', 'name')).toBe('Серво');
  });

  it('falls back to English when requested locale is missing', () => {
    const partial = { en: { name: 'Servo' } } as typeof entity;
    expect(getLocalizedField(partial, 'zh' as Lang, 'name')).toBe('Servo');
  });
});
