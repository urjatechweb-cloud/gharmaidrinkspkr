# 🚀 Launch Gharmai Drinks on Netlify

The site is a full Next.js app (server rendering, API routes, admin, database), so it
deploys as a Netlify **site with functions** using the official Next.js runtime.

> ⚠️ **Database:** Netlify servers are stateless — the local `dev.db` SQLite file will **not**
> save data there. For a real launch you need a hosted **PostgreSQL** database. A free
> **Neon** database takes 2 minutes and is all you need.

---

## Step 1 — Create a free database (Neon)
1. Go to **https://neon.tech** → sign up → **Create project** (name it `gharmai`).
2. Copy the **connection string** (looks like
   `postgresql://user:pass@ep-xxxx.neon.tech/gharmai?sslmode=require`).

## Step 2 — Point the app at PostgreSQL (one command, locally)
```bash
cd gharmai-platform
npm run db:postgres        # switches prisma schema provider to postgresql
```
Put the Neon string in a local `.env` and create + seed the tables **once**:
```bash
echo 'DATABASE_URL="<your-neon-connection-string>"' > .env.prod
DATABASE_URL="<your-neon-connection-string>" npm run db:push
DATABASE_URL="<your-neon-connection-string>" npm run db:seed
```
This fills the live database with the 203 products, brands, ads, coupons and admin users.

## Step 3 — Push the code to GitHub
```bash
git init && git add . && git commit -m "Gharmai Drinks — launch"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 4 — Create the Netlify site
1. **netlify.com** → **Add new site → Import an existing project** → pick the repo.
2. Build settings are auto-detected from `netlify.toml` (command `npm run build`, Next.js plugin). Leave as-is.
3. Add **Environment variables** (Site settings → Environment variables):

| Key | Value |
|-----|-------|
| `DATABASE_URL` | your Neon connection string |
| `NEXTAUTH_SECRET` | a long random string — run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | your live URL, e.g. `https://gharmaidrinks.netlify.app` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `9779746302115` (your WhatsApp, country code, no +) |
| `SEED_ADMIN_EMAIL` | `admin@gharmaidrinks.com` |
| `SEED_ADMIN_PASSWORD` | a strong password |

4. Click **Deploy**. Done — your storefront is live, and the admin is at `/admin`.

## Step 5 — After the first deploy
- Log in at `https://<your-site>/admin` and **change the admin password**.
- Update `NEXTAUTH_URL` to your final custom domain if you add one, then redeploy.

---

## Product images / uploads on Netlify
Local uploads save to `/public/uploads`, which **won't persist** on Netlify. For image
uploads from the admin in production, add a free **Cloudinary** account and set these env vars
(the media API auto-routes to Cloudinary when they exist):
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
Pasting image **URLs** in the admin works with no setup.

## Switching back to local dev
```bash
npm run db:sqlite          # back to zero-config local SQLite
npm run db:reset           # rebuild + reseed the local dev.db
npm run dev
```

## Common issues
- **Build blocked "Next.js security vulnerability"** → already fixed (Next 15.5.19). Keep it updated.
- **"Unauthorized" / login loops** → `NEXTAUTH_URL` must exactly match the live URL, and `NEXTAUTH_SECRET` must be set.
- **Empty storefront** → the database wasn't seeded (run Step 2) or `DATABASE_URL` is wrong.
