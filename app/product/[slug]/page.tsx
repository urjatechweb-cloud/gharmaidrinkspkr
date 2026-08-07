import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Shell } from "@/components/store/StoreClient";
import ProductDetail from "@/components/store/ProductDetail";
import { getProductBySlug, getRelatedProducts } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product not found | Gharmai Drinks" };
  return {
    title: p.metaTitle || `${p.name} | Gharmai Drinks Pokhara`,
    description: p.metaDescription || `Order ${p.name} online in Pokhara for Rs. ${p.price.toLocaleString()}. Delivered 2 PM – 3 AM.`,
    openGraph: { title: p.name, images: p.images[0] ? [p.images[0]] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product.categoryId, product.id);

  // Product structured data for Google rich results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: product.price,
      availability: product.stock === "OUT_OF_STOCK" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Gharmai Drinks" },
    },
  };

  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product as any} related={related as any} />
    </Shell>
  );
}
