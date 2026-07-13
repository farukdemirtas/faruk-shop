"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Flame, ArrowRight } from "lucide-react";

const collections = [
  { label: "Babydoll & Gecelik",  href: "/collections/gece-koleksiyonu" },
  { label: "Fantazi Kostümler",   href: "/collections/fantazi-kostumler" },
  { label: "Korse & Sütyen",      href: "/collections/saten-dantel" },
  { label: "Yeni Gelenler",       href: "/collections/yeni-gelenler" },
  { label: "Tüm Ürünler",         href: "/products" },
];

const contact = [
  { icon: Mail,    text: "info@farukshop.com" },
  { icon: Phone,   text: "0538 611 35 03" },
  { icon: MapPin,  text: "Samsun, Türkiye" },
];

export function Footer() {
  return (
    <footer style={{ width: "100%", background: "#0d0d1a", color: "white" }}>
      {/* Main grid */}
      <div className="container" style={{ paddingTop: "4.5rem", paddingBottom: "3rem" }}>
        <div className="footer-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "3rem",
        }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: "1.2rem" }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "linear-gradient(135deg, #FF4FA3 0%, #c2185b 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(255,79,163,0.3)",
              }}>
                <Flame size={18} color="white" />
              </div>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Faruk<span style={{ color: "#FF4FA3" }}>Shop</span>
              </span>
            </Link>

            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.83rem", lineHeight: 1.7, maxWidth: 220 }}>
              +18 Fantazi iç giyim ve kostüm. Gizli paket, güvenli ödeme ile kapınıza kadar.
            </p>

            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,79,163,0.15)",
              border: "1px solid rgba(255,79,163,0.3)",
              borderRadius: 99,
              padding: "5px 14px",
              marginTop: "1rem",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#FF4FA3",
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}>
              +18 Yalnızca Yetişkinler
            </div>
          </div>

          {/* Koleksiyonlar */}
          <div>
            <h4 style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)", marginBottom: "1.2rem" }}>
              Koleksiyonlar
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" as const, gap: "0.6rem" }}>
              {collections.map(c => (
                <li key={c.href}>
                  <Link href={c.href} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    color: "rgba(255,255,255,0.45)", fontSize: "0.875rem",
                    textDecoration: "none", transition: "color 0.15s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#FF4FA3"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)"; }}
                  >
                    <ArrowRight size={12} /> {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)", marginBottom: "1.2rem" }}>
              İletişim
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" as const, gap: "0.8rem" }}>
              {contact.map(({ icon: Icon, text }) => (
                <li key={text} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" }}>
                  <Icon size={14} color="#FF4FA3" style={{ flexShrink: 0 }} />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Bülten */}
          <div>
            <h4 style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)", marginBottom: "1.2rem" }}>
              Yeni Ürünlerden Haberdar Ol
            </h4>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.83rem", marginBottom: "1rem" }}>
              Kampanya ve yeni koleksiyonlardan ilk siz haberdar olun.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="email"
                placeholder="E-posta adresiniz"
                style={{
                  flex: 1, height: 44,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10, padding: "0 14px",
                  color: "white", fontSize: "0.83rem",
                  outline: "none",
                }}
              />
              <button style={{
                height: 44, width: 44,
                background: "linear-gradient(135deg, #FF4FA3 0%, #c2185b 100%)",
                border: "none", borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
              }}>
                <ArrowRight size={16} color="white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="container footer-bottom" style={{
          display: "flex", flexWrap: "wrap" as const,
          alignItems: "center", justifyContent: "space-between",
          gap: "0.75rem", paddingTop: "1.2rem", paddingBottom: "1.2rem",
          fontSize: "0.75rem", color: "rgba(255,255,255,0.25)",
        }}>
          <p>
            © 2026 FarukShop · Tüm hakları saklıdır &nbsp;·&nbsp; Bu site yalnızca{" "}
            <span style={{ color: "#FF4FA3" }}>18+</span> bireyler içindir
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Gizlilik Politikası", "Kullanım Koşulları", "18+ Uyarı"].map(l => (
              <Link key={l} href="#" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.25)"; }}
              >{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
