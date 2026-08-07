import type { Metadata } from "next";
import { Playfair_Display, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3470"),
  title: "Gharmai Drinks | Premium Alcohol & Food Delivery in Pokhara — Until 3 AM",
  description:
    "Nepal's premium alcohol delivery. Whiskey, Scotch, Wine, Beer, Vodka & food delivered to your door in Pokhara, 2 PM – 3 AM daily. VIP membership, party boxes & fast late-night delivery.",
  keywords: [
    "alcohol delivery Pokhara",
    "whiskey delivery Nepal",
    "wine delivery Pokhara",
    "late night liquor delivery",
    "premium drinks Pokhara",
  ],
  openGraph: {
    title: "Gharmai Drinks | Premium Drinks Delivered Until 3 AM",
    description: "Your Party Starts at Home. Premium alcohol & food delivery in Pokhara.",
    images: ["/logo.png"],
    type: "website",
  },
  robots: { index: true, follow: true },
};

// JSON-LD structured data — helps Google show the business in local results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LiquorStore",
  name: "Gharmai Drinks",
  slogan: "Your Party Starts at Home",
  description: "Premium alcohol & food delivery in Pokhara, Nepal — 2 PM to 3 AM daily.",
  telephone: "+977-974-6302115",
  address: { "@type": "PostalAddress", streetAddress: "Newroad", addressLocality: "Pokhara", addressCountry: "NP" },
  openingHours: "Mo-Su 14:00-03:00",
  priceRange: "Rs.100 - Rs.75,000",
  image: "/logo.png",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${space.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply saved theme before paint to avoid a flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('gharmai_theme')==='light')document.documentElement.classList.add('light')}catch(e){}` }} />
      </head>
      <body className="font-body bg-dark text-white antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
