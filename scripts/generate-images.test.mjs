import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import sharp from "sharp";

test("gallery cache reuses assets and invalidates changed inputs or missing output", async () => {
  const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "aurea-gallery-test-"));
  try {
    await fs.mkdir(path.join(fixture, "scripts"));
    await fs.mkdir(path.join(fixture, "src/data"), { recursive: true });
    await fs.mkdir(path.join(fixture, "content/galleries/wedding"), { recursive: true });
    await fs.symlink(path.join(project, "node_modules"), path.join(fixture, "node_modules"), "dir");
    const script = path.join(fixture, "scripts/generate-images.mjs");
    await fs.copyFile(path.join(project, "scripts/generate-images.mjs"), script);
    const source = path.join(fixture, "content/galleries/wedding/photo.png");
    const writeSource = (background) => sharp({ create: { width: 16, height: 12, channels: 3, background } }).png().toFile(source);
    const run = () => execFileSync(process.execPath, [script], { cwd: fixture, encoding: "utf8" });
    const manifestPath = path.join(fixture, "src/data/gallery-manifest.json");
    const readManifest = async () => JSON.parse(await fs.readFile(manifestPath, "utf8"));
    const variantPath = (manifest) => path.join(fixture, "public", manifest.galleries.wedding[0].full.fallback.src.slice(1));

    await writeSource("red");
    assert.match(run(), /up to date/);
    const first = await readManifest();
    const firstPath = variantPath(first);
    const before = await fs.stat(firstPath);
    const manifestBefore = await fs.readFile(manifestPath, "utf8");
    assert.match(run(), /unchanged; reused/);
    assert.equal((await fs.stat(firstPath)).mtimeMs, before.mtimeMs);
    assert.equal(await fs.readFile(manifestPath, "utf8"), manifestBefore);

    // Restoring the tracked timestamp must not invalidate otherwise identical assets.
    await fs.writeFile(manifestPath, JSON.stringify({ ...first, generatedAt: "restored" }));
    assert.match(run(), /unchanged; reused/);
    await fs.unlink(firstPath);
    assert.match(run(), /up to date/);
    assert.ok((await fs.stat(firstPath)).size > 0);

    await writeSource("blue");
    assert.match(run(), /up to date/);
    const second = await readManifest();
    assert.notEqual(first.galleries.wedding[0].id, second.galleries.wedding[0].id);
    await assert.rejects(fs.stat(firstPath), { code: "ENOENT" });

    await fs.appendFile(script, "\n// Changed generation recipe.\n");
    assert.match(run(), /up to date/);
    assert.match(run(), /unchanged; reused/);

    const currentPath = variantPath(await readManifest());
    await fs.writeFile(currentPath, "");
    assert.match(run(), /up to date/);
    await fs.unlink(source);
    assert.match(run(), /up to date/);
    assert.deepEqual((await readManifest()).galleries, {});
    await assert.rejects(fs.stat(currentPath), { code: "ENOENT" });
    assert.match(run(), /unchanged; reused/);
  } finally {
    await fs.rm(fixture, { recursive: true, force: true });
  }
});
