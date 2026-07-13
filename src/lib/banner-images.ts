/**
 * Banner görselleri — fantazi iç giyim & kostüm temalı Unsplash kaynakları.
 */
const U = "https://images.unsplash.com";

function img(id: string, w: number, crop = "center") {
  return `${U}/${id}?w=${w}&q=88&auto=format&fit=crop&crop=${crop}`;
}

/* Fantazi iç giyim / kostüm fotoğrafları */
const P = {
  geceHero: "photo-1778430305834-68044213a39c",      // Kırmızı-siyah iç çamaşırı
  geceNight: "photo-1775705050079-a3efe4ff0814",     // Siyah fantazi iç giyim
  geceBed: "photo-1561375958-669d8413fa06",          // Siyah dantel set
  geceWhite: "photo-1770611110298-965733455373",     // Beyaz iç giyim
  geceSet: "photo-1778438936256-8c6834d0a468",       // Siyah-bej set
  geceRed: "photo-1634241796701-24569ef1c554",       // Kırmızı iç giyim
  geceBra: "photo-1730140762556-4de6b470415b",      // Yatak üstü iç giyim
  kostumWings: "photo-1764555719604-74e0228caf1e",   // Fantazi kanatlı kostüm
  kostumFairy: "photo-1770872937735-277e82b6de0f",   // Peri kostümü
  laceDetail: "photo-1584061554353-f8c337f5dbb9",    // Siyah dantel sütyen
} as const;

export const BANNER_IMAGES = {
  hero: {
    gece: img(P.geceHero, 1920, "entropy"),
    kostum: img(P.kostumWings, 1920, "center"),
    korse: img(P.geceNight, 1920, "center"),
  },
  category: {
    gece: img(P.geceBed, 800, "entropy"),
    kostum: img(P.kostumFairy, 800, "center"),
    korse: img(P.geceSet, 800, "center"),
    yeni: img(P.geceWhite, 800, "face"),
  },
  dual: {
    gece: img(P.geceRed, 900, "center"),
    kostum: img(P.kostumWings, 900, "center"),
  },
  pageHeader: {
    default: img(P.geceHero, 1600, "entropy"),
    products: img(P.geceSet, 1600, "center"),
    collections: img(P.kostumFairy, 1600, "center"),
    gece: img(P.geceHero, 1600, "entropy"),
    kostum: img(P.kostumWings, 1600, "center"),
    korse: img(P.geceNight, 1600, "center"),
    yeni: img(P.geceWhite, 1600, "face"),
  },
  product: {
    gecelik: img(P.geceHero, 800, "entropy"),
    gecelik2: img(P.geceNight, 800, "center"),
    gecelik3: img(P.geceWhite, 800, "face"),
    gecelik4: img(P.geceBra, 800, "entropy"),
    kostum: img(P.kostumWings, 800, "center"),
    kostum2: img(P.kostumFairy, 800, "center"),
    kostum3: img(P.geceRed, 800, "center"),
    jartiyer: img(P.geceSet, 800, "center"),
    jartiyer2: img(P.geceBed, 800, "entropy"),
    corap: img(P.geceNight, 800, "center"),
    corap2: img(P.laceDetail, 800, "center"),
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

/** Seed — koleksiyon DB kayıtları için görseller */
export const SEED_COLLECTION_IMAGES: Record<string, string> = {
  "gece-koleksiyonu": BANNER_IMAGES.category.gece,
  "fantazi-kostumler": BANNER_IMAGES.category.kostum,
  "saten-dantel": BANNER_IMAGES.category.korse,
  "yeni-gelenler": BANNER_IMAGES.category.yeni,
};

/** Seed — hero slider banner görselleri */
export const SEED_HERO_BANNERS = [
  {
    title: "Yeni Sezon Fantazi Koleksiyon",
    subtitle: "Babydoll, korse ve kostüm. Gizli paket ile kapınıza kadar.",
    image: BANNER_IMAGES.hero.gece,
    buttonText: "Koleksiyonu Keşfet",
    link: "/collections/gece-koleksiyonu",
    position: 0,
  },
  {
    title: "Fantazi Kostüm Serisi",
    subtitle: "Özel roleplay kostümleri. Sınırlı stok, hızlı kargo.",
    image: BANNER_IMAGES.hero.kostum,
    buttonText: "İncele",
    link: "/collections/fantazi-kostumler",
    position: 1,
  },
  {
    title: "Saten & Dantel Korse Koleksiyonu",
    subtitle: "Premium saten ve dantel korse setleri. S'den XL'e tüm bedenler.",
    image: BANNER_IMAGES.hero.korse,
    buttonText: "Alışverişe Başla",
    link: "/collections/saten-dantel",
    position: 2,
  },
] as const;
