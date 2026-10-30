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
| Live Pages URL | https://aureafotografia-hu.pages.dev |
| Framework | Astro, static output; no Cloudflare adapter |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | Repository root |
| Environment variable | `NODE_VERSION=24.19.0` |

The owner confirmed the first deployment succeeded for commit
`b2df90fd30b2c9f55c448ccd9b8e5b5c2a3fd476`.
Future pushes to `main` automatically trigger Pages builds and deployments.

## Release workflow

1. Preserve the existing application and make only the requested changes.
2. Run relevant checks and `npm run build`. Use Node.js 24; the deployment runtime is 24.19.0. Build automatically regenerates gallery assets. Documentation-only changes require checking documentation and diffs, not rebuilding unchanged application assets.
3. Commit and push approved changes to `main`. When using a pull request, merge only when authorized; merging to `main` triggers deployment.
4. Monitor the Pages deployment when access is available, then verify the updated pages at https://aureafotografia-hu.pages.dev. A successful Git push alone does not establish a successful build, deployment, or live update. Report these outcomes separately if verification is unavailable.
5. If deployment fails, inspect its actual build logs before changing configuration.

GitHub write access is required to push. Cloudflare credentials are not required to trigger this configured deployment. Detailed Cloudflare logs may require separate account access.

Do not manually upload build files, run `wrangler deploy`, create a Worker, or use the old OpenAI Sites project for current releases. Do not commit generated image variants, `dist`, credentials, or dependency caches.

## Production domains have not moved

**`aureafotografia.hu` and `www.aureafotografia.hu` still point to the old OpenAI Sites hosting. They have not been switched to Pages.** A successful Pages release does not update those domains until a separately approved domain cutover.

Do not change DNS, attach custom domains, alter email records, or remove the old site without explicit owner approval. Preserve the old site while the replacement is being verified.

## Historical hosting reference

`.openai/hosting.json` identifies the old OpenAI Sites project
`appgprj_6ab1395740a0819186da725985909d6d`, with static output `dist`.
It is retained as historical reference and is **not** the current Pages deployment configuration.

Historical Sites URL: https://aurea-fotografia.aczeldz.chatgpt.site.
The last historically verified Sites release was October 22, 2026, version 9,
commit `78c132294bf07f7f30b3fa913c58754cbd6e4f22`.
Repository migration did not transfer Sites ownership or publishing access.
