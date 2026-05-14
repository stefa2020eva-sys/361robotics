# 361Robotics — Design Spec

**Date:** 2026-05-14
**Status:** Draft for user review

## Summary

361Robotics is a multilingual (RU/EN/ZH) B2B catalog of robotics-industry companies and the components they manufacture. Visitors can browse companies, browse components, search across both, and follow many-to-many relationships between them. The catalog is operated by a single person who edits content through conversation with an AI assistant — there is no admin UI, no CMS, and the operator never writes code or touches files directly.

## Goals

- Catalog **100+ companies** (robot brands, component manufacturers, or both) and **100+ components**, growing over time.
- Each company has a profile page with description, key clients (with logos), highlights, and a list of components/robots they produce.
- Each component has a page listing companies that manufacture it.
- Full-text search across companies and components, working in Russian, English, and Chinese.
- Site is SEO-friendly: every company and component has its own indexable URL in every language.
- **Mobile-first**: design, build, and test from the phone-sized viewport up. Filters collapse into a slide-over panel, header collapses to a hamburger, grids reflow to one or two columns. Desktop is an enhancement, not the baseline.
- **Accessible**: WCAG 2.2 AA as the floor — color contrast verified for accent on white, keyboard navigation for every interactive element, alt text on every image, semantic landmarks (`<main>`, `<nav>`, `<article>`).
- **Legally compliant for form collection**: Privacy Policy page covering GDPR and 152-ФЗ exists in v1.
- Visual style: "Industrial Minimalism" — clean, image-driven, single accent color, sparse animations. Inspired by robostore.com's polish but adapted for information-dense B2B catalog.

## Non-Goals (v1)

- Online payments or checkout. Inquiries go through a "Contact us" form and messengers (WhatsApp / WeChat / Telegram).
- Separate pages for individual robot models (e.g., Spot, Atlas). Robot models are mentioned inside the company page; only companies and component types are top-level entities.
- Self-service editing by the operator. All content edits happen via chat with the AI; if/when the operator wants direct admin access, a headless CMS can be added later without changing the frontend.
- AI semantic / ML-reranked search, voice search, personalization.
- Comparison tool, news section, user accounts.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Static site generator | **Astro** | Best i18n routing, Content Collections with Zod validation, mixed-component support (Astro islands) for richer UX without bloat |
| Styling | **Tailwind CSS** | Fast iteration, design tokens enforced |
| Search | **Pagefind** | Static, free, supports CJK segmentation, ~80 KB runtime, no backend |
| Hosting | **Netlify (free tier)** | Auto-deploy from GitHub, preview deploys, free SSL, free forms (100 submissions / month) |
| Source control | **GitHub (private repo)** | Versioning, backup, no lock-in |
| Domain | **361robotics.com** (primary) | International B2B audience; `.ru` / `.io` optional later |
| Forms | **Netlify Forms** | Built-in, email notifications, free at our scale |

Alternative considered: **Hugo**. Strong contender for pure-catalog use case (faster builds, simpler stack), rejected because Astro's component model and Zod-validated content collections give a meaningful edge for robostore-style polish and for content safety at 300+ entities.

## Site Structure

Language-prefixed URLs: `/<lang>/...` where `<lang>` ∈ `{ru, en, zh}`. First-visit root URL is redirected by browser `Accept-Language` (see Root URL section below); after that, the visitor's choice is persisted in `localStorage` and overrides auto-detect.

### Pages

1. **Home** — `/<lang>/`
   - Hero with title, subhead, primary CTA
   - Large search input above the fold
   - Featured companies (6–8 cards)
   - Featured components (popular categories)
   - Short "About the catalog" block
   - CTA "Contact us"

2. **Companies catalog** — `/<lang>/companies`
   - Grid of all companies (logo, name, country, type)
   - Sidebar filters: type (`robot_brand` / `component_maker` / `both`), country, category
   - Sort: alphabetical, featured-first

