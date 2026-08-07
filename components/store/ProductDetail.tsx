"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "./CartContext";
import type { Product } from "./StoreClient";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779746302115";
const NPR = (n: number) => "Rs. " + n.toLocaleString();

export default function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);

  function addToCart() {
    for (let i = 0; i < qty; i++) add({ id: product.id, productId: product.id, name: product.name, price: product.price, image: product.images[0] });
  }

  const waMsg = encodeURIComponent(`Hi! I want to order ${qty} × ${product.name} (${NPR(product.price * qty)}) from Gharmai Drinks.`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Breadcrumbs */}
      <nav className="text-sm text-white/70 mb-8" aria-label="Breadcrumb">
        <a href="/" className="hover:text-gold">Home</a> <span className="mx-1.5 text-white/40">/</span>
        <a href="/menu" className="hover:text-gold">Menu</a> <span className="mx-1.5 text-white/40">/</span>
        <span className="text-white/90">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="relative rounded-3xl overflow-hidden border border-white/12 bg-white/[0.04]">
            <img src={product.images[img] || product.images[0]} alt={product.name} className="w-full h-[420px] sm:h-[520px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent pointer-events-none" />
            {product.badge !== "NONE" && (
              <span className="absolute top-5 left-5 px-3.5 py-1.5 rounded-full bg-gold text-[#0a0a0a] text-xs font-bold uppercase tracking-wider">{product.badge}</span>
            )}
            {product.luxury && (
              <span className="absolute top-5 right-5 px-3.5 py-1.5 rounded-full bg-black/70 border border-gold/40 text-gold text-xs font-bold uppercase tracking-wider">✦ Reserve</span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((u, i) => (
                <button key={i} onClick={() => setImg(i)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === img ? "border-gold" : "border-white/12 opacity-70 hover:opacity-100"}`}>
                  <img src={u} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          {product.brand?.name && <div className="text-gold text-sm uppercase tracking-[0.25em] mb-2">{product.brand.name}</div>}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black mb-3">{product.name}</h1>
          <a href="/menu" className="inline-block text-white/70 text-sm mb-6 hover:text-gold transition-colors">{product.category.name}</a>

          <div className="flex items-end gap-3 mb-6">
            <span className="font-display font-black text-4xl gold-text">{NPR(product.price)}</span>
            {product.compareAt && <span className="text-white/60 line-through text-xl mb-1">{NPR(product.compareAt)}</span>}
          </div>

          <p className="text-white/80 text-lg leading-relaxed mb-8">{product.description}</p>

          {/* Qty + actions */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] p-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-full hover:bg-white/10 text-xl" aria-label="Decrease quantity">−</button>
              <span className="w-10 text-center font-bold text-lg">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 rounded-full hover:bg-white/10 text-xl" aria-label="Increase quantity">+</button>
            </div>
            <span className="text-white/70 text-sm">Total: <b className="text-gold">{NPR(product.price * qty)}</b></span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button onClick={() => { addToCart(); setOpen(true); }} className="flex-1 py-4 btn-gold rounded-full text-lg">
              🛍️ Add to Cart
            </button>
            <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener"
              className="flex-1 py-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg text-center hover:shadow-lg hover:shadow-green-500/30 transition-all">
              Order on WhatsApp
            </a>
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[["⚡", "30-min delivery"], ["🛡️", "100% sealed"], ["🌙", "Until 3 AM"]].map(([icon, label]) => (
              <div key={label} className="glass rounded-xl py-3 px-2">
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-white/75 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl sm:text-3xl font-display font-black mb-8">You May Also <span className="gold-text">Like</span></h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {related.map((p) => (
              <a key={p.id} href={`/product/${p.slug}`} className="glass rounded-2xl overflow-hidden group">
                <div className="relative h-40 overflow-hidden">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                </div>
                <div className="p-4">
                  <div className="font-display font-bold text-sm truncate group-hover:text-gold transition-colors">{p.name}</div>
                  <div className="gold-text font-display font-bold mt-1">{NPR(p.price)}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
