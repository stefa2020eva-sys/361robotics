# Operations Cheatsheet

Common edit recipes for the 361Robotics catalog. **Read [`CLAUDE.md`](./CLAUDE.md) first if you haven't.**

Every recipe assumes you are in the project root: `/Users/naumovichandrei/Downloads/361robotics`.

After every change, the standard verify-commit-push loop is:

```bash
npx astro build                  # must exit 0
git add <changed files>
git commit -m "<conventional message>"
git push                         # SSH, no token needed
```

Netlify auto-rebuilds within ~30–90 seconds and the change is live.

---

## Add a new company

1. Pick a `slug` — lowercase Latin, hyphens between words, no underscores. The slug regex is `^[a-z0-9]+(-[a-z0-9]+)*$`. Examples: `abb`, `boston-dynamics`, `kuka-china`.

2. Create `src/content/companies/<slug>.yaml`. Copy the structure from `src/content/companies/fanuc.yaml` and fill in:
   - `slug`, `name`, `country` (ISO 3166-1 alpha-2 uppercase, e.g., `JP`, `DE`, `CN`)
   - `founded` (optional, integer)
   - `website` (must be a valid URL)
   - `logo: ./logo.svg` (until real logos are wired)
   - `logo_alt: { ru, en, zh }` (required when logo is set)
   - `type:` — array of one or both: `robot_brand`, `component_maker`
   - `featured:` — `true` to show on home, `false` otherwise
   - `categories:` — array of category slugs (must exist in `src/content/categories/`)
   - `produces_components:` — REQUIRED if `type` includes `component_maker`. Array of component slugs that exist in `src/content/components/`.
   - `robot_products:` — REQUIRED if `type` includes `robot_brand`. Array of `{ name, short?, image?, image_alt? }`.
   - `key_clients:` — array of client slugs (or `[]`)
   - `ru`, `en`, `zh` — each must have `description` (string) and `highlights` (1–8 strings)
   - `verified:` — `false` (default; the operator manually flips to `true` after fact-checking)
   - `source:` — optional, a URL to the primary source
   - `needs_review:` — optional, `{ zh: true }` flags Chinese translation for native-speaker review

3. Verify and push:
   ```bash
   npx astro build
   git add src/content/companies/<slug>.yaml
   git commit -m "content: add company <Name>"
   git push
   ```

If the schema rejects the file, Astro prints exactly which field is wrong and where.

---

## Add a new component

1. Pick a slug (same rules as company slugs).
2. Create `src/content/components/<slug>.yaml` mirroring `src/content/components/servo-motor.yaml`:
   - `slug`, `category` (a slug from `src/content/categories/`), `image?`, `image_alt?` (required if image set)
   - `featured: true|false`
   - `ru`, `en`, `zh` — each with `name` and `description`
   - `verified: false`

3. The component's "Manufacturers" list on its detail page is **auto-derived** from companies whose `produces_components` includes this slug. No manual list to update.

```bash
npx astro build && git add src/content/components/ && git commit -m "content: add component <Name>" && git push
```

---

## Add a new category

1. Create `src/content/categories/<slug>.yaml`:
   ```yaml
   slug: <slug>
   ru: { name: "Русское название" }
   en: { name: "English name" }
   zh: { name: "中文名称" }
   ```
2. Optional icon: `icon: ./icon.svg` requires `icon_alt: { ru, en, zh }`.
3. Commit and push.

Now this category is available for use in companies' `categories:` array and components' `category` field.

---

## Add a new country to the dictionary

The country dictionary at `src/i18n/countries.json` has 30 starter countries. To add more:

1. Edit `src/i18n/countries.json`. Add the ISO 3166-1 alpha-2 code with all three localized names:
   ```json
   "XX": { "ru": "...", "en": "...", "zh": "..." }
   ```
2. Commit and push.

Without an entry, the site falls back to displaying the bare ISO code (e.g., `XX`).

---

## Mark a company as `verified`

The `verified` field is internal-only (not currently rendered on the site as of 2026-05-15 — the prior "Unverified" badge was removed). But it's still meaningful operational metadata. To flip it:

1. Open the company YAML, change `verified: false` → `verified: true`.
2. Optionally add or update `source: <URL>` to record where you confirmed the facts.
3. Optionally remove `needs_review:` flags if those translations have been re-checked.
4. Commit and push.

---

## Change site contact info

