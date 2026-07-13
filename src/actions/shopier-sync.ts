"use server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import {
  fetchShopierProductDetail,
  fetchShopierStoreListing,
  getDefaultShopierStoreUrl,
} from "@/lib/shopier/scraper";
import { revalidatePath } from "next/cache";

async function ensureShopierSettings() {
  const existing = await db.shopierSettings.findFirst();
  if (existing) return existing;

  return db.shopierSettings.create({
    data: {
      storeUsername: "Privatetime",
      storeUrl: getDefaultShopierStoreUrl(),
    },
  });
}

export async function getShopierSettings() {
  return ensureShopierSettings();
}

export async function updateShopierSettings(data: {
  storeUrl: string;
  patToken?: string;
  autoSync?: boolean;
}) {
  const username = data.storeUrl
    .trim()
    .replace(/\/$/, "")
    .replace(/^https?:\/\/(www\.)?shopier\.com\//i, "")
    .split("/")[0];

  const existing = await ensureShopierSettings();

  return db.shopierSettings.update({
    where: { id: existing.id },
    data: {
      storeUrl: data.storeUrl.trim() || getDefaultShopierStoreUrl(),
      storeUsername: username || "Privatetime",
      patToken: data.patToken || null,
      autoSync: data.autoSync ?? false,
    },
  });
}

export async function testShopierStoreAction() {
  try {
    const settings = await ensureShopierSettings();
    const listing = await fetchShopierStoreListing(settings.storeUrl);

    await db.shopierSettings.update({
      where: { id: settings.id },
      data: {
        isConnected: listing.length > 0,
        lastConnectedAt: new Date(),
        lastProductCount: listing.length,
      },
    });

    return {
      success: true,
      productCount: listing.length,
      storeUsername: settings.storeUsername,
    };
  } catch (error) {
    const settings = await db.shopierSettings.findFirst();
    if (settings) {
      await db.shopierSettings.update({
        where: { id: settings.id },
        data: { isConnected: false },
      });
    }
    return { success: false, error: (error as Error).message };
  }
}

function buildUniqueSlug(title: string, externalId: string, existingSlug?: string) {
  if (existingSlug) return existingSlug;
  const base = slugify(title) || `urun-${externalId}`;
  return `${base}-${externalId}`;
}

export async function pullProductsFromShopier() {
  const startTime = Date.now();
  const settings = await ensureShopierSettings();

  const syncRecord = await db.syncHistory.create({
    data: {
      type: "SHOPIER_PULL",
      status: "RUNNING",
      totalProducts: 0,
      successCount: 0,
      failCount: 0,
      errors: [],
      triggeredBy: "manual",
    },
  });

  let successCount = 0;
  let failCount = 0;
  const errors: Array<{ productId: string; title: string; error: string }> = [];

  try {
    const listing = await fetchShopierStoreListing(settings.storeUrl);

    await db.syncHistory.update({
      where: { id: syncRecord.id },
      data: { totalProducts: listing.length },
    });

    for (const item of listing) {
      try {
        const detail = await fetchShopierProductDetail(settings.storeUrl, item.id);
        if (!detail) throw new Error("Ürün detayı okunamadı");

        const images = detail.images.length > 0 ? detail.images : item.image ? [item.image] : [];
        const price = detail.price > 0 ? detail.price : 0;

        const existing = await db.product.findFirst({
          where: { shopifyId: detail.id },
        });

        const slug = buildUniqueSlug(detail.name, detail.id, existing?.slug);

        const productData = {
          title: detail.name,
          description: detail.description,
          slug,
          price,
          status: "ACTIVE" as const,
          shopifyId: detail.id,
          shopifyHandle: slug,
          shopifySynced: true,
          lastSyncedAt: new Date(),
          syncErrors: [],
          tags: ["shopier", settings.storeUsername.toLowerCase()],
        };

        let productId: string;

        if (existing) {
          const updated = await db.product.update({
            where: { id: existing.id },
            data: productData,
          });
          productId = updated.id;
          await db.productImage.deleteMany({ where: { productId } });
          await db.productVariant.deleteMany({ where: { productId } });
        } else {
          const created = await db.product.create({ data: productData });
          productId = created.id;
        }

        if (images.length > 0) {
          await db.productImage.createMany({
            data: images.map((url, index) => ({
              productId,
              url,
              altText: detail.name,
              position: index,
            })),
          });
        }

        if (detail.variations.length > 0) {
          const variants: Array<{
            productId: string;
            title: string;
            size: string | null;
            color: string | null;
            price: number;
            inventory: number;
            position: number;
          }> = [];

          const sizeVar = detail.variations.find((v) => /beden|size/i.test(v.name));
          const colorVar = detail.variations.find((v) => /renk|color/i.test(v.name));

          if (sizeVar && colorVar) {
            let pos = 0;
            for (const size of sizeVar.options) {
              for (const color of colorVar.options) {
                variants.push({
                  productId,
                  title: `${size.name} / ${color.name}`,
                  size: size.name,
                  color: color.name,
                  price,
                  inventory: Math.min(size.stock, color.stock),
                  position: pos++,
                });
              }
            }
          } else {
            detail.variations.forEach((group, groupIndex) => {
              group.options.forEach((opt, optIndex) => {
                variants.push({
                  productId,
                  title: opt.name,
                  size: /beden|size/i.test(group.name) ? opt.name : null,
                  color: /renk|color/i.test(group.name) ? opt.name : null,
                  price,
                  inventory: opt.stock,
                  position: groupIndex * 10 + optIndex,
                });
              });
            });
          }

          if (variants.length > 0) {
            await db.productVariant.createMany({ data: variants });
          }
        } else {
          await db.productVariant.create({
            data: {
              productId,
              title: "Standart",
              price,
              inventory: detail.stock,
              position: 0,
            },
          });
        }

        successCount++;
      } catch (error) {
        failCount++;
        errors.push({
          productId: item.id,
          title: item.title,
          error: (error as Error).message,
        });
      }
    }

    const finalStatus =
      failCount === 0 ? "COMPLETED" : successCount === 0 ? "FAILED" : "PARTIAL";

    await db.syncHistory.update({
      where: { id: syncRecord.id },
      data: {
        status: finalStatus,
        successCount,
        failCount,
        errors,
        duration: Date.now() - startTime,
      },
    });

    await db.shopierSettings.update({
      where: { id: settings.id },
      data: {
        isConnected: true,
        lastConnectedAt: new Date(),
        lastProductCount: listing.length,
        lastSyncAt: new Date(),
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/shopier-sync");
    revalidatePath("/admin");
    revalidatePath("/products");

    return {
      success: failCount === 0,
      totalProducts: listing.length,
      successCount,
      failCount,
      errors,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    await db.syncHistory.update({
      where: { id: syncRecord.id },
      data: {
        status: "FAILED",
        failCount: 1,
        errors: [{ productId: "-", title: "Genel", error: (error as Error).message }],
        duration: Date.now() - startTime,
      },
    });

    return {
      success: false,
      totalProducts: 0,
      successCount: 0,
      failCount: 1,
      errors: [{ productId: "-", title: "Genel", error: (error as Error).message }],
      duration: Date.now() - startTime,
    };
  }
}

export async function getShopierSyncStats() {
  const [totalProducts, importedProducts, lastSync, settings] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { shopifySynced: true } }),
    db.syncHistory.findFirst({
      where: { type: "SHOPIER_PULL" },
      orderBy: { createdAt: "desc" },
    }),
    ensureShopierSettings(),
  ]);

  return {
    totalProducts,
    importedProducts,
    lastSync,
    settings,
  };
}

export async function getShopierSyncHistory(limit = 10) {
  return db.syncHistory.findMany({
    where: { type: "SHOPIER_PULL" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