3. **Company detail** — `/<lang>/companies/<slug>` (e.g., `/ru/companies/fanuc`)
   - Header: logo, name, country (with flag), website, type
   - Description (1–3 paragraphs)
   - "Key clients" block — chips for each client. If the client has a logo → logo chip; if no logo → text chip with name.
   - "Highlights" block — 3–6 bullets (achievements, scale, differentiators)
   - "What they produce" — two sub-blocks:
     - **Components** (only if `type` includes `component_maker`) — linked component-page cards from `produces_components`
     - **Robots** (only if `type` includes `robot_brand`) — named robot products from `robot_products` (name, optional image, short tagline; no individual page)

4. **Components catalog** — `/<lang>/components`
   - Grid grouped/filtered by category
   - Filters: category, country-of-manufacturer
   - Search within catalog

5. **Component detail** — `/<lang>/components/<slug>` (e.g., `/en/components/servo-motor`)
   - Description
   - "Manufacturers" — auto-generated list of companies whose `produces_components` includes this component
   - Related components (same category)

6. **Global search results** — `/<lang>/search?q=...`
   - Tabs: All / Companies / Components
   - Filters (Pagefind filters): type, country, category
   - Shareable URL

7. **About** — `/<lang>/about`
   - About the catalog, the maintainer, how to use, how to suggest additions
   - Content source: `src/content/pages/about.{ru,en,zh}.md` (Markdown, one file per language)

8. **Contacts** — `/<lang>/contacts`
   - Contact form (name, email, company, message) → Netlify Forms → operator email
   - Direct contact: email, phone, WhatsApp, WeChat, Telegram
   - Content source: `src/content/pages/contacts.{ru,en,zh}.md` for prose; contact details and messenger handles live in `src/content/settings/contacts.yaml` (single source of truth, surfaced in footer + this page)
   - Form page includes a checkbox: "I have read and agree to the Privacy Policy" (linked) — required before submit.

9. **Privacy Policy** — `/<lang>/privacy`
   - Covers what data is collected (form submissions: name, email, company, message; HTTP server logs by Netlify), purpose (responding to inquiries), retention, third parties (Netlify as processor), rights under GDPR + 152-ФЗ, contact for data requests.
   - Content source: `src/content/pages/privacy.{ru,en,zh}.md`
   - Linked from footer on every page and from the Contacts form checkbox.

### Header (all pages)

Logo (wordmark "361Robotics" in Inter Bold) · Menu (Companies · Components · About · Contacts) · Search icon · Language switcher (RU · EN · 中文) · "Contact us" button

### Footer (all pages)

Short description · Language links · Section links · Contact info · Copyright

## Data Model

All content lives in YAML files inside Astro Content Collections. Each entity is one file. Schemas are enforced at build time via Zod — a missing required field on any entity fails the build with a precise error.

**Slug policy:** every entity has exactly one `slug` (Latin, lowercase, hyphenated). The slug is language-independent and is used for the URL in all languages — `/ru/companies/fanuc`, `/en/companies/fanuc`, `/zh/companies/fanuc`. Native Chinese URLs (`/zh/companies/发那科`) are explicitly rejected because they complicate routing, hreflang, and language switching for marginal SEO benefit at our scale.

### Companies — `src/content/companies/<slug>.yaml`

```yaml
slug: fanuc
name: FANUC
country: JP                      # ISO 3166-1 alpha-2; localized name resolved from src/i18n/countries.json
founded: 1956
website: https://www.fanuc.com

logo: ./logo.svg
logo_alt:                        # alt text, per language
  ru: Логотип FANUC
  en: FANUC logo
  zh: FANUC 标志

hero_image: ./hero.jpg           # optional
hero_alt:                        # required if hero_image is set
  ru: Роботизированная линия FANUC на заводе Toyota
  en: FANUC robotic line at a Toyota factory
  zh: 丰田工厂的 FANUC 机器人生产线

type:                            # one or both
  - robot_brand
  - component_maker
featured: true                   # show on homepage
categories:
  - industrial_robots
  - cnc
  - servo_motors

produces_components:             # required if type includes `component_maker`
  - servo-motor
  - cnc-controller
  - robot-arm-6axis

robot_products:                  # required if type includes `robot_brand`
  - name: FANUC M-2000iA
    image: ./robots/m-2000ia.jpg # optional
    image_alt:                   # required if image is set
      ru: Промышленный робот FANUC M-2000iA
      en: FANUC M-2000iA industrial robot
      zh: FANUC M-2000iA 工业机器人
    short: Heavy-payload industrial robot, up to 2300 kg
  - name: FANUC LR Mate 200iD
    short: Compact 6-axis robot for assembly and material handling

key_clients:                     # references to clients/ collection
  - toyota
  - tesla
  - honda

ru:
  description: |
    Японский производитель промышленных роботов и систем ЧПУ...
  highlights:
    - Более 500 000 роботов установлено по миру
    - Лидер по доле рынка в Азии
en:
  description: |
    Japanese manufacturer of industrial robots and CNC systems...
  highlights:
    - Over 500,000 robots installed worldwide
    - Market leader in Asia
zh:
  description: |
    日本工业机器人和数控系统制造商...
  highlights:
    - 全球安装超过 500,000 台机器人
    - 亚洲市场份额第一

# Content provenance and review flags (see "Content Verification Policy" below)
verified: true                   # operator confirmed core facts against the source
source: https://www.fanuc.com/company/profile.html
needs_review:                    # optional, per language; flags translations to re-check
  zh: true
```

