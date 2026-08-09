// ============================================================
// cPanel / Phusion Passenger entrypoint.
//
// cPanel's "Setup Node.js App" hosts Node apps under Passenger, which cannot
// run `next start` directly — it needs a plain Node file that listens on
// process.env.PORT (Passenger sets this for you). This file boots the same
// compiled Next.js app (storefront + admin + API routes) that `next build`
// produces, so nothing else about the project changes.
//
// In cPanel: Setup Node.js App → Application startup file → server.js
// ============================================================
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// Passenger sets NODE_ENV itself in most configurations; default to
// production here since this file's only job is serving the built app.
const dev = process.env.NODE_ENV === "development";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT) || 3470;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Gharmai Drinks ready on port ${port} (${dev ? "development" : "production"})`);
  });
}).catch((err) => {
  console.error("Failed to start Gharmai Drinks server:", err);
  process.exit(1);
});
