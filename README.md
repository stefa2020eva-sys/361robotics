# 361Robotics

A multilingual (RU / EN / ZH) B2B catalog of robotics companies and the components they manufacture. Built with Astro, Tailwind, and Pagefind. Hosted on Netlify.

## Editing

This catalog is maintained through AI-assisted edits — see [docs/superpowers/specs/2026-05-14-361robotics-design.md](docs/superpowers/specs/2026-05-14-361robotics-design.md) for the workflow.

To add content, talk to the AI assistant. Files in `src/content/` should not be edited by hand under normal operation.

## Local development

```bash
npm install
npm run dev            # http://localhost:4321
npm test               # Vitest unit tests
npm run test:e2e       # Playwright E2E tests
npm run build          # Astro build + Pagefind indexing
npm run preview        # Serve the build locally
```

## Deploy

See [DEPLOY.md](DEPLOY.md) for the step-by-step Netlify deployment guide.

Once connected to a Git remote, pushes to `main` auto-deploy via Netlify (`netlify.toml`).
