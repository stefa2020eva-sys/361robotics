# Deployment Steps

This project is ready to deploy. Two paths:

## Option A — GitHub + Netlify auto-deploy (recommended)

1. If a GitHub repo already exists (check `git remote -v`), skip to step 2. Otherwise:
   - Go to https://github.com/new
   - Name: `361robotics`, Private
   - Do NOT initialize with README, .gitignore, or license
   - Create
   - On your machine: `git remote add origin git@github.com:<your-username>/361robotics.git && git push -u origin main`

2. Go to https://app.netlify.com/start
3. "Import from Git" → authorize GitHub → select `361robotics`
4. Netlify auto-detects `netlify.toml`. Click "Deploy site".
5. After first deploy:
   - Site Settings → Change site name → `361robotics`
   - Forms → confirm `contact` form auto-detected, add notification email
   - Build & deploy → Notifications → add "Deploy failed" email
   - Domain settings → when domain ready, add custom domain + DNS + HTTPS

## Option B — Drag-and-drop (no GitHub)

1. Run `npm run build` locally — generates `dist/`
2. Go to https://app.netlify.com/drop
3. Drag the `dist/` folder onto the page
4. Site is live at a random `.netlify.app` URL
5. To update: rebuild locally, drag the new `dist/` again

Option A is required for the contact form (Netlify Forms detection happens via build process).
