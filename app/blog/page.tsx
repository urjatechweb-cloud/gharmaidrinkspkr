import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Blog | Gharmai Drinks — Cocktail Recipes & Party Tips",
  description: "Cocktail recipes, party planning tips and nightlife guides from Gharmai Drinks, Pokhara.",
};

async function getPosts() {
  try {
    return await prisma.post.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function BlogIndex() {
  const posts = await getPosts();
  return (
    <main className="min-h-screen bg-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/" className="text-gold text-sm hover:underline">← Back to store</Link>
        <h1 className="text-4xl sm:text-5xl font-display font-black mt-4 mb-10">The <span className="gold-text">Gharmai</span> Journal</h1>
        {posts.length === 0 && <p className="text-white/85">No posts published yet.</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="glass rounded-2xl overflow-hidden group">
              {p.coverImage && <img src={p.coverImage} alt={p.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />}
              <div className="p-5">
                <h2 className="font-display font-bold text-lg mb-2 group-hover:text-gold transition-colors">{p.title}</h2>
                <p className="text-white/85 text-sm">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
