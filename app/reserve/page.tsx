import { Shell, LuxurySection } from "@/components/store/StoreClient";
import { getActiveProducts } from "@/lib/storefront";
import { getHomepageSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "The Reserve — Premium & Luxury Liquor | Gharmai Drinks",
  description: "Rare imports, aged single malts and limited editions — Blue Label, Glenfiddich 21, Macallan, Hibiki & more, delivered in Pokhara.",
};

export default async function ReservePage() {
  const [products, settings] = await Promise.all([getActiveProducts(), getHomepageSettings()]);
  const luxury = products.filter((p: any) => p.luxury);
  return (
    <Shell>
      <LuxurySection products={luxury as any} title={settings.reserveTitle} subtitle={settings.reserveSubtitle} />
    </Shell>
  );
}
