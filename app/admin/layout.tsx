import Providers from "@/components/admin/Providers";
import Sidebar from "@/components/admin/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = { title: "Admin · Gharmai Drinks", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <Providers>
      {/* The admin dashboard always uses the dark theme, regardless of the storefront toggle */}
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.remove('light')` }} />
      {session ? (
        <div className="flex min-h-screen bg-dark">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      ) : (
        <main className="min-h-screen bg-dark">{children}</main>
      )}
    </Providers>
  );
}
