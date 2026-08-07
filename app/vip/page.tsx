import { Shell, Vip } from "@/components/store/StoreClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "VIP Members Club | Gharmai Drinks Pokhara",
  description: "Silver, Gold, Platinum & Black Card memberships — priority delivery, VIP-only products and discounts on every order.",
};

export default function VipPage() {
  return (
    <Shell>
      <Vip />
    </Shell>
  );
}