The footer and contacts page read from `src/content/settings/contacts.yaml`:

```yaml
email: hello@361robotics.com
phone: "+86 ..."             # optional
whatsapp: "+86 ..."          # optional
wechat_id: "..."             # optional
telegram_handle: "@..."      # optional
```

Edit this single file — all surfaces (footer + contact page) update.

---

## Edit About / Contacts / Privacy text

Markdown files in `src/content/pages/`:

- `about.{en,ru,zh}.md` — About page text
- `contacts.{en,ru,zh}.md` — Contact page prose (form is rendered separately)
- `privacy.{en,ru,zh}.md` — Privacy Policy text

Each has frontmatter (`title`, `description`, `lang`, `slug`) and Markdown body. Edit, commit, push.

---

## Change the "361Robotics Partner" badge

The badge appears on companies where `country: CN`. To change:

- **Text**: edit `company.partner_badge` in `src/i18n/en.json`, `ru.json`, `zh.json`.
- **Color**: edit the `class=` in two places — `src/components/CompanyCard.astro` and `src/pages/[lang]/companies/[slug].astro`. Currently `bg-green-900 text-white`.
- **Trigger country**: change the `data.country === 'CN'` check in both files.

---

## Edit UI strings (menu, button text, etc.)

All UI text is in `src/i18n/{en,ru,zh}.json`. Top-level keys:

- `site` (name, tagline)
- `nav` (Companies, Components, About, Contacts, Search, Menu button, Contact CTA)
- `home` (hero, featured-section titles)
- `company` (Country, Founded, Website, Highlights, Key clients, etc.)
- `component` (Category, Manufacturers, Related components)
- `catalog` (filters labels, results count)
- `search` (tabs, no-results)
- `footer`
- `form` (input labels, submit button, privacy consent)

Edit all three files in parallel — every UI string must exist in all three languages.

---

## Run the site locally

```bash
npm install          # only the first time on a fresh checkout
npm run dev          # http://localhost:4321
```

Note: in dev mode, **Pagefind search will not work** (the Pagefind index lives in `dist/`, which only exists after `npm run build`). To preview the production build locally with search working:

```bash
npm run build
npm run preview      # serves dist/ at http://localhost:4321
```

---

## Run tests

```bash
npm test             # Vitest unit tests (schemas, i18n helpers, hreflang)
npm run test:e2e     # Playwright e2e (home × 3 langs, lang switch, company page, search)
```

E2E tests start `npm run preview` automatically (so Pagefind is available). They take ~30–60 seconds.

---

## Setting up SSH on a new machine

If you're on a new laptop and need to push to this repo:

```bash
# 1. Generate a new key
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -C "stefa2020eva@gmail.com"

# 2. Pre-add GitHub's host key (so first connection doesn't prompt)
ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts

# 3. Show the public key
cat ~/.ssh/id_ed25519.pub
```

Copy the printed public key, then go to https://github.com/settings/ssh/new — paste, save.

Verify: `ssh -T git@github.com` should respond with `Hi stefa2020eva-sys! You've successfully authenticated...`.

Then clone the repo via SSH:

```bash
git clone git@github.com:stefa2020eva-sys/361robotics.git
cd 361robotics
npm install
```

---

## Roll back a bad deploy

If a push breaks the site:

```bash
git log --oneline -5                # find the last good SHA
git revert <bad-sha>                # creates an inverse commit
git push                            # Netlify rebuilds, rolling back
```

Or, in Netlify dashboard → site `361robotics` → **Deploys** → click any previous successful deploy → **Publish deploy** → instant rollback without touching git.

---

## "I have no AI assistant — can I still edit content?"

Yes. The repo is plain files. Anyone comfortable with a text editor + git can:

1. `cd ~/Downloads/361robotics`
2. Copy any company YAML: `cp src/content/companies/fanuc.yaml src/content/companies/new-co.yaml`
3. Open the new file in TextEdit / VS Code / any editor. Replace the fields.
4. Verify: `npx astro build` — if exit 0, schemas are happy.
5. `git add src/content/companies/new-co.yaml && git commit -m "add company X" && git push`
6. Netlify rebuilds, the page appears at `https://361robotics.netlify.app/<lang>/companies/<slug>` in ~1 minute.

No AI needed. The schemas in `src/content.config.ts` will tell you exactly what's wrong if a field is missing or malformed.
