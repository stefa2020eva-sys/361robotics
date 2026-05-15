# Deployment

## Current state (as of 2026-05-15)

- ✅ GitHub repo created: `git@github.com:stefa2020eva-sys/361robotics.git` (private)
- ✅ Netlify site connected and auto-deploying from `main`
- ✅ Live URL: **https://361robotics.netlify.app**
- ✅ SSH authentication configured (no tokens needed for push)
- ⏳ Custom domain (`361robotics.com`) — not yet purchased; canonical URLs already reference it for SEO

Every `git push` to `main` triggers a Netlify rebuild that completes in ~30–90 seconds.

## SSH authentication

The current machine (`/Users/naumovichandrei`) has an Ed25519 SSH key pair authorized on GitHub:

- Private key: `~/.ssh/id_ed25519` (never share, no passphrase set)
- Public key: `~/.ssh/id_ed25519.pub`
- Authorized at: https://github.com/settings/keys
- Host key fingerprint pre-added to `~/.ssh/known_hosts`

Origin remote uses SSH:
```
git@github.com:stefa2020eva-sys/361robotics.git
```

**On a NEW machine** (e.g., a replacement laptop), follow [`OPERATIONS.md` → "Setting up SSH on a new machine"](./OPERATIONS.md#setting-up-ssh-on-a-new-machine).

## Adding a custom domain (when ready)

1. Buy a domain. For `361robotics.com`: Namecheap (~$12/year) or any registrar.
2. In Netlify dashboard → site `361robotics` → **Domain management** → **Add domain alias** → enter `361robotics.com`.
3. Netlify shows DNS records needed. Two options:
   - **Use Netlify DNS** (easiest): change your domain's nameservers to Netlify's. Netlify creates all records for you, including SSL.
   - **Keep your DNS provider**: add an `A` record pointing to Netlify's IP and a `CNAME` for `www`.
4. After DNS propagates (5 min to 24 h), Netlify auto-provisions SSL via Let's Encrypt.
5. Once HTTPS is green, set `361robotics.com` as **primary** in Netlify domain settings.

The site code already references `https://361robotics.com` in canonical URLs and sitemap — no code changes needed when the domain is connected.

## Form notifications

The contact form on `/<lang>/contacts` uses Netlify Forms (auto-detected on first deploy with `data-netlify="true"`). To receive submissions:

1. Netlify dashboard → site `361robotics` → **Forms**
2. Click the `contact` form → **Settings & usage** → **Form notifications** → **Add notification** → choose **Email notification**
3. Enter recipient email (the operator: `stefa2020eva@gmail.com`)
4. Save

Free tier: 100 submissions/month. After: $19/month "Forms Level 1" plan.

## Deploy failure protocol

If a `git push` causes Netlify build to fail:
- The previous successful deploy stays live (nothing breaks for visitors)
- Netlify emails the configured "deploy failed" notification address
- The operator should forward the build log link to the AI assistant
- The AI inspects, pushes a fix (or `git revert` of the breaking commit), build retries

To enable failure notifications: Netlify dashboard → site `361robotics` → **Build & deploy** → **Deploy notifications** → **Add notification** → **Email** → **Deploy failed**.

## Manual deploy (drag-and-drop)

If GitHub-based auto-deploy is broken for some reason, you can always:

1. Locally: `npm install && npm run build` — generates `dist/`
2. Open https://app.netlify.com/drop
3. Drag the `dist/` folder onto the page
4. Site is live at a random URL

This is the emergency fallback. Normal updates should go via `git push`.

## Quick deploy verification commands

After a push, verify the deploy:

```bash
# Verify HTTP 200 on key pages
curl -sI https://361robotics.netlify.app/en/                     # home
curl -sI https://361robotics.netlify.app/ru/companies/fanuc/     # entity
curl -sI https://361robotics.netlify.app/sitemap-index.xml       # sitemap
curl -sI https://361robotics.netlify.app/pagefind/pagefind.js    # search index

# Count companies on production catalog
curl -sL https://361robotics.netlify.app/en/companies | grep -c 'href="/en/companies/[a-z]'
```
