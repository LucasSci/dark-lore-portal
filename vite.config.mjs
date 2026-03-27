import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PREVIEW_PORT = Number(process.env.PORT ?? 8080);
const PREVIEW_HOST = process.env.HOST ?? "0.0.0.0";
const LOCAL_WITCHER_TILE_PREFIX = "/local-witcher3map";
const LOCAL_WITCHER_TILE_SOURCE = (() => {
  const vendored = path.resolve(__dirname, "assets/witcher3map-maps-master");
  if (fs.existsSync(vendored)) return vendored;
  return path.resolve(__dirname, ".codex_tmp/witcher3map-maps-master");
})();
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

export default defineConfig(() => ({
  server: {
    host: PREVIEW_HOST,
    port: PREVIEW_PORT,
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: PREVIEW_HOST,
    port: PREVIEW_PORT,
    strictPort: true,
  },
  plugins: [react(), witcherLocalTilesPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.split(path.sep).join("/");

          if (!normalizedId.includes("/node_modules/")) {
            return undefined;
          }

          if (
            normalizedId.includes("/node_modules/react/") ||
            normalizedId.includes("/node_modules/react-dom/") ||
            normalizedId.includes("/node_modules/react-router/") ||
            normalizedId.includes("/node_modules/react-router-dom/") ||
            normalizedId.includes("/node_modules/@tanstack/")
          ) {
            return "react-vendor";
          }

          if (
            normalizedId.includes("/node_modules/@radix-ui/") ||
            normalizedId.includes("/node_modules/cmdk/") ||
            normalizedId.includes("/node_modules/vaul/") ||
            normalizedId.includes("/node_modules/input-otp/")
          ) {
            return "ui-vendor";
          }

          if (
            normalizedId.includes("/node_modules/leaflet/") ||
            normalizedId.includes("/node_modules/react-resizable-panels/")
          ) {
            return "maps-vendor";
          }

          if (
            normalizedId.includes("/node_modules/framer-motion/") ||
            normalizedId.includes("/node_modules/gsap/")
          ) {
            return "motion-vendor";
          }

          if (normalizedId.includes("/node_modules/@supabase/")) {
            return "supabase-vendor";
          }

          if (normalizedId.includes("/node_modules/recharts/")) {
            return "charts-vendor";
          }

          return undefined;
        },
      },
    },
  },
}));
