import { notFound } from "next/navigation";
import { getProductById } from "@/actions/products";
import { db } from "@/lib/db";
import { EditProductClient } from "./edit-product-client";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, collections] = await Promise.all([
    getProductById(id),
    db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.collection.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <EditProductClient
      product={product}
      categories={categories}
      collections={collections}
    />
  );
}