### Components — `src/content/components/<slug>.yaml`

```yaml
slug: servo-motor
category: actuators
image: ./main.jpg
image_alt:
  ru: Промышленный серводвигатель с энкодером
  en: Industrial servo motor with encoder
  zh: 带编码器的工业伺服电机
featured: true

ru:
  name: Серводвигатель
  description: |
    Двигатель с обратной связью...
en:
  name: Servo Motor
  description: |
    A motor with feedback control...
zh:
  name: 伺服电机
  description: |
    具有反馈控制的电机...

verified: true                   # operator confirmed the description is accurate
```

The component's list of manufacturers is **not stored on the component** — it is computed at build time from companies whose `produces_components` includes this slug. Single source of truth, no possibility of desync.

### Clients — `src/content/clients/<slug>.yaml`

A separate collection because the same client appears across many companies. Editing the logo or name in one place updates all references.

```yaml
slug: toyota
name: Toyota
logo: ./logo.svg                       # optional — falls back to a text chip if absent
logo_alt:                              # required if logo is set
  ru: Логотип Toyota
  en: Toyota logo
  zh: 丰田标志
country: JP                            # optional
website: https://global.toyota         # optional
```

A client without a logo renders as a text chip with the name. Only `slug` and `name` are required, so a B2B client without easily obtainable logo can still be added.

### Categories — `src/content/categories/<slug>.yaml`

```yaml
slug: actuators
icon: ./icon.svg
icon_alt:                              # required if icon is set
  ru: Иконка категории «Актуаторы»
  en: "\"Actuators\" category icon"
  zh: "\"执行器\"类别图标"
ru: { name: Актуаторы }
en: { name: Actuators }
zh: { name: 执行器 }
```

### Starter Categories (10)

`actuators`, `sensors`, `controllers`, `drives-power`, `mechanical`, `end-effectors`, `vision`, `connectivity`, `software-sdk`, `safety`. More categories will be added as content is gathered (e.g., `power-electronics`, `mobile-platforms`, `manipulators`).

### UI Strings — `src/i18n/{ru,en,zh}.json`

All UI labels ("Search", "Companies", "Contact us", section headings, etc.) live in per-language JSON files. Adding a fourth language later is a single new file + one route prefix.

### Country Names — `src/i18n/countries.json`

A single dictionary mapping ISO 3166-1 alpha-2 codes to localized country names. Generated once from open data (CLDR / Wikidata) and committed; updated rarely. Example:

```json
{
  "JP": { "ru": "Япония", "en": "Japan", "zh": "日本" },
  "CN": { "ru": "Китай",  "en": "China", "zh": "中国" },
  "DE": { "ru": "Германия","en": "Germany","zh": "德国" }
}
```

Any company / client referencing `country: JP` renders the right name in the current language without per-entity duplication.

### Pages — `src/content/pages/{about,contacts}.{ru,en,zh}.md`

Markdown content for About and Contacts. Each page = one file per language. Frontmatter includes meta (title, description) per language; body is freeform Markdown so we can format with headings, links, lists without needing schema changes.

### Site Settings — `src/content/settings/contacts.yaml`

Single source of truth for contact info displayed in the footer and on the Contacts page:

