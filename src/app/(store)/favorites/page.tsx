"use client";

import { useWishlist } from "@/lib/wishlist-context";
import { ProductCard } from "@/components/store/product-card";
import Link from "next/link";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";

export default function FavoritesPage() {
  const { items, count } = useWishlist();

  return (
    <div style={{ width: "100%", background: "#f9fafb", minHeight: "70vh" }}>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "14px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/products" style={{
            width: 38, height: 38, borderRadius: 10,
            border: "1.5px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6b7280", textDecoration: "none",
          }}>
            <ArrowLeft size={17} />
          </Link>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0d0d1a", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 8 }}>
            <Heart size={20} color="#FF4FA3" fill="#FF4FA3" />
            Favorilerim
          </h1>
          {count > 0 && (
            <span style={{ fontSize: "0.82rem", color: "#9ca3af", fontWeight: 500 }}>
              ({count} ürün)
            </span>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        {items.length === 0 ? (
          /* Boş durum */
          <div style={{ textAlign: "center", padding: "5rem 0" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "linear-gradient(135deg, #fff0f7 0%, #ffe0f0 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}>
              <Heart size={44} color="#FF4FA3" />
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0d0d1a", marginBottom: "0.5rem" }}>
              Favori Ürününüz Yok
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginBottom: "2rem" }}>
              Beğendiğiniz ürünlerin kalbine tıklayarak buraya ekleyebilirsiniz
            </p>
            <Link href="/products" className="btn-primary">
              <ShoppingBag size={17} /> Ürünleri Keşfet
            </Link>
          </div>
        ) : (
          <>
            <div className="product-grid-home" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  product={{
                    id: item.id,
                    title: item.title,
                    handle: item.handle,
                    price: item.price,
                    compareAtPrice: item.compareAtPrice,
                    image: item.image,
                    brand: item.brand,
                  }}
                />
              ))}
            </div>

            <div style={{ marginTop: "2rem", textAlign: "center" }}>
              <Link href="/products" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                color: "#FF4FA3", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
              }}>
                <ArrowLeft size={14} /> Alışverişe Devam Et
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
