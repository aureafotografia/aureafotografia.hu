# Aurea Fotográfia

Bilingual Hungarian/English photography portfolio for Kulcsár-Horváth Alexandra.
Production URLs (Cloudflare Pages): https://aureafotografia.hu and https://www.aureafotografia.hu

Cloudflare Pages deployment: https://aureafotografia-hu.pages.dev

## Development

Use Node.js 24 (the local handoff runtime was 24.14.0) and npm.

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

```sh
npm run check
npm run build
npm run preview -- --host 0.0.0.0
```

The static build is written to `dist/`. Development, checking, and building run the image sync first; the initial sync can take several minutes.

## Source map

- `src/pages`: Hungarian and English routes, sitemap, robots.txt.
- `src/components`: navigation, galleries, category/pricing pages, contact form.
- `src/layouts/SiteLayout.astro`: shared layout and SEO metadata.
- `src/styles/global.css`: shared styling.
- `src/data`: site copy, categories, generated gallery manifest.
- `content/galleries`: original gallery photographs; keep these in source control.
- `public/images`: homepage photographs and brand assets.
- `scripts/generate-images.mjs`: Sharp-based responsive image generation.

See `content/galleries/README.md` for gallery maintenance. Generated variants, dependencies, and build output are ignored and regenerated locally.

## Configuration and hosting

The contact form uses Web3Forms. `.env.example` documents `PUBLIC_WEB3FORMS_ACCESS_KEY`, a public client-side form identifier. The component currently includes the same fallback identifier. Do not submit test inquiries without authorization.

Cloudflare Pages deploys this repository automatically when approved changes reach `main`. See [DEPLOYMENT.md](DEPLOYMENT.md) for the verified project settings, release workflow, and domain restrictions. Both production domains now serve the Pages site over HTTPS.

`.openai/hosting.json` is retained only as the old OpenAI Sites hosting reference; it does not configure the current Pages deployment. Do not change DNS, attach custom domains, alter email records, or remove the old site without explicit approval.

## Cloud continuation

Connect this private repository to the destination account's Codex cloud environment. Use Node.js 24 and `npm ci` for installation. Run `npm run gallery:sync` during preparation to pre-generate image assets, then run the check and build commands above.

Read `HANDOFF.md` and paste the prompt in `CONTINUE_PROMPT.md` into the new chat. This repository contains the source and handoff context; previous chat history and account-specific connections are separate.
