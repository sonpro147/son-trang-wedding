import { createServer } from "node:http";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = path.join(projectRoot, "site");
const uploadsRoot = path.join(siteRoot, "assets", "uploads");
const contentFile = path.join(siteRoot, "data", "default-content.json");
const port = Number(process.env.WEDDING_ADMIN_PORT || 4173);
const maxJsonBytes = 1_500_000;
const maxUploadBytes = 25 * 1024 * 1024;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".png", "image/png"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"],
  [".webp", "image/webp"], [".svg", "image/svg+xml"], [".mp3", "audio/mpeg"],
  [".ogg", "audio/ogg"], [".wav", "audio/wav"], [".m4a", "audio/mp4"]
]);
const extensions = new Map([
  ["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"],
  ["audio/mpeg", ".mp3"], ["audio/ogg", ".ogg"], ["audio/wav", ".wav"],
  ["audio/x-wav", ".wav"], ["audio/mp4", ".m4a"]
]);

function sendJson(response, status, value) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(JSON.stringify(value));
}

function isLocalHost(value = "") {
  const host = value.toLowerCase().replace(/^\[|\]$/g, "").split(":")[0];
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function validateLocalRequest(request, response) {
  if (!isLocalHost(request.headers.host)) {
    sendJson(response, 403, { error: "This editor only accepts connections from this computer." });
    return false;
  }
  const origin = request.headers.origin;
  if (origin) {
    try {
      if (!isLocalHost(new URL(origin).host)) throw new Error("remote origin");
    } catch {
      sendJson(response, 403, { error: "Cross-site requests are not accepted." });
      return false;
    }
  }
  return true;
}

async function readJson(request, limit = maxJsonBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error("Request is too large."), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 });
  }
}

async function handleApi(request, response, url) {
  if (!validateLocalRequest(request, response)) return;

  if (url.pathname === "/api/content" && request.method === "GET") {
    try {
      const content = JSON.parse(await fs.readFile(contentFile, "utf8"));
      sendJson(response, 200, content);
    } catch (error) {
      sendJson(response, 500, { error: `Could not read project content: ${error.message}` });
    }
    return;
  }

  if (url.pathname === "/api/content" && request.method === "PUT") {
    try {
      const content = await readJson(request);
      if (!content || typeof content !== "object" || Array.isArray(content) || !content.couple || !content.gallery) {
        throw Object.assign(new Error("Content file has an unexpected structure."), { status: 400 });
      }
      await fs.mkdir(path.dirname(contentFile), { recursive: true });
      const temporaryFile = `${contentFile}.${randomUUID()}.tmp`;
      await fs.writeFile(temporaryFile, `${JSON.stringify(content, null, 2)}\n`, "utf8");
      await fs.rename(temporaryFile, contentFile);
      sendJson(response, 200, { ok: true, savedAt: new Date().toISOString() });
    } catch (error) {
      sendJson(response, error.status || 500, { error: error.message });
    }
    return;
  }

  if (url.pathname === "/api/upload" && request.method === "POST") {
    try {
      const upload = await readJson(request, Math.ceil(maxUploadBytes * 1.4));
      if (!upload || typeof upload.name !== "string" || typeof upload.type !== "string" || typeof upload.data !== "string") {
        throw Object.assign(new Error("Upload details are incomplete."), { status: 400 });
      }
      const extension = extensions.get(upload.type);
      if (!extension) throw Object.assign(new Error("This file type is not supported."), { status: 415 });
      const bytes = Buffer.from(upload.data, "base64");
      if (!bytes.length || bytes.length > maxUploadBytes) throw Object.assign(new Error("Each file must be smaller than 25 MB."), { status: 413 });

      const folder = upload.folder === "music" ? "music" : "images";
      const filename = `${folder}-${randomUUID()}${extension}`;
      await fs.mkdir(uploadsRoot, { recursive: true });
      await fs.writeFile(path.join(uploadsRoot, filename), bytes, { flag: "wx" });
      sendJson(response, 201, { url: `assets/uploads/${filename}`, name: filename });
    } catch (error) {
      sendJson(response, error.status || 500, { error: error.message });
    }
    return;
  }

  sendJson(response, 404, { error: "Unknown local editor endpoint." });
}

async function handleStatic(request, response, url) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end("Invalid path");
    return;
  }
  if (pathname === "/") pathname = "/index.html";
  if (pathname === "/admin") pathname = "/admin.html";
  const localToolFile = new Map([
    ["/admin.html", "admin.html"], ["/admin.css", "admin.css"], ["/admin.js", "admin.js"]
  ]).get(pathname);
  const isDocsFile = pathname.startsWith("/docs/");
  const root = localToolFile ? path.join(projectRoot, "tools") : isDocsFile ? path.join(projectRoot, "docs") : siteRoot;
  const relativePath = localToolFile ? `/${localToolFile}` : isDocsFile ? pathname.slice("/docs".length) : pathname;
  const file = path.resolve(root, `.${relativePath}`);
  if (!file.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const stat = await fs.stat(file);
    if (!stat.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "content-type": mimeTypes.get(path.extname(file).toLowerCase()) || "application/octet-stream",
      "cache-control": path.extname(file) === ".html" || path.extname(file) === ".json" ? "no-store" : "no-cache",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin"
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
}

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(request, response, url).catch((error) => sendJson(response, 500, { error: error.message }));
  } else {
    handleStatic(request, response, url).catch(() => response.writeHead(500).end("Server error"));
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Local invitation editor: http://127.0.0.1:${port}/admin.html`);
  console.log("Changes are written to this project only. Nothing is pushed or published.");
});
