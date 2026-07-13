"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronRight, Package, Shield, CreditCard, Banknote,
  CheckCircle2, Loader2, MapPin, User, ShoppingBag, Home,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  loadCart, clearCart, calcCartTotals,
  type CartItem, type CartState,
} from "@/lib/cart-storage";
import { CITIES, getDistricts } from "@/lib/turkey-locations";
import { LocationSelect } from "@/components/store/location-select";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  notes: string;
  paymentMethod: "cod" | "transfer";
};

const EMPTY_FORM: FormData = {
  firstName: "", lastName: "", email: "", phone: "",
  address: "", city: "", district: "", postalCode: "",
  notes: "", paymentMethod: "cod",
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartState | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const saved = loadCart();
    if (!saved.items.length) {
      router.replace("/cart");
      return;
    }
    setCart(saved);
  }, [router]);

  if (!cart) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} color="#FF4FA3" className="animate-spin" />
      </div>
    );
  }

  const { subtotal, discount, shipping, total } = calcCartTotals(
    cart.items,
    !!cart.couponApplied,
  );

  const districts = form.city ? getDistricts(form.city) : [];

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setApiError("");
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (form.firstName.trim().length < 2) e.firstName = "Ad gerekli";
    if (form.lastName.trim().length < 2) e.lastName = "Soyad gerekli";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Geçerli e-posta girin";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Geçerli telefon girin";
    if (form.address.trim().length < 10) e.address = "Adres gerekli";
    if (!form.city) e.city = "Şehir seçin";
    if (!form.district) e.district = "İlçe seçin";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!cart || !validate()) return;

    setSubmitting(true);
    setApiError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: cart.items,
          couponCode: cart.couponApplied ? cart.couponCode ?? "YEVA15" : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sipariş oluşturulamadı");

      clearCart();
      setOrderNumber(data.orderNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Başarı ekranı ── */
  if (orderNumber) {
    return (
      <div style={{
        width: "100%", background: "#f9fafb", minHeight: "70vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2.5rem 1rem",
      }}>
        <div style={{
          width: "100%", maxWidth: 460,
          background: "white",
          borderRadius: 20,
          border: "1px solid #f3f4f6",
          boxShadow: "0 12px 48px rgba(0,0,0,0.07)",
          padding: "2.5rem 2rem",
          textAlign: "center",
        }}>
          {/* İkon */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
            border: "3px solid #bbf7d0",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}>
            <CheckCircle2 size={40} color="#16a34a" strokeWidth={2.5} />
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d0d1a", marginBottom: "0.35rem", letterSpacing: "-0.02em" }}>
            Siparişiniz Alındı!
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            Teşekkür ederiz, siparişiniz başarıyla oluşturuldu.
          </p>

          {/* Sipariş no kutusu */}
          <div style={{
            background: "linear-gradient(135deg, #fff0f7 0%, #ffe8f5 100%)",
            border: "1px solid #ffd6ee",
            borderRadius: 14,
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
          }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Sipariş Numaranız
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FF4FA3", letterSpacing: "-0.02em" }}>
              #{orderNumber}
            </p>
          </div>

          {/* Bilgi satırları */}
          <div style={{
            display: "flex", flexDirection: "column", gap: "0.5rem",
            textAlign: "left", marginBottom: "1.5rem",
          }}>
            {[
              { icon: Package, text: "Siparişiniz gizli paket ile kargoya verilecektir." },
              { icon: Shield, text: "En kısa sürede sizinle iletişime geçeceğiz." },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "0.65rem 0.85rem",
                background: "#f9fafb", borderRadius: 10,
                fontSize: "0.82rem", color: "#6b7280",
              }}>
                <Icon size={15} color="#FF4FA3" style={{ flexShrink: 0 }} />
                {text}
              </div>
            ))}
          </div>

          {/* Butonlar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <Link
              href="/products"
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
            >
              <ShoppingBag size={17} /> Alışverişe Devam Et
            </Link>
            <Link
              href="/"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", height: 48,
                border: "1.5px solid #e5e7eb", borderRadius: 16,
                color: "#374151", fontWeight: 600, fontSize: "0.875rem",
                textDecoration: "none", background: "white",
                transition: "all 0.2s",
              }}
            >
              <Home size={17} color="#6b7280" /> Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: "100%", height: 44, padding: "0 14px",
    border: `1.5px solid ${err ? "#ef4444" : "#e5e7eb"}`,
    borderRadius: 12, fontSize: "0.875rem", outline: "none",
    color: "#111827", background: "white",
  });

  return (
    <div style={{ width: "100%", background: "#f9fafb", minHeight: "70vh" }}>
      <div style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "14px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/cart" style={{
            width: 38, height: 38, borderRadius: 10,
            border: "1.5px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6b7280", textDecoration: "none",
          }}>
            <ArrowLeft size={17} />
          </Link>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0d0d1a" }}>Ödeme & Teslimat</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <div className="cart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.75rem", alignItems: "start" }}>

          {/* Sol: Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* İletişim */}
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: "1.25rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                <User size={16} color="#FF4FA3" /> İletişim Bilgileri
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 4 }}>Ad *</label>
                  <input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} style={inputStyle(errors.firstName)} placeholder="Adınız" />
                  {errors.firstName && <p style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: 4 }}>{errors.firstName}</p>}
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 4 }}>Soyad *</label>
                  <input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} style={inputStyle(errors.lastName)} placeholder="Soyadınız" />
                  {errors.lastName && <p style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: 4 }}>{errors.lastName}</p>}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 4 }}>E-posta *</label>
                  <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} style={inputStyle(errors.email)} placeholder="ornek@email.com" />
                  {errors.email && <p style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: 4 }}>{errors.email}</p>}
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 4 }}>Telefon *</label>
                  <input type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} style={inputStyle(errors.phone)} placeholder="05XX XXX XX XX" />
                  {errors.phone && <p style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: 4 }}>{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Adres */}
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: "1.25rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={16} color="#FF4FA3" /> Teslimat Adresi
              </h2>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 4 }}>Adres *</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  rows={3}
                  placeholder="Mahalle, sokak, bina no, daire..."
                  style={{ ...inputStyle(errors.address), height: "auto", padding: "12px 14px", resize: "vertical" }}
                />
                {errors.address && <p style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: 4 }}>{errors.address}</p>}
              </div>
              <div className="checkout-location-block">
                <div className="checkout-location-grid">
                  <LocationSelect
                    label="İl"
                    value={form.city}
                    onChange={(city) => {
                      setForm((p) => ({ ...p, city, district: "" }));
                      setErrors((p) => ({ ...p, city: undefined, district: undefined }));
                      setApiError("");
                    }}
                    options={CITIES}
                    placeholder="İl seçin"
                    error={errors.city}
                    required
                    searchable
                  />
                  <LocationSelect
                    label="İlçe"
                    value={form.district}
                    onChange={(district) => setField("district", district)}
                    options={districts}
                    placeholder={form.city ? "İlçe seçin" : "Önce il seçin"}
                    disabled={!form.city}
                    error={errors.district}
                    required
                    searchable={districts.length > 12}
                  />
                  <div>
                    <label className="form-label">Posta Kodu</label>
                    <input
                      className="form-input"
                      value={form.postalCode}
                      onChange={(e) => setField("postalCode", e.target.value)}
                      placeholder="55000"
                    />
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                <label style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 4 }}>Sipariş Notu (isteğe bağlı)</label>
                <input value={form.notes} onChange={(e) => setField("notes", e.target.value)} style={inputStyle()} placeholder="Gizli paket, kapıya bırakın vb." />
              </div>
            </div>

            {/* Ödeme yöntemi */}
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: "1.25rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                <CreditCard size={16} color="#FF4FA3" /> Ödeme Yöntemi
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {([
                  { id: "cod" as const, icon: Banknote, label: "Kapıda Ödeme", desc: "Kargo tesliminde nakit veya kart" },
                  { id: "transfer" as const, icon: CreditCard, label: "Havale / EFT", desc: "Sipariş sonrası IBAN bilgisi gönderilir" },
                ]).map(({ id, icon: Icon, label, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setField("paymentMethod", id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      border: `2px solid ${form.paymentMethod === id ? "#FF4FA3" : "#e5e7eb"}`,
                      background: form.paymentMethod === id ? "#fff0f7" : "white",
                    }}
                  >
                    <Icon size={18} color={form.paymentMethod === id ? "#FF4FA3" : "#9ca3af"} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>{label}</p>
                      <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ: Özet */}
          <div style={{ position: "sticky", top: "100px" }}>
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: "1.25rem" }}>
              <h2 style={{ fontWeight: 800, color: "#0d0d1a", marginBottom: "1rem", fontSize: "1rem" }}>Sipariş Özeti</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
                {cart.items.map((item: CartItem) => (
                  <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f9fafb" }}>
                      {item.image && <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 500, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                      <p style={{ fontSize: "0.72rem", color: "#9ca3af" }}>x{item.quantity}</p>
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#FF4FA3" }}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem", borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                  <span>Ara Toplam</span><span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                    <span>İndirim</span><span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                  <span>Kargo</span>
                  <span style={{ color: shipping === 0 ? "#16a34a" : undefined }}>{shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, paddingTop: "0.5rem", borderTop: "1px solid #f3f4f6" }}>
                  <span>Toplam</span>
                  <span style={{ color: "#FF4FA3", fontSize: "1.1rem" }}>{formatPrice(total)}</span>
                </div>
              </div>

              {apiError && (
                <p style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "0.75rem", textAlign: "center" }}>{apiError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%", height: 50, marginTop: "1rem",
                  background: submitting ? "#e5e7eb" : "linear-gradient(135deg, #FF4FA3 0%, #c2185b 100%)",
                  color: "white", border: "none", borderRadius: 14,
                  fontSize: "0.95rem", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: submitting ? "none" : "0 8px 24px rgba(255,79,163,0.3)",
                }}
              >
                {submitting
                  ? <><Loader2 size={18} className="animate-spin" /> İşleniyor...</>
                  : <>Siparişi Onayla <ChevronRight size={18} /></>}
              </button>

              <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.75rem" }}>
                {[
                  { icon: Shield, text: "Güvenli" },
                  { icon: Package, text: "Gizli Paket" },
                ].map(({ icon: Icon, text }) => (
                  <span key={text} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#9ca3af" }}>
                    <Icon size={12} color="#FF4FA3" /> {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
