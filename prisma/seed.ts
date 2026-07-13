import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const UNSPLASH = "https://images.unsplash.com";

// Koleksiyon görselleri — ürün kataloğuyla aynı fotoğraflar
const collectionImages: Record<string, string> = {
  "gece-koleksiyonu":  `${UNSPLASH}/photo-1551489186-cf8726f514f8?w=800&q=88&auto=format&fit=crop&crop=entropy`,
  "fantazi-kostumler": `${UNSPLASH}/photo-1529139574466-a303027c1d8b?w=800&q=88&auto=format&fit=crop&crop=center`,
  "saten-dantel":      `${UNSPLASH}/photo-1496747611176-843222e1e57c?w=800&q=88&auto=format&fit=crop&crop=center`,
  "yeni-gelenler":     `${UNSPLASH}/photo-1536243298747-ea8874136d64?w=800&q=88&auto=format&fit=crop&crop=face`,
};

/** Koleksiyon kapak görseli için temsil ürün slug'ları */
const collectionProductSlug: Record<string, string> = {
  "gece-koleksiyonu": "deri-seksi-gecelik",
  "fantazi-kostumler": "liseli-kiz-kostum-siyah",
  "saten-dantel": "seksi-jartiyer-takim",
  "yeni-gelenler": "dekolteli-seksi-gecelik",
};

