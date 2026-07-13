import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import Link from "next/link";
import { ArrowRight, Sparkles, Truck, Shield, RotateCcw } from "lucide-react";

async function getHomeData() {
  const [banners, featuredProducts, collections] = await Promise.all([
    db.banner.findMany({ where: { isActive: true }, orderBy: { position: "asc" }, take: 3 }),
    db.product.findMany({
      where: { status: "ACTIVE" },
      include: { images: { take: 1, orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.collection.findMany({ where: { isActive: true }, take: 4 }),
  ]);

  return { banners, featuredProducts, collections };
}

export default async function HomePage() {
  const { banners, featuredProducts, collections } = await getHomeData();

  const mainBanner = banners[0];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0f0f23]" />
        {mainBanner?.image && (
          <div className="absolute inset-0 opacity-30">
            <img src={mainBanner.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FF4FA3] rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#FFD6E8] rounded-full opacity-10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#FF4FA3]" />
              <span className="text-white/80 text-sm">2024 Yaz Koleksiyonu</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
              {mainBanner?.title ?? "Premium"}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4FA3] to-[#FFD6E8]">
                Kadın Giyim
              </span>
            </h1>
            <p className="text-white/60 text-lg mt-6 leading-relaxed max-w-lg">
              {mainBanner?.subtitle ?? "En şık ve kaliteli kadın giyim koleksiyonlarını keşfedin. Her tarza uygun seçenekler."}
            </p>
            <div className="flex items-center gap-4 mt-10">
              <Link
                href={mainBanner?.link ?? "/collections"}
                className="inline-flex items-center gap-2 h-12 px-8 bg-[#FF4FA3] text-white rounded-2xl font-semibold hover:bg-[#e6388e] transition-all active:scale-[0.98] shadow-lg shadow-pink-500/30"
              >
                {mainBanner?.buttonText ?? "Koleksiyonu Keşfet"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 h-12 px-6 border border-white/30 text-white rounded-2xl font-medium hover:bg-white/10 transition-colors"
              >
                Tüm Ürünler
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-[#FF4FA3] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-white text-sm font-medium">
            {[
              { icon: Truck, text: "500₺ Üzeri Ücretsiz Kargo" },
              { icon: RotateCcw, text: "30 Gün Ücretsiz İade" },
              { icon: Shield, text: "Güvenli Ödeme" },
              { icon: Sparkles, text: "Orijinal Ürün Garantisi" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections */}
      {collections.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#FF4FA3] text-sm font-semibold uppercase tracking-wider">Kategoriler</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">Koleksiyonlar</h2>
            </div>
            <Link href="/collections" className="text-[#FF4FA3] font-medium text-sm hover:underline flex items-center gap-1">
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-[#FFD6E8] to-[#fff0f7] hover:shadow-lg hover:shadow-pink-200 transition-all"
              >
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-[#FF4FA3] opacity-40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-lg">{c.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#FF4FA3] text-sm font-semibold uppercase tracking-wider">Öne Çıkanlar</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Yeni Gelenler</h2>
          </div>
          <Link href="/products" className="text-[#FF4FA3] font-medium text-sm hover:underline flex items-center gap-1">
            Tümünü Gör <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>Henüz ürün eklenmemiş.</p>
            <Link href="/admin/products" className="text-[#FF4FA3] text-sm mt-2 inline-block hover:underline">
              Admin paneline git →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((p, i) => (
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
        )}
      </section>

      {/* Banner Strip */}
      <section className="py-16 bg-gradient-to-r from-[#1A1A2E] to-[#16213E]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#FF4FA3] text-sm font-semibold uppercase tracking-wider mb-3">Özel Teklif</p>
          <h2 className="text-4xl font-bold text-white mb-4">İlk Siparişinizde %15 İndirim</h2>
          <p className="text-white/60 mb-8">FARUK15 kupon kodunu kullanın</p>
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-3">
            <span className="text-[#FF4FA3] font-mono font-bold text-xl tracking-widest">FARUK15</span>
            <button
              className="text-white/60 hover:text-white text-sm"
              onClick={() => navigator?.clipboard?.writeText("FARUK15")}
            >
              Kopyala
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
