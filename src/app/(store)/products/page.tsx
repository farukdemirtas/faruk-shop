import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import { SlidersHorizontal, Sparkles, Grid3X3, Tag } from "lucide-react";
import { PageHeaderBanner } from "@/components/store/page-header-banner";
import { BANNER_IMAGES } from "@/lib/banner-images";

export const revalidate = 60;

export const metadata = {
  title: "Tüm Ürünler | Faruk Shop",
  description: "+18 Fantazi iç giyim ürünleri. Babydoll, kostüm, korse ve daha fazlası.",
};

const priceRanges = [
  { label: "Tümü", min: null, max: null },
  { label: "0 – 500 ₺", min: 0, max: 500 },
  { label: "500 – 1000 ₺", min: 500, max: 1000 },
  { label: "1000 ₺ ve üzeri", min: 1000, max: null },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const limit = 24;
  const skip = (page - 1) * limit;

  const minPrice = params.minPrice ? parseFloat(params.minPrice) : null;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : null;

  const whereClause = {
    status: "ACTIVE" as const,
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(minPrice !== null || maxPrice !== null
      ? {
          price: {
            ...(minPrice !== null ? { gte: minPrice } : {}),
            ...(maxPrice !== null ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where: whereClause,
      include: { images: { take: 1, orderBy: { position: "asc" } } },
      orderBy:
        params.sort === "price-asc"
          ? { price: "asc" }
          : params.sort === "price-desc"
          ? { price: "desc" }
          : { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({ where: whereClause }),
    db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Build URL helper
  function buildUrl(overrides: Record<string, string | null>) {
    const base: Record<string, string> = {};
    if (params.category) base.category = params.category;
    if (params.sort) base.sort = params.sort;
    if (params.minPrice) base.minPrice = params.minPrice;
    if (params.maxPrice) base.maxPrice = params.maxPrice;
    const merged = { ...base, ...overrides };
    const entries = Object.entries(merged).filter(([, v]) => v !== null && v !== "");
    if (entries.length === 0) return "/products";
    return "/products?" + entries.map(([k, v]) => `${k}=${v}`).join("&");
  }

  const activePriceRange = priceRanges.find(
    (r) =>
      (r.min === null ? !params.minPrice : String(r.min) === params.minPrice) &&
      (r.max === null ? !params.maxPrice : String(r.max) === params.maxPrice)
  );

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <PageHeaderBanner image={BANNER_IMAGES.pageHeader.products}>
          <span className="badge-18" style={{ display: "inline-flex", marginBottom: "1rem" }}>
            <Sparkles size={11} /> +18 Koleksiyon
          </span>
          <h1 className="page-header-title" style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: "0.4rem" }}>
            Tüm Ürünler
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem" }}>
            Fantazi iç giyim, babydoll, kostüm ve korse
          </p>
      </PageHeaderBanner>

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        {/* Top bar */}
        <div className="products-top-bar flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Grid3X3 className="w-4 h-4" />
            <span>
              <strong className="text-gray-900">{total}</strong> ürün
              {params.category && (
                <a
                  href="/products"
                  className="ml-2 inline-flex items-center gap-1 bg-[#FF4FA3]/10 text-[#FF4FA3] text-xs px-2 py-0.5 rounded-full font-medium hover:bg-[#FF4FA3]/20 transition-colors"
                >
                  Filtreyi Temizle ×
                </a>
              )}
            </span>
          </div>
          <div className="products-sort flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 mr-1">Sırala:</span>
            {[
              { label: "Yeni", value: "" },
              { label: "En Ucuz", value: "price-asc" },
              { label: "En Pahalı", value: "price-desc" },
            ].map(({ label, value }) => (
              <a
                key={value}
                href={buildUrl({ sort: value || null, page: null })}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  (params.sort ?? "") === value
                    ? "bg-[#FF4FA3] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#FF4FA3] hover:text-[#FF4FA3]"
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="products-layout" style={{ display: "flex", gap: "1.75rem", alignItems: "flex-start" }}>
          {/* ── Sidebar ── */}
          <aside className="products-sidebar" style={{ width: 220, flexShrink: 0 }}>
            <div style={{
              position: "sticky", top: "100px",
              background: "linear-gradient(160deg, #13132b 0%, #1e0a2e 100%)",
              borderRadius: 18,
              border: "1px solid rgba(255,79,163,0.15)",
              overflow: "hidden",
            }}>

              {/* ── Kategoriler ── */}
              <div style={{ padding: "1.25rem 1.25rem 1rem" }}>
                <p style={{
                  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "rgba(255,79,163,0.8)",
                  display: "flex", alignItems: "center", gap: 6, marginBottom: "0.75rem",
                }}>
                  <Tag size={11} /> Kategoriler
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
                  <li>
                    <a href={buildUrl({ category: null, page: null })} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px", borderRadius: 10,
                      fontSize: "0.82rem", fontWeight: 500, textDecoration: "none",
                      background: !params.category ? "linear-gradient(135deg,#FF4FA3,#c2185b)" : "transparent",
                      color: !params.category ? "white" : "rgba(255,255,255,0.55)",
                      transition: "all 0.15s",
                    }}>
                      <span>Tümü</span>
                      <span style={{
                        fontSize: "10px", padding: "1px 7px", borderRadius: 99,
                        background: !params.category ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                        color: !params.category ? "white" : "rgba(255,255,255,0.4)",
                      }}>{total}</span>
                    </a>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <a href={buildUrl({ category: c.slug, page: null })} style={{
                        display: "block", padding: "8px 12px", borderRadius: 10,
                        fontSize: "0.82rem", fontWeight: 500, textDecoration: "none",
                        background: params.category === c.slug ? "linear-gradient(135deg,#FF4FA3,#c2185b)" : "transparent",
                        color: params.category === c.slug ? "white" : "rgba(255,255,255,0.55)",
                        transition: "all 0.15s",
                      }}>
                        {c.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(255,79,163,0.12)", margin: "0 1.25rem" }} />

              {/* ── Fiyat ── */}
              <div style={{ padding: "1rem 1.25rem" }}>
                <p style={{
                  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "rgba(255,79,163,0.8)",
                  marginBottom: "0.75rem",
                }}>
                  ₺ Fiyat Aralığı
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
                  {priceRanges.map((r) => {
                    const href = buildUrl({
                      minPrice: r.min !== null ? String(r.min) : null,
                      maxPrice: r.max !== null ? String(r.max) : null,
                      page: null,
                    });
                    const active =
                      (!r.min && !params.minPrice && !r.max && !params.maxPrice) ||
                      (String(r.min ?? "") === (params.minPrice ?? "") &&
                        String(r.max ?? "") === (params.maxPrice ?? ""));
                    return (
                      <li key={r.label}>
                        <a href={href} style={{
                          display: "block", padding: "8px 12px", borderRadius: 10,
                          fontSize: "0.82rem", fontWeight: 500, textDecoration: "none",
                          background: active ? "linear-gradient(135deg,#FF4FA3,#c2185b)" : "transparent",
                          color: active ? "white" : "rgba(255,255,255,0.55)",
                          transition: "all 0.15s",
                        }}>
                          {r.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(255,79,163,0.12)", margin: "0 1.25rem" }} />

              {/* ── Koleksiyonlar ── */}
              <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
                <p style={{
                  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "rgba(255,79,163,0.8)", marginBottom: "0.75rem",
                }}>
                  Koleksiyonlar
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    { emoji: "🌙", name: "Gece",          href: "/collections/gece-koleksiyonu" },
                    { emoji: "🎭", name: "Kostümler",      href: "/collections/fantazi-kostumler" },
                    { emoji: "✨", name: "Saten & Dantel", href: "/collections/saten-dantel" },
                    { emoji: "🆕", name: "Yeni Gelenler",  href: "/collections/yeni-gelenler" },
                  ].map(({ emoji, name, href }) => (
                    <li key={name}>
                      <a href={href} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", borderRadius: 10,
                        fontSize: "0.82rem", textDecoration: "none",
                        color: "rgba(255,255,255,0.5)",
                        transition: "all 0.15s",
                      }}>
                        <span style={{ fontSize: "14px" }}>{emoji}</span>
                        {name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* ── Products ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile category chips */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 lg:hidden scrollbar-none">
              <a
                href="/products"
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !params.category ? "bg-[#FF4FA3] text-white" : "bg-gray-100 text-gray-600 hover:bg-[#fff0f7]"
                }`}
              >
                Tümü
              </a>
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={buildUrl({ category: c.slug, page: null })}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    params.category === c.slug
                      ? "bg-[#FF4FA3] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-[#fff0f7]"
                  }`}
                >
                  {c.name}
                </a>
              ))}
            </div>

            {products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-[#fff0f7] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#FF4FA3] opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ürün bulunamadı</h3>
                <p className="text-gray-400 text-sm mb-6">Bu filtrede henüz ürün yok.</p>
                <a
                  href="/products"
                  className="inline-flex items-center gap-2 h-10 px-6 bg-[#FF4FA3] text-white rounded-xl text-sm font-medium hover:bg-[#e6388e] transition-colors"
                >
                  Filtreleri Temizle
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
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
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 pt-8 border-t border-gray-100">
                {page > 1 && (
                  <a
                    href={buildUrl({ page: String(page - 1) })}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-sm text-gray-600 hover:border-[#FF4FA3] hover:text-[#FF4FA3] transition-colors"
                  >
                    ‹
                  </a>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={buildUrl({ page: String(p) })}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-[#FF4FA3] text-white shadow-sm"
                        : "border border-gray-200 text-gray-600 hover:border-[#FF4FA3] hover:text-[#FF4FA3]"
                    }`}
                  >
                    {p}
                  </a>
                ))}
                {page < totalPages && (
                  <a
                    href={buildUrl({ page: String(page + 1) })}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-sm text-gray-600 hover:border-[#FF4FA3] hover:text-[#FF4FA3] transition-colors"
                  >
                    ›
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
