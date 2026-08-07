"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CartProvider, useCart } from "./CartContext";
import ThemeToggle from "./ThemeToggle";
import BeerBackground from "./BeerBackground";
import Captcha from "./Captcha";

// ---------- Types ----------
export type Product = {
  id: string; slug: string; name: string; price: number; compareAt?: number | null;
  images: string[]; badge: string; sponsored: boolean; luxury?: boolean; description: string;
  category: { name: string; slug: string };
  brand?: { name: string; accent?: string } | null;
};
export type Brand = {
  id: string; name: string; logo?: string | null; bannerImage?: string | null;
  tagline?: string | null; description: string; accent: string; linkUrl?: string | null;
};
export type Banner = {
  id: string; title: string; headline?: string | null; subtext?: string | null;
  buttonLabel?: string | null; linkUrl?: string | null; mediaUrl?: string | null;
  placement: string; frequency?: string | null; endAt?: string | null;
};
export type Testimonial = { id: string; name: string; role: string; body: string; rating: number };
export type Cat = { name: string; slug: string };

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779746302115";
const FREE_DELIVERY_MIN = 2000;
const DELIVERY_FEE = 100;
const NPR = (n: number) => "Rs. " + n.toLocaleString();

function track(id: string, type: "impression" | "click") {
  fetch("/api/banners/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, type }) }).catch(() => {});
}

export type Settings = {
  heroBadge: string; menuTitle: string; menuSubtitle: string;
  reserveTitle: string; reserveSubtitle: string;
  showSpecials: boolean; showVip: boolean; showWhyUs: boolean; showHowItWorks: boolean;
  showContact: boolean; showBrands: boolean; showReserve: boolean;
};

// ============================================================
export default function StoreClient(props: {
  products: Product[]; banners: Banner[]; testimonials: Testimonial[]; categories: Cat[]; brands: Brand[]; settings: Settings;
}) {
  return (
    <CartProvider>
      <Store {...props} />
    </CartProvider>
  );
}

function Store({ products, banners, testimonials, categories, brands, settings }: {
  products: Product[]; banners: Banner[]; testimonials: Testimonial[]; categories: Cat[]; brands: Brand[]; settings: Settings;
}) {
  // null = unknown (avoids a flash of content before the age check resolves)
  const [verified, setVerified] = useState<boolean | null>(null);
  useEffect(() => {
    setVerified(localStorage.getItem("gharmai_age_verified") === "true");
    try { document.documentElement.classList.toggle("light", localStorage.getItem("gharmai_theme") === "light"); } catch {}
  }, []);

  const byPlacement = (p: string) => banners.filter((b) => b.placement === p);
  const luxury = products.filter((p) => p.luxury);

  if (verified === null) return <div className="min-h-screen bg-dark" />;

  return (
    <>
      {!verified && <AgeGate onVerify={() => setVerified(true)} />}
      {verified && (
        <>
          <BeerBackground />
          <TopBar banner={byPlacement("TOP_BAR")[0]} />
          <Navbar />
          <Hero banners={byPlacement("HERO")} heroBadge={settings.heroBadge} />
          {settings.showBrands && brands.length > 0 && <BrandSpotlight brands={brands} />}
          {settings.showReserve && luxury.length > 0 && <LuxurySection products={luxury} title={settings.reserveTitle} subtitle={settings.reserveSubtitle} />}
          <Menu products={products} categories={categories} title={settings.menuTitle} subtitle={settings.menuSubtitle} />
          <MidBanner banner={byPlacement("MID_PAGE")[0]} />
          {settings.showSpecials && <Specials />}
          {settings.showVip && <Vip />}
          {settings.showWhyUs && <WhyUs />}
          <Reviews testimonials={testimonials} />
          {settings.showHowItWorks && <HowItWorks />}
          <CtaBanner />
          {settings.showContact && <Contact />}
          <Footer />
          <CartDrawer />
          <WhatsAppFloat />
          <MobileNav />
          <Popup banner={byPlacement("POPUP")[0]} />
          <ToastHost />
        </>
      )}
    </>
  );
}

// ---------- Brand Spotlight (admin-managed "different brands" ad panel) ----------
export function BrandSpotlight({ brands }: { brands: Brand[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (brands.length > 1) {
      const t = setInterval(() => setI((x) => (x + 1) % brands.length), 4500);
      return () => clearInterval(t);
    }
  }, [brands]);
  const b = brands[i];
  if (!b) return null;
  return (
    <section id="brands" className="py-16 sm:py-20 relative overflow-hidden border-y border-white/10">
      <div className="absolute inset-0 transition-colors duration-700" style={{ background: `radial-gradient(circle at 30% 50%, ${b.accent}18, transparent 60%)` }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/10 text-white/80 text-sm mb-3">Featured House</span>
          <h2 className="text-3xl sm:text-4xl font-display font-black">Brand <span className="gold-text">Spotlight</span></h2>
        </Reveal>

        {/* Spotlight stage */}
        <div className="grid lg:grid-cols-2 gap-8 items-center glass rounded-3xl overflow-hidden border border-white/10 mb-8">
          <div className="relative h-64 lg:h-80 overflow-hidden">
            {b.bannerImage
              ? <img src={b.bannerImage} alt={b.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${b.accent}, #0A0A0A)` }} />}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-card/80 lg:to-dark-card" />
          </div>
          <div className="p-8 lg:p-10">
            {b.logo
              ? <img src={b.logo} alt={b.name} className="h-12 w-auto mb-4 object-contain" />
              : <div className="font-display text-2xl font-black mb-3" style={{ color: b.accent }}>{b.name}</div>}
            {b.tagline && <h3 className="text-2xl sm:text-3xl font-display font-bold mb-3">{b.tagline}</h3>}
            <p className="text-white/75 mb-6 leading-relaxed">{b.description}</p>
            <a href={(b.linkUrl && b.linkUrl !== "#menu") ? b.linkUrl : "/menu"} className="inline-flex px-7 py-3 rounded-full font-bold text-[#0a0a0a] transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${b.accent}, ${b.accent}cc)` }}>
              Shop {b.name}
            </a>
          </div>
        </div>

        {/* Brand logo strip — click to switch */}
        <div className="flex flex-wrap justify-center gap-3">
          {brands.map((br, x) => (
            <button key={br.id} onClick={() => setI(x)}
              className={`px-5 py-3 rounded-2xl border transition-all ${x === i ? "border-gold/40 bg-gold/5" : "border-white/15 bg-white/[0.06] hover:border-white/20"}`}>
              {br.logo
                ? <img src={br.logo} alt={br.name} className="h-6 w-auto object-contain opacity-80" />
                : <span className="font-display font-bold text-sm" style={{ color: x === i ? br.accent : "rgba(255,255,255,.6)" }}>{br.name}</span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Premium Luxury Liquor section ----------
export function LuxurySection({ products, title, subtitle }: { products: Product[]; title: string; subtitle: string }) {
  const { add } = useCart();
  return (
    <section id="reserve" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-darker via-[#0d0b06] to-darker" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gold/8 rounded-full blur-[200px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-gold/15 to-transparent border border-gold/30 text-gold text-sm font-medium mb-5 tracking-widest uppercase">✦ {title} ✦</span>
          <h2 className="text-4xl sm:text-6xl font-display font-black mb-4">Premium <span className="gold-text">Luxury</span> Collection</h2>
          <p className="text-white/85 text-lg max-w-2xl mx-auto">{subtitle} — curated for those who appreciate the finest pour.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, idx) => (
            <Reveal key={p.id} delay={idx * 0.08}>
              <div className="group relative rounded-3xl overflow-hidden border border-gold/15 bg-gradient-to-b from-white/[0.04] to-transparent h-full">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(212,175,55,.12), transparent 70%)" }} />
                <a href={`/product/${p.slug}`} className="block relative h-72 overflow-hidden">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.2s]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/20 to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold text-[#0a0a0a] text-[10px] font-bold uppercase tracking-wider">{p.badge !== "NONE" ? p.badge : "Reserve"}</span>
                </a>
                <div className="p-7 relative">
                  {p.brand?.name && <div className="text-gold/70 text-xs uppercase tracking-[0.2em] mb-1">{p.brand.name}</div>}
                  <a href={`/product/${p.slug}`} className="block font-display font-bold text-xl mb-2 hover:text-gold transition-colors">{p.name}</a>
                  <p className="text-white/85 text-sm mb-5 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display font-black text-2xl gold-text">{NPR(p.price)}</span>
                      {p.compareAt && <span className="text-white/80 line-through text-sm ml-2">{NPR(p.compareAt)}</span>}
                    </div>
                    <button onClick={() => add({ id: p.id, productId: p.id, name: p.name, price: p.price, image: p.images[0] })}
                      className="px-5 py-2.5 rounded-full bg-gold/10 border border-gold/30 text-gold font-semibold text-sm hover:bg-gold hover:text-[#0a0a0a] transition-all">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Age Gate ----------
function AgeGate({ onVerify }: { onVerify: () => void }) {
  const [denied, setDenied] = useState(false);
  if (denied)
    return (
      <div className="fixed inset-0 z-[9999] bg-dark flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-3xl font-display font-bold mb-3">Sorry!</h2>
          <p className="text-white/75">You must be 18 or older to access Gharmai Drinks.</p>
        </div>
      </div>
    );
  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <Image src="/logo.png" alt="Gharmai Drinks" width={160} height={90} className="mx-auto mb-8" />
        <h2 className="text-3xl font-display font-bold mb-3">Age Verification</h2>
        <p className="text-white/75 mb-8">You must be 18 years or older to view products and prices. Please confirm your age. Drink responsibly.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => { localStorage.setItem("gharmai_age_verified", "true"); onVerify(); }} className="px-10 py-3.5 btn-gold rounded-full text-lg">I'm 18+</button>
          <button onClick={() => setDenied(true)} className="px-10 py-3.5 rounded-full border border-white/20 text-white/80 hover:border-accent hover:text-accent transition-all">Under 18</button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------- Top Promo Bar ----------
function TopBar({ banner }: { banner?: Banner }) {
  const [show, setShow] = useState(true);
  useEffect(() => { if (banner) track(banner.id, "impression"); }, [banner]);
  if (!banner || !show) return null;
  return (
    <div className="relative z-[55] bg-gradient-to-r from-gold-dark via-gold to-gold-dark text-[#0a0a0a] text-center text-sm font-semibold py-2 px-10">
      <span>{banner.headline}</span>
      <button onClick={() => setShow(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0a0a0a]/60 hover:text-[#0a0a0a]">✕</button>
    </div>
  );
}

// ---------- Navbar ----------
function Navbar() {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [["Home", "/"], ["Menu", "/menu"], ["Reserve", "/reserve"], ["Brands", "/brands"], ["Deals", "/specials"], ["VIP", "/vip"], ["About", "/about"], ["Contact", "/contact"]];
  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-darker/90 backdrop-blur-xl border-b border-white/10" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <a href="/"><Image src="/logo.png" alt="Gharmai Drinks" width={130} height={56} className="h-14 w-auto" style={{ width: "auto" }} /></a>
        <div className="hidden lg:flex items-center gap-8">
          {links.map(([l, h]) => <a key={h} href={h} className="text-white/80 hover:text-gold text-sm font-medium transition-colors">{l}</a>)}
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin" title="Admin Panel" aria-label="Admin Panel" className="hidden sm:flex w-11 h-11 rounded-xl bg-white/[0.08] border border-white/10 items-center justify-center hover:border-gold/40 hover:text-gold transition-all text-lg">⚙️</a>
          <ThemeToggle />
          <button onClick={() => setOpen(true)} className="relative w-11 h-11 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center hover:border-gold/30 transition-all">
            🛍️
            {count > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent rounded-full text-[10px] font-bold flex items-center justify-center">{count}</span>}
          </button>
          <a href="/menu" className="hidden sm:inline-flex px-6 py-2.5 btn-gold rounded-full text-sm">Order Now</a>
          <button onClick={() => setMobOpen(!mobOpen)} className="lg:hidden w-11 h-11 flex items-center justify-center text-2xl">{mobOpen ? "✕" : "☰"}</button>
        </div>
      </div>
      <AnimatePresence>
        {mobOpen && (
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="lg:hidden fixed inset-0 top-20 bg-darker/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-7">
            {links.map(([l, h]) => <a key={h} href={h} onClick={() => setMobOpen(false)} className="text-2xl font-display font-bold text-white/85 hover:text-gold">{l}</a>)}
            <a href="/admin" onClick={() => setMobOpen(false)} className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gold/30 text-gold font-semibold">⚙️ Admin Panel</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ---------- Hero (with admin-managed banner carousel) ----------
function Hero({ banners, heroBadge }: { banners: Banner[]; heroBadge: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    banners.forEach((b) => track(b.id, "impression"));
    if (banners.length > 1) {
      const t = setInterval(() => setI((x) => (x + 1) % banners.length), 5000);
      return () => clearInterval(t);
    }
  }, [banners]);
  const active = banners[i];
  return (
    <section id="home" className="relative min-h-[88vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-darker via-dark to-darker" />
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[130px]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 items-center py-20">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/8 border border-gold/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-sm font-medium">{heroBadge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-tight mb-6">
            <span className="block">{active?.headline || "Premium Drinks"}</span>
            <span className="block gold-text">Delivered To Your Door</span>
            <span className="block">Until <span className="text-accent">3 AM</span></span>
          </h1>
          <p className="text-white/85 text-lg max-w-xl mb-8">{active?.subtext || "Imported Whiskey, Scotch, Wine, Beer, Vodka, Rum, Food Combos & Exclusive VIP Benefits — delivered to your doorstep."}</p>
          <div className="flex flex-wrap gap-3">
            <a href={active?.linkUrl || "#menu"} onClick={() => active && track(active.id, "click")} className="px-7 py-3.5 btn-gold rounded-full">{active?.buttonLabel || "Order Now"}</a>
            <a href="#vip" className="px-7 py-3.5 rounded-full border border-gold/30 text-gold font-semibold hover:bg-gold/10 transition-all">Become VIP</a>
          </div>
          {banners.length > 1 && (
            <div className="flex gap-2 mt-8">
              {banners.map((_, x) => <button key={x} onClick={() => setI(x)} className={`h-1.5 rounded-full transition-all ${x === i ? "w-8 bg-gold" : "w-2 bg-white/20"}`} />)}
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }} className="relative hidden lg:block">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 blur-[80px] scale-75" />
          <div className="relative rounded-3xl overflow-hidden border border-white/10">
            <img src={active?.mediaUrl || "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&h=700&fit=crop"} alt="" className="w-full h-[500px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-darker to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- Marquee ----------
function Marquee() {
  const cats = ["WHISKEY", "SCOTCH", "WINE", "BEER", "VODKA", "RUM", "BRANDY", "GIN", "TEQUILA", "FOOD"];
  const row = [...cats, ...cats];
  return (
    <section className="py-6 bg-surface border-y border-white/10 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {row.map((c, i) => (
          <span key={i} className="flex items-center gap-10 mx-5 text-white/75 font-display font-bold text-lg">{c}<span className="text-gold/30 text-xs">◆</span></span>
        ))}
      </div>
    </section>
  );
}

// ---------- Menu with filter + search + sponsored cards ----------
export function Menu({ products, categories, title, subtitle }: { products: Product[]; categories: Cat[]; title: string; subtitle: string }) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(0); // 0 = any
  const { add } = useCart();

  const priceCeil = useMemo(() => Math.max(1000, ...products.map((p) => p.price)), [products]);
  const topCats = categories.filter((c) => !c.slug.includes("-"));

  const filtered = useMemo(() => {
    let list = products;
    if (cat !== "all") list = list.filter((p) => p.category.slug === cat || p.category.slug.startsWith(cat + "-"));
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase()));
    if (maxPrice > 0) list = list.filter((p) => p.price <= maxPrice);
    const arr = [...list];
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    else if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [products, cat, q, sort, maxPrice]);

  const countFor = (slug: string) => slug === "all" ? products.length : products.filter((p) => p.category.slug === slug || p.category.slug.startsWith(slug + "-")).length;
  const reset = () => { setCat("all"); setQ(""); setSort("featured"); setMaxPrice(0); };
  const catRow = (slug: string, name: string) => (
    <button key={slug} onClick={() => setCat(slug)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${cat === slug ? "bg-gold/15 text-gold font-semibold" : "text-white/75 hover:bg-white/[0.06] hover:text-white"}`}>
      <span>{name}</span><span className="text-xs text-white/50">{countFor(slug)}</span>
    </button>
  );

  return (
    <section id="menu" className="py-20 sm:py-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/3 rounded-full blur-[200px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/8 border border-gold/15 text-gold text-sm mb-4">Premium Selection</span>
          <h2 className="text-4xl sm:text-5xl font-display font-black mb-3">{title.includes(" ") ? <>{title.split(" ").slice(0, -1).join(" ")} <span className="gold-text">{title.split(" ").slice(-1)}</span></> : <span className="gold-text">{title}</span>}</h2>
          <p className="text-white/85">{subtitle}</p>
        </Reveal>

        <div className="max-w-md mx-auto mb-8 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45">🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search drinks, food…" className="w-full pl-11 pr-5 py-3.5 rounded-xl bg-white/[0.08] border border-white/10 text-white placeholder-white/45 focus:border-gold/40 focus:outline-none" />
        </div>

        {/* Mobile category pills */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 hide-scrollbar lg:hidden">
          <Tab active={cat === "all"} onClick={() => setCat("all")}>All</Tab>
          {topCats.map((c) => <Tab key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>{c.name}</Tab>)}
        </div>

        <div className="grid lg:grid-cols-[250px_1fr] gap-6 lg:gap-8 items-start">
          {/* Filter sidebar */}
          <aside className="hidden lg:block sticky top-24">
            <div className="glass rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg">Filters</h3>
                <button onClick={reset} className="text-xs text-gold hover:underline">Reset</button>
              </div>

              <div>
                <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Category</div>
                <div className="space-y-0.5 max-h-64 overflow-y-auto hide-scrollbar">
                  {catRow("all", "All Products")}
                  {topCats.map((c) => catRow(c.slug, c.name))}
                </div>
              </div>

              <div>
                <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Max Price</div>
                <input type="range" min={0} max={priceCeil} step={100} value={maxPrice || priceCeil}
                  onChange={(e) => setMaxPrice(Number(e.target.value) >= priceCeil ? 0 : Number(e.target.value))}
                  className="w-full accent-gold" />
                <div className="text-sm text-white/75 mt-1">{maxPrice > 0 ? `Up to ${NPR(maxPrice)}` : "Any price"}</div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[["Under 500", 500], ["Under 1K", 1000], ["Under 5K", 5000], ["Any", 0]].map(([label, val]) => (
                    <button key={label as string} onClick={() => setMaxPrice(val as number)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-all ${maxPrice === val ? "bg-gold/15 border-gold/40 text-gold" : "border-white/12 text-white/70 hover:border-white/25"}`}>{label}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Sort By</div>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.08] border border-white/10 text-white text-sm focus:border-gold/40 focus:outline-none">
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="name">Name: A → Z</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div>
            <div className="text-sm text-white/70 mb-4">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filtered.map((p, idx) => (
                <Reveal key={p.id} delay={Math.min(idx, 8) * 0.03}>
                  <ProductCard p={p} onAdd={() => add({ id: p.id, productId: p.id, name: p.name, price: p.price, image: p.images[0] })} />
                </Reveal>
              ))}
            </div>
            {filtered.length === 0 && <p className="text-center text-white/65 py-16">No products match your filters.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${active ? "btn-gold" : "bg-white/[0.06] border border-white/12 text-white/85 hover:text-gold hover:border-gold/25"}`}>
      {children}
    </button>
  );
}

function ProductCard({ p, onAdd }: { p: Product; onAdd: () => void }) {
  const [added, setAdded] = useState(false);
  return (
    <motion.div whileHover={{ y: -6 }} className="glass rounded-2xl overflow-hidden group relative">
      {p.sponsored && <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-black/60 text-gold text-[9px] font-bold uppercase tracking-wide">Sponsored</span>}
      <a href={`/product/${p.slug}`} className="block relative h-44 overflow-hidden">
        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
        {p.badge !== "NONE" && <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-gold text-[#0a0a0a] text-[10px] font-bold uppercase">{p.badge}</span>}
      </a>
      <div className="p-4">
        <a href={`/product/${p.slug}`} className="block font-display font-bold text-[15px] truncate hover:text-gold transition-colors">{p.name}</a>
        <div className="text-white/80 text-xs mb-3">{p.category.name}</div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display font-bold text-lg gold-text">{NPR(p.price)}</span>
            {p.compareAt && <span className="text-white/80 line-through text-xs ml-1">{NPR(p.compareAt)}</span>}
          </div>
          <button onClick={() => { onAdd(); setAdded(true); setTimeout(() => setAdded(false), 1200); }} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${added ? "bg-green-500 text-white" : "bg-gold/10 border border-gold/20 text-gold hover:bg-gold hover:text-[#0a0a0a]"}`}>
            {added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Mid-page sponsored banner ----------
function MidBanner({ banner }: { banner?: Banner }) {
  useEffect(() => { if (banner) track(banner.id, "impression"); }, [banner]);
  if (!banner) return null;
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <a href={banner.linkUrl || "#menu"} onClick={() => track(banner.id, "click")} className="block relative rounded-3xl overflow-hidden border border-gold/15 group">
          {banner.mediaUrl && <img src={banner.mediaUrl} alt={banner.title} className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-700" />}
          <div className="absolute inset-0 bg-gradient-to-r from-darker/95 to-darker/40 flex flex-col justify-center px-8 sm:px-12">
            <span className="text-gold text-xs font-bold uppercase tracking-wider mb-2">Featured</span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold mb-1">{banner.headline}</h3>
            <p className="text-white/75 mb-4">{banner.subtext}</p>
            {banner.buttonLabel && <span className="inline-flex w-fit px-6 py-2.5 btn-gold rounded-full text-sm">{banner.buttonLabel}</span>}
          </div>
        </a>
      </div>
    </section>
  );
}

// ---------- Specials ----------
export function Specials() {
  const { add } = useCart();
  const boxes = [
    { id: "hangover", name: "Hangover Recovery Box", price: 999, color: "green", img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500", desc: "Hydration, electrolytes, energy, vitamins, coffee & recovery snacks." },
    { id: "latenight", name: "Late Night Box", price: 2499, color: "purple", img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500", desc: "Premium drinks + food combo + mixers + ice. Midnight to 3 AM." },
    { id: "party", name: "Premium Party Box", price: 4999, color: "gold", img: "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=500", desc: "Alcohol + BBQ + snacks + mixers + ice + party essentials." },
  ];
  return (
    <section id="specials" className="py-20 sm:py-24 relative bg-gradient-to-b from-dark via-surface to-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-4">Exclusive</span>
          <h2 className="text-4xl sm:text-5xl font-display font-black">Signature <span className="gold-text">Specials</span></h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boxes.map((b, i) => (
            <Reveal key={b.id} delay={i * 0.1}>
              <div className="glass rounded-2xl overflow-hidden group h-full">
                <div className="relative h-52 overflow-hidden">
                  <img src={b.img} alt={b.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent" />
                </div>
                <div className="p-6">
                  <h4 className="font-display font-bold text-xl mb-2">{b.name}</h4>
                  <p className="text-white/85 text-sm mb-4">{b.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-display font-bold gold-text">{NPR(b.price)}</span>
                    <button onClick={() => add({ id: b.id, name: b.name, price: b.price })} className="px-5 py-2 rounded-full bg-gold/15 border border-gold/30 text-gold font-semibold text-sm hover:bg-gold hover:text-[#0a0a0a] transition-all">Add</button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- VIP ----------
export function Vip() {
  const tiers = [
    { name: "Silver", price: 999, perks: ["5% off all orders", "Priority delivery", "Birthday offer", "Reward points"] },
    { name: "Gold", price: 1999, popular: true, perks: ["10% off all orders", "Free delivery always", "VIP-only products", "Party invitations"] },
    { name: "Platinum", price: 3999, perks: ["15% off all orders", "Exclusive imports", "Personal concierge", "Monthly free gift"] },
    { name: "Black Card", price: 7999, perks: ["20% off everything", "Rare limited editions", "24/7 priority line", "All benefits included"] },
  ];
  return (
    <section id="vip" className="py-20 sm:py-24 relative bg-gradient-to-b from-surface via-dark to-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/8 border border-gold/15 text-gold text-sm mb-4">Exclusive Membership</span>
          <h2 className="text-4xl sm:text-5xl font-display font-black">VIP <span className="gold-text">Members Club</span></h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className={`glass rounded-2xl p-6 text-center h-full relative ${t.popular ? "border-gold/30" : "border-white/10"}`}>
                {t.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gold text-[#0a0a0a] text-xs font-bold rounded-full">POPULAR</span>}
                <h4 className="font-display font-bold text-xl mb-1 gold-text">{t.name}</h4>
                <p className="text-3xl font-display font-black mb-4">{NPR(t.price)}<span className="text-sm text-white/65 font-normal">/mo</span></p>
                <ul className="text-white/85 text-sm space-y-2 text-left mb-6">{t.perks.map((p) => <li key={p} className="flex gap-2"><span className="text-gold">✓</span> {p}</li>)}</ul>
                <a href={`https://wa.me/${WA}?text=${encodeURIComponent("I want to join the " + t.name + " VIP membership!")}`} target="_blank" className={`block w-full py-2.5 rounded-full font-semibold text-sm ${t.popular ? "btn-gold" : "border border-gold/30 text-gold hover:bg-gold/10"} transition-all`}>Join {t.name}</a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Why Us ----------
export function WhyUs() {
  const items = [
    ["⚡", "30-Min Delivery", "Lightning fast across Pokhara."],
    ["🛡️", "100% Authentic", "Genuine, sealed products only."],
    ["🌙", "Until 3 AM", "Late night delivery, 7 days a week."],
    ["🔞", "Age-Verified", "Secure, responsible, 18+ checkout."],
  ];
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12"><h2 className="text-4xl sm:text-5xl font-display font-black">Why Choose <span className="gold-text">Us?</span></h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(([icon, title, desc], i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="glass rounded-2xl p-7 text-center h-full">
                <div className="text-4xl mb-4">{icon}</div>
                <h4 className="font-display font-bold text-lg mb-2">{title}</h4>
                <p className="text-white/85 text-sm">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Reviews ----------
export function Reviews({ testimonials }: { testimonials: Testimonial[] }) {
  const list = testimonials.length ? testimonials : [];
  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-dark via-surface to-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12"><h2 className="text-4xl sm:text-5xl font-display font-black">What Our <span className="gold-text">Customers</span> Say</h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <div className="glass rounded-2xl p-7 h-full">
                <div className="text-gold mb-3">{"★".repeat(t.rating)}</div>
                <p className="text-white/75 text-sm mb-5">&ldquo;{t.body}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center font-bold text-[#0a0a0a]">{t.name[0]}</div>
                  <div><div className="font-semibold text-sm">{t.name}</div><div className="text-white/65 text-xs">{t.role}</div></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- How It Works ----------
export function HowItWorks() {
  const steps = [["1", "Browse & Choose", "Explore 200+ products"], ["2", "Checkout", "Enter delivery details"], ["3", "WhatsApp Confirm", "Order sent instantly"], ["4", "Delivered!", "At your door in 30 min"]];
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12"><h2 className="text-4xl sm:text-5xl font-display font-black">How It <span className="gold-text">Works</span></h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 0.1}>
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/15 flex items-center justify-center mx-auto mb-5 text-2xl font-display font-bold gold-text">{n}</div>
                <h4 className="font-display font-bold text-lg mb-2">{t}</h4>
                <p className="text-white/85 text-sm">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- CTA ----------
export function CtaBanner() {
  return (
    <section className="py-20 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-accent/5" />
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <Reveal>
          <h2 className="text-4xl sm:text-6xl font-display font-black mb-6">Ready To <span className="gold-text">Cheers?</span></h2>
          <p className="text-white/85 text-xl mb-10">Don&apos;t let the night wait. Order premium drinks now.</p>
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Hi! I want to order from Gharmai Drinks")}`} target="_blank" className="inline-flex px-10 py-5 bg-gradient-to-r from-green-500 to-green-600 rounded-full font-bold text-xl text-white hover:scale-105 transition-all">Order on WhatsApp</a>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Contact ----------
export function Contact() {
  const info = [["📍", "Location", "Newroad, Pokhara, Nepal"], ["📞", "Call / WhatsApp", "+977 974-6302115"], ["🕐", "Delivery Hours", "2:00 PM – 3:00 AM Daily"], ["✉️", "Email", "info@gharmaidrinks.com"]];
  return (
    <section id="contact" className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12"><h2 className="text-4xl sm:text-5xl font-display font-black">Contact <span className="gold-text">Us</span></h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {info.map(([icon, t, d]) => (
            <div key={t} className="glass rounded-2xl p-6 text-center"><div className="text-3xl mb-3">{icon}</div><h4 className="font-display font-semibold mb-1">{t}</h4><p className="text-white/85 text-sm">{d}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Image src="/logo.png" alt="Gharmai Drinks" width={140} height={60} className="h-14 w-auto mx-auto mb-4" style={{ width: "auto" }} />
        <p className="text-white/65 text-sm max-w-lg mx-auto mb-6">Nepal&apos;s premium alcohol &amp; food delivery. Cheers from Home. Pokhara, 2 PM – 3 AM daily.</p>
        <div className="p-4 max-w-md mx-auto rounded-xl bg-gold/8 border border-gold/15 mb-6">
          <p className="text-gold text-xs font-semibold">⚠️ Strictly 18+. Please drink responsibly. Delivery within Pokhara valley only. Sale of alcohol to minors is prohibited.</p>
        </div>
        <p className="text-white/55 text-xs">© 2025 Gharmai Drinks. All rights reserved. · <a href="/blog" className="hover:text-gold">Blog</a> · <a href="/admin" className="hover:text-gold">Admin</a></p>
      </div>
    </footer>
  );
}

// ---------- Cart Drawer + Checkout ----------
function CartDrawer() {
  const { items, open, setOpen, changeQty, remove, add, subtotal, clear } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const delivery = subtotal >= FREE_DELIVERY_MIN || subtotal === 0 ? 0 : DELIVERY_FEE;

  // Load a handful of suggestions the first time the cart opens
  useEffect(() => {
    if (open && suggestions.length === 0) {
      fetch("/api/products?featured=1").then((r) => r.json())
        .then((d) => Array.isArray(d) && d.length ? d : fetch("/api/products").then((r) => r.json()))
        .then((d) => Array.isArray(d) ? setSuggestions(d.slice(0, 8)) : null)
        .catch(() => {});
    }
  }, [open, suggestions.length]);

  const inCart = new Set(items.map((i) => i.name));
  const recos = suggestions.filter((p) => !inCart.has(p.name)).slice(0, 4);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 bg-black/60 z-[59]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween" }} className="fixed top-0 right-0 w-full max-w-md h-full z-[60] bg-darker/95 backdrop-blur-2xl border-l border-white/10 flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="font-display text-xl font-bold">Your Cart</h3>
                <button onClick={() => setOpen(false)} className="w-10 h-10 rounded-xl bg-white/[0.08] hover:bg-white/10">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {items.length === 0 && <p className="text-center text-white/65 py-16">Your cart is empty</p>}
                {items.map((i) => (
                  <div key={i.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10">
                    {i.image && <img src={i.image} alt={i.name} className="w-14 h-14 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{i.name}</div><div className="text-gold text-sm font-bold">{NPR(i.price)}</div></div>
                    <div className="flex items-center gap-2">
                      {i.qty > 1
                        ? <button onClick={() => changeQty(i.id, -1)} aria-label="Decrease" className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 hover:border-gold/30">−</button>
                        : <button onClick={() => remove(i.id)} aria-label="Remove item" className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 hover:bg-accent/20 hover:text-accent hover:border-accent/30">🗑</button>}
                      <span className="text-sm font-semibold w-5 text-center">{i.qty}</span>
                      <button onClick={() => changeQty(i.id, 1)} aria-label="Increase" className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 hover:border-gold/30">+</button>
                    </div>
                  </div>
                ))}

                {/* Suggestions — fills the cart and drives bigger orders */}
                {items.length > 0 && recos.length > 0 && (
                  <div className="pt-4 mt-2 border-t border-white/10">
                    <div className="text-white/60 text-xs uppercase tracking-wider mb-3">You might also like</div>
                    <div className="space-y-2">
                      {recos.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.05] transition-colors">
                          <img src={p.images[0]} alt={p.name} className="w-11 h-11 rounded-lg object-cover" />
                          <a href={`/product/${p.slug}`} className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate hover:text-gold transition-colors">{p.name}</div>
                            <div className="text-gold text-xs font-bold">{NPR(p.price)}</div>
                          </a>
                          <button onClick={() => add({ id: p.id, productId: p.id, name: p.name, price: p.price, image: p.images[0] })}
                            className="px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold hover:bg-gold hover:text-[#0a0a0a] transition-all">+ Add</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {items.length > 0 && (
                <div className="border-t border-white/10 p-6">
                  <div className="flex justify-between mb-2"><span className="text-white/75">Subtotal</span><span className="font-bold gold-text">{NPR(subtotal)}</span></div>
                  <div className="flex justify-between mb-4 text-sm"><span className="text-white/75">Delivery</span><span className={delivery === 0 ? "text-green-400" : ""}>{delivery === 0 ? "FREE" : NPR(delivery)}</span></div>
                  <button onClick={() => { setOpen(false); setCheckout(true); }} className="w-full py-4 btn-gold rounded-xl text-lg">Checkout</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {checkout && <Checkout onClose={() => setCheckout(false)} items={items} subtotal={subtotal} delivery={delivery} clear={clear} />}
    </>
  );
}

function Checkout({ onClose, items, subtotal, delivery, clear }: any) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", maps: "", notes: "", coupon: "" });
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [done, setDone] = useState(false);
  const [captchaOk, setCaptchaOk] = useState(false);
  const total = subtotal + delivery - discount;

  async function applyCoupon() {
    const res = await fetch("/api/promotions/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: form.coupon, subtotal }) });
    const data = await res.json();
    if (data.valid) { setDiscount(data.discount); setCouponMsg(`✓ ${data.description} applied`); }
    else { setDiscount(0); setCouponMsg(data.reason || "Invalid code"); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!captchaOk) return; // security layer: block until human-verification passes
    const now = new Date().toLocaleString("en-NP", { timeZone: "Asia/Kathmandu" });
    let msg = `🥂 *NEW ORDER — GHARMAI DRINKS*\n━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *Name:* ${form.name}\n📞 *Phone:* ${form.phone}\n📍 *Address:* ${form.address}\n`;
    if (form.maps) msg += `🗺️ *Maps:* ${form.maps}\n`;
    if (form.notes) msg += `📝 *Notes:* ${form.notes}\n`;
    msg += `━━━━━━━━━━━━━━━━━\n🛒 *ITEMS:*\n`;
    items.forEach((i: any) => { msg += `  • ${i.name} x${i.qty} = ${NPR(i.price * i.qty)}\n`; });
    msg += `━━━━━━━━━━━━━━━━━\n💰 *Subtotal:* ${NPR(subtotal)}\n🚚 *Delivery:* ${delivery === 0 ? "FREE" : NPR(delivery)}\n`;
    if (discount > 0) msg += `🎟️ *Discount:* -${NPR(discount)}\n`;
    msg += `💎 *TOTAL:* ${NPR(total)}\n⏰ ${now}\n━━━━━━━━━━━━━━━━━\nCheers from Home! 🍻`;

    // Persist the order in the backend
    await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: form.name, phone: form.phone, address: form.address, mapsLink: form.maps, notes: form.notes,
        subtotal, deliveryFee: delivery, discount, total, couponCode: discount > 0 ? form.coupon : null, whatsappLog: msg,
        items: items.map((i: any) => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.qty })),
      }),
    }).catch(() => {});

    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank");
    setDone(true);
    clear();
    setTimeout(onClose, 2500);
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-card border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {done ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="font-display text-2xl font-bold mb-2">Order Placed!</h3>
            <p className="text-white/75">We&apos;ve opened WhatsApp to confirm your order. See you soon!</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-display text-xl font-bold">Complete Order</h3>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/[0.08] hover:bg-white/10">✕</button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              {[["name", "Full Name *", "text"], ["phone", "Phone Number *", "tel"], ["address", "Delivery Address *", "text"], ["maps", "Google Maps Link (optional)", "url"]].map(([k, label, type]) => (
                <div key={k}>
                  <label className="text-white/75 text-sm mb-1.5 block">{label}</label>
                  <input required={label.includes("*")} type={type} value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full px-4 py-3.5 rounded-xl bg-white/[0.08] border border-white/10 focus:border-gold/40 focus:outline-none" />
                </div>
              ))}
              <div>
                <label className="text-white/75 text-sm mb-1.5 block">Notes (optional)</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-4 py-3.5 rounded-xl bg-white/[0.08] border border-white/10 focus:border-gold/40 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="text-white/75 text-sm mb-1.5 block">Coupon Code</label>
                <div className="flex gap-2">
                  <input value={form.coupon} onChange={(e) => setForm({ ...form, coupon: e.target.value })} placeholder="WELCOME10" className="flex-1 px-4 py-3 rounded-xl bg-white/[0.08] border border-white/10 focus:border-gold/40 focus:outline-none uppercase" />
                  <button type="button" onClick={applyCoupon} className="px-5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold">Apply</button>
                </div>
                {couponMsg && <p className={`text-xs mt-1 ${discount > 0 ? "text-green-400" : "text-accent"}`}>{couponMsg}</p>}
              </div>
              <div className="p-4 rounded-xl bg-white/[0.06] border border-white/10 text-sm space-y-1">
                <div className="flex justify-between text-white/75"><span>Subtotal</span><span>{NPR(subtotal)}</span></div>
                <div className="flex justify-between text-white/75"><span>Delivery</span><span>{delivery === 0 ? "FREE" : NPR(delivery)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{NPR(discount)}</span></div>}
                <div className="flex justify-between font-bold pt-2 border-t border-white/10"><span>Total</span><span className="gold-text">{NPR(total)}</span></div>
              </div>
              <Captcha onValidChange={setCaptchaOk} />
              <button type="submit" disabled={!captchaOk}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:shadow-lg enabled:hover:shadow-green-500/30">
                {captchaOk ? "Send Order via WhatsApp" : "Complete the security check above"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ---------- WhatsApp Float ----------
function WhatsAppFloat() {
  return (
    <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Hi! I want to order from Gharmai Drinks")}`} target="_blank" className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-110 transition-all text-2xl">
      💬
    </a>
  );
}

// ---------- Mobile Bottom Nav ----------
function MobileNav() {
  const { count, setOpen } = useCart();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 120);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-500 ${show ? "translate-y-0" : "translate-y-full"}`}>
      <div className="bg-darker/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 grid grid-cols-5 text-center text-[10px]">
        <a href="/" className="py-1.5 text-white/85">🏠<div>Home</div></a>
        <a href="/menu" className="py-1.5 text-white/85">🍾<div>Menu</div></a>
        <button onClick={() => setOpen(true)} className="py-1.5 relative"><div className="w-11 h-11 -mt-5 mx-auto rounded-full btn-gold flex items-center justify-center text-lg">🛍️</div><div className="text-gold -mt-0.5">Cart</div>{count > 0 && <span className="absolute top-0 right-1/2 translate-x-4 w-4 h-4 bg-accent rounded-full text-[9px] flex items-center justify-center">{count}</span>}</button>
        <a href="/specials" className="py-1.5 text-white/85">🎉<div>Deals</div></a>
        <a href="/vip" className="py-1.5 text-white/85">👑<div>VIP</div></a>
      </div>
    </div>
  );
}

// ---------- Entry Popup (frequency-controlled) ----------
function Popup({ banner }: { banner?: Banner }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!banner) return;
    const key = "gharmai_popup_" + banner.id;
    const freq = banner.frequency || "once_per_session";
    const seen = freq === "once_per_day" ? localStorage.getItem(key) : sessionStorage.getItem(key);
    if (freq === "once_per_day" && seen) {
      if (Date.now() - Number(seen) < 86400000) return;
    } else if (seen) return;
    const t = setTimeout(() => { setShow(true); track(banner.id, "impression"); }, 3500);
    return () => clearTimeout(t);
  }, [banner]);

  function close() {
    if (!banner) return;
    const key = "gharmai_popup_" + banner.id;
    (banner.frequency === "once_per_day" ? localStorage : sessionStorage).setItem(key, String(Date.now()));
    setShow(false);
  }
  if (!banner || !show) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-card border border-gold/20 rounded-3xl max-w-md w-full overflow-hidden text-center relative">
        <button onClick={close} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/40 text-white/85 hover:text-white">✕</button>
        {banner.mediaUrl && <img src={banner.mediaUrl} alt="" className="w-full h-40 object-cover" />}
        <div className="p-8">
          <h3 className="font-display text-2xl font-bold mb-2 gold-text">{banner.headline}</h3>
          <p className="text-white/75 mb-6">{banner.subtext}</p>
          <a href={banner.linkUrl || "#menu"} onClick={() => { track(banner.id, "click"); close(); }} className="inline-flex px-8 py-3 btn-gold rounded-full">{banner.buttonLabel || "Shop Now"}</a>
        </div>
      </motion.div>
    </div>
  );
}

// ---------- Toast ----------
function ToastHost() {
  const { toast } = useCart();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] px-6 py-3 rounded-full bg-green-500 text-white font-semibold shadow-lg">
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------- Reveal helper (Framer Motion, triggers once) ----------
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

// ---------- Shell: shared chrome for dedicated pages (/menu, /reserve, /product/…) ----------
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ShellInner>{children}</ShellInner>
    </CartProvider>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  useEffect(() => {
    setVerified(localStorage.getItem("gharmai_age_verified") === "true");
    try { document.documentElement.classList.toggle("light", localStorage.getItem("gharmai_theme") === "light"); } catch {}
  }, []);
  if (verified === null) return <div className="min-h-screen bg-dark" />;
  return (
    <>
      {!verified && <AgeGate onVerify={() => setVerified(true)} />}
      {verified && (
        <>
          <BeerBackground />
          <Navbar />
          <main className="min-h-[70vh] relative z-10">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppFloat />
          <MobileNav />
          <ToastHost />
        </>
      )}
    </>
  );
}