// Ürünler — erox.com.tr referanslı isimler, kanıtlı Unsplash görseller
const sampleProducts = [
  {
    title: "Liseli Kız Fantazi Kostüm - Siyah",
    slug: "liseli-kiz-kostum-siyah",
    price: 1299,
    compareAtPrice: 1599,
    category: "fantazi-kostum",
    image: `${UNSPLASH}/photo-1529139574466-a303027c1d8b?w=800&q=85&auto=format&fit=crop`,
    description: "Mini etekli, fiyonk detaylı liseli kız kostümü. Bluz + etek + çorap seti. S/M/L/XL beden.",
    tags: ["kostüm", "fantazi", "roleplay", "siyah"],
  },
  {
    title: "Seksi Gelinlik Kostüm",
    slug: "seksi-gelinlik-kostum",
    price: 1299,
    compareAtPrice: null,
    category: "fantazi-kostum",
    image: `${UNSPLASH}/photo-1509631179647-0177331693ae?w=800&q=85&auto=format&fit=crop`,
    description: "Tül detaylı mini gelinlik fantazi kostüm. Peçe ve eldiven dahildir. S-XL.",
    tags: ["kostüm", "gelinlik", "beyaz", "fantazi"],
  },
  {
    title: "Deri Seksi Gecelik",
    slug: "deri-seksi-gecelik",
    price: 1199,
    compareAtPrice: 1499,
    category: "babydoll-gecelik",
    image: `${UNSPLASH}/photo-1551489186-cf8726f514f8?w=800&q=85&auto=format&fit=crop`,
    description: "Fetish deri görünümlü babydoll gecelik. Zincir detaylı, fermuarlı. S/M/L/XL.",
    tags: ["gecelik", "deri", "fetish", "siyah"],
  },
  {
    title: "Seksi Jartiyer Takım",
    slug: "seksi-jartiyer-takim",
    price: 899,
    compareAtPrice: 1199,
    category: "corap-aksesuar",
    image: `${UNSPLASH}/photo-1496747611176-843222e1e57c?w=800&q=85&auto=format&fit=crop`,
    description: "Dantel jartiyer kemeri + file çorap seti. Kırmızı, siyah, beyaz. S-XL.",
    tags: ["jartiyer", "dantel", "set", "çorap"],
  },
  {
    title: "Ponponlu Seksi Gecelik",
    slug: "ponponlu-seksi-gecelik",
    price: 1099,
    compareAtPrice: null,
    category: "babydoll-gecelik",
    image: `${UNSPLASH}/photo-1469334031218-e382a71b716b?w=800&q=85&auto=format&fit=crop`,
    description: "Ponpon detaylı tül babydoll gecelik. Şeffaf tül, pamuk astar. S/M/L/XL.",
    tags: ["gecelik", "babydoll", "ponpon", "tül"],
  },
  {
    title: "Dekolteli Seksi Gecelik",
    slug: "dekolteli-seksi-gecelik",
    price: 1099,
    compareAtPrice: 1399,
    category: "babydoll-gecelik",
    image: `${UNSPLASH}/photo-1536243298747-ea8874136d64?w=800&q=85&auto=format&fit=crop`,
    description: "Derin V dekolteli saten gecelik. İnce askılı, vücut hatlarını belirten kesim. S-XL.",
    tags: ["gecelik", "dekolte", "saten", "mini"],
  },
  {
    title: "Deri Seksi Kostüm",
    slug: "deri-seksi-kostum",
    price: 1199,
    compareAtPrice: null,
    category: "fantazi-kostum",
    image: `${UNSPLASH}/photo-1485231183945-fffde7ea051a?w=800&q=85&auto=format&fit=crop`,
    description: "Deri görünümlü lamine kumaş mini kostüm. Fermuarlı ön, kemer dahil. S-XL.",
    tags: ["kostüm", "deri", "lamine", "fantazi"],
  },
  {
    title: "Deri Jartiyer Takım",
    slug: "deri-jartiyer-takim",
    price: 1199,
    compareAtPrice: 1499,
    category: "corap-aksesuar",
    image: `${UNSPLASH}/photo-1485518994671-a0b83289c09f?w=800&q=85&auto=format&fit=crop`,
    description: "Deri görünümlü jartiyer kemeri + siyah file çorap. Fetish tasarım. S-XL.",
    tags: ["jartiyer", "deri", "fetish", "set"],
  },
  {
    title: "Kırmızı Fantezi Hizmetçi Kostümü",
    slug: "kirmizi-hizmetci-kostumu",
    price: 1099,
    compareAtPrice: 1299,
    category: "fantazi-kostum",
    image: `${UNSPLASH}/photo-1529139574466-a303027c1d8b?w=800&q=85&auto=format&fit=crop&crop=right`,
    description: "Fiyonk detaylı kırmızı-siyah fantezi hizmetçi kostümü. Önlük + kep dahil. S-XL.",
    tags: ["kostüm", "hizmetçi", "kırmızı", "roleplay"],
  },
  {
    title: "Tül Seksi Hizmetçi Kostümü",
    slug: "tul-hizmetci-kostumu",
    price: 1099,
    compareAtPrice: null,
    category: "fantazi-kostum",
    image: `${UNSPLASH}/photo-1509631179647-0177331693ae?w=800&q=85&auto=format&fit=crop&crop=top`,
    description: "Tül etekli mini hizmetçi kostümü. Önlük, kep ve dantel eldiven dahil. S-XL.",
    tags: ["kostüm", "hizmetçi", "tül", "beyaz"],
  },
  {
    title: "Beauty Night Seksi Vücut Çorabı",
    slug: "beauty-night-vucut-corabi",
    price: 599,
    compareAtPrice: 799,
    category: "corap-aksesuar",
    image: `${UNSPLASH}/photo-1551489186-cf8726f514f8?w=800&q=85&auto=format&fit=crop&crop=bottom`,
    description: "Özel desen tam vücut fishnet çorabı. Elastik, one-size (38-44). Siyah.",
    tags: ["vücut çorabı", "fishnet", "one-size", "siyah"],
  },
  {
    title: "File Detay Seksi Vücut Çorabı",
    slug: "file-detay-vucut-corabi",
    price: 599,
    compareAtPrice: null,
    category: "corap-aksesuar",
    image: `${UNSPLASH}/photo-1496747611176-843222e1e57c?w=800&q=85&auto=format&fit=crop&crop=entropy`,
    description: "File detaylı tam vücut çorabı. Askılı model, vücut hatlarını belirten kesim. One-size.",
    tags: ["vücut çorabı", "file", "one-size", "dantel"],
  },
];