```yaml
email: hello@361robotics.com
phone: "+86 ..."                 # optional
whatsapp: "+86 ..."              # optional
wechat_id: "..."                 # optional
telegram_handle: "@..."          # optional
```

Changing a phone number once updates it everywhere.

## Content Verification Policy

The AI may produce plausible-sounding but unverified facts when generating or translating entity content. Two flags address this:

- **`verified: bool`** on each company and component. Defaults to `false` if absent. Operator sets `verified: true` only after confirming the description, founding year, key clients, and highlights against a real source (company website, press release, Wikipedia citation). The site renders an "Unverified" badge on entities where `verified` is not yet `true`, signalling visitors that the page is informational but not yet operator-confirmed.
- **`source: <URL>`** on each entity, recording where the content was drawn from. Optional but strongly encouraged. Used in the AI's tracking dashboard for re-verification cycles.
- **`needs_review: { ru?, en?, zh? }`** flags translations the operator should re-check; orthogonal to `verified` (a verified entity may still have a translation flagged for review).

This is operationally important because the alternative — verifying every fact silently — does not scale to 100+ companies and leaves the operator with no way to audit which pages they actually stand behind.

## Multilingual SEO

Each entity page exists in three languages at three URLs (`/ru/...`, `/en/...`, `/zh/...`) with the same slug. To prevent duplicate-content penalties and ensure each language is indexed for the right audience, the following is part of v1, not deferred:

- **`hreflang` tags** in every page `<head>`, listing all three language variants + an `x-default` pointing to `/en/`.
- **Auto-generated `sitemap.xml`** via `@astrojs/sitemap`, listing every page in every language with proper `<xhtml:link rel="alternate" hreflang="...">` entries inside each `<url>`.
- **`robots.txt`** — allows all crawlers, points to the sitemap.
- **Per-language `<html lang="...">`** attribute set on every page so screen readers and Google use the right TTS/index.
- **Canonical URLs** per page (each language version is its own canonical, not pointing at /en/).
- **Open Graph + meta description** per language (titles and descriptions translated, not just the body text).
- **Open Graph image policy** per page type, falling back gracefully:
  - Company page: `hero_image` → `logo` → site default
  - Component page: `image` → category icon → site default
  - About / Contacts / Privacy / Home: site default
  - The site default is a branded 1200×630 image (wordmark on Industrial-Minimalism background), shipped in `/public/og-default.jpg`.

## Root URL and Language Detection

When a visitor hits `361robotics.com/` (no language prefix), Netlify performs an HTTP-level redirect based on `Accept-Language`:

| Browser prefers | Redirect to |
|---|---|
| `zh*` | `/zh/` |
| `ru*` | `/ru/` |
| anything else | `/en/` |

Implemented in Netlify `_redirects` with `Language=...` conditions; no client-side JavaScript needed for the first hit. After the visitor uses the in-header language switcher, the choice persists in `localStorage` and overrides the auto-detect on subsequent visits.

## Typography Implementation

- **Inter** (Latin + Cyrillic) — self-hosted woff2 with `font-display: swap`, full glyph coverage in one ~70 KB file per weight.
- **Noto Sans SC** (Chinese) — served via **Google Fonts** with their automatic glyph-subsetting (the CSS only loads the hieroglyphs actually present on each page). Full Noto Sans SC is ~10 MB and would destroy our performance budget; Google's dynamic subsetting brings it to ~30–80 KB per page on average. The Google-Fonts dependency is an accepted external dep — if it ever fails, the page degrades to system CJK font (PingFang on macOS, Microsoft YaHei on Windows), which is acceptable.

## Visual Direction — Industrial Minimalism

| Token | Value |
|---|---|
| Background | `#FFFFFF` |
| Primary text | `#0A0A0A` |
| Secondary text | `#5C5C5C` |
| Accent | `#0B5FFF` |
| Border | `#E5E5E5` |
| Sans (Latin/Cyrillic) | Inter |
| Sans (CJK) | Noto Sans SC |
| Max content width | 1280 px |
| Base spacing unit | 8 px |

