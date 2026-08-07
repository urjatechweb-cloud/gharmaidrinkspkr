import { prisma } from "./prisma";
import { productOut } from "./serialize";

// Shared server-side fetchers for the storefront pages.

export async function getActiveProducts() {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true },
      include: { category: true, brand: true },
      orderBy: [{ sortOrder: "asc" }],
    });
    return rows.map(productOut);
  } catch { return []; }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({ where: { active: true, parentId: null }, orderBy: { sortOrder: "asc" } });
  } catch { return []; }
}

export async function getBrands() {
  try {
    return await prisma.brand.findMany({ where: { active: true, featured: true }, orderBy: { sortOrder: "asc" } });
  } catch { return []; }
}

export async function getTestimonials() {
  try {
    return await prisma.testimonial.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  } catch { return []; }
}

export async function getProductBySlug(slug: string) {
  try {
    const p = await prisma.product.findFirst({ where: { slug, active: true }, include: { category: true, brand: true } });
    return p ? productOut(p) : null;
  } catch { return null; }
}

export async function getRelatedProducts(categoryId: string, excludeId: string, take = 4) {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true, categoryId, id: { not: excludeId } },
      include: { category: true, brand: true },
      orderBy: { sortOrder: "asc" },
      take,
    });
    return rows.map(productOut);
  } catch { return []; }
}
