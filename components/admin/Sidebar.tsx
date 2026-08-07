"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊", sections: ["analytics"] },
  { href: "/admin/products", label: "Products", icon: "🍾", sections: ["products"] },
  { href: "/admin/brands", label: "Brand Spotlight", icon: "🏷️", sections: ["ads"] },
  { href: "/admin/ads", label: "Ads & Banners", icon: "📣", sections: ["ads"] },
  { href: "/admin/promotions", label: "Promotions", icon: "🎟️", sections: ["ads"] },
  { href: "/admin/posts", label: "Blog Posts", icon: "✍️", sections: ["posts"] },
  { href: "/admin/settings", label: "Site Settings", icon: "⚙️", sections: ["ads"] },
  { href: "/admin/orders", label: "Orders", icon: "📦", sections: ["orders"] },
  { href: "/admin/customers", label: "Customers", icon: "👥", sections: ["orders"] },
];

const ROLE_SECTIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["analytics", "products", "ads", "posts", "orders"],
  CONTENT_EDITOR: ["products", "ads", "posts"],
  ORDER_MANAGER: ["orders"],
};

export default function Sidebar() {
  const path = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "CONTENT_EDITOR";
  const allowed = ROLE_SECTIONS[role] || [];
  const items = NAV.filter((n) => n.sections.some((s) => allowed.includes(s)));

  return (
    <aside className="w-64 shrink-0 bg-darker border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-white/10">
        <Image src="/logo.png" alt="Gharmai Drinks" width={120} height={50} className="h-12 w-auto" style={{ width: "auto" }} />
        <p className="text-white/65 text-xs mt-2">Admin CMS</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((n) => {
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${active ? "bg-gold/10 text-gold border border-gold/20" : "text-white/75 hover:text-white hover:bg-white/[0.08]"}`}>
              <span>{n.icon}</span> {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="text-sm font-medium truncate">{session?.user?.name}</div>
        <div className="text-white/65 text-xs mb-3">{role.replace("_", " ")}</div>
        <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="w-full py-2 rounded-lg bg-white/[0.08] hover:bg-accent/20 hover:text-accent text-sm transition-all">Sign Out</button>
      </div>
    </aside>
  );
}
