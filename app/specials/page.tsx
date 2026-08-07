import { Shell, Specials } from "@/components/store/StoreClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Deals & Party Boxes | Gharmai Drinks Pokhara",
  description: "Hangover Recovery Box, Late Night Box & Premium Party Box — signature specials delivered until 3 AM in Pokhara.",
};

export default function SpecialsPage() {
  return (
    <Shell>
      <Specials />
    </Shell>
  );
}
