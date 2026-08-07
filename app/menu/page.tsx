import { Shell, Menu } from "@/components/store/StoreClient";
import { getActiveProducts, getCategories } from "@/lib/storefront";
import { getHomepageSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Full Menu & Price List | Gharmai Drinks Pokhara",
  description: "Browse 200+ drinks with live prices — whisky, beer, vodka, gin, rum, wine & food. Delivered in Pokhara 2 PM – 3 AM.",
};

export default async function MenuPage() {
  const [products, categories, settings] = await Promise.all([getActiveProducts(), getCategories(), getHomepageSettings()]);
  return (
    <Shell>
      <div className="pt-6">
        <Menu products={products as any} categories={categories as any} title={settings.menuTitle} subtitle={settings.menuSubtitle} />
      </div>
    </Shell>
  );
}
