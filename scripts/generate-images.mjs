import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "content", "galleries");
const outputRoot = path.join(root, "public", "images", "generated", "galleries");
const manifestPath = path.join(root, "src", "data", "gallery-manifest.json");
const cachePath = path.join(root, ".astro", "gallery-sync-cache.json");
const publishedCachePath = path.join(root, "public", "images", "generated", "gallery-sync-cache.json");
const cacheOrigin = process.env.GALLERY_CACHE_ORIGIN ?? (process.env.CF_PAGES === "1" ? "https://aureafotografia.hu" : "");
const publicPrefix = "/images/generated/galleries";
const widthCandidates = [480, 800, 1200, 1600, 2400];
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const hashFor = async (filePath) => crypto.createHash("sha1").update(await fs.readFile(filePath)).digest("hex").slice(0, 10);
const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");
const readJson = async (filePath) => {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" || error instanceof SyntaxError) return null;
    throw error;
  }
};
// Ignore the generation timestamp so restoring a tracked manifest preserves the cache.
const manifestDigest = (manifest) => digest(JSON.stringify({ version: manifest.version, galleries: manifest.galleries }));
const outputFiles = (manifest) => Object.values(manifest.galleries).flat().flatMap((entry) =>
  [...entry.regular, entry.full].flatMap((set) => Object.values(set).map((variant) =>
    path.join(root, "public", variant.src.slice(1)))));

const cacheIsValid = async (cache, manifest, inputHash) => {
  if (!cache || !manifest || cache.inputHash !== inputHash || cache.manifestHash !== manifestDigest(manifest)) return false;
  const files = outputFiles(manifest);
  if (!Array.isArray(cache.outputs) || cache.outputs.length !== files.length) return false;
  return (await Promise.all(files.map(async (file, index) => {
    try {
      const stat = await fs.stat(file);
      return stat.isFile() && stat.size > 0 && stat.size === cache.outputs[index];
    } catch (error) {
      if (error.code === "ENOENT") return false;
      throw error;
    }
  }))).every(Boolean);
};

const sourceFiles = async (directory, relative = "") => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryRelative = path.join(relative, entry.name);
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(entryPath, entryRelative));
    else if (supportedExtensions.has(path.extname(entry.name).toLowerCase())) files.push(entryRelative);
  }
  return files.sort();
};

const dimensionsFor = (metadata) => {
  const rotated = metadata.orientation && metadata.orientation >= 5 && metadata.orientation <= 8;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  if (!width || !height) throw new Error(`Unable to determine dimensions for ${metadata.format || "image"}`);
  return { width, height };
};

const dimensionsAt = (width, height, targetWidth) => {
  const outputWidth = Math.min(width, targetWidth);
  return { width: outputWidth, height: Math.max(1, Math.round((height * outputWidth) / width)) };
};

const safeBaseName = (relative) => path.basename(relative, path.extname(relative)).replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "photo";

const writeVariant = async ({ inputPath, relative, hash, label, width, height, format, alpha }) => {
  const extension = format === "jpeg" ? "jpg" : format;
  const gallery = relative.split(path.sep)[0];
  const fileName = `${safeBaseName(relative)}--${label}--${hash}.${extension}`;
  const targetPath = path.join(outputRoot, gallery, fileName);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  let pipeline = sharp(inputPath, { failOn: "none" }).rotate().toColorspace("srgb").resize(width, height, { fit: "inside", withoutEnlargement: true });
  if (format === "avif") pipeline = pipeline.avif({ quality: 76, effort: 4 });
  else if (format === "webp") pipeline = pipeline.webp({ quality: 80, effort: 4 });
  else if (alpha) pipeline = pipeline.png({ compressionLevel: 9 });
  else pipeline = pipeline.jpeg({ quality: 84, progressive: true, mozjpeg: true });
  await pipeline.toFile(targetPath);

  return { src: `${publicPrefix}/${gallery}/${fileName}`, width, height };
};

const buildFormatSet = async ({ inputPath, relative, hash, label, width, height, alpha }) => {
  const formats = ["avif", "webp", alpha ? "png" : "jpeg"];
  const variants = await Promise.all(formats.map((format) => writeVariant({ inputPath, relative, hash, label, width, height, format, alpha })));
  return { avif: variants[0], webp: variants[1], fallback: variants[2] };
};

const mapLimit = async (items, limit, worker) => {
  const results = new Array(items.length);
  let cursor = 0;
  const run = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
};

const saveCache = async (inputHash, manifest) => {
  const files = await Promise.all(outputFiles(manifest).map(async (file) => {
    const bytes = await fs.readFile(file);
    return { src: `/${path.relative(path.join(root, "public"), file).split(path.sep).join("/")}`, size: bytes.length, sha256: digest(bytes) };
  }));
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  await fs.writeFile(cachePath, JSON.stringify({ inputHash, manifestHash: manifestDigest(manifest), outputs: files.map((file) => file.size) }));
  await fs.mkdir(path.dirname(publishedCachePath), { recursive: true });
  await fs.writeFile(publishedCachePath, JSON.stringify({ version: 1, inputHash, manifest, files }));
};

const download = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
};

