import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import { CopyButton } from "@/components/store/copy-button";
import { HeroSlider } from "@/components/store/hero-slider";
import Link from "next/link";
import { ArrowRight, Package, Lock, Shield, Truck, Sparkles, RotateCcw, Flame } from "lucide-react";

export const revalidate = 60;

const UNSPLASH = "https://images.unsplash.com";

/* ── Sabit hero slider verileri (DB'de banner yoksa fallback) ── */
const DEFAULT_SLIDES = [
  {
    id: "s1",
    title: "Yeni Sezon\nFantazi Koleksiyon",
    subtitle: "Babydoll, korse ve kostüm. Gizli paket ile kapınıza kadar.",
    image: `${UNSPLASH}/photo-1529139574466-a303027c1d8b?w=1600&q=85&auto=format&fit=crop`,
    link: "/collections/gece-koleksiyonu",
    buttonText: "Koleksiyonu Keşfet",
    badge: "2024 Yeni Sezon",
  },
  {
    id: "s2",
    title: "Fantazi\nKostüm Serisi",
    subtitle: "Özel roleplay kostümleri. Sınırlı stok, hızlı kargo.",
    image: `${UNSPLASH}/photo-1485231183945-fffde7ea051a?w=1600&q=85&auto=format&fit=crop`,
    link: "/collections/fantazi-kostumler",
    buttonText: "İncele",
    badge: "En Çok Satan",
  },
  {
    id: "s3",
    title: "Saten & Dantel\nKorse Koleksiyonu",
    subtitle: "Premium saten ve dantel korse setleri. S'den XL'e tüm bedenler.",
    image: `${UNSPLASH}/photo-1551489186-cf8726f514f8?w=1600&q=85&auto=format&fit=crop`,
    link: "/collections/saten-dantel",
    buttonText: "Alışverişe Başla",
    badge: "Premium Koleksiyon",
  },
];

/* ── Kategori banner grid ── */
const CATEGORY_BANNERS = [
  {
    slug: "gece-koleksiyonu",
    name: "Babydoll & Gecelik",
    sub: "Dantel ve saten koleksiyonu",
    image: `${UNSPLASH}/photo-1529139574466-a303027c1d8b?w=800&q=80&auto=format&fit=crop`,
    tag: "ÇOK SATAN",
    tagColor: "#FF4FA3",
  },
  {
    slug: "fantazi-kostumler",
    name: "Fantazi Kostümler",
    sub: "Roleplay & kostüm serisi",
    image: `${UNSPLASH}/photo-1485231183945-fffde7ea051a?w=800&q=80&auto=format&fit=crop`,
    tag: "YENİ",
    tagColor: "#7c3aed",
  },
  {
    slug: "saten-dantel",
    name: "Korse & Sütyen",
    sub: "Premium saten & dantel",
    image: `${UNSPLASH}/photo-1551489186-cf8726f514f8?w=800&q=80&auto=format&fit=crop`,
    tag: "İNDİRİM",
    tagColor: "#ef4444",
  },
  {
    slug: "yeni-gelenler",
    name: "Yeni Gelenler",
    sub: "Son eklenen ürünler",
    image: `${UNSPLASH}/photo-1496747611176-843222e1e57c?w=800&q=80&auto=format&fit=crop`,
    tag: "TAZE",
    tagColor: "#059669",
  },
];