- Cards: white surface, 1 px border, soft shadow on hover, no heavy gradients.
- Hero: large black-and-white photography with text overlay; one bold colored CTA.
- Animations: fade-in on scroll, hover lift on cards, no parallax or video backgrounds.
- Country shown with flag emoji + localized country name (from `src/i18n/countries.json`); ISO code is internal only.
- Logo placeholder: wordmark "361Robotics" in Inter Bold; a geometric mark can be designed later.

### Responsive Breakpoints (Mobile-first)

| Breakpoint | Width | Layout behavior |
|---|---|---|
| `base` | <640 px | Single-column grids. Header collapses to logo + hamburger + search icon. Sidebar filters become a full-screen slide-over opened from a "Filters" button. Tables degrade to stacked cards. |
| `sm` | ≥640 px | Two-column product grids; secondary action buttons appear inline. |
| `md` | ≥768 px | Side-by-side hero text/image; three-column grids start. |
| `lg` | ≥1024 px | Filters move from slide-over to permanent sidebar. Four-column featured grids. |
| `xl` | ≥1280 px | Max content width reached; no further changes. |

Every interactive area meets the 44×44 px minimum touch target on small screens. Verified on a real iPhone-sized viewport (375 px) and iPad-sized viewport (768 px) before any page is considered done.

## Search Behavior

**Engine:** Pagefind. Indexes all built pages at the end of each Netlify build; index is served as static assets. CJK segmentation handles Chinese correctly.

**Entry points:**

1. Hero on homepage — primary search input.
2. Magnifying-glass icon in header on every page — opens a dropdown overlay without leaving the current page.
3. Dedicated `/<lang>/search?q=...` page for full results and filters.

**Result UX:**

- Debounced 200 ms after typing stops.
- Grouped results: **Companies** (top 5) + **Components** (top 5) + "Show all N results" link.
- Matched fragment highlighted in title and description.
- Tolerant of partial matches and typos (e.g., "fanu" → FANUC; "серво" → Серводвигатель).
- Enter key → full `/search` page.

**Filters on the full search page (also Pagefind, client-side):**

- Type: All / Companies / Components
- Company type: Robot brand / Component maker / Both
- Country
- Category

## Editing Workflow

The operator never opens GitHub, never opens a code editor, never opens a terminal. Their inputs are: chat messages to the AI + a browser tab on the live site.

### One-edit cycle

```
1. Operator → AI:  "Add company FANUC: <data>"
2. AI:             Creates/updates YAML files in the GitHub repo
3. AI:             git commit + git push
4. Netlify:        Auto-rebuilds (30–90 s)
5. Operator:       Refreshes browser — change is live
```

### Accepted input formats

- Free-form text in chat
- Bulk list in a single message
- Link / screenshot / PDF
- Excel / CSV

The AI normalizes whatever the operator provides into the YAML schema.

### Translation policy

- **Default:** operator provides content in one language (preferably English when sources are English-language company sites). AI translates to the other two. For Chinese, AI flags entities with `needs_review: { zh: true }` so the operator can later have a Chinese speaker validate critical pages.
- **For high-visibility pages** (homepage, About, Contacts): operator provides all three languages explicitly when possible.

### Preview deploys

- Small edits go straight to `main` and are live in ~1 min.
- Bulk additions or visual changes go on a branch with a Netlify deploy preview (`deploy-preview-N.netlify.app`); operator reviews, AI merges to `main`.

### Operational tracking (maintained by AI, not operator)

- Index of added companies and components with dates added.
- Translation status (which entities have all three languages; which have `needs_review` flags).
- Verification status (which entities are `verified: true`, which still need operator confirmation).
- TODO list of missing data (logos not yet found, key clients without logos, etc.).

### Build-failure protocol

When a push results in a failed Netlify build (typo in YAML, schema violation, broken image reference), the live site stays on the previous successful deploy — visitors see no breakage. The recovery flow:

1. **Netlify emails the operator** within ~1 min, subject "Deploy failed". The email links to the failed build log on Netlify.
2. **The operator forwards or describes the failure to the AI in chat** (or simply says "the last change failed, please fix").
3. **The AI inspects the build log, identifies the cause** (missing required field, broken image path, invalid YAML), pushes a corrective commit, and confirms the new build succeeds.
4. **If a fix is not immediate** (e.g., requires waiting for an asset from the operator), the AI explicitly reverts the breaking commit so the repo's `main` is in a known-good state, then proceeds with the fix on a branch.

