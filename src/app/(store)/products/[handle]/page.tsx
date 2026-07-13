"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Heart, Share2, Truck, Shield, Package, ChevronRight, Check, Minus, Plus, Sparkles, Copy, CheckCheck } from "lucide-react";
import { ProductCard, ProductCardData } from "@/components/store/product-card";

/* ── formatPrice yardımcısı (utils import yerine inline) ── */
function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(n);
}

/* ── Veri tipi ─────────────────────────────────────── */
interface Variant { id: string; title: string; size?: string | null; color?: string | null; price: number; inventory: number; }
interface Img     { id: string; url: string; altText?: string | null; }
interface Product {
  id: string; title: string; description?: string | null;
  price: number; compareAtPrice?: number | null;
  brand?: string | null; sku?: string | null; barcode?: string | null;
  tags: string[];
  category?: { name: string; slug: string } | null;
  images: Img[];
  variants: Variant[];
  related?: ProductCardData[];
}

export default function ProductDetailPage() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [shared, setShared] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${handle}`)
      .then(r => r.json())
      .then(d => { setProduct(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [handle]);

  if (loading) return (
    <div style={{ width: "100%", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#9ca3af" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #f0e0ea", borderTopColor: "#FF4FA3", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
        <p style={{ fontSize: "0.875rem" }}>Yükleniyor...</p>
      </div>
    </div>
  );
  if (!product) return (
    <div style={{ width: "100%", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
      <p style={{ color: "#374151", fontWeight: 600, fontSize: "1.2rem" }}>Ürün bulunamadı</p>
      <Link href="/products" className="btn-primary">Ürünlere Dön</Link>
    </div>
  );

  const sizes   = [...new Set(product.variants.filter(v => v.size).map(v => v.size!))];
  const colors  = [...new Set(product.variants.filter(v => v.color).map(v => v.color!))];
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  async function handleAddToCart() {
    setAdded(true);
    await new Promise(r => setTimeout(r, 1800));
    setAdded(false);
  }

  async function handleShare() {
    const url = window.location.href;
    const title = product?.title ?? "Ürün";
    /* Web Share API — mobil cihazlarda paylaşım menüsü açar */
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} - FarukShop`, url });
        return;
      } catch {}
    }
    /* Masaüstü fallback — linki kopyala */
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      setShowShareMenu(v => !v);
    }
  }

  return (
    <div style={{ width: "100%", background: "#f9fafb", paddingBottom: "4rem" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "12px 0" }}>
        <div className="container">
          <nav className="product-breadcrumb" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: "#9ca3af" }}>
            <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Ana Sayfa</Link>
            <ChevronRight size={12} />
            <Link href="/products" style={{ color: "#9ca3af", textDecoration: "none" }}>Ürünler</Link>
            {product.category && (
              <>
                <ChevronRight size={12} />
                <span style={{ color: "#6b7280" }}>{product.category.name}</span>
              </>
            )}
            <ChevronRight size={12} />
            <span style={{ color: "#111827", fontWeight: 500 }}>{product.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Ana içerik ── */}
      <div className="container" style={{ paddingTop: "2.5rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "start",
        }} className="product-detail-grid">

          {/* ─────── Sol: Görseller ─────── */}
          <div style={{ position: "sticky", top: "100px" }}>
            {/* Ana görsel */}
            <div style={{
              borderRadius: 20,
              overflow: "hidden",
              background: "#1e0a2e",
              aspectRatio: "4/5",
              position: "relative",
            }}>
              {product.images[activeImg] ? (
                <img
                  src={product.images[activeImg].url}
                  alt={product.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShoppingBag size={64} color="rgba(255,79,163,0.3)" />
                </div>
              )}

              {/* Discount badge */}
              {discount > 0 && (
                <div style={{ position: "absolute", top: 16, left: 16, background: "#ef4444", color: "white", borderRadius: 99, padding: "4px 12px", fontSize: "12px", fontWeight: 700 }}>
                  -%{discount}
                </div>
              )}

              {/* Wishlist */}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                style={{
                  position: "absolute", top: 16, right: 16,
                  width: 40, height: 40, borderRadius: "50%",
                  background: wishlisted ? "#FF4FA3" : "rgba(255,255,255,0.9)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.2s",
                }}
              >
                <Heart size={17} fill={wishlisted ? "white" : "none"} color={wishlisted ? "white" : "#6b7280"} />
              </button>
            </div>

            {/* Küçük görseller */}
            {product.images.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(product.images.length, 5)}, 1fr)`, gap: "0.5rem", marginTop: "0.75rem" }}>
                {product.images.slice(0, 5).map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)} style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    aspectRatio: "1",
                    border: `2px solid ${activeImg === i ? "#FF4FA3" : "transparent"}`,
                    padding: 0, cursor: "pointer",
                    transition: "all 0.15s",
                  }}>
                    <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─────── Sağ: Detaylar ─────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Başlık */}
            <div>
              {product.brand && (
                <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FF4FA3", marginBottom: "0.4rem" }}>
                  {product.brand}
                </p>
              )}
              <h1 className="product-detail-title" style={{ fontSize: "1.9rem", fontWeight: 800, color: "#0d0d1a", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                {product.title}
              </h1>
              {product.category && (
                <Link href={`/collections/${product.category.slug}`} style={{ fontSize: "0.8rem", color: "#9ca3af", textDecoration: "none", marginTop: "0.4rem", display: "inline-block" }}>
                  {product.category.name}
                </Link>
              )}
            </div>

            {/* Fiyat */}
            <div className="product-price-box" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1.2rem", background: "white", borderRadius: 16, border: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: "2.2rem", fontWeight: 800, color: "#FF4FA3" }}>
                {fmt(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span style={{ fontSize: "1.1rem", color: "#9ca3af", textDecoration: "line-through" }}>
                    {fmt(product.compareAtPrice)}
                  </span>
                  <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 8, padding: "3px 10px", fontSize: "0.8rem", fontWeight: 700 }}>
                    %{discount} İndirim
                  </span>
                </>
              )}
            </div>

            {/* Renk */}
            {colors.length > 0 && (
              <div>
                <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: "0.6rem" }}>
                  Renk: <span style={{ color: "#FF4FA3" }}>{selectedColor ?? "Seçiniz"}</span>
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c === selectedColor ? null : c)} style={{
                      padding: "8px 18px",
                      borderRadius: 10,
                      border: `2px solid ${selectedColor === c ? "#FF4FA3" : "#e5e7eb"}`,
                      background: selectedColor === c ? "#fff0f7" : "white",
                      color: selectedColor === c ? "#FF4FA3" : "#374151",
                      fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
                      transition: "all 0.15s",
                    }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Beden */}
            {sizes.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
                    Beden: <span style={{ color: "#FF4FA3" }}>{selectedSize ?? "Seçiniz"}</span>
                  </p>
                  <button style={{ fontSize: "0.75rem", color: "#FF4FA3", background: "none", border: "none", cursor: "pointer" }}>
                    Beden Rehberi →
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s === selectedSize ? null : s)} style={{
                      width: 52, height: 52,
                      borderRadius: 12,
                      border: `2px solid ${selectedSize === s ? "#FF4FA3" : "#e5e7eb"}`,
                      background: selectedSize === s ? "#fff0f7" : "white",
                      color: selectedSize === s ? "#FF4FA3" : "#374151",
                      fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Adet */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>Adet:</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0", border: "2px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "white" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 42, height: 42, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                  <Minus size={16} />
                </button>
                <span style={{ width: 40, textAlign: "center", fontWeight: 700, fontSize: "1rem", color: "#111827" }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: 42, height: 42, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Sepete Ekle */}
            <div className="product-actions" style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1, height: 56,
                  background: added
                    ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                    : "linear-gradient(135deg, #FF4FA3 0%, #c2185b 100%)",
                  color: "white", border: "none", borderRadius: 16,
                  fontSize: "1rem", fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: added ? "0 8px 24px rgba(34,197,94,0.3)" : "0 8px 24px rgba(255,79,163,0.35)",
                  transition: "all 0.3s",
                }}
              >
                {added ? <><Check size={20} /> Sepete Eklendi</> : <><ShoppingBag size={20} /> Sepete Ekle</>}
              </button>
              <button
                onClick={() => setWishlisted(!wishlisted)}
                style={{
                  width: 56, height: 56,
                  border: `2px solid ${wishlisted ? "#FF4FA3" : "#e5e7eb"}`,
                  background: wishlisted ? "#fff0f7" : "white",
                  borderRadius: 16, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                <Heart size={20} fill={wishlisted ? "#FF4FA3" : "none"} color={wishlisted ? "#FF4FA3" : "#6b7280"} />
              </button>
              {/* Paylaş */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={handleShare}
                  title="Paylaş"
                  style={{
                    width: 56, height: 56,
                    border: `2px solid ${shared ? "#22c55e" : "#e5e7eb"}`,
                    background: shared ? "#f0fdf4" : "white",
                    borderRadius: 16, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>
                  {shared
                    ? <CheckCheck size={20} color="#22c55e" />
                    : <Share2 size={20} color="#6b7280" />
                  }
                </button>

                {/* Fallback dropdown — kopyalandı bildirimi */}
                {showShareMenu && (
                  <div style={{
                    position: "absolute", bottom: "calc(100% + 8px)", right: 0,
                    background: "white", borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    padding: "0.5rem",
                    minWidth: 180, zIndex: 20,
                  }}>
                    {[
                      { label: "Linki Kopyala", action: async () => { await navigator.clipboard.writeText(window.location.href); setShowShareMenu(false); setShared(true); setTimeout(() => setShared(false), 2000); } },
                      { label: "WhatsApp'ta Paylaş", action: () => { window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, "_blank"); setShowShareMenu(false); } },
                      { label: "Twitter'da Paylaş",   action: () => { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product?.title ?? "")}`, "_blank"); setShowShareMenu(false); } },
                    ].map(({ label, action }) => (
                      <button key={label} onClick={action} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        width: "100%", padding: "9px 12px", background: "none",
                        border: "none", borderRadius: 8, cursor: "pointer",
                        fontSize: "0.83rem", color: "#374151", textAlign: "left",
                        transition: "background 0.1s",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Özellikler */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
              {[
                { icon: Truck,     title: "Ücretsiz Kargo", sub: "500₺ üzeri" },
                { icon: Package,   title: "Gizli Paket",    sub: "İçerik gizli" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                  padding: "1rem 0.5rem", background: "white", borderRadius: 14,
                  border: "1px solid #f3f4f6",
                }}>
                  <Icon size={18} color="#FF4FA3" style={{ marginBottom: 6 }} />
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151" }}>{title}</p>
                  <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Açıklama */}
            {product.description && (
              <div style={{ background: "white", borderRadius: 16, padding: "1.5rem", border: "1px solid #f3f4f6" }}>
                <h3 style={{ fontWeight: 700, color: "#0d0d1a", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                  Ürün Açıklaması
                </h3>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.75 }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Etiketler */}
            {product.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {product.tags.map(tag => (
                  <span key={tag} style={{
                    padding: "4px 12px", background: "#f9fafb", border: "1px solid #e5e7eb",
                    borderRadius: 99, fontSize: "0.75rem", color: "#6b7280",
                  }}># {tag}</span>
                ))}
              </div>
            )}

            {/* SKU */}
            {(product.sku || product.barcode) && (
              <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.75rem", color: "#9ca3af" }}>
                {product.sku && <span>SKU: <strong>{product.sku}</strong></span>}
                {product.barcode && <span>Barkod: <strong>{product.barcode}</strong></span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Benzer Ürünler ── */}
      {product.related && product.related.length > 0 && (
        <section style={{ width: "100%", background: "#f9fafb", padding: "3rem 0", borderTop: "1px solid #f3f4f6" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.75rem" }}>
              <Sparkles size={16} color="#FF4FA3" />
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0d0d1a", letterSpacing: "-0.02em" }}>
                Benzer Ürünler
                {product.category && (
                  <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#9ca3af", marginLeft: 8 }}>
                    — {product.category.name}
                  </span>
                )}
              </h2>
              {product.category && (
                <Link href={`/collections/${product.category.slug}`} style={{
                  marginLeft: "auto", fontSize: "0.82rem", color: "#FF4FA3",
                  fontWeight: 600, textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  Tümünü Gör <ChevronRight size={14} />
                </Link>
              )}
            </div>
            <div className="product-grid-home" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
              {product.related.map(r => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Spin animasyonu */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
