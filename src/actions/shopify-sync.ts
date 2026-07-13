"use server";

import { db } from "@/lib/db";
import { createShopifyProduct, updateShopifyProduct, deleteShopifyProduct, testShopifyConnection } from "@/lib/shopify/admin";
import { transformProductToShopify } from "@/lib/shopify/transform";
import { withRetry } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// ─── Test Connection ──────────────────────────────────────────────────────────

export async function testShopifyConnectionAction() {
  try {
    const shop = await testShopifyConnection();

    await db.shopifySettings.updateMany({
      data: {
        isConnected: true,
        lastConnectedAt: new Date(),
      },
    });

    return { success: true, shop };
  } catch (error) {
    await db.shopifySettings.updateMany({
      data: { isConnected: false },
    });
    return { success: false, error: (error as Error).message };
  }
}

// ─── Sync Single Product ──────────────────────────────────────────────────────

export async function syncProductToShopify(productId: string) {
  const startTime = Date.now();

  const product = await db.product.findUnique({
    where: { id: productId },
    include: { images: { orderBy: { position: "asc" } }, variants: true },
  });

  if (!product) {
    return { success: false, error: "Ürün bulunamadı" };
  }

  try {
    const { input, media } = transformProductToShopify(product);

    let shopifyProduct;

    if (product.shopifyId) {
      shopifyProduct = await withRetry(() =>
        updateShopifyProduct({ ...input, id: product.shopifyId! })
      );
    } else {
      shopifyProduct = await withRetry(() =>
        createShopifyProduct(input, media.length > 0 ? media : undefined)
      );
    }

    if (!shopifyProduct) throw new Error("Shopify yanıt vermedi");

    await db.product.update({
      where: { id: productId },
      data: {
        shopifyId: shopifyProduct.id,
        shopifyHandle: shopifyProduct.handle,
        shopifySynced: true,
        lastSyncedAt: new Date(),
        syncErrors: [],
      },
    });

    await db.syncHistory.create({
      data: {
        type: "SINGLE",
        status: "COMPLETED",
        totalProducts: 1,
        successCount: 1,
        failCount: 0,
        errors: [],
        duration: Date.now() - startTime,
        triggeredBy: "manual",
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/shopify-sync");
    return { success: true, shopifyId: shopifyProduct.id };
  } catch (error) {
    const errMsg = (error as Error).message;

    await db.product.update({
      where: { id: productId },
      data: {
        shopifySynced: false,
        syncErrors: [errMsg],
      },
    });

    await db.syncHistory.create({
      data: {
        type: "SINGLE",
        status: "FAILED",
        totalProducts: 1,
        successCount: 0,
        failCount: 1,
        errors: [{ productId, error: errMsg }],
        duration: Date.now() - startTime,
        triggeredBy: "manual",
      },
    });

    return { success: false, error: errMsg };
  }
}

// ─── Bulk Sync ────────────────────────────────────────────────────────────────

export async function bulkSyncToShopify(productIds?: string[]) {
  const startTime = Date.now();

  const products = await db.product.findMany({
    where: productIds ? { id: { in: productIds } } : { status: "ACTIVE" },
    include: { images: { orderBy: { position: "asc" } }, variants: true },
  });

  const syncRecord = await db.syncHistory.create({
    data: {
      type: productIds ? "PARTIAL" : "FULL",
      status: "RUNNING",
      totalProducts: products.length,
      successCount: 0,
      failCount: 0,
      errors: [],
      triggeredBy: "manual",
    },
  });

  let successCount = 0;
  let failCount = 0;
  const errors: Array<{ productId: string; title: string; error: string }> = [];

  for (const product of products) {
    try {
      const { input, media } = transformProductToShopify(product);

      let shopifyProduct;
      if (product.shopifyId) {
        shopifyProduct = await withRetry(() =>
          updateShopifyProduct({ ...input, id: product.shopifyId! })
        );
      } else {
        shopifyProduct = await withRetry(() =>
          createShopifyProduct(input, media.length > 0 ? media : undefined)
        );
      }

      if (shopifyProduct) {
        await db.product.update({
          where: { id: product.id },
          data: {
            shopifyId: shopifyProduct.id,
            shopifyHandle: shopifyProduct.handle,
            shopifySynced: true,
            lastSyncedAt: new Date(),
            syncErrors: [],
          },
        });
        successCount++;
      }
    } catch (error) {
      const errMsg = (error as Error).message;
      errors.push({ productId: product.id, title: product.title, error: errMsg });
      await db.product.update({
        where: { id: product.id },
        data: { shopifySynced: false, syncErrors: [errMsg] },
      });
      failCount++;
    }
  }

  const finalStatus = failCount === 0 ? "COMPLETED" : successCount === 0 ? "FAILED" : "PARTIAL";

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

  revalidatePath("/admin/products");
  revalidatePath("/admin/shopify-sync");

  return {
    success: failCount === 0,
    totalProducts: products.length,
    successCount,
    failCount,
    errors,
    duration: Date.now() - startTime,
  };
}

// ─── Delete from Shopify ──────────────────────────────────────────────────────

export async function deleteFromShopify(productId: string) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product?.shopifyId) {
    return { success: false, error: "Bu ürün Shopify ile senkronize edilmemiş" };
  }

  try {
    await deleteShopifyProduct(product.shopifyId);
    await db.product.update({
      where: { id: productId },
      data: { shopifyId: null, shopifyHandle: null, shopifySynced: false },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ─── Sync Settings ────────────────────────────────────────────────────────────

export async function getShopifySettings() {
  return db.shopifySettings.findFirst();
}

export async function updateShopifySettings(data: {
  storeUrl: string;
  storefrontToken: string;
  adminToken: string;
  apiVersion: string;
  webhookSecret?: string;
  autoSync: boolean;
  deleteOnRemove: boolean;
  syncInventory: boolean;
  syncPrices: boolean;
}) {
  const existing = await db.shopifySettings.findFirst();

  if (existing) {
    return db.shopifySettings.update({
      where: { id: existing.id },
      data: { ...data, isConnected: false },
    });
  }

  return db.shopifySettings.create({
    data: { ...data, isConnected: false },
  });
}

// ─── Sync History ─────────────────────────────────────────────────────────────

export async function getSyncHistory(limit = 20) {
  return db.syncHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getSyncStats() {
  const [totalProducts, syncedProducts, lastSync] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { shopifySynced: true } }),
    db.syncHistory.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  return { totalProducts, syncedProducts, lastSync };
}