async function getHomeData() {
  const [banners, featuredProducts, bestSellers] = await Promise.all([
    db.banner.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    }),
    db.product.findMany({
      where: { status: "ACTIVE" },
      include: { images: { take: 1, orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.product.findMany({
      where: { status: "ACTIVE" },
      include: { images: { take: 1, orderBy: { position: "asc" } } },
      orderBy: { createdAt: "asc" },
      take: 4,
    }),
  ]);
  return { banners, featuredProducts, bestSellers };
}

export default async function HomePage() {
  const { banners, featuredProducts, bestSellers } = await getHomeData();

  /* DB bannerlarını slider formatına çevir, yoksa default kullan */
  const slides =
    banners.length > 0
      ? banners.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          image: b.image,
          link: b.link,
          buttonText: b.buttonText,
          badge: "+18 Koleksiyon",
        }))
      : DEFAULT_SLIDES;

  return (
    <div style={{ width: "100%" }}>

      {/* ══ 1. HERO SLIDER ════════════════════════════ */}
      <HeroSlider slides={slides} />

      {/* ══ 2. KARGO ŞERİDİ ══════════════════════════ */}
      <div style={{
        width: "100%",
        background: "linear-gradient(90deg, #FF4FA3 0%, #c2185b 100%)",
        padding: "13px 0",
      }}>
        <div className="container">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem" }}>
            {[
              { icon: Truck,     text: "600 TL Üzeri Kargo Ücretsiz" },
              { icon: Package,   text: "Gizli Paket Teslimat" },
              { icon: RotateCcw, text: "14 Gün İade Hakkı" },
              { icon: Shield,    text: "Güvenli & Gizli Ödeme" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, color: "white", fontSize: "0.8rem", fontWeight: 500 }}>
                <Icon size={14} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 3. KATEGORİ BANNER GRID ══════════════════ */}
      <section style={{ width: "100%", background: "white", padding: "3rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d0d1a", letterSpacing: "-0.02em" }}>
              Koleksiyonlar
            </h2>
            <Link href="/collections" style={{ display: "flex", alignItems: "center", gap: 5, color: "#FF4FA3", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
              Tümünü Gör <ArrowRight size={14} />
            </Link>
          </div>

          {/* 2+2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }} className="banner-grid">
            {CATEGORY_BANNERS.map((cat) => (
              <Link key={cat.slug} href={`/collections/${cat.slug}`} style={{
                position: "relative",
                borderRadius: 14,
                overflow: "hidden",
                aspectRatio: "3/4",
                display: "block",
                textDecoration: "none",
                background: "#1e0a2e",
              }}
                className="banner-card"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    opacity: 0.7,
                    transition: "transform 0.4s ease, opacity 0.3s",
                  }}
                  className="banner-img"
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
                }} />

                {/* Etiket */}
                <div style={{ position: "absolute", top: 12, left: 12 }}>
                  <span style={{
                    padding: "3px 10px",
                    background: cat.tagColor,
                    color: "white",
                    fontSize: "10px",
                    fontWeight: 700,
                    borderRadius: 99,
                    letterSpacing: "0.06em",
                  }}>{cat.tag}</span>
                </div>

                {/* Yazılar */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.1rem" }}>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", marginBottom: "4px" }}>{cat.sub}</p>
                  <p style={{ color: "white", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2 }}>{cat.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, color: "#FF4FA3", fontSize: "12px", fontWeight: 600 }}>
                    Keşfet <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. PROMOSYON BANNER (tam genişlik) ════════ */}
      <section style={{ width: "100%", position: "relative", overflow: "hidden", background: "#1e0a2e" }}>
        <div style={{ position: "relative", aspectRatio: "16/5", minHeight: 200, maxHeight: 340 }}>
          <img
            src={`${UNSPLASH}/photo-1496747611176-843222e1e57c?w=1600&q=80&auto=format&fit=crop`}
            alt="Kampanya"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", opacity: 0.4 }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(194,24,91,0.85) 0%, rgba(13,13,26,0.7) 100%)",
            display: "flex", alignItems: "center",
          }}>
            <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  Özel Kampanya
                </p>
                <h3 style={{ color: "white", fontSize: "clamp(1.4rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  İlk Siparişinizde <span style={{ color: "#ffb3d9" }}>%15 İndirim</span>
                </h3>
                <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "0.4rem", fontSize: "0.875rem" }}>
                  YEVA15 kodunu kullanın
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.75rem",
                  background: "rgba(255,255,255,0.12)",
                  border: "2px dashed rgba(255,255,255,0.4)",
                  borderRadius: 14, padding: "10px 20px",
                }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.3rem", color: "white", letterSpacing: "0.1em" }}>YEVA15</span>
                  <CopyButton text="YEVA15" />
                </div>
                <Link href="/products" className="btn-outline">
                  Alışverişe Git <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 5. YENİ GELENLER ═════════════════════════ */}
      <section style={{ width: "100%", background: "#f9fafb", padding: "3.5rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p className="section-label" style={{ marginBottom: "0.4rem" }}>Yeni Ürünler</p>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0d0d1a", letterSpacing: "-0.02em" }}>Yeni Gelenler</h2>
            </div>
            <Link href="/products" style={{ display: "flex", alignItems: "center", gap: 5, color: "#FF4FA3", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
              Tümünü Gör <ArrowRight size={14} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#9ca3af" }}>
              Henüz ürün eklenmemiş.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
              {featuredProducts.map((p, i) => (
                <ProductCard key={p.id} product={{
                  id: p.id, title: p.title,
                  handle: p.shopifyHandle ?? p.slug,
                  price: p.price.toString(),
                  compareAtPrice: p.compareAtPrice?.toString(),
                  image: p.images[0]?.url,
                  brand: p.brand ?? undefined,
                  isNew: i < 4,
                  isSale: !!(p.compareAtPrice && p.compareAtPrice > p.price),
                }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ 6. 2'Lİ BANNER (Yatay) ═══════════════════ */}
      <section style={{ width: "100%", background: "white", padding: "2.5rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
            {[
              {
                title: "Gece Koleksiyonu",
                sub: "Babydoll & Gecelik",
                href: "/collections/gece-koleksiyonu",
                img: `${UNSPLASH}/photo-1529139574466-a303027c1d8b?w=800&q=80&auto=format&fit=crop`,
                color: "linear-gradient(135deg, #FF4FA3 0%, #c2185b 100%)",
              },
              {
                title: "Kostüm Serisi",
                sub: "Fantazi & Roleplay",
                href: "/collections/fantazi-kostumler",
                img: `${UNSPLASH}/photo-1485231183945-fffde7ea051a?w=800&q=80&auto=format&fit=crop`,
                color: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
              },
            ].map((b) => (
              <Link key={b.href} href={b.href} style={{
                position: "relative",
                display: "block",
                borderRadius: 16,
                overflow: "hidden",
                aspectRatio: "2/1",
                textDecoration: "none",
                background: "#1e0a2e",
              }}>
                <img src={b.img} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55, transition: "transform 0.4s, opacity 0.3s" }}
                  className="banner-img"
                />
                <div style={{ position: "absolute", inset: 0, background: b.color, opacity: 0.5 }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", padding: "1.5rem" }}>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", marginBottom: "0.3rem" }}>{b.sub}</p>
                    <p style={{ color: "white", fontWeight: 800, fontSize: "1.3rem" }}>{b.title}</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, color: "white", fontSize: "0.8rem", fontWeight: 600 }}>
                      Keşfet <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. ÇOK SATANLAR ══════════════════════════ */}
      {bestSellers.length > 0 && (
        <section style={{ width: "100%", background: "#f9fafb", padding: "3.5rem 0" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <p className="section-label" style={{ marginBottom: "0.4rem" }}>
                  <Flame size={11} style={{ display: "inline", marginRight: 4 }} />
                  Çok Satanlar
                </p>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0d0d1a", letterSpacing: "-0.02em" }}>En Çok Satılanlar</h2>
              </div>
              <Link href="/products?sort=popular" style={{ display: "flex", alignItems: "center", gap: 5, color: "#FF4FA3", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                Tümünü Gör <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={{
                  id: p.id, title: p.title,
                  handle: p.shopifyHandle ?? p.slug,
                  price: p.price.toString(),
                  compareAtPrice: p.compareAtPrice?.toString(),
                  image: p.images[0]?.url,
                  brand: p.brand ?? undefined,
                  isSale: !!(p.compareAtPrice && p.compareAtPrice > p.price),
                }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 8. NEDEN BİZ ════════════════════════════ */}
      <section style={{
        width: "100%",
        background: "linear-gradient(135deg, #0d0d1a 0%, #1e0a2e 50%, #0d0d1a 100%)",
        padding: "4.5rem 0",
      }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="badge-18" style={{ display: "inline-flex", marginBottom: "1rem" }}>
              <Sparkles size={11} /> Neden Biz?
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
              Güvenli & Gizli Alışveriş
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {[
              { emoji: "📦", title: "Gizli Paket",        desc: "İçeriği belli olmayan nötr ambalaj. Kimse ne aldığınızı bilmez." },
              { emoji: "🔒", title: "SSL Güvenli Ödeme",  desc: "256-bit şifreleme. Kart bilgileriniz asla saklanmaz." },
              { emoji: "🛡️", title: "Gizlilik Garantisi", desc: "KVKK güvencesi altında kişisel veri koruması." },
              { emoji: "🚚", title: "Hızlı Kargo",         desc: "24-48 saat kargoya verilir. Türkiye geneli kapı teslim." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="glass" style={{ padding: "1.75rem" }}>
                <div style={{ fontSize: "2.25rem", marginBottom: "1rem" }}>{emoji}</div>
                <h3 style={{ color: "white", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>{title}</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem", marginTop: "2.5rem" }}>
            {["KVKK Uyumlu", "7/24 Destek", "Türkiye Geneli Kargo", "Yasal Güvence"].map(item => (
              <span key={item} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF4FA3", display: "inline-block" }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
