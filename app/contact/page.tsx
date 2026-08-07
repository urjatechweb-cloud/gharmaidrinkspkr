import { Shell, Contact, CtaBanner } from "@/components/store/StoreClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Contact Us | Gharmai Drinks Pokhara",
  description: "Order on WhatsApp +977 974-6302115 · Newroad, Pokhara · Delivering 2 PM – 3 AM daily.",
};

export default function ContactPage() {
  return (
    <Shell>
      <Contact />
      <CtaBanner />
    </Shell>
  );
}