const restorePublishedCache = async (inputHash) => {
  if (!cacheOrigin) return false;
  let staging;
  try {
    const metadata = JSON.parse((await download(new URL("/images/generated/gallery-sync-cache.json", cacheOrigin))).toString("utf8"));
    if (metadata.version !== 1 || metadata.inputHash !== inputHash) {
      console.log("Published gallery cache does not match current inputs; generating images.");
      return false;
    }
    const expected = outputFiles(metadata.manifest);
    if (expected.length !== metadata.files.length) throw new Error("Invalid cached file list");
    // Derive allowed paths from the manifest and confine all writes to the gallery directory.
    for (const [index, file] of metadata.files.entries()) {
      const relative = path.relative(outputRoot, expected[index]);
      if (!file.src.startsWith(`${publicPrefix}/`) || relative.startsWith("..") || path.isAbsolute(relative)
        || path.join(root, "public", file.src.slice(1)) !== expected[index]
        || !Number.isInteger(file.size) || file.size <= 0 || !/^[a-f0-9]{64}$/.test(file.sha256)) {
        throw new Error("Invalid cached asset metadata");
      }
    }
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    staging = await fs.mkdtemp(path.join(path.dirname(cachePath), "gallery-restore-"));
    let downloadFailure;
    const downloads = await mapLimit(metadata.files, 6, async (file, index) => {
      if (downloadFailure) return downloadFailure;
      try {
        const bytes = await download(new URL(file.src, cacheOrigin));
        if (bytes.length !== file.size || digest(bytes) !== file.sha256) throw new Error(`Cached asset integrity mismatch: ${file.src}`);
        const target = path.join(staging, path.relative(outputRoot, expected[index]));
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, bytes);
        return null;
      } catch (error) {
        downloadFailure = error;
        return error;
      }
    });
    const failure = downloads.find(Boolean);
    if (failure) throw failure;
    await fs.mkdir(path.dirname(outputRoot), { recursive: true });
    await fs.rm(outputRoot, { recursive: true, force: true });
    await fs.rename(staging, outputRoot);
    staging = null;
    await fs.writeFile(manifestPath, `${JSON.stringify(metadata.manifest, null, 2)}\n`);
    await saveCache(inputHash, metadata.manifest);
    console.log(`Restored ${metadata.files.length} verified gallery assets from production; no images encoded.`);
    return true;
  } catch (error) {
    console.log(`Published gallery cache unavailable (${error.message}); generating images.`);
    return false;
  } finally {
    if (staging) await fs.rm(staging, { recursive: true, force: true });
  }
};

const buildEntry = async (relative) => {
  const inputPath = path.join(sourceRoot, relative);
  const [metadata, hash] = await Promise.all([sharp(inputPath, { failOn: "none" }).metadata(), hashFor(inputPath)]);
  const { width: sourceWidth, height: sourceHeight } = dimensionsFor(metadata);
  const alpha = Boolean(metadata.hasAlpha);
  const regularWidths = [...new Set(widthCandidates.map((candidate) => dimensionsAt(sourceWidth, sourceHeight, candidate).width))];
  const regular = [];
  for (const width of regularWidths) {
    const dimensions = dimensionsAt(sourceWidth, sourceHeight, width);
    regular.push(await buildFormatSet({ inputPath, relative, hash, label: `${dimensions.width}w`, ...dimensions, alpha }));
  }
  const fullDimensions = dimensionsAt(sourceWidth, sourceHeight, 2400);
  const full = await buildFormatSet({ inputPath, relative, hash, label: "full", ...fullDimensions, alpha });
  return {
    id: `${relative.replaceAll(path.sep, "/")}--${hash}`,
    file: relative.replaceAll(path.sep, "/"),
    width: sourceWidth,
    height: sourceHeight,
    regular,
    full,
  };
};

const main = async () => {
  await fs.mkdir(sourceRoot, { recursive: true });
  const files = await sourceFiles(sourceRoot);
  const sourceHashes = await Promise.all(files.map(async (file) => [file, digest(await fs.readFile(path.join(sourceRoot, file)))]));
  const inputHash = digest(JSON.stringify({
    sources: sourceHashes,
    generator: digest(await fs.readFile(fileURLToPath(import.meta.url))),
    encoders: sharp.versions,
  }));
  const [cache, previousManifest] = await Promise.all([readJson(cachePath), readJson(manifestPath)]);
  if (await cacheIsValid(cache, previousManifest, inputHash)) {
    // Ensure the next deployment exposes cache metadata even when local outputs are reused.
    await saveCache(inputHash, previousManifest);
    console.log(`Gallery images unchanged; reused generated assets (${files.length} source images).`);
    return;
  }
  if (await restorePublishedCache(inputHash)) return;
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });

  const entries = await mapLimit(files, 3, buildEntry);
  const galleries = {};
  for (const entry of entries) {
    const gallery = entry.file.split("/")[0];
    galleries[gallery] ||= [];
    galleries[gallery].push(entry);
  }
  Object.values(galleries).forEach((gallery) => gallery.sort((a, b) => a.file.localeCompare(b.file)));

  const manifest = { version: 1, generatedAt: new Date().toISOString(), galleries };
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await saveCache(inputHash, manifest);
  console.log(`Gallery images are up to date (${files.length} source images across ${Object.keys(galleries).length} galleries).`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
