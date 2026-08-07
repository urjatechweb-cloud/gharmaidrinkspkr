import StoreClient from "@/components/store/StoreClient";
import { prisma } from "@/lib/prisma";
import { productOut } from "@/lib/serialize";
import { getHomepageSettings, DEFAULT_HOMEPAGE } from "@/lib/settings";

export const dynamic = "force-dynamic"; // always fresh content from CMS

async function getData() {
  try {
    const now = new Date();
    const [products, banners, testimonials, categories, brands, settings] = await Promise.all([
      prisma.product.findMany({ where: { active: true }, include: { category: true, brand: true }, orderBy: [{ sortOrder: "asc" }] }),
      prisma.bannerAd.findMany({
        where: {
          active: true,
          AND: [
            { OR: [{ startAt: null }, { startAt: { lte: now } }] },
            { OR: [{ endAt: null }, { endAt: { gte: now } }] },
          ],
        },
        orderBy: { priority: "desc" },
      }),
      prisma.testimonial.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.category.findMany({ where: { active: true, parentId: null }, orderBy: { sortOrder: "asc" } }),
      prisma.brand.findMany({ where: { active: true, featured: true }, orderBy: { sortOrder: "asc" } }),
      getHomepageSettings(),
    ]);
    return { products: products.map(productOut), banners, testimonials, categories, brands, settings };
  } catch (e) {
    return { products: [], banners: [], testimonials: [], categories: [], brands: [], settings: DEFAULT_HOMEPAGE };
  }
}

export default async function HomePage() {
  const data = await getData();
  return (
    <StoreClient
      products={data.products as any}
      banners={JSON.parse(JSON.stringify(data.banners))}
      testimonials={data.testimonials as any}
      categories={data.categories as any}
      brands={JSON.parse(JSON.stringify(data.brands))}
      settings={data.settings as any}
    />
  );
}
