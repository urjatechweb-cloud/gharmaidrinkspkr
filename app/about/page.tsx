import { Shell, WhyUs, HowItWorks, Reviews } from "@/components/store/StoreClient";
import { getTestimonials } from "@/lib/storefront";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "About Us | Gharmai Drinks Pokhara",
  description: "Why Pokhara chooses Gharmai Drinks — 30-minute delivery, 100% authentic sealed bottles, open until 3 AM, age-verified checkout.",
};

export default async function AboutPage() {
  const testimonials = await getTestimonials();
  return (
    <Shell>
      <WhyUs />
      <HowItWorks />
      <Reviews testimonials={testimonials as any} />
    </Shell>
  );
}
