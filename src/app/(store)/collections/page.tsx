import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeaderBanner } from "@/components/store/page-header-banner";
import { COLLECTION_BANNER_FALLBACK } from "@/lib/banner-images";
import { getAllCollectionCoverImages } from "@/lib/collection-images";

export const revalidate = 60;

export const metadata = {
  title: "Koleksiyonlar | Faruk Shop",
  description: "+18 Fantazi iç giyim koleksiyonları. Babydoll, kostüm, korse ve daha fazlası.",
};

const CATEGORY_HIGHLIGHTS = [
  { name: "Babydoll & Gecelik", slug: "gece-koleksiyonu", desc: "Saten ve dantel gecelikler", emoji: "🌙" },
  { name: "Fantazi Kostümler", slug: "fantazi-kostumler", desc: "Roleplay ve fantazi kostümler", emoji: "🎭" },
  { name: "Korse & Sütyen", slug: "saten-dantel", desc: "Korse, sütyen ve jartiyer setleri", emoji: "✨" },
  { name: "Çorap & Aksesuar", slug: "yeni-gelenler", desc: "Fishnet, jartiyer ve aksesuarlar", emoji: "🖤" },
] as const;

export default async function CollectionsPage() {
  const [collections, collectionCovers] = await Promise.all([
    db.collection.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    getAllCollectionCoverImages(800),
  ]);

  const headerImage = collectionCovers["gece-koleksiyonu"] ?? COLLECTION_BANNER_FALLBACK.default;

  const categoryHighlights = CATEGORY_HIGHLIGHTS.map((cat) => ({
    ...cat,
    image: collectionCovers[cat.slug] ?? COLLECTION_BANNER_FALLBACK[cat.slug],
  }));

  return (
    <div style={{ width: "100%" }}>
      <PageHeaderBanner image={headerImage} align="center" padding="4rem 0">
          <div className="inline-flex items-center gap-2 bg-[#FF4FA3]/20 border border-[#FF4FA3]/30 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4FA3]" />
            <span className="text-[#FF4FA3] text-xs font-semibold uppercase tracking-wider">+18 Koleksiyonlar</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Tüm Koleksiyonlar</h1>
          <p className="text-white/55 max-w-lg mx-auto">
            Babydoll, fantazi kostüm, korse ve daha fazlası. Özel koleksiyonlarımızı keşfedin.
          </p>
      </PageHeaderBanner>

      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categoryHighlights.map((cat) => (
            <Link
              key={cat.slug}
              href={`/collections/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] hover:shadow-xl hover:shadow-pink-900/30 transition-all border border-white/5 hover:border-[#FF4FA3]/30"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/95 via-[#2d0a1f]/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4FA3]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex flex-col justify-end p-6">
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-[#FF4FA3] transition-colors">{cat.name}</h3>
                <p className="text-white/50 text-sm">{cat.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-[#FF4FA3] text-sm font-medium">
                  <span>Keşfet</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {collections.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Öne Çıkan Koleksiyonlar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {collections.map((c) => {
                const image =
                  collectionCovers[c.slug as keyof typeof collectionCovers] ??
                  c.image ??
                  COLLECTION_BANNER_FALLBACK[c.slug] ??
                  COLLECTION_BANNER_FALLBACK.default;

                return (
                  <Link
                    key={c.id}
                    href={`/collections/${c.slug}`}
                    className="group relative rounded-2xl overflow-hidden aspect-square hover:shadow-lg hover:shadow-pink-900/40 transition-all border border-gray-100"
                  >
                    <img
                      src={image}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/90 via-[#2d0a1f]/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-bold text-lg drop-shadow">{c.name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
