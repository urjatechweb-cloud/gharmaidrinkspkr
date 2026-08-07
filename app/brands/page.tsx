import { Shell, BrandSpotlight } from "@/components/store/StoreClient";
import { getBrands } from "@/lib/storefront";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Brand Houses | Gharmai Drinks Pokhara",
  description: "Johnnie Walker, Jack Daniel's, Glenfiddich, Jameson, Grey Goose, Hennessy — shop the world's great houses in Pokhara.",
};

export default async function BrandsPage() {
  const brands = await getBrands();
  return (
    <Shell>
      <BrandSpotlight brands={JSON.parse(JSON.stringify(brands))} />
    </Shell>
  );
}
