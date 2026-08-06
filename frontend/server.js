// LumaLab frontend — статический сервер с канонизацией домена.
// Задачи:
//   1) www.lumalab.asia  → 301 → https://lumalab.asia   (тот же путь и query)
//   2) http              → 301 → https                   (за прокси Railway)
//   3) отдать статические файлы из этой папки
// Зависимостей нет — только встроенные модули Node.
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;
const CANONICAL_HOST = "lumalab.asia"; // боевой апекс-домен

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function send(res, status, body, headers) {
  res.writeHead(status, headers || {});
  res.end(body);
}

const server = http.createServer((req, res) => {
  const host = (req.headers.host || "").toLowerCase().split(":")[0];
  // Railway терминирует TLS и проставляет x-forwarded-proto
  const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();

  // --- Канонизация: www → apex и http → https ---
  const needsHostRedirect = host === "www." + CANONICAL_HOST;
  const needsHttps = host === CANONICAL_HOST && proto !== "https";
  if (needsHostRedirect || needsHttps) {
    const location = "https://" + CANONICAL_HOST + req.url;
    return send(res, 301, "", { Location: location, "Cache-Control": "no-store" });
  }

  const parsed = url.parse(req.url);
  let pathname = decodeURIComponent(parsed.pathname);

  // --- Канонизация URL: /index.html → / (одна страница = один адрес) ---
  if (pathname === "/index.html") {
    const q = parsed.search || "";
    return send(res, 301, "", { Location: "/" + q, "Cache-Control": "no-store" });
  }

  // --- Отдача статики ---
  if (pathname.endsWith("/")) pathname += "index.html";

  // Защита от выхода за пределы папки (path traversal)
  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT)) {
    return send(res, 403, "Forbidden");
  }

  fs.stat(filePath, (err, stat) => {
    if (err || stat.isDirectory()) {
      // Неизвестный путь → отдаём offline/404 главной страницей 404-кодом
      const notFound = path.join(ROOT, "index.html");
      return fs.readFile(notFound, (e2, buf) => {
        if (e2) return send(res, 404, "Not found");
        send(res, 404, buf, { "Content-Type": MIME[".html"] });
      });
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    // HTML не кэшируем долго (чтобы обновления доходили), ассеты — кэшируем.
    const cache = ext === ".html"
      ? "no-cache"
      : "public, max-age=86400";
    fs.readFile(filePath, (e3, buf) => {
      if (e3) return send(res, 500, "Server error");
      send(res, 200, buf, { "Content-Type": type, "Cache-Control": cache });
    });
  });
});

server.listen(PORT, () => {
  console.log(`[lumalab] serving ${ROOT} on :${PORT}, canonical https://${CANONICAL_HOST}`);
});
