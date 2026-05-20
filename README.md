# AndiYangcs.github.io

Personal site for Andi Yang. Built with Astro + React, deployed to GitHub Pages.

## Local dev

```powershell
npm install
npm run dev      # http://localhost:4321
npm test         # run unit tests
npm run build    # produce dist/
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages.

Specs live in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`.