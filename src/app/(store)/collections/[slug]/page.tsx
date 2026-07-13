import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PageHeaderBanner } from "@/components/store/page-header-banner";
import { getCollectionHeaderImage, toBannerImage } from "@/lib/collection-images";

export const revalidate = 60;

// Her koleksiyon slug'ı için meta + hangi kategorileri içereceği
const collectionConfig: Record<
  string,
  { title: string; desc: string; categorySlugs: string[] }
> = {
  "gece-koleksiyonu": {
    title: "Gece Koleksiyonu",
    desc: "Babydoll, gecelik ve saten iç giyim ürünleri",
    categorySlugs: ["babydoll-gecelik"],
  },
  "fantazi-kostumler": {
    title: "Fantazi Kostümler",
    desc: "Roleplay ve fantazi kostüm koleksiyonu",
    categorySlugs: ["fantazi-kostum"],
  },
  "saten-dantel": {
    title: "Korse & Sütyen",
    desc: "Korse, sütyen ve jartiyer seti koleksiyonu",
    categorySlugs: ["korse-sutyen", "corap-aksesuar"],
  },
  "yeni-gelenler": {
    title: "Yeni Gelenler",
    desc: "En yeni fantazi iç giyim ürünleri",
    categorySlugs: [],   // boş = tüm aktif ürünler
  },
};

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = collectionConfig[slug];

  // DB'den collection kaydına bak
  const collection = await db.collection.findFirst({ where: { slug } });

  // Ne config ne DB'de varsa genel ürün göster
  const title = config?.title ?? collection?.name ?? slug;
  const desc = config?.desc ?? collection?.description ?? "";
  const categorySlugs = config?.categorySlugs ?? [];

  const whereClause =
    categorySlugs.length > 0
      ? { status: "ACTIVE" as const, category: { slug: { in: categorySlugs } } }
      : { status: "ACTIVE" as const };

  const products = await db.product.findMany({
    where: whereClause,
    include: { images: { take: 1, orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 48,
  });

  const headerImage =
    (products[0]?.images[0]?.url
      ? toBannerImage(products[0].images[0].url, 1600, "entropy")
      : null) ??
    (await getCollectionHeaderImage(slug));

  return (
    <div style={{ width: "100%" }}>
      <PageHeaderBanner image={headerImage}>
          <Link href="/collections" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.55)", fontSize: "0.82rem",
            textDecoration: "none", marginBottom: "1.25rem",
          }}>
            <ArrowLeft size={14} /> Tüm Koleksiyonlar
          </Link>
          <div style={{ marginBottom: "0.75rem" }}>
            <span className="badge-18" style={{ display: "inline-flex" }}>
              <Sparkles size={11} /> +18 Koleksiyon
            </span>
          </div>
          <h1 className="page-header-title" style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>
            {title}
          </h1>
          {desc && <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem" }}>{desc}</p>}
      </PageHeaderBanner>

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#fff0f7] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#FF4FA3] opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Bu koleksiyonda ürün yok</h3>
            <p className="text-gray-400 text-sm mb-6">Yakında yeni ürünler eklenecek.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 h-10 px-6 bg-[#FF4FA3] text-white rounded-xl text-sm font-medium hover:bg-[#e6388e] transition-colors"
            >
              Tüm Ürünleri Gör
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">
              <strong className="text-gray-900">{products.length}</strong> ürün bulundu
            </p>
            <div className="collections-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    title: p.title,
                    handle: p.shopifyHandle ?? p.slug,
                    price: p.price.toString(),
                    compareAtPrice: p.compareAtPrice?.toString(),
                    image: p.images[0]?.url,
                    brand: p.brand ?? undefined,
                    isNew: i < 4,
                    isSale: !!(p.compareAtPrice && p.compareAtPrice > p.price),
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
