# Aurea Fotográfia galleries

Place the original photographs for each category in its matching folder:

- `eskuvo` — weddings
- `portre` — portraits
- `lifestyle` — lifestyle
- `uzleti` — business
- `kisallat` — pets

Supported source formats are `.jpg`, `.jpeg`, `.png`, `.webp`, and `.avif`.

After adding, removing, or replacing photos, run:

```text
npm run gallery:update
```

The script creates responsive AVIF, WebP, and JPEG/PNG variants, writes the image manifest, and removes stale generated variants. The normal `npm run build` command runs the same sync automatically.
