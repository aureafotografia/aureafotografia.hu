import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "content", "galleries");
const outputRoot = path.join(root, "public", "images", "generated", "galleries");
const manifestPath = path.join(root, "src", "data", "gallery-manifest.json");
const publicPrefix = "/images/generated/galleries";
const widthCandidates = [480, 800, 1200, 1600, 2400];
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const hashFor = async (filePath) => crypto.createHash("sha1").update(await fs.readFile(filePath)).digest("hex").slice(0, 10);

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
      results[index] = await worker(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
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
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });

  const files = await sourceFiles(sourceRoot);
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
  console.log(`Gallery images are up to date (${files.length} source images across ${Object.keys(galleries).length} galleries).`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
