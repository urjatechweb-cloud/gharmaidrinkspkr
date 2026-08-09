# 🚀 Launch Gharmai Drinks on cPanel (Node.js App / Passenger)

cPanel's "Setup Node.js App" runs Node apps under **Phusion Passenger**, which is
different from Netlify/Vercel — it keeps one long-running Node process, and it
**cannot run `next start` directly**. It needs a plain file that listens on the
port Passenger gives it. That file is already in this repo: **`server.js`**.

> If cPanel said *"package.json file is required"*, the file is already in the repo —
> that error almost always means the **Application Root** you set in cPanel doesn't
> point at the exact folder the repo was cloned into (or the repo hasn't been pulled
> into that folder yet). Steps below fix both.

---

## Step 1 — Get the code onto the server
**Option A — cPanel Git Version Control (recommended)**
1. cPanel → **Git™ Version Control** → **Create**.
2. Clone URL: `https://github.com/urjatechweb-cloud/gharmaidrinkspkr.git`
3. Repository Path: pick a folder, e.g. `/home/<user>/gharmaidrinkspkr` — **remember this exact path**, you'll need it in Step 2.
4. Click **Create**, then **Manage** → **Pull or Deploy** to make sure `main` is checked out.

**Option B — Upload manually**
Zip the project (excluding `node_modules` and `.next`) and upload/extract it via **File Manager** into a folder — again, remember the exact path.

## Step 2 — Create the Node.js App
cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|---|---|
| Node.js version | **18.18 or newer** (20 recommended) |
| Application mode | **Production** |
| Application root | the **exact folder from Step 1** (must directly contain `package.json`) |
| Application URL | your domain / subdomain |
| Application startup file | **`server.js`** |

Click **Create**.

## Step 3 — Environment variables
Still on the app's page, scroll to **Environment Variables** and add:

| Key | Value |
|---|---|
| `DATABASE_URL` | your Postgres connection string (see Step 4) |
| `NEXTAUTH_SECRET` | a long random string — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | your live site URL, e.g. `https://gharmaidrinks.com` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `9779746302115` |
| `SEED_ADMIN_EMAIL` | `admin@gharmaidrinks.com` |
| `SEED_ADMIN_PASSWORD` | a strong password |
| `NODE_ENV` | `production` |

Click **Save**.

## Step 4 — Database (PostgreSQL)
SQLite (the local dev database) **will not work** here — cPanel app folders aren't
guaranteed persistent/writable the same way across restarts, and Prisma's SQLite
engine needs a real file path. Use a hosted Postgres instead — the same one used
for Netlify works fine here too since it's just an outbound connection:

1. Create a free database at **https://neon.tech** (or use cPanel's own PostgreSQL
   if your host offers it, under **PostgreSQL Databases**).
2. Copy the connection string into `DATABASE_URL` above.
3. On your own machine, point Prisma at Postgres and push the schema once:
   ```bash
   npm run db:postgres
   DATABASE_URL="<your-connection-string>" npm run db:push
   DATABASE_URL="<your-connection-string>" npm run db:seed
   ```
   This creates the tables and loads the 203 products, brands, ads and admin users.
4. Commit the provider switch (`prisma/schema.prisma` now says `postgresql`) and push:
   ```bash
   git add prisma/schema.prisma && git commit -m "Use PostgreSQL for production" && git push
   ```
   Then re-pull in cPanel (Git Version Control → **Update from Remote** → **Deploy HEAD Commit**).

## Step 5 — Install & build
In cPanel, click **"Run NPM Install"** on the Node.js App page (this is the button
that failed before — it will work now that the Application Root points at the
folder containing `package.json`).

Then open the **terminal** cPanel gives you for the app (the "Enter to the virtual
environment" command shown on the app's page), `cd` into the Application Root, and run:
```bash
npm run build
```
This runs `prisma generate && next build` — it needs `DATABASE_URL` to be set
(cPanel exports the app's configured env vars into that shell).

## Step 6 — Start it
Back in **Setup Node.js App**, click **Restart**. Passenger launches `server.js`,
which boots the same Next.js app Netlify would run — storefront, admin (`/admin`),
and all API routes.

## Step 7 — After launch
- Visit `https://<your-domain>/admin`, log in, and **change the admin password**.
- Product image uploads from the admin need Cloudinary in production (same as the
  Netlify guide) — local `/public/uploads` won't persist across app restarts. Set
  `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` if you want
  in-admin uploads; pasting an image URL always works with no setup.

---

## Redeploying after future changes
```bash
# in cPanel's Git Version Control: Update from Remote → Deploy HEAD Commit
# then in the app's terminal:
npm install
npm run build
# then click "Restart" in Setup Node.js App
```

## Troubleshooting
- **"package.json file is required"** → Application Root doesn't match the folder
  containing `package.json`. Open File Manager, confirm the exact path, and update
  the Node.js App's Application Root to match exactly.
- **App starts but shows a 500 / blank page** → usually `DATABASE_URL` is missing,
  wrong, or the tables haven't been created yet (redo Step 4.3).
- **Login redirects loop / "Unauthorized"** → `NEXTAUTH_URL` must exactly match the
  URL you're visiting (including `https://`), and `NEXTAUTH_SECRET` must be set.
- **Node version errors** → this app needs Node **18.18+** (Next.js 15 requirement);
  pick 20 in the Node.js version dropdown if available.
