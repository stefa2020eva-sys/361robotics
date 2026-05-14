import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
  message: 'Slug must be lowercase Latin letters/digits with single hyphens (e.g., fanuc, boston-dynamics).',
});

const i18nText = z.object({ ru: z.string().min(1), en: z.string().min(1), zh: z.string().min(1) });

const localizedBody = z.object({
  description: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(1).max(8),
});

const robotProduct = z.object({
  name: z.string().min(1),
  image: z.string().optional(),
  image_alt: i18nText.optional(),
  short: z.string().min(1).optional(),
});

const companyType = z.enum(['robot_brand', 'component_maker']);

export const companySchema = z
  .object({
    slug,
    name: z.string().min(1),
    country: z.string().length(2).regex(/^[A-Z]{2}$/),
    founded: z.number().int().min(1800).max(2100).optional(),
    website: z.string().url(),
    logo: z.string(),
    logo_alt: i18nText,
    hero_image: z.string().optional(),
    hero_alt: i18nText.optional(),
    type: z.array(companyType).min(1),
    featured: z.boolean().default(false),
    categories: z.array(slug).min(1),
    produces_components: z.array(slug).optional(),
    robot_products: z.array(robotProduct).optional(),
    key_clients: z.array(slug).default([]),
    ru: localizedBody,
    en: localizedBody,
    zh: localizedBody,
    verified: z.boolean().default(false),
    source: z.string().url().optional(),
    needs_review: z
      .object({ ru: z.boolean().optional(), en: z.boolean().optional(), zh: z.boolean().optional() })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type.includes('component_maker') && (!data.produces_components || data.produces_components.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['produces_components'],
        message: 'produces_components is required when type includes "component_maker"',
      });
    }
    if (data.type.includes('robot_brand') && (!data.robot_products || data.robot_products.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['robot_products'],
        message: 'robot_products is required when type includes "robot_brand"',
      });
    }
    if (data.hero_image && !data.hero_alt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['hero_alt'],
        message: 'hero_alt is required when hero_image is set',
      });
    }
  });

const componentLocalized = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export const componentSchema = z
  .object({
    slug,
    category: slug,
    image: z.string().optional(),
    image_alt: i18nText.optional(),
    featured: z.boolean().default(false),
    ru: componentLocalized,
    en: componentLocalized,
    zh: componentLocalized,
    verified: z.boolean().default(false),
    source: z.string().url().optional(),
    needs_review: z
      .object({ ru: z.boolean().optional(), en: z.boolean().optional(), zh: z.boolean().optional() })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.image && !data.image_alt) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['image_alt'], message: 'image_alt is required when image is set' });
    }
  });

export const clientSchema = z
  .object({
    slug,
    name: z.string().min(1),
    logo: z.string().optional(),
    logo_alt: i18nText.optional(),
    country: z.string().length(2).regex(/^[A-Z]{2}$/).optional(),
    website: z.string().url().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.logo && !data.logo_alt) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['logo_alt'], message: 'logo_alt is required when logo is set' });
    }
  });

const localizedName = z.object({ name: z.string().min(1) });

export const categorySchema = z
  .object({
    slug,
    icon: z.string().optional(),
    icon_alt: i18nText.optional(),
    ru: localizedName,
    en: localizedName,
    zh: localizedName,
  })
  .superRefine((data, ctx) => {
    if (data.icon && !data.icon_alt) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['icon_alt'], message: 'icon_alt is required when icon is set' });
    }
  });

export const contactsSettingsSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  wechat_id: z.string().optional(),
  telegram_handle: z.string().optional(),
});

const pageFrontmatter = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  lang: z.enum(['ru', 'en', 'zh']),
  slug: z.enum(['about', 'contacts', 'privacy']),
});

export const collections = {
  companies: defineCollection({
    loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/companies' }),
    schema: companySchema,
  }),
  components: defineCollection({
    loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/components' }),
    schema: componentSchema,
  }),
  clients: defineCollection({
    loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/clients' }),
    schema: clientSchema,
  }),
  categories: defineCollection({
    loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/categories' }),
    schema: categorySchema,
  }),
  pages: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
    schema: pageFrontmatter,
  }),
  settings: defineCollection({
    loader: glob({ pattern: 'contacts.{yaml,yml}', base: './src/content/settings' }),
    schema: contactsSettingsSchema,
  }),
};
