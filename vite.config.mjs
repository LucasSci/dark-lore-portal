import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_WITCHER_TILE_PREFIX = "/local-witcher3map";
const LOCAL_WITCHER_TILE_SOURCE = path.resolve(__dirname, ".codex_tmp/witcher3map-maps-master");
const LOCAL_WITCHER_TILE_FOLDERS = [
  "velen",
  "hos_velen",
  "skellige",
  "kaer_morhen",
  "toussaint",
  "white_orchard",
];

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

async function copyDirectorySubset(sourceDir, targetDir, folderNames) {
  await fsp.rm(targetDir, { recursive: true, force: true });
  await fsp.mkdir(targetDir, { recursive: true });

  for (const folderName of folderNames) {
    const sourcePath = path.join(sourceDir, folderName);
    const targetPath = path.join(targetDir, folderName);

    if (!fs.existsSync(sourcePath)) {
      continue;
    }

    await fsp.cp(sourcePath, targetPath, { recursive: true });
  }
}

function witcherLocalTilesPlugin() {
  return {
    name: "witcher-local-tiles",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url?.split("?")[0] ?? "";

        if (!rawUrl.startsWith(LOCAL_WITCHER_TILE_PREFIX)) {
          next();
          return;
        }

        const relativePath = decodeURIComponent(rawUrl.slice(LOCAL_WITCHER_TILE_PREFIX.length)).replace(/^[/\\]+/, "");
        const filePath = path.resolve(LOCAL_WITCHER_TILE_SOURCE, relativePath);

        if (!filePath.startsWith(LOCAL_WITCHER_TILE_SOURCE) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          res.statusCode = 404;
          res.end("Tile nao encontrado.");
          return;
        }

        res.setHeader("Content-Type", getContentType(filePath));
        fs.createReadStream(filePath).pipe(res);
      });
    },
    async writeBundle() {
      if (!fs.existsSync(LOCAL_WITCHER_TILE_SOURCE)) {
        return;
      }

      const outDir = path.resolve(__dirname, "dist", LOCAL_WITCHER_TILE_PREFIX.replace(/^\//, ""));
      await copyDirectorySubset(LOCAL_WITCHER_TILE_SOURCE, outDir, LOCAL_WITCHER_TILE_FOLDERS);
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), witcherLocalTilesPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
