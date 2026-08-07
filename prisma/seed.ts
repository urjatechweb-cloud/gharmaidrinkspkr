import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ---------- Categories (matches the owner's rate list) ----------
const CATS = [
  { name: "Beer", slug: "beer" },
  { name: "Domestic Whisky", slug: "whisky-domestic" },
  { name: "Imported Whisky", slug: "whisky-imported" },
  { name: "Single Malt", slug: "single-malt" },
  { name: "Vodka", slug: "vodka" },
  { name: "Gin", slug: "gin" },
  { name: "Rum", slug: "rum" },
  { name: "Wine", slug: "wine" },
  { name: "Mixers & More", slug: "mixers" },
  { name: "Food", slug: "food" },
];

// ---------- Brand houses (Brand Spotlight) ----------
const BRANDS = [
  { name: "Johnnie Walker", tagline: "Keep Walking.", accent: "#D4AF37", match: /johnnie|blue label|gold label|green label|double black|black label|red label/i, description: "The world's most iconic Scotch whisky house, striding forward since 1820.", banner: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1200" },
  { name: "Jack Daniel's", tagline: "Every day we make it, we'll make it the best we can.", accent: "#8B5A2B", match: /jack daniel/i, description: "Tennessee whiskey, charcoal-mellowed drop by drop since 1866.", banner: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=1200" },
  { name: "Glenfiddich", tagline: "Where Next.", accent: "#A67C00", match: /glenfiddich/i, description: "The world's most awarded single malt Scotch whisky, from Speyside.", banner: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=1200" },
  { name: "Jameson", tagline: "Widen the Circle.", accent: "#2E7D32", match: /jameson/i, description: "Smooth triple-distilled Irish whiskey enjoyed the world over.", banner: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200" },
  { name: "Grey Goose", tagline: "Fly Beyond.", accent: "#9CA3AF", match: /grey goose/i, description: "World-class French vodka, distilled from the finest ingredients.", banner: "https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=1200" },
  { name: "Hennessy", tagline: "Never Stop. Never Settle.", accent: "#B8860B", match: /hennessy/i, description: "The world's best-selling cognac, crafted in France for over 250 years.", banner: "https://images.unsplash.com/photo-1569924995012-c4c706bfcd51?w=1200" },
];

// ---------- Food & mixers (kept from the food menu) ----------
const EXTRAS = [
  { name: "Classic Chicken Wings", cat: "food", price: 450, badge: "POPULAR", featured: true, img: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600", desc: "Crispy wings tossed in house sauce." },
  { name: "Loaded Nachos", cat: "food", price: 350, badge: "NONE", img: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600", desc: "Tortilla chips, cheese & salsa." },
  { name: "Smash Burger", cat: "food", price: 450, badge: "NONE", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600", desc: "Double patty, cheese, special sauce." },
  { name: "Chicken Momo (10pc)", cat: "food", price: 250, badge: "POPULAR", img: "https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=600", desc: "Nepali classic, steamed fresh." },
  { name: "Sekuwa Platter", cat: "food", price: 600, badge: "NONE", img: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600", desc: "Char-grilled BBQ platter." },
  { name: "French Fries", cat: "food", price: 200, badge: "NONE", img: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600", desc: "Golden and crispy." },
  { name: "Late Night Food Box", cat: "food", price: 799, badge: "LIMITED", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600", desc: "Wings + fries + momo + dips combo." },
  { name: "Red Bull Energy 250ml", cat: "mixers", price: 200, badge: "NONE", img: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=600", desc: "Energy drink mixer." },
  { name: "Tonic Water 500ml", cat: "mixers", price: 150, badge: "NONE", img: "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=600", desc: "Mixer for gin & more." },
  { name: "Ice Pack (2kg)", cat: "mixers", price: 100, badge: "VALUE", img: "https://images.unsplash.com/photo-1497534547324-0ebb3f052e88?w=600", desc: "Party essential — keep it chilled." },
];

const CAT_DESC: Record<string, string> = {
  beer: "Chilled and ready to pour.",
  "whisky-domestic": "Nepal's favourite pours at honest prices.",
  "whisky-imported": "World-class labels, delivered to your door.",
  "single-malt": "Aged, rare and remarkable single malts.",
  vodka: "Crisp, clean and party-ready.",
  gin: "Botanical spirits for the perfect G&T.",
  rum: "Dark, spiced and smooth classics.",
  wine: "Reds, whites and sparkling for every table.",
};

async function main() {
  console.log("🌱 Seeding Gharmai Drinks…");

  // ----- Admin users -----
  const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!", 10);
  for (const [name, email, role] of [
    ["Super Admin", process.env.SEED_ADMIN_EMAIL || "admin@gharmaidrinks.com", "SUPER_ADMIN"],
    ["Content Editor", "editor@gharmaidrinks.com", "CONTENT_EDITOR"],
    ["Order Manager", "orders@gharmaidrinks.com", "ORDER_MANAGER"],
  ]) {
    await prisma.adminUser.upsert({ where: { email }, update: {}, create: { name, email, password, role } });
  }

  // ----- Categories -----
  const catMap: Record<string, string> = {};
  for (const [i, c] of CATS.entries()) {
    const cat = await prisma.category.upsert({ where: { slug: c.slug }, update: { sortOrder: i }, create: { name: c.name, slug: c.slug, sortOrder: i } });
    catMap[c.slug] = cat.id;
  }

  // ----- Brands -----
  const brandRows: { id: string; match: RegExp }[] = [];
  for (const [i, b] of BRANDS.entries()) {
    const brand = await prisma.brand.upsert({
      where: { slug: slug(b.name) },
      update: { sortOrder: i },
      create: { name: b.name, slug: slug(b.name), tagline: b.tagline, accent: b.accent, description: b.description, bannerImage: b.banner, linkUrl: "#menu", featured: true, sortOrder: i },
    });
    brandRows.push({ id: brand.id, match: b.match });
  }

  // ----- Real catalog from rate list.xlsx -----
  const catalogPath = path.join(__dirname, "catalog.json");
  const catalog: { name: string; baseName: string; size: string; price: number; cat: string; image: string; luxury: boolean; badge: string }[] =
    JSON.parse(fs.readFileSync(catalogPath, "utf8"));

  let created = 0;
  for (const [i, p] of catalog.entries()) {
    const brand = brandRows.find((b) => b.match.test(p.name));
    const featured = /black label 750|jack daniel's 750|glenfiddich 12 years 750|chivas 750|absolut vodka 750|jameson irish whisky 750|corona/i.test(p.name);
    await prisma.product.upsert({
      where: { slug: slug(p.name) },
      update: { price: p.price, images: JSON.stringify([p.image]) }, // re-running seed refreshes prices + images from the sheet
      create: {
        name: p.name,
        slug: slug(p.name),
        description: `${p.baseName}${p.size ? ` — ${p.size}` : ""}. ${CAT_DESC[p.cat] ?? ""}`.trim(),
        price: p.price,
        images: JSON.stringify([p.image]),
        badge: p.badge,
        luxury: p.luxury,
        featured,
        brandId: brand?.id ?? null,
        sortOrder: i,
        categoryId: catMap[p.cat],
        metaTitle: `${p.name} price in Pokhara | Gharmai Drinks`,
        metaDescription: `Order ${p.name} online in Pokhara for Rs. ${p.price.toLocaleString()}. Delivered to your door 2 PM – 3 AM.`,
      },
    });
    created++;
  }

  // ----- Food & mixers -----
  for (const [i, p] of EXTRAS.entries()) {
    await prisma.product.upsert({
      where: { slug: slug(p.name) },
      update: {},
      create: {
        name: p.name, slug: slug(p.name), description: p.desc, price: p.price,
        images: JSON.stringify([p.img]), badge: p.badge, featured: (p as any).featured ?? false,
        sortOrder: 1000 + i, categoryId: catMap[p.cat],
      },
    });
  }

  // ----- Banners / ads -----
  const now = new Date();
  const banners = [
    { title: "Hero — Weekend Whiskey Sale", headline: "Weekend Whiskey Sale", subtext: "Up to 20% off premium imports", buttonLabel: "Shop Whiskey", linkUrl: "#menu", placement: "HERO", priority: 10, mediaUrl: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1200" },
    { title: "Top Bar — Free Delivery", headline: "🚚 Free delivery on orders above Rs. 2,000 — every day till 3 AM!", placement: "TOP_BAR", priority: 5 },
    { title: "Mid-Page — Party Box Campaign", headline: "Throwing a Party?", subtext: "Build your own party box and save big", buttonLabel: "Build Box", linkUrl: "#specials", placement: "MID_PAGE", mediaUrl: "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=1200" },
    { title: "Popup — First Order Offer", headline: "Get 10% Off Your First Order", subtext: "Use code WELCOME10 at checkout", buttonLabel: "Order Now", linkUrl: "#menu", placement: "POPUP", frequency: "once_per_session" },
  ];
  for (const b of banners) {
    const exists = await prisma.bannerAd.findFirst({ where: { title: b.title } });
    if (!exists) await prisma.bannerAd.create({ data: { ...b, startAt: now } as any });
  }

  // ----- Promotions -----
  for (const pr of [
    { code: "WELCOME10", description: "10% off your first order", type: "PERCENT", value: 10, minOrder: 1000 },
    { code: "FREEDEL", description: "Free delivery", type: "FIXED", value: 100, minOrder: 1500 },
    { code: "PARTY500", description: "Rs.500 off orders above Rs.5000", type: "FIXED", value: 500, minOrder: 5000 },
  ]) {
    await prisma.promotion.upsert({ where: { code: pr.code }, update: {}, create: pr as any });
  }

  // ----- Testimonials -----
  for (const [i, t] of [
    { name: "Rajesh K.", role: "VIP Gold Member", body: "Fastest delivery in Pokhara! Ordered Black Label at 11 PM, arrived in 20 minutes.", rating: 5 },
    { name: "Suman P.", role: "Regular Customer", body: "The Late Night Box saved our house party. Everything in one delivery!", rating: 5 },
    { name: "Anita G.", role: "Party Host", body: "Best prices for imported whisky in town. Genuine sealed bottles, every time.", rating: 5 },
  ].entries()) {
    const exists = await prisma.testimonial.findFirst({ where: { name: t.name } });
    if (!exists) await prisma.testimonial.create({ data: { ...t, sortOrder: i } });
  }

  // ----- Site settings (homepage content + section toggles) -----
  const defaults = {
    heroBadge: "Delivering 2 PM – 3 AM Daily",
    menuTitle: "Our Menu",
    menuSubtitle: "Browse the full catalog of active products",
    reserveTitle: "The Reserve",
    reserveSubtitle: "Rare imports, single malts & limited editions",
    showSpecials: true, showVip: true, showWhyUs: true, showHowItWorks: true,
    showContact: true, showBrands: true, showReserve: true,
  };
  await prisma.siteSetting.upsert({
    where: { key: "homepage" },
    update: {},
    create: { key: "homepage", value: JSON.stringify(defaults) },
  });

  console.log(`✅ Seed complete: ${created} catalog products + ${EXTRAS.length} food/mixers, ${BRANDS.length} brands.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
