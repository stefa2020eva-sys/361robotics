import { describe, it, expect } from 'vitest';
import {
  companySchema,
  componentSchema,
  clientSchema,
  categorySchema,
  contactsSettingsSchema,
} from '../../src/content.config';

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

describe('componentSchema', () => {
  const valid = {
    slug: 'servo-motor',
    category: 'actuators',
    image: './main.jpg',
    image_alt: { ru: 'Серво', en: 'Servo', zh: '伺服' },
    featured: true,
    ru: { name: 'Серводвигатель', description: '...' },
    en: { name: 'Servo Motor', description: '...' },
    zh: { name: '伺服电机', description: '...' },
    verified: false,
  };

  it('parses a valid component', () => {
    expect(() => componentSchema.parse(valid)).not.toThrow();
  });

  it('rejects a component missing en.name', () => {
    const bad = { ...valid, en: { description: '...' } };
    expect(() => componentSchema.parse(bad)).toThrow();
  });
});

describe('clientSchema', () => {
  const minimal = { slug: 'toyota', name: 'Toyota' };
  const withLogo = { ...minimal, logo: './logo.svg', logo_alt: { ru: 'a', en: 'b', zh: 'c' } };

  it('parses a client with only slug + name', () => {
    expect(() => clientSchema.parse(minimal)).not.toThrow();
  });

  it('rejects a client with a logo but no alt text', () => {
    expect(() => clientSchema.parse({ ...minimal, logo: './logo.svg' })).toThrow();
  });

  it('accepts a client with logo + alt', () => {
    expect(() => clientSchema.parse(withLogo)).not.toThrow();
  });
});

describe('categorySchema', () => {
  const valid = {
    slug: 'actuators',
    icon: './icon.svg',
    icon_alt: { ru: 'Икона', en: 'Icon', zh: '图标' },
    ru: { name: 'Актуаторы' },
    en: { name: 'Actuators' },
    zh: { name: '执行器' },
  };

  it('parses a valid category', () => {
    expect(() => categorySchema.parse(valid)).not.toThrow();
  });

  it('makes icon optional but requires alt when icon present', () => {
    const noIcon = { ...valid, icon: undefined, icon_alt: undefined };
    expect(() => categorySchema.parse(noIcon)).not.toThrow();
    const iconNoAlt = { ...valid, icon_alt: undefined };
    expect(() => categorySchema.parse(iconNoAlt)).toThrow();
  });
});

describe('contactsSettingsSchema', () => {
  it('parses a settings file with only email', () => {
    expect(() => contactsSettingsSchema.parse({ email: 'hello@361robotics.com' })).not.toThrow();
  });

  it('rejects an invalid email', () => {
    expect(() => contactsSettingsSchema.parse({ email: 'not-an-email' })).toThrow();
  });
});
