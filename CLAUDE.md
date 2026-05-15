# 361Robotics — Project Context for AI Assistants

> **This file is the bootstrap context.** Any new AI session opened in this directory should read this file first, then proceed. It tells you what 361Robotics is, what's already built, and what NOT to break.

## One-paragraph project summary

361Robotics is a static multilingual (RU / EN / ZH) B2B catalog of robotics-industry companies and the components they manufacture. Visitors browse companies, browse components, search across both, and follow many-to-many relationships between them. **The operator does not write code or edit files directly** — all content edits are made by an AI assistant (you) editing YAML files via the `src/content/` collections. The site lives on Netlify with auto-deploy from GitHub on push to `main`.

## Repository & deployment

| What | Where |
|---|---|
| GitHub repo (private) | `git@github.com:stefa2020eva-sys/361robotics.git` |
| Operator's GitHub user | `stefa2020eva-sys` (email: `stefa2020eva@gmail.com`) |
| Live site (preview domain) | https://361robotics.netlify.app |
| Future custom domain | `361robotics.com` (not yet purchased / connected) |
| Local working tree | `/Users/naumovichandrei/Downloads/361robotics` |
| Authentication | **SSH key** at `~/.ssh/id_ed25519` (no tokens needed) |
| Default branch | `main` |

## Current content state (as of 2026-05-15)

- **16 companies** in `src/content/companies/` — FANUC (JP), Boston Dynamics (US), HEIDENHAIN (DE), Hexagon MI (SE), Inspire Robots (CN), Talls Intelligent (CN), Han's Motor (CN), AKD-Jinwangda (CN), plus 8 more Chinese companies imported from `Page 1.docx` exhibitor catalog.
- **4 components** in `src/content/components/`: `servo-motor`, `lidar`, `gripper`, `motion-controller`. (Many more will be added by the operator on demand.)
- **10 starter categories** in `src/content/categories/`: `actuators`, `sensors`, `controllers`, `drives-power`, `mechanical`, `end-effectors`, `vision`, `connectivity`, `software-sdk`, `safety`.
- **3 demo clients** in `src/content/clients/`: Toyota, Tesla, Honda.
- **Pages** (about, contacts, privacy) — Markdown in `src/content/pages/`, one per language.
- **Settings** — `src/content/settings/contacts.yaml` (single source of truth for footer contact info).
- **Country dictionary** — `src/i18n/countries.json` covers 30 countries with RU/EN/ZH names.

## Tech stack — and known divergences from the spec

The spec was written in May 2026 against Astro 5 expectations. The actual installed environment is **Astro 6.3.2** + **Tailwind v4**, which introduced several deliberate divergences. **Do not "fix" these — they are correct for our environment.**

| Layer | What's installed | Note |
|---|---|---|
| Static site generator | Astro 6.3.2 | Schema declared in `src/content.config.ts` (not legacy `src/content/config.ts`) |
| Styling | **Tailwind v4 via `@tailwindcss/vite`** | **NOT** `@astrojs/tailwind`. There is no `tailwind.config.cjs`. Tokens live in `@theme` blocks inside `src/styles/global.css` |
| Search | Pagefind 1.5 | Runs in build script: `npm run build` = `astro build && pagefind --site dist` |
| Forms | Netlify Forms | Auto-detects `<form data-netlify="true">` on `/<lang>/contacts` |
| Test runners | Vitest 4 (unit) + Playwright 1.60 (e2e) | Playwright `webServer` uses `npm run preview`, NOT `npm run dev` — required so Pagefind index in `dist/` is served during e2e |
| i18n routing | Astro built-in `i18n` config | `prefixDefaultLocale: true` — `/en/`, `/ru/`, `/zh/` always explicit |

## Known operational quirks (don't break these)

