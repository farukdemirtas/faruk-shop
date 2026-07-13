import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  const product = await db.product.findFirst({
    where: {
      OR: [{ slug: handle }, { shopifyHandle: handle }],
      status: "ACTIVE",
    },
    include: {
      images:   { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!product) return NextResponse.json(null, { status: 404 });

  /* Benzer ürünler — yalnızca aynı kategoriden, kendisi hariç, max 4 */
  const related =
    product.categoryId && product.category
      ? await db.product.findMany({
          where: {
            status: "ACTIVE",
            id: { not: product.id },
            categoryId: product.categoryId,
          },
          include: { images: { take: 1, orderBy: { position: "asc" } } },
          orderBy: { createdAt: "desc" },
          take: 4,
        })
      : [];

  return NextResponse.json({
    id:             product.id,
    title:          product.title,
    description:    product.description,
    price:          Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    brand:          product.brand,
    sku:            product.sku,
    barcode:        product.barcode,
    tags:           product.tags,
    category:       product.category,
    images:         product.images.map(i => ({ id: i.id, url: i.url, altText: i.altText })),
    variants:       product.variants.map(v => ({
      id: v.id, title: v.title, size: v.size, color: v.color,
      price: Number(v.price), inventory: v.inventory,
    })),
    related: related.map(r => ({
      id: r.id, title: r.title,
      handle: r.shopifyHandle ?? r.slug,
      price: Number(r.price),
      compareAtPrice: r.compareAtPrice ? Number(r.compareAtPrice) : null,
      image: r.images[0]?.url,
      brand: r.brand,
    })),
  });
}
