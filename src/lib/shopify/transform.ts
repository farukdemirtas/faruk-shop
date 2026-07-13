import type { Product, ProductVariant, ProductImage } from "@prisma/client";
import type { AdminProductInput, AdminVariantInput, CreateMediaInput } from "./admin";

type ProductWithRelations = Product & {
  variants: ProductVariant[];
  images: ProductImage[];
};

export function transformProductToShopify(product: ProductWithRelations): {
  input: AdminProductInput;
  media: CreateMediaInput[];
} {
  const variants: AdminVariantInput[] = product.variants.length > 0
    ? product.variants.map((v, i) => ({
        id: v.shopifyVariantId ?? undefined,
        sku: v.sku ?? undefined,
        barcode: v.barcode ?? undefined,
        price: v.price.toString(),
        compareAtPrice: v.compareAtPrice?.toString(),
        inventoryQuantity: v.inventory,
        weight: v.weight ? Number(v.weight) : undefined,
        weightUnit: (v.weightUnit as AdminVariantInput["weightUnit"]) ?? "KILOGRAMS",
        requiresShipping: v.requiresShipping,
        option1: v.size ?? v.color ?? v.title,
        option2: v.size && v.color ? v.color : undefined,
      }))
    : [
        {
          sku: product.sku ?? undefined,
          barcode: product.barcode ?? undefined,
          price: product.price.toString(),
          compareAtPrice: product.compareAtPrice?.toString(),
          requiresShipping: true,
        },
      ];

  const media: CreateMediaInput[] = product.images
    .sort((a, b) => a.position - b.position)
    .filter((img) => img.url.startsWith("http"))
    .map((img) => ({
      originalSource: img.url,
      alt: img.altText ?? product.title,
      mediaContentType: "IMAGE" as const,
    }));

  const input: AdminProductInput = {
    id: product.shopifyId ?? undefined,
    title: product.title,
    bodyHtml: product.description ?? "",
    vendor: product.brand ?? "",
    tags: product.tags,
    status: product.status === "ACTIVE" ? "ACTIVE" : product.status === "ARCHIVED" ? "ARCHIVED" : "DRAFT",
    seo: {
      title: product.seoTitle ?? product.title,
      description: product.seoDescription ?? product.description?.substring(0, 320) ?? "",
    },
    variants,
  };

  return { input, media };
}

export function parseShopifyGid(gid: string): string {
  return gid.split("/").pop() ?? gid;
}

export function buildShopifyGid(resource: string, id: string): string {
  return `gid://shopify/${resource}/${id}`;
}
