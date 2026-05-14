import { LANGS, type Lang } from './helpers';

export interface HreflangEntry {
  hreflang: Lang | 'x-default';
  href: string;
}

export function buildHreflang(params: { site: string; pathTail: string }): HreflangEntry[] {
  const site = params.site.replace(/\/$/, '');
  const tail = params.pathTail.replace(/^\//, '');
  const segment = tail.length === 0 ? '' : `/${tail}`;
  const entries: HreflangEntry[] = LANGS.map((lang) => ({
    hreflang: lang,
    href: `${site}/${lang}${segment}`,
  }));
  entries.push({ hreflang: 'x-default', href: `${site}/en${segment}` });
  return entries;
}
