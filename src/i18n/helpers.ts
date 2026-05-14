import en from './en.json' with { type: 'json' };
import ru from './ru.json' with { type: 'json' };
import zh from './zh.json' with { type: 'json' };
import countries from './countries.json' with { type: 'json' };

export type Lang = 'en' | 'ru' | 'zh';

const dictionaries: Record<Lang, Record<string, unknown>> = { en, ru, zh };

function lookup(dict: Record<string, unknown>, dottedKey: string): string | undefined {
  const parts = dottedKey.split('.');
  let current: unknown = dict;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`));
}

export function t(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const fromLang = lookup(dictionaries[lang], key);
  if (fromLang !== undefined) return interpolate(fromLang, vars);
  const fromEn = lookup(dictionaries.en, key);
  if (fromEn !== undefined) return interpolate(fromEn, vars);
  return key;
}

type IsoCode = keyof typeof countries;

export function getCountryName(code: IsoCode | string, lang: Lang): string {
  const entry = (countries as Record<string, Record<Lang, string>>)[code];
  if (!entry) return code;
  return entry[lang] ?? entry.en ?? code;
}

type LocalizedEntity<F extends string> = Partial<Record<Lang, Record<F, string>>>;

export function getLocalizedField<F extends string>(
  entity: LocalizedEntity<F>,
  lang: Lang,
  field: F,
): string {
  const fromLang = entity[lang]?.[field];
  if (fromLang) return fromLang;
  const fromEn = entity.en?.[field];
  return fromEn ?? '';
}

export const LANGS: readonly Lang[] = ['en', 'ru', 'zh'] as const;

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}