The operator never needs to read the log or touch a terminal — only forward the email or ask.

## Hosting and Deployment

- **Code repo:** private GitHub repo. AI is owner and primary committer; operator is added as collaborator for backup access.
- **Hosting:** Netlify free tier. Auto-deploy on push to `main`. SSL via Netlify (free, automatic).
- **Domain:** primary `361robotics.com` (~$12/year). Operator buys at any registrar (Namecheap, Reg.ru) and provides DNS access; AI configures DNS records to point to Netlify. Until purchased, the site is live at `361robotics.netlify.app`.
- **Forms:** Netlify Forms; submissions go to operator's email and are also visible in Netlify dashboard.

### What the operator must provide

1. Email for form submissions and build notifications.
2. GitHub account (one-time setup, never opened again afterwards).
3. Public contact info to display: WhatsApp, WeChat, Telegram, phone.
4. Domain (when ready).

### What the AI provides

1. GitHub repo + Netlify project, linked.
2. Astro scaffold with `/ru`, `/en`, `/zh` routes, Content Collections schemas (companies, components, clients, categories, pages, settings), Pagefind integration, hreflang tags, sitemap, robots.txt, root-URL language-detect redirects, mobile-first responsive layout, OG default image, placeholder home + about + contacts + privacy pages.
3. Seed content: starter categories + `countries.json` dictionary + 1–2 demo companies for visual verification.
4. Initial drafts of Privacy Policy text in all three languages, for operator review (the operator is the legally responsible party — AI drafts, operator approves).
5. DNS configuration when the domain is purchased.

## Annual Cost

| Item | Cost |
|---|---|
| Domain `.com` | ~₽1100 / ~$12 |
| Netlify hosting | ₽0 |
| GitHub | ₽0 |
| Pagefind search | ₽0 |
| Netlify Forms | ₽0 |
| **Total** | **~₽1100 / year** |

## Portability and Lock-In

YAML content files + generated HTML run on any static host (Cloudflare Pages, Vercel, GitHub Pages, S3) with no changes. The repo can be handed to any developer; nothing in this stack ties the operator to AI assistance, Netlify, or any specific vendor.

## Out of Scope for v1 (Deferred)

- Headless CMS for self-service editing (Sanity, Strapi, Decap) — add later if the operator wants direct admin access.
- Per-robot-model pages — add as a third Content Collection if catalog scope expands.
- Comparison view (side-by-side two companies / components).
- Industry news section.
- Operator analytics dashboard beyond Netlify's built-in stats.

## Open Questions for Implementation Phase

These are deliberately deferred to the implementation plan, not blockers for this spec:

- **Image optimization defaults** — exact max dimensions per slot (logo / hero / robot product), AVIF + WebP delivery order via Astro's `<Image>` component.
- **Featured ordering rule** — `featured: true` is a manual flag (confirmed). Ordering among featured items defaults to alphabetical; we may add an optional `featured_weight: number` field if explicit ordering is needed later.
- **Inter variant** — base Inter is the default; we'll evaluate Inter Tight only if visual review of headings asks for tighter tracking.
- **Bulk-import cadence** — when ingesting 50+ companies in one operation, the AI works incrementally over multiple sessions; exact batching policy is operational, not architectural.
- **Empty states** — visual treatment for: search with zero results, category with no components, company with neither `produces_components` nor `robot_products`, filter combination that excludes everything. Decided during implementation; each is a small UI choice, not an architectural one.
- **Trademark / fair-use disclaimer** — one-line note in the footer (e.g., "All logos and trademarks are the property of their respective owners.") and a paragraph in About. Exact wording determined during implementation; legal substance is straightforward.
- **Performance budget targets** — proposed defaults: Lighthouse Performance ≥ 90 on mobile, First Contentful Paint < 1.5 s on 4G, Largest Contentful Paint < 2.5 s, Cumulative Layout Shift < 0.1. To be ratified at scaffold time when we can measure against real builds.
- **Analytics** — whether to add privacy-preserving analytics (Plausible, GoatCounter) or skip; affects the cookie-banner decision (with cookie-less analytics, no banner needed).
