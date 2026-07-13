"use client";

import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, Package, Shield, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { loadCart, saveCart, type CartItem } from "@/lib/cart-storage";
import { BANNER_IMAGES } from "@/lib/banner-images";

const DEMO_ITEMS: CartItem[] = [
  { id: "1", title: "Deri Seksi Gecelik", price: 1199, quantity: 1, size: "M", color: "Siyah",
    image: BANNER_IMAGES.product.gecelik.replace("w=800", "w=200").replace("q=88", "q=80") },
  { id: "2", title: "Seksi Jartiyer Takım", price: 899, quantity: 2, size: "S",
    image: BANNER_IMAGES.product.jartiyer.replace("w=800", "w=200").replace("q=88", "q=80") },
];

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    const saved = loadCart();
    if (saved.items.length > 0) {
      setItems(saved.items);
      if (saved.couponApplied) {
        setCouponApplied(true);
        setCoupon(saved.couponCode ?? "YEVA15");
      }
    } else {
      setItems(DEMO_ITEMS);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveCart({
      items,
      couponCode: couponApplied ? coupon : undefined,
      couponApplied,
    });
  }, [items, coupon, couponApplied, loaded]);

  const subtotal  = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount  = couponApplied ? Math.round(subtotal * 0.15) : 0;
  const shipping  = subtotal - discount >= 600 ? 0 : 49.90;
  const total     = subtotal - discount + shipping;

  function updateQty(id: string, qty: number) {
    if (qty < 1) setItems(p => p.filter(i => i.id !== id));
    else setItems(p => p.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }

  function applyCoupon() {
    if (coupon.toUpperCase() === "YEVA15") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Geçersiz kupon kodu");
      setCouponApplied(false);
    }
  }

  function goToCheckout() {
    if (items.length === 0) return;
    saveCart({
      items,
      couponCode: couponApplied ? coupon : undefined,
      couponApplied,
    });
    router.push("/checkout");
  }

  if (!loaded) return null;

  return (
    <div style={{ width: "100%", background: "#f9fafb", minHeight: "70vh" }}>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "14px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/products" style={{
            width: 38, height: 38, borderRadius: 10,
            border: "1.5px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6b7280", textDecoration: "none", flexShrink: 0,
          }}>
            <ArrowLeft size={17} />
          </Link>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0d0d1a", letterSpacing: "-0.02em" }}>
            Sepetim
          </h1>
          <span style={{ fontSize: "0.82rem", color: "#9ca3af", fontWeight: 500 }}>
            ({items.length} ürün)
          </span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>

        {/* ── Boş sepet ── */}
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "linear-gradient(135deg, #fff0f7 0%, #ffe0f0 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}>
              <ShoppingBag size={44} color="#FF4FA3" />
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0d0d1a", marginBottom: "0.5rem" }}>
              Sepetiniz Boş
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginBottom: "2rem" }}>
              Harika ürünlerimizi keşfetmeye başlayın
            </p>
            <Link href="/products" className="btn-primary">
              <ShoppingBag size={17} /> Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.75rem", alignItems: "start" }} className="cart-grid">

            {/* ── Sol: Ürünler ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

              {/* Ücretsiz kargo bilgisi */}
              {shipping > 0 && (
                <div style={{
                  background: "linear-gradient(135deg, #fff0f7 0%, #ffe8f5 100%)",
                  border: "1px solid #ffd6ee",
                  borderRadius: 14, padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: "0.83rem", color: "#c2185b",
                }}>
                  <Package size={16} color="#FF4FA3" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>{formatPrice(600 - (subtotal - discount))}</strong> daha ekleyin, kargo <strong>ücretsiz</strong>!
                  </span>
                </div>
              )}

              {/* Ürün kartları */}
              {items.map((item) => (
                <div key={item.id} className="cart-item" style={{
                  background: "white", borderRadius: 16,
                  border: "1px solid #f3f4f6",
                  padding: "1rem",
                  display: "flex", gap: "1rem", alignItems: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}>
                  {/* Görsel */}
                  <div style={{
                    width: 86, height: 86, borderRadius: 12,
                    overflow: "hidden", flexShrink: 0,
                    background: "#f9fafb",
                  }}>
                    {item.image
                      ? <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ShoppingBag size={28} color="#e5e7eb" />
                        </div>
                    }
                  </div>

                  {/* Bilgi */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: "#111827", fontSize: "0.92rem", marginBottom: 3 }}>{item.title}</p>
                    {(item.size || item.color) && (
                      <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginBottom: 6 }}>
                        {[item.size && `Beden: ${item.size}`, item.color && `Renk: ${item.color}`].filter(Boolean).join("  ·  ")}
                      </p>
                    )}
                    <p style={{ fontWeight: 700, color: "#FF4FA3", fontSize: "1rem" }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Adet + Sil */}
                  <div className="cart-item-actions" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} style={{
                      width: 30, height: 30, borderRadius: 8,
                      border: "none", background: "#fff5f5", color: "#ef4444",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}>
                      <Trash2 size={14} />
                    </button>
                    <div style={{
                      display: "flex", alignItems: "center",
                      border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden",
                    }}>
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} style={{
                        width: 34, height: 34, border: "none", background: "none",
                        color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Minus size={13} />
                      </button>
                      <span style={{ width: 32, textAlign: "center", fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} style={{
                        width: 34, height: 34, border: "none", background: "none",
                        color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Alışverişe devam */}
              <Link href="/products" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                color: "#FF4FA3", fontSize: "0.85rem", fontWeight: 600,
                textDecoration: "none", marginTop: 4,
              }}>
                <ArrowLeft size={14} /> Alışverişe Devam Et
              </Link>
            </div>

            {/* ── Sağ: Özet ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", position: "sticky", top: "100px" }}>

              {/* Kupon */}
              <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", display: "flex", alignItems: "center", gap: 6, marginBottom: "0.75rem" }}>
                  <Tag size={13} color="#FF4FA3" /> İndirim Kuponu
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    value={coupon}
                    onChange={e => { setCoupon(e.target.value); setCouponError(""); }}
                    onKeyDown={e => e.key === "Enter" && applyCoupon()}
                    placeholder="Kupon kodu girin"
                    style={{
                      flex: 1, height: 40, padding: "0 12px",
                      border: `1.5px solid ${couponApplied ? "#22c55e" : couponError ? "#ef4444" : "#e5e7eb"}`,
                      borderRadius: 10, fontSize: "0.83rem", outline: "none",
                      color: "#111827", background: couponApplied ? "#f0fdf4" : "white",
                    }}
                  />
                  <button onClick={applyCoupon} style={{
                    height: 40, padding: "0 14px",
                    background: "linear-gradient(135deg, #FF4FA3 0%, #c2185b 100%)",
                    color: "white", border: "none", borderRadius: 10,
                    fontSize: "0.83rem", fontWeight: 600, cursor: "pointer",
                  }}>
                    Uygula
                  </button>
                </div>
                {couponApplied && (
                  <p style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: 6, fontWeight: 500 }}>
                    ✓ YEVA15 kodu uygulandı — %15 indirim
                  </p>
                )}
                {couponError && (
                  <p style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: 6 }}>{couponError}</p>
                )}
              </div>

              {/* Sipariş özeti */}
              <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontWeight: 800, color: "#0d0d1a", marginBottom: "1rem", fontSize: "1rem" }}>
                  Sipariş Özeti
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.875rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                    <span>Ara Toplam</span>
                    <span style={{ color: "#111827", fontWeight: 500 }}>{formatPrice(subtotal)}</span>
                  </div>
                  {couponApplied && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                      <span>İndirim (YEVA15)</span>
                      <span style={{ fontWeight: 600 }}>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                    <span>Kargo</span>
                    <span style={{ color: shipping === 0 ? "#16a34a" : "#111827", fontWeight: shipping === 0 ? 600 : 400 }}>
                      {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div style={{ height: 1, background: "#f3f4f6", margin: "0.25rem 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, color: "#111827" }}>Toplam</span>
                    <span style={{ fontWeight: 800, color: "#FF4FA3", fontSize: "1.15rem" }}>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={goToCheckout}
                  style={{
                  width: "100%", height: 50, marginTop: "1.25rem",
                  background: "linear-gradient(135deg, #FF4FA3 0%, #c2185b 100%)",
                  color: "white", border: "none", borderRadius: 14,
                  fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 8px 24px rgba(255,79,163,0.3)",
                  transition: "all 0.2s",
                }}>
                  Ödemeye Geç <ChevronRight size={18} />
                </button>

                {/* Güven ikonları */}
                <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", marginTop: "1rem" }}>
                  {[
                    { icon: Shield, text: "Güvenli Ödeme" },
                    { icon: Package, text: "Gizli Paket" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "#9ca3af" }}>
                      <Icon size={14} color="#FF4FA3" />
                      <span style={{ fontSize: "9px", fontWeight: 500 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
