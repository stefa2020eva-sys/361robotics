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

Language-prefixed URLs: `/<lang>/...` where `<lang>` ∈ `{ru, en, zh}`. Default is `/en/`. Language preference is persisted in `localStorage`.

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
   - "Key clients" block — logos of clients (links to client info if applicable, otherwise just visual)
   - "Highlights" block — 3–6 bullets (achievements, scale, differentiators)
   - "What they produce" — list of linked component pages and/or named robot products

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

8. **Contacts** — `/<lang>/contacts`
   - Contact form (name, email, company, message) → Netlify Forms → operator email
   - Direct contact: email, phone, WhatsApp, WeChat, Telegram

### Header (all pages)

Logo (wordmark "361Robotics" in Inter Bold) · Menu (Companies · Components · About · Contacts) · Search icon · Language switcher (RU · EN · 中文) · "Contact us" button

### Footer (all pages)

Short description · Language links · Section links · Contact info · Copyright

## Data Model

All content lives in YAML files inside Astro Content Collections. Each entity is one file. Schemas are enforced at build time via Zod — a missing required field on any entity fails the build with a precise error.

### Companies — `src/content/companies/<slug>.yaml`

```yaml
slug: fanuc
name: FANUC
country: JP
founded: 1956
website: https://www.fanuc.com
logo: ./logo.svg
hero_image: ./hero.jpg          # optional, for company page hero
type:                            # one or both
  - robot_brand
  - component_maker
featured: true                   # show on homepage
categories:
  - industrial_robots
  - cnc
  - servo_motors

produces_components:             # many-to-many → resolved on component pages
  - servo-motor
  - cnc-controller
  - robot-arm-6axis

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

needs_review:                    # optional QA flag, per language
  zh: true
```

### Components — `src/content/components/<slug>.yaml`

```yaml
slug: servo-motor
category: actuators
image: ./main.jpg
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
```

The component's list of manufacturers is **not stored on the component** — it is computed at build time from companies whose `produces_components` includes this slug. Single source of truth, no possibility of desync.

### Clients — `src/content/clients/<slug>.yaml`

A separate collection because the same client appears across many companies. Editing the logo or name in one place updates all references.

```yaml
slug: toyota
name: Toyota
logo: ./logo.svg
country: JP
website: https://global.toyota         # optional
```

### Categories — `src/content/categories/<slug>.yaml`

```yaml
slug: actuators
icon: ./icon.svg
ru: { name: Актуаторы }
en: { name: Actuators }
zh: { name: 执行器 }
```

### Starter Categories (10)

`actuators`, `sensors`, `controllers`, `drives-power`, `mechanical`, `end-effectors`, `vision`, `connectivity`, `software-sdk`, `safety`. More categories will be added as content is gathered (e.g., `power-electronics`, `mobile-platforms`, `manipulators`).

### UI Strings — `src/i18n/{ru,en,zh}.json`

All UI labels ("Search", "Companies", "Contact us", section headings, etc.) live in per-language JSON files. Adding a fourth language later is a single new file + one route prefix.

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
- Country shown with flag emoji + ISO code (no flag icon assets to maintain).
- Logo placeholder: wordmark "361Robotics" in Inter Bold; a geometric mark can be designed later.

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
- TODO list of missing data (logos not yet found, key clients without logos, etc.).

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
2. Astro scaffold with `/ru`, `/en`, `/zh` routes, Content Collections schemas, Pagefind integration, placeholder home + contact pages.
3. Seed content: starter categories + 1–2 demo companies for visual verification.
4. DNS configuration when the domain is purchased.

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

- Image optimization defaults (max dimensions, formats served).
- Exact featured-on-homepage selection logic (manual flag confirmed; ordering rule TBD).
- Sitemap / `robots.txt` defaults for 3-language SEO.
- Choice between Cyrillic-friendly variants of Inter (e.g., Inter vs. Inter Tight).
