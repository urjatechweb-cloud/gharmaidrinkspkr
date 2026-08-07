// Switches the Prisma datasource provider between "sqlite" (local dev) and
// "postgresql" (production / Netlify). Usage: node scripts/set-db-provider.mjs postgresql
import { readFileSync, writeFileSync } from "fs";

const target = (process.argv[2] || "").toLowerCase();
if (!["sqlite", "postgresql"].includes(target)) {
  console.error('Usage: node scripts/set-db-provider.mjs <sqlite|postgresql>');
  process.exit(1);
}

const path = new URL("../prisma/schema.prisma", import.meta.url);
let s = readFileSync(path, "utf8");
s = s.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${target}"`);
writeFileSync(path, s);
console.log(`✔ Prisma datasource provider set to "${target}".`);
console.log(target === "postgresql"
  ? "  → Set DATABASE_URL to your Postgres/Neon connection string, then run: npm run db:push && npm run db:seed"
  : "  → Local SQLite. Run: npm run db:push && npm run db:seed");
