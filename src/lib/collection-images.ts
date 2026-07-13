/**
 * Koleksiyon ↔ kategori eşlemesi ve ürün görsellerinden banner üretimi.
 */
import { db } from "@/lib/db";
import { COLLECTION_BANNER_FALLBACK } from "@/lib/banner-images";

export const COLLECTION_SLUGS = [
  "gece-koleksiyonu",
  "fantazi-kostumler",
  "saten-dantel",
  "yeni-gelenler",
] as const;

export type CollectionSlug = (typeof COLLECTION_SLUGS)[number];

/** Koleksiyon slug → hangi ürün kategorilerini içerir */
export const COLLECTION_CATEGORY_MAP: Record<CollectionSlug, string[]> = {
  "gece-koleksiyonu": ["babydoll-gecelik"],
  "fantazi-kostumler": ["fantazi-kostum"],
  "saten-dantel": ["korse-sutyen", "corap-aksesuar"],
  "yeni-gelenler": [],
};

/** Seed ile uyumlu temsil ürün slug'ları (fallback görseller) */
export const COLLECTION_FEATURE_PRODUCT: Record<CollectionSlug, string> = {
  "gece-koleksiyonu": "deri-seksi-gecelik",
  "fantazi-kostumler": "liseli-kiz-kostum-siyah",
  "saten-dantel": "seksi-jartiyer-takim",
  "yeni-gelenler": "dekolteli-seksi-gecelik",
};

/** Unsplash ürün URL'sini banner boyutuna çevir */
export function toBannerImage(url: string, width: number, crop = "center") {
  const match = url.match(/(photo-\d+-[a-f0-9]+)/);
  if (!match) return url;
  return `https://images.unsplash.com/${match[1]}?w=${width}&q=88&auto=format&fit=crop&crop=${crop}`;
}

function resolveImage(
  slug: CollectionSlug,
  productUrl: string | null | undefined,
  width: number,
  crop?: string,
) {
  if (productUrl) return toBannerImage(productUrl, width, crop);
  return COLLECTION_BANNER_FALLBACK[slug] ?? COLLECTION_BANNER_FALLBACK.default;
}

/** Tek koleksiyon için kapak görseli — önce DB ürününden */
export async function getCollectionCoverImage(
  slug: CollectionSlug,
  width = 800,
  crop = "center",
) {
  const categorySlugs = COLLECTION_CATEGORY_MAP[slug] ?? [];
  const where =
    categorySlugs.length > 0
      ? { status: "ACTIVE" as const, category: { slug: { in: categorySlugs } } }
      : { status: "ACTIVE" as const };

  const product = await db.product.findFirst({
    where,
    include: { images: { take: 1, orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return resolveImage(slug, product?.images[0]?.url, width, crop);
}

/** Tüm koleksiyonlar için kapak görselleri */
export async function getAllCollectionCoverImages(width = 800) {
  const crops: Partial<Record<CollectionSlug, string>> = {
    "gece-koleksiyonu": "entropy",
    "fantazi-kostumler": "center",
    "saten-dantel": "center",
    "yeni-gelenler": "face",
  };

  const entries = await Promise.all(
    COLLECTION_SLUGS.map(async (slug) => [
      slug,
      await getCollectionCoverImage(slug, width, crops[slug] ?? "center"),
    ] as const),
  );

  return Object.fromEntries(entries) as Record<CollectionSlug, string>;
}

/** Koleksiyon sayfa başlığı — geniş banner */
export async function getCollectionHeaderImage(slug: string) {
  if (!COLLECTION_SLUGS.includes(slug as CollectionSlug)) {
    return COLLECTION_BANNER_FALLBACK.default;
  }
  return getCollectionCoverImage(slug as CollectionSlug, 1600, "entropy");
}
