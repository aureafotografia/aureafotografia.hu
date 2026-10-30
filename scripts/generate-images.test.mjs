import assert from "node:assert/strict";
import { execFile, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { promisify } from "node:util";
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
    const run = () => execFileSync(process.execPath, [script], { cwd: fixture, encoding: "utf8", env: { ...process.env, GALLERY_CACHE_ORIGIN: "" } });
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

test("clean builds restore published assets, reject corruption, and generate changed sources", async () => {
  const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "aurea-published-gallery-test-"));
  const responses = new Map();
  const server = createServer((request, response) => {
    const body = responses.get(request.url);
    response.writeHead(body ? 200 : 404);
    response.end(body ?? "Not found");
  });
  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    await fs.mkdir(path.join(fixture, "scripts"));
    await fs.mkdir(path.join(fixture, "src/data"), { recursive: true });
    await fs.mkdir(path.join(fixture, "content/galleries/wedding"), { recursive: true });
    await fs.symlink(path.join(project, "node_modules"), path.join(fixture, "node_modules"), "dir");
    const script = path.join(fixture, "scripts/generate-images.mjs");
    await fs.copyFile(path.join(project, "scripts/generate-images.mjs"), script);
    const source = path.join(fixture, "content/galleries/wedding/photo.png");
    const writeSource = (background) => sharp({ create: { width: 16, height: 12, channels: 3, background } }).png().toFile(source);
    const run = async (cacheOrigin = origin) => (await promisify(execFile)(process.execPath, [script], {
      cwd: fixture, encoding: "utf8", env: { ...process.env, GALLERY_CACHE_ORIGIN: cacheOrigin },
    })).stdout;
    const clearBuild = async () => {
      await fs.rm(path.join(fixture, "public"), { recursive: true, force: true });
      await fs.rm(path.join(fixture, ".astro"), { recursive: true, force: true });
      await fs.rm(path.join(fixture, "src/data/gallery-manifest.json"), { force: true });
    };
    await writeSource("red");
    await run("");
    const metadataPath = "/images/generated/gallery-sync-cache.json";
    const metadata = JSON.parse(await fs.readFile(path.join(fixture, "public", metadataPath), "utf8"));
    responses.set(metadataPath, JSON.stringify(metadata));
    for (const file of metadata.files) responses.set(file.src, await fs.readFile(path.join(fixture, "public", file.src)));

    await clearBuild();
    assert.match(await run(), /Restored .* verified gallery assets.*no images encoded/);
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(fixture, "src/data/gallery-manifest.json"))), metadata.manifest);
    for (const file of metadata.files) assert.deepEqual(await fs.readFile(path.join(fixture, "public", file.src)), responses.get(file.src));

    // Even same-size corruption must never be deployed as a restored image.
    const file = metadata.files[0];
    const original = responses.get(file.src);
    responses.set(file.src, Buffer.alloc(original.length));
    await clearBuild();
    assert.match(await run(), /integrity mismatch.*generating images/s);
    assert.deepEqual(await fs.readFile(path.join(fixture, "public", file.src)), original);
    responses.set(file.src, original);

    await writeSource("blue");
    await clearBuild();
    assert.match(await run(), /does not match current inputs; generating images/);
    await writeSource("red");
    await clearBuild();
    responses.clear();
    assert.match(await run(), /HTTP 404.*generating images/s);

    // A malformed published manifest cannot write outside the gallery directory.
    const invalid = structuredClone(metadata);
    invalid.manifest.galleries.wedding[0].full.fallback.src = "/outside.png";
    responses.set(metadataPath, JSON.stringify(invalid));
    await clearBuild();
    assert.match(await run(), /Invalid cached asset metadata.*generating images/s);
    await assert.rejects(fs.stat(path.join(fixture, "public/outside.png")), { code: "ENOENT" });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(fixture, { recursive: true, force: true });
  }
});
