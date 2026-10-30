# Project instructions

## Start every task

- Read `README.md`, `HANDOFF.md`, and `DEPLOYMENT.md` before making changes. These files and this instruction file carry project context across sessions; do not rely on another chat's memory.
- Inspect the working tree before updating it. Pull the latest `main` when safe; preserve existing edits and local commits, and never reset or overwrite them to update the checkout.
- Use the existing isolated checkout. Do not create a Git worktree unless requested.
- Preserve the application design, text, photographs, routes, and functionality unless the owner requests changes.

## Active hosting — Cloudflare Pages

- Repository: `aureafotografia/aureafotografia.hu`; production branch: `main`.
- Existing Pages project: `aureafotografia-hu`.
- Production: https://aureafotografia.hu and https://www.aureafotografia.hu.
- Pages URL: https://aureafotografia-hu.pages.dev.
- Both production domains have already migrated to Pages. Do not repeat the migration.
- Approved pushes or authorized PR merges to `main` automatically trigger Cloudflare builds and deployments. GitHub write access is sufficient to trigger this; Cloudflare credentials are not required for the Git integration.
- `.openai/hosting.json` is historical OpenAI Sites configuration, **not active hosting**. A Sites access error does not block current releases. Do not use Sites, manually upload build files, run `wrangler deploy`, create a Worker, or create replacement hosting for routine releases.
- Do not change DNS/email records, custom-domain configuration, or remove the old Sites project without explicit owner authorization.

## Development and verification

- Use Node.js 24 (Pages is pinned to 24.19.0) and `npm ci`. Astro produces a static site in `dist`; no Cloudflare adapter is needed.
- In the managed cloud environment, use `npm_config_cache=/workspace/.npm-cache` and `ASTRO_TELEMETRY_DISABLED=1` to avoid writes to the restricted home directory.
- Run `npm run check` and `npm run build` for application changes; run `npm run test:gallery` when modifying image generation. Documentation-only changes need relevant documentation and diff checks.
- Gallery sync reuses unchanged local assets. Fresh Cloudflare Pages builds restore matching published images from the production site with SHA-256 verification; see README.md and DEPLOYMENT.md. Changed inputs or unavailable/invalid assets fall back to generation, which can take several minutes. Do not commit generated variants, dependencies, caches, or `dist`. Preserve original photographs.
- Gallery generation may rewrite the tracked manifest timestamp. Avoid committing timestamp-only churn; preserve pre-existing manifest changes.
- For approved releases, monitor the Cloudflare Pages GitHub check and verify the public production URLs. A push is not proof of a successful deployment. Report pushed, building, deployed, and live-verified states accurately; inspect actual logs on failure, or state when log access is unavailable.
- Do not submit test contact-form messages without authorization. Preserve the existing Web3Forms configuration.
- Browser control and public preview tools depend on the session. Do not claim access to the owner's browser or offer cloud-localhost URLs as user-accessible previews.

See `DEPLOYMENT.md` for account/project details, build settings, and historical rollback references. Its recorded verification commits are historical evidence, not a substitute for checking the latest release.
