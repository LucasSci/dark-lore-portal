import fs from "node:fs/promises";
import path from "node:path";
import monsters from "../src/data/witcher-bestiary-data.js";

const outputDir = path.resolve("public", "bestiary");
const manifestPath = path.resolve("src", "data", "witcher-bestiary-image-manifest.ts");

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferExtension(url, contentType) {
  if (contentType?.includes("png")) {
    return "png";
  }

  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) {
    return "jpg";
  }

  const normalized = url.split("?")[0];
  const directMatch = normalized.match(/\.([a-zA-Z0-9]+)$/);
  if (directMatch) {
    return directMatch[1].toLowerCase();
  }

  const embeddedMatch = normalized.match(/\.([a-zA-Z0-9]+)\//);
  if (embeddedMatch) {
    return embeddedMatch[1].toLowerCase();
  }

  return "png";
}

function extractFandomFileName(url) {
  const parsed = new URL(url);
  const match = parsed.pathname.match(/\/wiki\/(?:Arquivo|File):(.+)$/i);
  return match ? decodeURIComponent(match[1]).replace(/_/g, " ") : null;
}

function extractStaticFileName(url) {
  const parsed = new URL(url);
  const candidates = parsed.pathname.split("/");
  const revisionIndex = candidates.findIndex((segment) => segment === "revision");
  const fileName = revisionIndex > 0 ? candidates[revisionIndex - 1] : null;

  return fileName ? decodeURIComponent(fileName).replace(/_/g, " ") : null;
}

async function resolveFileUrlFromApi(fileName) {
  const apiUrl = new URL("https://witcher.fandom.com/api.php");
  apiUrl.searchParams.set("action", "query");
  apiUrl.searchParams.set("titles", `File:${fileName}`);
  apiUrl.searchParams.set("prop", "imageinfo");
  apiUrl.searchParams.set("iiprop", "url");
  apiUrl.searchParams.set("format", "json");
  apiUrl.searchParams.set("origin", "*");

  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "DarkLorePortal/1.0",
      Accept: "application/json,text/plain,*/*",
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao resolver arquivo ${fileName}: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const page = Object.values(payload.query?.pages ?? {}).find(
    (candidate) => Array.isArray(candidate.imageinfo) && candidate.imageinfo.length > 0,
  );

  return page?.imageinfo?.[0]?.url ?? null;
}

async function resolveDownloadUrl(monster) {
  if (!monster.imageUrl.includes("fandom.com")) {
    return monster.imageUrl;
  }

  const fileName = extractFandomFileName(monster.imageUrl);
  if (!fileName) {
    return monster.imageUrl;
  }

  const resolvedUrl = await resolveFileUrlFromApi(fileName);
  return resolvedUrl ?? monster.imageUrl;
}

await fs.mkdir(outputDir, { recursive: true });

const slugCounts = new Map();
const manifest = {};
const missingImages = [];

for (const monster of monsters) {
  const baseSlug = slugify(monster.nome);
  const seenCount = (slugCounts.get(baseSlug) ?? 0) + 1;
  slugCounts.set(baseSlug, seenCount);
  const slug = seenCount === 1 ? baseSlug : `${baseSlug}-${seenCount}`;

  const downloadUrl = await resolveDownloadUrl(monster);
  let response = await fetch(downloadUrl, {
    headers: {
      "User-Agent": "DarkLorePortal/1.0",
      Referer: "https://witcher.fandom.com/",
    },
  });

  if (!response.ok && downloadUrl.includes("static.wikia.nocookie.net")) {
    const fileName = extractStaticFileName(downloadUrl);
    if (fileName) {
      const fallbackUrl = await resolveFileUrlFromApi(fileName);
      if (fallbackUrl) {
        response = await fetch(fallbackUrl, {
          headers: {
            "User-Agent": "DarkLorePortal/1.0",
            Referer: "https://witcher.fandom.com/",
          },
        });
      }
    }
  }

  if (!response.ok) {
    missingImages.push({
      monster: monster.nome,
      url: monster.imageUrl,
      status: response.status,
      statusText: response.statusText,
    });
    continue;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const extension = inferExtension(downloadUrl, contentType);
  const relativePath = `/bestiary/${slug}.${extension}`;
  const absolutePath = path.resolve("public", relativePath.slice(1));
  const existingFile = await fs
    .access(absolutePath)
    .then(() => true)
    .catch(() => false);

  if (!existingFile) {
    const arrayBuffer = await response.arrayBuffer();
    await fs.writeFile(absolutePath, Buffer.from(arrayBuffer));
  }
  manifest[slug] = relativePath;
}

const manifestSource = `export const witcherBestiaryImageManifest: Record<string, string> = ${JSON.stringify(
  manifest,
  null,
  2,
)};\n`;

await fs.writeFile(manifestPath, manifestSource);

console.log(`Bestiario sincronizado: ${Object.keys(manifest).length} imagens.`);
if (missingImages.length > 0) {
  console.warn(`Imagens nao resolvidas: ${missingImages.length}`);
  console.warn(JSON.stringify(missingImages, null, 2));
}
