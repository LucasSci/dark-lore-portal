import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "127.0.0.1";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendNotBuilt(response) {
  response.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(
    "A pasta dist nao existe. Rode um build antes de iniciar o servidor estatico.",
  );
}

function sendFile(filePath, response) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Arquivo nao encontrado.");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=3600",
    });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  if (!fs.existsSync(distDir)) {
    sendNotBuilt(response);
    return;
  }

  const pathname = decodeURIComponent(new URL(request.url || "/", `http://${host}:${port}`).pathname);
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const requestedPath = path.normalize(path.join(distDir, safePath));

  if (!requestedPath.startsWith(distDir)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Acesso negado.");
    return;
  }

  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
    sendFile(requestedPath, response);
    return;
  }

  sendFile(path.join(distDir, "index.html"), response);
});

server.listen(port, host, () => {
  console.log(`Dark Lore Portal disponivel em http://${host}:${port}`);
});