1. **Pages collection ID generation.** Pages MD files (`about.en.md`, `about.ru.md`, `about.zh.md`, etc.) would have colliding default IDs (`about` × 3). We use a custom `generateId` in the `pages` collection in `src/content.config.ts` that strips only the `.md` extension, producing IDs like `about.en`. **Page lookups use `getEntry('pages', `${slug}.${lang}`)`.**

2. **Astro `astro:content` is a virtual module.** It does not resolve in Vitest. For unit tests, we stub it via `tests/_stubs/astro-content.ts` and alias it in `vitest.config.ts`. **Don't import `astro:content` from anywhere outside `.astro` files unless you add an alias.**

3. **Trailing-slash mismatch (cosmetic).** Astro config says `trailingSlash: 'never'` (canonical URLs without slash), but Netlify's default "Pretty URLs" adds a slash, so `/ru/companies/fanuc` → 301 → `/ru/companies/fanuc/`. Both work; Google handles the redirect. Future cleanup: switch to `trailingSlash: 'always'` and update `buildHreflang`.

4. **Canonical URLs reference `https://361robotics.com`** (the future custom domain), not the current `https://361robotics.netlify.app`. This is intentional — when the domain is purchased and connected, everything will match. During the netlify.app phase, Google sees the canonical and trusts that the destination is the canonical home.

5. **"Partner 361Robotics" badge.** Companies with `country: CN` show a dark green (`bg-green-900 text-white`) badge labelled per locale: «Партнёр 361Robotics» / «361Robotics Partner» / «361Robotics 合作伙伴». The translation key is `company.partner_badge`. Companies from other countries get no badge. Rendered in `CompanyCard.astro` and the company detail page header.

6. **`verified` field is internal-only.** The schema still has it on companies and components, but it's NOT rendered anywhere on the site. It's stored data for the operator's future use (e.g., to filter "verified-only" entries in some future view). Don't repurpose it without asking.

