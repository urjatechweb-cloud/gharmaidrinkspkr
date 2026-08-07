import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";
import { productOut, stringifyArr } from "@/lib/serialize";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 6);
}

// GET /api/products — public list with filters: ?category=&q=&featured=&sponsored=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured");
  const includeInactive = searchParams.get("admin") === "1";
  if (includeInactive) {
    // admin listing (includes hidden products) requires a signed-in editor
    try { await requireAdmin("products"); } catch (e) { if (e instanceof Response) return e; }
  }

  const where: any = {};
  if (!includeInactive) where.active = true;
  if (category && category !== "all") where.category = { slug: category };
  if (featured === "1") where.featured = true;
  // SQLite: `contains` only (LIKE is case-insensitive for ASCII); no `mode`/`has` operators
  if (q) where.OR = [
    { name: { contains: q } },
    { description: { contains: q } },
    { tags: { contains: q } },
  ];

  if (searchParams.get("luxury") === "1") where.luxury = true;

  const products = await prisma.product.findMany({
    where,
    include: { category: true, brand: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(products.map(productOut));
}

// POST /api/products — admin create
export async function POST(req: NextRequest) {
  try {
    const { adminId } = await requireAdmin("products");
    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug || slugify(body.name),
        description: body.description ?? "",
        price: Number(body.price),
        compareAt: body.compareAt ? Number(body.compareAt) : null,
        images: stringifyArr(body.images ?? []),
        badge: body.badge ?? "NONE",
        tags: stringifyArr(body.tags ?? []),
        stock: body.stock ?? "IN_STOCK",
        featured: !!body.featured,
        sponsored: !!body.sponsored,
        luxury: !!body.luxury,
        sortOrder: Number(body.sortOrder ?? 0),
        active: body.active ?? true,
        categoryId: body.categoryId,
        brandId: body.brandId || null,
        metaTitle: body.metaTitle ?? null,
        metaDescription: body.metaDescription ?? null,
      },
    });
    await logActivity({ adminId, action: "CREATE", entity: "Product", entityId: product.id, detail: product.name });
    return NextResponse.json(productOut(product), { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to create product" }, { status: 400 });
  }
}