async function main() {
  console.log("Seeding database...");

  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@farukshop.com" },
    update: {},
    create: {
      email: "admin@farukshop.com",
      name: "Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // Categories
  const categories = [
    { name: "Babydoll & Gecelik", slug: "babydoll-gecelik" },
    { name: "Fantazi Kostüm", slug: "fantazi-kostum" },
    { name: "Korse & Sütyen", slug: "korse-sutyen" },
    { name: "Çorap & Aksesuar", slug: "corap-aksesuar" },
    { name: "İç Çamaşırı Set", slug: "ic-camasiri-set" },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
  }
  console.log("Categories ready.");

  // Collections with Unsplash images
  const collections = [
    { name: "🌙 Gece Koleksiyonu", slug: "gece-koleksiyonu" },
    { name: "🎭 Fantazi Kostümler", slug: "fantazi-kostumler" },
    { name: "✨ Korse & Dantel", slug: "saten-dantel" },
    { name: "🆕 Yeni Gelenler", slug: "yeni-gelenler" },
  ];
  for (const col of collections) {
    await prisma.collection.upsert({
      where: { slug: col.slug },
      update: { image: collectionImages[col.slug] },
      create: { ...col, isActive: true, image: collectionImages[col.slug] },
    });
  }
  console.log("Collections with images ready.");

  // Shopify settings
  await prisma.shopifySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeUrl: "your-store.myshopify.com",
      storefrontToken: "",
      adminToken: "",
      apiVersion: "2024-10",
      autoSync: false,
      deleteOnRemove: false,
      syncInventory: true,
      syncPrices: true,
      isConnected: false,
    },
  });

  // Hero slider banners — 3 slide
  await prisma.banner.deleteMany({});
  const heroBanners = [
    {
      title: "Yeni Sezon Fantazi Koleksiyon",
      subtitle: "Babydoll, korse ve kostüm. Gizli paket ile kapınıza kadar.",
      image: `${UNSPLASH}/photo-1551489186-cf8726f514f8?w=1920&q=88&auto=format&fit=crop&crop=entropy`,
      buttonText: "Koleksiyonu Keşfet",
      link: "/collections/gece-koleksiyonu",
      position: 0,
    },
    {
      title: "Fantazi Kostüm Serisi",
      subtitle: "Özel roleplay kostümleri. Sınırlı stok, hızlı kargo.",
      image: `${UNSPLASH}/photo-1529139574466-a303027c1d8b?w=1920&q=88&auto=format&fit=crop&crop=center`,
      buttonText: "İncele",
      link: "/collections/fantazi-kostumler",
      position: 1,
    },
    {
      title: "Saten & Dantel Korse Koleksiyonu",
      subtitle: "Premium saten ve dantel korse setleri. S'den XL'e tüm bedenler.",
      image: `${UNSPLASH}/photo-1496747611176-843222e1e57c?w=1920&q=88&auto=format&fit=crop&crop=center`,
      buttonText: "Alışverişe Başla",
      link: "/collections/saten-dantel",
      position: 2,
    },
  ];
  for (const b of heroBanners) {
    await prisma.banner.create({
      data: { ...b, isActive: true, startDate: new Date(), endDate: new Date("2099-01-01") },
    });
  }
  console.log("3 hero banners created.");

  // Cleanup: eski ürünleri tamamen sil
  const newSlugs = sampleProducts.map((p) => p.slug);
  const oldProducts = await prisma.product.findMany({
    where: { slug: { notIn: newSlugs } },
    select: { id: true },
  });
  if (oldProducts.length > 0) {
    await prisma.product.deleteMany({
      where: { id: { in: oldProducts.map((p) => p.id) } },
    });
    console.log(`Deleted ${oldProducts.length} old products.`);
  }

  // Sample products
  const categoryMap: Record<string, string> = {};
  const allCats = await prisma.category.findMany();
  for (const c of allCats) categoryMap[c.slug] = c.id;

  for (const p of sampleProducts) {
    const existing = await prisma.product.findFirst({ where: { slug: p.slug } });
    const catId = categoryMap[p.category];
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          title: p.title,
          description: p.description,
          tags: p.tags,
          ...(catId ? { categoryId: catId } : { categoryId: null }),
        },
      });
      // Always update the first image URL
      const existingImg = await prisma.productImage.findFirst({ where: { productId: existing.id } });
      if (existingImg) {
        await prisma.productImage.update({
          where: { id: existingImg.id },
          data: { url: p.image, altText: p.title },
        });
      } else {
        await prisma.productImage.create({
          data: { productId: existing.id, url: p.image, altText: p.title, position: 0 },
        });
      }
      continue;
    }
    const product = await prisma.product.create({
      data: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        status: "ACTIVE",
        ...(catId ? { category: { connect: { id: catId } } } : {}),
        tags: p.tags,
      },
    });
    await prisma.productImage.create({
      data: { productId: product.id, url: p.image, altText: p.title, position: 0 },
    });
  }

  // Koleksiyon görsellerini temsil ürün fotoğraflarıyla senkronize et
  for (const [colSlug, productSlug] of Object.entries(collectionProductSlug)) {
    const rep = await prisma.product.findFirst({
      where: { slug: productSlug },
      include: { images: { take: 1, orderBy: { position: "asc" } } },
    });
    const url = rep?.images[0]?.url;
    if (url) {
      const bannerUrl = url.includes("?")
        ? url.replace(/w=\d+/, "w=800").replace(/q=\d+/, "q=88")
        : `${url}?w=800&q=88&auto=format&fit=crop&crop=center`;
      await prisma.collection.updateMany({
        where: { slug: colSlug },
        data: { image: bannerUrl },
      });
    }
  }

  console.log(`${sampleProducts.length} sample products created/updated.`);
  console.log("Seeding completed!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