7. **All companies share one placeholder logo SVG** at `src/content/companies/logo.svg`. Every company has `logo: ./logo.svg`. When a real logo is added per company, create `src/content/companies/<slug>-logo.svg` (or use the company's own subfolder) and update its YAML. The card components currently render the placeholder visually as a grey LOGO/IMAGE box — they do NOT yet output `<img>` tags. Wiring real image rendering is a deferred enhancement.

8. **Translations: `needs_review: { zh: true }` on imported Chinese companies.** I (the AI) translated their descriptions to Chinese without being a native speaker. A native review should validate critical entries before they're considered final.

## File map (where to find what)

```
361robotics/
├── CLAUDE.md                              ← you are here
├── DEPLOY.md                              ← deploy + SSH setup state
├── OPERATIONS.md                          ← common edit recipes
├── README.md                              ← short project intro
├── astro.config.mjs                       ← i18n + Vite plugins + integrations
├── netlify.toml                           ← build cmd, headers, Node 22 pin
├── package.json                           ← scripts (dev / build / test / test:e2e)
├── playwright.config.ts                   ← uses preview, two profiles
├── tailwind.config.cjs                    ← DOES NOT EXIST (Tailwind v4 CSS-first)
├── tsconfig.json                          ← strict
├── vitest.config.ts                       ← aliases astro:content → tests/_stubs
├── public/
│   ├── _redirects                         ← Accept-Language root redirect
│   ├── fonts/                             ← Inter Regular + Bold (woff2)
│   ├── favicon.svg
│   ├── og-default.jpg                     ← 1200×630, branded
│   └── robots.txt
├── src/
│   ├── content.config.ts                  ← Zod schemas (6 collections)
│   ├── styles/global.css                  ← Tailwind @import + @theme tokens
│   ├── i18n/
│   │   ├── en.json, ru.json, zh.json      ← UI strings
│   │   ├── countries.json                 ← ISO codes → localized country names
│   │   ├── helpers.ts                     ← t(), getCountryName(), getLocalizedField()
│   │   └── hreflang.ts                    ← URL alternates builder
│   ├── layouts/
│   │   ├── BaseLayout.astro               ← <html>, head, hreflang, OG, canonical
│   │   └── ContentLayout.astro            ← BaseLayout + Header + Footer + <main>
│   ├── components/
│   │   ├── Header.astro                   ← logo, menu, search icon, lang switcher
│   │   ├── Footer.astro                   ← settings-driven contacts column
│   │   ├── LanguageSwitcher.astro         ← persists choice to localStorage
│   │   ├── HreflangTags.astro
│   │   ├── OGTags.astro
│   │   ├── CompanyCard.astro              ← partner badge logic lives here
│   │   ├── ComponentCard.astro
│   │   ├── ClientChip.astro
│   │   └── RobotProductCard.astro
│   ├── pages/
│   │   ├── index.astro                    ← JS redirect fallback for root
│   │   └── [lang]/
│   │       ├── index.astro                ← home
│   │       ├── companies/{index,[slug]}.astro
│   │       ├── components/{index,[slug]}.astro
│   │       ├── search.astro               ← Pagefind UI mount
│   │       ├── about.astro
│   │       ├── contacts.astro             ← Netlify Form lives here
│   │       └── privacy.astro
│   └── content/
│       ├── companies/   *.yaml + logo.svg
│       ├── components/  *.yaml
│       ├── clients/     *.yaml
│       ├── categories/  *.yaml
│       ├── pages/       {about,contacts,privacy}.{en,ru,zh}.md
│       └── settings/    contacts.yaml
├── tests/
│   ├── unit/            schemas, i18n-helpers, hreflang (Vitest)
│   ├── e2e/             home, language-switch, company-page, search (Playwright)
│   └── _stubs/          astro-content.ts (Vitest shim)
└── docs/superpowers/
    ├── specs/2026-05-14-361robotics-design.md     ← full design spec, 18 sections
    └── plans/2026-05-14-361robotics-implementation.md ← 36-task build log
```

## How to make changes (workflow)

The operator does not edit files. They tell you (the AI) what to change in chat. Your loop:

```
1. Operator → AI:    "Add company X" / "Mark Y as verified" / "Change badge color to ..."
2. AI:               Edit YAML / Astro / config files in this working tree
3. AI:               npx astro build   (verify schema + compilation; exit 0 required)
4. AI:               git add ... && git commit -m "..."  && git push
5. Netlify:          Auto-deploys in ~30-90s
6. Operator:         Refreshes the live site at https://361robotics.netlify.app
```

**Common operations are documented step-by-step in [`OPERATIONS.md`](./OPERATIONS.md).** Read that file before adding/editing content for the first time.

## What NOT to break

- **Do not** add `tailwind.config.cjs` or revert to `@astrojs/tailwind` — Tailwind v4 in this project uses CSS-first config via `@theme` in `src/styles/global.css`.
- **Do not** change Playwright's `webServer` back to `npm run dev` — the search e2e test needs `npm run preview` to access the Pagefind index in `dist/`.
- **Do not** remove the `astro:content` alias in `vitest.config.ts` — schema tests will break.
- **Do not** remove the `generateId` function from the `pages` collection in `src/content.config.ts` — page lookups by `<slug>.<lang>` will break.
- **Do not** rerender the `verified` field as an "Unverified" badge — that UI was removed and replaced by the country-based "Partner" badge.
- **Do not** push to `main` without first running `npx astro build` and confirming exit 0.

## When in doubt, read the spec

The spec at [`docs/superpowers/specs/2026-05-14-361robotics-design.md`](./docs/superpowers/specs/2026-05-14-361robotics-design.md) is the source of truth for architecture decisions. It has 18 sections covering data model, i18n, SEO, hosting, content verification policy, mobile-first responsive, accessibility, and more. The implementation plan at [`docs/superpowers/plans/2026-05-14-361robotics-implementation.md`](./docs/superpowers/plans/2026-05-14-361robotics-implementation.md) shows exactly how it was built.
