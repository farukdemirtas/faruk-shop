import { getProducts } from "@/actions/products";
import { db } from "@/lib/db";
import { ProductsClient } from "./products-client";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const search = params.search;
  const status = params.status;
  const categoryId = params.category;

  const [{ products, total, pages }, categories, collections] = await Promise.all([
    getProducts({ page, search, status, categoryId }),
    db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.collection.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <ProductsClient
      products={products as Parameters<typeof ProductsClient>[0]["products"]}
      total={total}
      pages={pages}
      page={page}
      categories={categories}
      collections={collections}
    />
  );
}
