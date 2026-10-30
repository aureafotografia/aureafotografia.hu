# Deployment

## Current Cloudflare Pages deployment

Configuration confirmed by the owner on October 30, 2026:

| Setting | Value |
| --- | --- |
| Project | `aureafotografia-hu` |
| Cloudflare account | `Alexandra.kulcsarhorvath@gmail.com` |
| Account ID | `c968dc8fbb253d376b013baf85fac407` |
| Repository | `aureafotografia/aureafotografia.hu` |
| Production branch | `main` |
| Production URLs | https://aureafotografia.hu and https://www.aureafotografia.hu |
| Live Pages URL | https://aureafotografia-hu.pages.dev |
| Framework | Astro, static output; no Cloudflare adapter |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | Repository root |
| Environment variable | `NODE_VERSION=24.19.0` |

The owner confirmed the production migration is complete and both custom domains serve Pages over HTTPS. The last owner-verified deployed commit is
`b2df90fd30b2c9f55c448ccd9b8e5b5c2a3fd476`.
Future pushes to `main` automatically trigger Pages builds and deployments.

## Release workflow

1. Pull the latest `main` before making changes. Preserve the existing application and make only the requested changes.
2. Run `npm run check` and `npm run build` for application changes. Use Node.js 24; the deployment runtime is 24.19.0. Both commands regenerate gallery assets, so builds take several minutes. Documentation-only changes require checking documentation and diffs, not rebuilding unchanged application assets.
3. Commit and push approved changes to `main`. When using a pull request, merge only when authorized; merging to `main` triggers deployment.
4. Monitor the Pages deployment when access is available, then verify the updated public production URLs (apex and www), as well as the Pages URL when accessible. A successful Git push alone does not establish a successful build, deployment, or live update. Report these outcomes separately if verification is unavailable.
5. If deployment fails, inspect its actual build logs before changing configuration.

GitHub write access is required to push. Cloudflare credentials are not required to trigger this configured deployment. Detailed Cloudflare logs may require separate account access.

Do not manually upload build files, run `wrangler deploy`, create a Worker, or use the old OpenAI Sites project for current releases. Do not commit generated image variants, `dist`, credentials, or dependency caches.

## Production cutover and verification

**Both `aureafotografia.hu` and `www.aureafotografia.hu` now serve the Cloudflare Pages site over HTTPS.** The owner verified after cutover:

- Both domains, Hungarian/English homepages, and pricing pages (`/arak`, `/en/prices`) work.
- Both wedding routes show two photographs; both business routes show ten.
- Gallery lightboxes work and the footer includes `test`.
- Contact form configuration was preserved; no test message was submitted.

Use the existing Pages project. Do not create another hosting project or change DNS/email records. Do not remove the old Sites project without explicit approval.

## Rollback reference

Before cutover, apex and www each had two proxied A records, `172.66.3.26` and `162.159.143.30`, TTL Auto. They were replaced with proxied CNAMEs to `aureafotografia-hu.pages.dev`. Email, wildcard, and verification records were preserved.

The detailed rollback snapshot exists **only on the original machine** at `/private/tmp/aureafotografia-dns-rollback-2026-10-30.json`. It is not a cloud-workspace file or a repository artifact. These values are historical references, not instructions to change DNS; any rollback requires explicit owner approval.

## Historical hosting reference

`.openai/hosting.json` identifies the old OpenAI Sites project
`appgprj_6ab1395740a0819186da725985909d6d`, with static output `dist`.
It is retained as historical reference and is **not** the current Pages deployment configuration.

Historical Sites URL: https://aurea-fotografia.aczeldz.chatgpt.site.
The last historically verified Sites release was October 22, 2026, version 9,
commit `78c132294bf07f7f30b3fa913c58754cbd6e4f22`.
Repository migration did not transfer Sites ownership or publishing access.
