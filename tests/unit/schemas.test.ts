import { describe, it, expect } from 'vitest';
import { companySchema } from '../../src/content.config';

const validCompany = {
  slug: 'fanuc',
  name: 'FANUC',
  country: 'JP',
  website: 'https://www.fanuc.com',
  logo: './logo.svg',
  logo_alt: { ru: 'Логотип FANUC', en: 'FANUC logo', zh: 'FANUC 标志' },
  type: ['robot_brand', 'component_maker'],
  featured: true,
  categories: ['industrial-robots'],
  produces_components: ['servo-motor'],
  robot_products: [{ name: 'M-2000iA', short: 'Heavy-payload robot' }],
  key_clients: ['toyota'],
  ru: { description: 'описание', highlights: ['пункт'] },
  en: { description: 'description', highlights: ['point'] },
  zh: { description: '描述', highlights: ['要点'] },
  verified: false,
};

describe('companySchema', () => {
  it('parses a valid company', () => {
    expect(() => companySchema.parse(validCompany)).not.toThrow();
  });

  it('rejects a company missing required name', () => {
    const bad = { ...validCompany };
    delete (bad as Record<string, unknown>).name;
    expect(() => companySchema.parse(bad)).toThrow();
  });

  it('rejects a company with empty type array', () => {
    expect(() => companySchema.parse({ ...validCompany, type: [] })).toThrow();
  });

  it('rejects a company missing produces_components when type includes component_maker', () => {
    const bad = { ...validCompany, type: ['component_maker'], produces_components: undefined };
    expect(() => companySchema.parse(bad)).toThrow();
  });

  it('rejects a company missing robot_products when type includes robot_brand', () => {
    const bad = { ...validCompany, type: ['robot_brand'], robot_products: undefined };
    expect(() => companySchema.parse(bad)).toThrow();
  });

  it('accepts only Latin-lowercase-hyphen slug', () => {
    expect(() => companySchema.parse({ ...validCompany, slug: 'FANUC' })).toThrow();
    expect(() => companySchema.parse({ ...validCompany, slug: '发那科' })).toThrow();
    expect(() => companySchema.parse({ ...validCompany, slug: 'fanuc-corp' })).not.toThrow();
  });
});
