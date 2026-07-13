import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const UNSPLASH = "https://images.unsplash.com";

const collectionImages: Record<string, string> = {
  "yaz-koleksiyonu-2024": `${UNSPLASH}/photo-1469334031218-e382a71b716b?w=600&q=80&auto=format&fit=crop`,
  "kis-koleksiyonu-2024": `${UNSPLASH}/photo-1548048026-5a1a941d93d3?w=600&q=80&auto=format&fit=crop`,
  "ozel-gunler":          `${UNSPLASH}/photo-1562572159-4efc207f5aff?w=600&q=80&auto=format&fit=crop`,
  "yeni-gelenler":        `${UNSPLASH}/photo-1509631179647-0177331693ae?w=600&q=80&auto=format&fit=crop`,
};

const sampleProducts = [
  {
    title: "Yazlık Çiçekli Elbise",
    slug: "yazlik-cicekli-elbise",
    price: 899,
    compareAtPrice: 1199,
    category: "elbise",
    image: `${UNSPLASH}/photo-1585487000160-6ebfffffc5a0?w=800&q=80&auto=format&fit=crop`,
    description: "Hafif ve şık yazlık çiçekli elbise. Yaz günleri için mükemmel bir seçim.",
    tags: ["elbise", "yazlık", "çiçekli"],
  },
  {
    title: "Saten Akşam Elbisesi",
    slug: "saten-aksam-elbisesi",
    price: 1499,
    compareAtPrice: null,
    category: "elbise",
    image: `${UNSPLASH}/photo-1566174053879-31528523f8ae?w=800&q=80&auto=format&fit=crop`,
    description: "Özel geceler için tasarlanmış zarif saten elbise.",
    tags: ["elbise", "saten", "özel gün"],
  },
  {
    title: "Oversize Keten Gömlek",
    slug: "oversize-keten-gomlek",
    price: 549,
    compareAtPrice: 749,
    category: "ust-giyim",
    image: `${UNSPLASH}/photo-1583846783214-7229a91b20ed?w=800&q=80&auto=format&fit=crop`,
    description: "Rahat kesim keten gömlek. Günlük kullanım için ideal.",
    tags: ["gömlek", "keten", "oversize"],
  },
  {
    title: "Blazer Ceket",
    slug: "blazer-ceket",
    price: 1299,
    compareAtPrice: 1699,
    category: "dis-giyim",
    image: `${UNSPLASH}/photo-1591047139829-d91aecb6caea?w=800&q=80&auto=format&fit=crop`,
    description: "İş ve günlük yaşam için şık blazer ceket.",
    tags: ["ceket", "blazer", "ofis"],
  },
  {
    title: "Yüksek Bel Mom Jean",
    slug: "yuksek-bel-mom-jean",
    price: 699,
    compareAtPrice: null,
    category: "alt-giyim",
    image: `${UNSPLASH}/photo-1541099649105-f69ad21f3246?w=800&q=80&auto=format&fit=crop`,
    description: "Trend mom jean, yüksek bel kesim. Her kombine uyar.",
    tags: ["jean", "kot", "yüksek bel"],
  },
  {
    title: "İpek Bluz",
    slug: "ipek-bluz",
    price: 849,
    compareAtPrice: 1099,
    category: "ust-giyim",
    image: `${UNSPLASH}/photo-1515886657613-9f3515b0c78f?w=800&q=80&auto=format&fit=crop`,
    description: "Yumuşak ipek bluz, ofisten akşam yemeğine kadar her ortama uyar.",
    tags: ["bluz", "ipek", "şık"],
  },
  {
    title: "Midi Etek",
    slug: "midi-etek",
    price: 599,
    compareAtPrice: null,
    category: "alt-giyim",
    image: `${UNSPLASH}/photo-1594938298603-c8148c4b4a5f?w=800&q=80&auto=format&fit=crop`,
    description: "Şık midi etek, saten kumaş. Özel günler için ideal.",
    tags: ["etek", "midi", "saten"],
  },
  {
    title: "Trençkot",
    slug: "trencot",
    price: 2199,
    compareAtPrice: 2799,
    category: "dis-giyim",
    image: `${UNSPLASH}/photo-1520975954732-35dd22299614?w=800&q=80&auto=format&fit=crop`,
    description: "Klasik trençkot, her sezonda şıklığını koruyan ikonik parça.",
    tags: ["trençkot", "dış giyim", "klasik"],
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
    { name: "Elbise", slug: "elbise" },
    { name: "Üst Giyim", slug: "ust-giyim" },
    { name: "Alt Giyim", slug: "alt-giyim" },
    { name: "Dış Giyim", slug: "dis-giyim" },
    { name: "Aksesuar", slug: "aksesuar" },
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
    { name: "Yaz Koleksiyonu 2024", slug: "yaz-koleksiyonu-2024" },
    { name: "Kış Koleksiyonu 2024", slug: "kis-koleksiyonu-2024" },
    { name: "Özel Günler", slug: "ozel-gunler" },
    { name: "Yeni Gelenler", slug: "yeni-gelenler" },
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

  // Banner with Unsplash image
  const existingBanner = await prisma.banner.findFirst({ where: { isActive: true } });
  if (existingBanner) {
    await prisma.banner.update({
      where: { id: existingBanner.id },
      data: {
        image: `${UNSPLASH}/photo-1483985988355-763728e1935b?w=1600&q=80&auto=format&fit=crop`,
      },
    });
  } else {
    await prisma.banner.create({
      data: {
        title: "2024 Yeni Koleksiyon",
        subtitle: "Premium kadın giyimde yeni sezon ürünleri şimdi burada",
        image: `${UNSPLASH}/photo-1483985988355-763728e1935b?w=1600&q=80&auto=format&fit=crop`,
        buttonText: "Koleksiyonu Keşfet",
        link: "/collections/yeni-gelenler",
        isActive: true,
        position: 0,
      },
    });
  }
  console.log("Banner with image ready.");

  // Sample products
  const categoryMap: Record<string, string> = {};
  const allCats = await prisma.category.findMany();
  for (const c of allCats) categoryMap[c.slug] = c.id;

  for (const p of sampleProducts) {
    const existing = await prisma.product.findFirst({ where: { slug: p.slug } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { status: "ACTIVE" },
      });
      const existingImg = await prisma.productImage.findFirst({ where: { productId: existing.id } });
      if (!existingImg) {
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
        inventory: Math.floor(Math.random() * 50) + 10,
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
