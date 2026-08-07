import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  try {
    return await prisma.post.findFirst({ where: { slug, status: "PUBLISHED" } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: { title: post.title, images: post.coverImage ? [post.coverImage] : [] },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <main className="min-h-screen bg-dark">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/blog" className="text-gold text-sm hover:underline">← All posts</Link>
        <h1 className="text-3xl sm:text-5xl font-display font-black mt-4 mb-6">{post.title}</h1>
        {post.coverImage && <img src={post.coverImage} alt={post.title} className="w-full rounded-2xl mb-8" />}
        <div className="prose prose-invert max-w-none text-white/85 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.body }} />
      </article>
    </main>
  );
}
