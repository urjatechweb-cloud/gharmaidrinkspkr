import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3470";
  const routes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/menu`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/reserve`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/brands`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/specials`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/vip`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];
  try {
    const [products, posts] = await Promise.all([
      prisma.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
      prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    ]);
    products.forEach((p) => routes.push({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 }));
    posts.forEach((p) => routes.push({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 }));
  } catch {}
  return routes;
}
