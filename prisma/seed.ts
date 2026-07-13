import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const UNSPLASH = "https://images.unsplash.com";

// Karanlık/seksi moda stili, fantazi iç giyim temasına uygun koleksiyon görselleri
const collectionImages: Record<string, string> = {
  "gece-koleksiyonu":  `${UNSPLASH}/photo-1529139574466-a303027c1d8b?w=600&q=80&auto=format&fit=crop`,
  "fantazi-kostumler": `${UNSPLASH}/photo-1485231183945-fffde7ea051a?w=600&q=80&auto=format&fit=crop`,
  "saten-dantel":      `${UNSPLASH}/photo-1551489186-cf8726f514f8?w=600&q=80&auto=format&fit=crop`,
  "yeni-gelenler":     `${UNSPLASH}/photo-1496747611176-843222e1e57c?w=600&q=80&auto=format&fit=crop`,
};

// +18 Fantazi iç giyim ürünleri — karanlık/seksi tema
const sampleProducts = [
  {
    title: "Siyah Dantel Babydoll Set",
    slug: "dantel-babydoll-set",
    price: 649,
    compareAtPrice: 899,
    category: "babydoll-gecelik",
    image: `${UNSPLASH}/photo-1529139574466-a303027c1d8b?w=800&q=80&auto=format&fit=crop`,
    description: "Şeffaf siyah dantel babydoll ve tanga seti. Askılı model, göğüs destekli. S/M/L/XL beden.",
    tags: ["babydoll", "dantel", "set", "siyah"],
  },
  {
    title: "Kırmızı Saten Gecelik",
    slug: "saten-ipek-gecelik",
    price: 899,
    compareAtPrice: null,
    category: "babydoll-gecelik",
    image: `${UNSPLASH}/photo-1551489186-cf8726f514f8?w=800&q=80&auto=format&fit=crop`,
    description: "Vücut hattını belirten kırmızı saten mini gecelik. Derin dekolte, ince askılı.",
    tags: ["gecelik", "saten", "kırmızı", "mini"],
  },
  {
    title: "Dantel Korse & Külot Set",
    slug: "korse-kulot-set",
    price: 1199,
    compareAtPrice: 1599,
    category: "korse-sutyen",
    image: `${UNSPLASH}/photo-1496747611176-843222e1e57c?w=800&q=80&auto=format&fit=crop`,
    description: "Siyah dantel korse ve jartiyer bağlantılı külot seti. Çelik kemikli, 6 renk.",
    tags: ["korse", "jartiyer", "dantel", "siyah"],
  },
  {
    title: "Hemşire Fantazi Kostümü",
    slug: "hemsire-kostumu",
    price: 799,
    compareAtPrice: 999,
    category: "fantazi-kostum",
    image: `${UNSPLASH}/photo-1485231183945-fffde7ea051a?w=800&q=80&auto=format&fit=crop`,
    description: "Mini hemşire kostümü seti. Önlük elbise, kep ve file çorap dahildir. S-XL.",
    tags: ["kostüm", "hemşire", "fantazi", "roleplay"],
  },
  {
    title: "Siyah Fishnet Vücut Çorabı",
    slug: "fishnet-takim",
    price: 449,
    compareAtPrice: null,
    category: "corap-aksesuar",
    image: `${UNSPLASH}/photo-1485518994671-a0b83289c09f?w=800&q=80&auto=format&fit=crop`,
    description: "Büyük göz fishnet tam vücut çorabı. Siyah ve kırmızı. One-size (38-44).",
    tags: ["fishnet", "vücut çorabı", "ağ", "siyah"],
  },
  {
    title: "Pembe İpek Sabahlık Robe",
    slug: "ipek-sabahlik",
    price: 749,
    compareAtPrice: 999,
    category: "babydoll-gecelik",
    image: `${UNSPLASH}/photo-1509631179647-0177331693ae?w=800&q=80&auto=format&fit=crop`,
    description: "Uzun ipek sabahlık, kemer bağcıklı. V yaka, derin dekolte. Pembe, siyah, şarap.",
    tags: ["sabahlık", "robe", "ipek", "pembe"],
  },
  {
    title: "Polis Memuru Kostümü",
    slug: "polis-memuru-kostumu",
    price: 849,
    compareAtPrice: null,
    category: "fantazi-kostum",
    image: `${UNSPLASH}/photo-1536243298747-ea8874136d64?w=800&q=80&auto=format&fit=crop`,
    description: "Mavi mini polis kostümü. Kep, kemer ve kelepçe dahildir. S-XL.",
    tags: ["kostüm", "polis", "fantazi", "mavi"],
  },
  {
    title: "Kırmızı Dantel Jartiyer Set",
    slug: "dantel-jartiyer-seti",
    price: 549,
    compareAtPrice: 749,
    category: "corap-aksesuar",
    image: `${UNSPLASH}/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop`,
    description: "Dantel jartiyer kemeri + file çorap seti. Kırmızı, siyah, beyaz renk seçeneği.",
    tags: ["jartiyer", "dantel", "file çorap", "set"],
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
      image: `${UNSPLASH}/photo-1529139574466-a303027c1d8b?w=1600&q=80&auto=format&fit=crop`,
      buttonText: "Koleksiyonu Keşfet",
      link: "/collections/gece-koleksiyonu",
      position: 0,
    },
    {
      title: "Fantazi Kostüm Serisi",
      subtitle: "Özel roleplay kostümleri. Sınırlı stok, hızlı kargo.",
      image: `${UNSPLASH}/photo-1485231183945-fffde7ea051a?w=1600&q=80&auto=format&fit=crop`,
      buttonText: "İncele",
      link: "/collections/fantazi-kostumler",
      position: 1,
    },
    {
      title: "Saten & Dantel Korse Koleksiyonu",
      subtitle: "Premium saten ve dantel korse setleri. S'den XL'e tüm bedenler.",
      image: `${UNSPLASH}/photo-1551489186-cf8726f514f8?w=1600&q=80&auto=format&fit=crop`,
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

  // Cleanup: deactivate old products that don't belong to new categories
  const newSlugs = sampleProducts.map((p) => p.slug);
  const oldProducts = await prisma.product.findMany({
    where: { slug: { notIn: newSlugs } },
    select: { id: true },
  });
  if (oldProducts.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: oldProducts.map((p) => p.id) } },
      data: { status: "DRAFT" },
    });
    console.log(`Deactivated ${oldProducts.length} old products.`);
  }

  // Sample products
  const categoryMap: Record<string, string> = {};
  const allCats = await prisma.category.findMany();
  for (const c of allCats) categoryMap[c.slug] = c.id;

  for (const p of sampleProducts) {
    const existing = await prisma.product.findFirst({ where: { slug: p.slug } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", title: p.title, description: p.description, tags: p.tags },
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
    const catId = categoryMap[p.category];
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
  console.log(`${sampleProducts.length} sample products created/updated.`);
  console.log("Seeding completed!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
