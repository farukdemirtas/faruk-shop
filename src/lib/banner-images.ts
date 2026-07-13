/**
 * Banner görselleri — ürün kataloğuyla aynı Unsplash kaynakları.
 * Her koleksiyon, seed'deki temsil ürün görseliyle eşleştirildi.
 */
const U = "https://images.unsplash.com";

function img(id: string, w: number, crop = "center") {
  return `${U}/${id}?w=${w}&q=88&auto=format&fit=crop&crop=${crop}`;
}

/* Ürün seed ile birebir aynı fotoğraf ID'leri */
const P = {
  gecelik: "photo-1551489186-cf8726f514f8",       // Deri Seksi Gecelik
  ponpon: "photo-1469334031218-e382a71b716b",      // Ponponlu Gecelik
  dekolte: "photo-1536243298747-ea8874136d64",     // Dekolteli Gecelik
  kostum: "photo-1529139574466-a303027c1d8b",      // Liseli Kız Kostüm
  gelinlik: "photo-1509631179647-0177331693ae",   // Seksi Gelinlik
  deriKostum: "photo-1485231183945-fffde7ea051a", // Deri Kostüm
  jartiyer: "photo-1496747611176-843222e1e57c",   // Jartiyer Takım
  deriJartiyer: "photo-1485518994671-a0b83289c09f", // Deri Jartiyer
} as const;

export const BANNER_IMAGES = {
  hero: {
    gece: img(P.gecelik, 1920, "entropy"),
    kostum: img(P.kostum, 1920, "center"),
    korse: img(P.jartiyer, 1920, "center"),
  },
  category: {
    gece: img(P.gecelik, 800, "entropy"),
    kostum: img(P.kostum, 800, "center"),
    korse: img(P.jartiyer, 800, "center"),
    yeni: img(P.dekolte, 800, "face"),
  },
  dual: {
    gece: img(P.ponpon, 900, "center"),
    kostum: img(P.gelinlik, 900, "center"),
  },
  pageHeader: {
    default: img(P.gecelik, 1600, "entropy"),
    products: img(P.deriJartiyer, 1600, "center"),
    collections: img(P.ponpon, 1600, "center"),
    gece: img(P.gecelik, 1600, "entropy"),
    kostum: img(P.kostum, 1600, "center"),
    korse: img(P.jartiyer, 1600, "center"),
    yeni: img(P.dekolte, 1600, "face"),
  },
} as const;

/** DB/ürün bulunamazsa kullanılan statik koleksiyon fallback'leri */
export const COLLECTION_BANNER_FALLBACK: Record<string, string> = {
  default: BANNER_IMAGES.pageHeader.default,
  "gece-koleksiyonu": BANNER_IMAGES.pageHeader.gece,
  "fantazi-kostumler": BANNER_IMAGES.pageHeader.kostum,
  "saten-dantel": BANNER_IMAGES.pageHeader.korse,
  "yeni-gelenler": BANNER_IMAGES.pageHeader.yeni,
};

export const COLLECTION_BANNER_MAP = COLLECTION_BANNER_FALLBACK;

/** Seed — koleksiyon DB kayıtları için ürünle eşleşen görseller */
export const SEED_COLLECTION_IMAGES: Record<string, string> = {
  "gece-koleksiyonu": BANNER_IMAGES.category.gece,
  "fantazi-kostumler": BANNER_IMAGES.category.kostum,
  "saten-dantel": BANNER_IMAGES.category.korse,
  "yeni-gelenler": BANNER_IMAGES.category.yeni,
};
