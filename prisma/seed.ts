import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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
  console.log(`Admin user created: ${admin.email}`);

  // Sample categories
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
  console.log("Categories created.");

  // Sample collections
  const collections = [
    { name: "Yaz Koleksiyonu 2024", slug: "yaz-koleksiyonu-2024" },
    { name: "Kış Koleksiyonu 2024", slug: "kis-koleksiyonu-2024" },
    { name: "Özel Günler", slug: "ozel-gunler" },
    { name: "Yeni Gelenler", slug: "yeni-gelenler" },
  ];

  for (const col of collections) {
    await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {},
      create: { ...col, isActive: true },
    });
  }
  console.log("Collections created.");

  // Shopify settings template
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
  console.log("Shopify settings initialized.");

  // Sample banner
  await prisma.banner.create({
    data: {
      title: "Yeni Koleksiyon",
      subtitle: "2024 İlkbahar-Yaz Koleksiyonu Şimdi Burada",
      image: "/images/banner-default.jpg",
      buttonText: "Keşfet",
      link: "/collections/yeni-gelenler",
      isActive: true,
      position: 0,
    },
  });
  console.log("Sample banner created.");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
