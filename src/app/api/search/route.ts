import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) return NextResponse.json({ results: [] });

  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { title:       { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags:        { has: q.toLowerCase() } },
        { brand:       { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      images:   { take: 1, orderBy: { position: "asc" } },
      category: { select: { name: true } },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    results: products.map(p => ({
      id:             p.id,
      title:          p.title,
      handle:         p.shopifyHandle ?? p.slug,
      price:          Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      image:          p.images[0]?.url,
      category:       p.category,
    })),
  });
}
