"use server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { bulkSyncToShopify } from "./shopify-sync";
import type { ProductStatus } from "@prisma/client";

export type ImportRow = {
  title: string;
  description?: string;
  price: string | number;
  compareAtPrice?: string | number;
  sku?: string;
  barcode?: string;
  brand?: string;
  tags?: string;
  status?: string;
  size?: string;
  color?: string;
  inventory?: string | number;
  seoTitle?: string;
  seoDescription?: string;
  image?: string;
};

export type ImportResult = {
  success: boolean;
  totalRows: number;
  importedCount: number;
  errorCount: number;
  errors: Array<{ row: number; title: string; error: string }>;
  productIds: string[];
};

export async function importProducts(
  rows: ImportRow[],
  options?: { autoSync?: boolean }
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    totalRows: rows.length,
    importedCount: 0,
    errorCount: 0,
    errors: [],
    productIds: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (!row.title || !row.price) {
      result.errors.push({
        row: i + 1,
        title: row.title ?? `Satır ${i + 1}`,
        error: "Başlık ve fiyat zorunludur",
      });
      result.errorCount++;
      continue;
    }

    try {
      const price = parseFloat(String(row.price).replace(",", "."));
      const compareAtPrice = row.compareAtPrice
        ? parseFloat(String(row.compareAtPrice).replace(",", "."))
        : undefined;

      if (isNaN(price)) {
        throw new Error("Geçersiz fiyat formatı");
      }

      const slug = slugify(row.title);
      const existing = await db.product.findFirst({ where: { slug } });
      const finalSlug = existing ? `${slug}-${Date.now()}-${i}` : slug;

      const tags = row.tags
        ? row.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const status = (["ACTIVE", "DRAFT", "ARCHIVED"].includes(row.status?.toUpperCase() ?? "")
        ? row.status?.toUpperCase()
        : "DRAFT") as ProductStatus;

      const product = await db.product.create({
        data: {
          title: row.title,
          description: row.description,
          slug: finalSlug,
          price,
          compareAtPrice,
          sku: row.sku,
          barcode: row.barcode,
          brand: row.brand,
          tags,
          status,
          seoTitle: row.seoTitle,
          seoDescription: row.seoDescription,
        },
      });

      if (row.size || row.color || row.inventory) {
        await db.productVariant.create({
          data: {
            productId: product.id,
            title: [row.size, row.color].filter(Boolean).join(" / ") || "Varsayılan",
            size: row.size,
            color: row.color,
            price,
            sku: row.sku,
            inventory: row.inventory ? parseInt(String(row.inventory)) : 0,
          },
        });
      }

      if (row.image) {
        await db.productImage.create({
          data: {
            productId: product.id,
            url: row.image,
            position: 0,
          },
        });
      }

      result.productIds.push(product.id);
      result.importedCount++;
    } catch (error) {
      result.errors.push({
        row: i + 1,
        title: row.title,
        error: (error as Error).message,
      });
      result.errorCount++;
    }
  }

  result.success = result.importedCount > 0;

  if (options?.autoSync && result.productIds.length > 0) {
    await bulkSyncToShopify(result.productIds);
  }

  return result;
}
