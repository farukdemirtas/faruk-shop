"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Flame, Search, Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { SearchModal } from "@/components/store/search-modal";

const links = [
  { label: "Ana Sayfa",         href: "/" },
  { label: "Tüm Ürünler",       href: "/products" },
  { label: "Babydoll & Gecelik",href: "/collections/gece-koleksiyonu" },
  { label: "Fantazi Kostümler", href: "/collections/fantazi-kostumler" },
  { label: "Korse & Sütyen",    href: "/collections/saten-dantel" },
  { label: "Yeni Gelenler",     href: "/collections/yeni-gelenler" },
];

export function Navbar({ cartCount = 0 }: { cartCount?: number }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      {/* +18 uyarı şeridi */}
      <div className="top-warning-bar" style={{
        width: "100%",
        background: "linear-gradient(90deg, #0d0d1a 0%, #1e1e3a 50%, #0d0d1a 100%)",
        borderBottom: "1px solid rgba(255,79,163,0.2)",
        textAlign: "center",
        padding: "7px 16px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "rgba(255,79,163,0.9)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 60,
      }}>
        <span className="top-bar-full">
          ⚠ Bu site yalnızca +18 bireyler içindir &nbsp;·&nbsp; Gizli Paket &nbsp;·&nbsp; Güvenli Ödeme &nbsp;·&nbsp; Türkiye Geneli Kargo
        </span>
        <span className="top-bar-short">
          ⚠ +18 &nbsp;·&nbsp; Gizli Paket &nbsp;·&nbsp; Güvenli Ödeme
        </span>
      </div>

      {/* Ana nav */}
      <nav className="store-nav" style={{
        position: "fixed",
        top: "33px",
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 50,
        transition: "all 0.3s ease",
        background: scrolled
          ? "rgba(255,255,255,0.97)"
          : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid #f0e0ea" : "1px solid rgba(240,224,234,0.5)",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
      }}>
        <div className="container nav-bar-row">
          {/* Logo */}
          <Link href="/" className="nav-logo-link">
            <div style={{
              width: 36, height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #FF4FA3 0%, #c2185b 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(255,79,163,0.4)",
            }}>
              <Flame size={18} color="white" />
            </div>
            <span className="nav-logo-text" style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0d0d1a", letterSpacing: "-0.02em" }}>
              Faruk<span style={{ color: "#FF4FA3" }}>Shop</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop-links">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} style={{
                  padding: "7px 13px",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  fontWeight: active ? 600 : 500,
                  color: active ? "#FF4FA3" : "#374151",
                  background: active ? "#fff0f7" : "transparent",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="nav-actions">
            {/* Arama */}
            <button onClick={() => setSearchOpen(true)} style={{
              width: 38, height: 38, borderRadius: 10, border: "none",
              background: "transparent", color: "#6b7280", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff0f7"; (e.currentTarget as HTMLButtonElement).style.color = "#FF4FA3"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
            >
              <Search size={19} />
            </button>

            {/* Favoriler */}
            <Link href="/favorites" style={{
              position: "relative", width: 38, height: 38, borderRadius: 10,
              background: "transparent", color: wishlistCount > 0 ? "#FF4FA3" : "#6b7280",
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none", transition: "all 0.15s",
            }}>
              <Heart size={19} fill={wishlistCount > 0 ? "#FF4FA3" : "none"} />
              {wishlistCount > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 2,
                  width: 16, height: 16,
                  background: "#FF4FA3", color: "white",
                  fontSize: "9px", fontWeight: 700,
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{wishlistCount}</span>
              )}
            </Link>
            <Link href="/cart" style={{
              position: "relative",
              width: 38, height: 38,
              borderRadius: 10,
              background: "transparent",
              color: "#6b7280",
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none",
              transition: "all 0.15s",
            }}>
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 2,
                  width: 16, height: 16,
                  background: "#FF4FA3", color: "white",
                  fontSize: "9px", fontWeight: 700,
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{cartCount}</span>
              )}
            </Link>
            <button
              className="nav-mobile-toggle"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={open}
              style={{
                background: open ? "#fff0f7" : "transparent",
                color: open ? "#FF4FA3" : "#374151",
              }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="nav-mobile-menu">
            <div className="container nav-mobile-menu-inner">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link key={l.href} href={l.href} className={`nav-mobile-link${active ? " is-active" : ""}`}>
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
