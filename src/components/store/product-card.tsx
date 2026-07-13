"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

export interface ProductCardData {
  id: string;
  title: string;
  handle?: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  image?: string;
  brand?: string;
  isNew?: boolean;
  isSale?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const discount = product.compareAtPrice
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (added) return;
    setAdded(true);
    await new Promise((r) => setTimeout(r, 1500));
    setAdded(false);
  }

  return (
    <Link
      href={`/products/${product.handle ?? product.id}`}
      className={className}
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: "white",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #f3f4f6",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.10)" : "0 2px 12px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.25s ease",
      }}>
        {/* Image */}
        <div style={{ position: "relative", aspectRatio: "3/4", background: "#1e0a2e", overflow: "hidden" }}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                transform: hovered ? "scale(1.06)" : "scale(1)",
                transition: "transform 0.45s ease",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={40} color="rgba(255,79,163,0.3)" />
            </div>
          )}

          {/* Dark overlay on hover */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }} />

          {/* Badges */}
          <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 5 }}>
            {product.isNew && (
              <span style={{
                padding: "3px 10px", background: "#FF4FA3", color: "white",
                fontSize: "10px", fontWeight: 700, borderRadius: 99, letterSpacing: "0.06em",
              }}>YENİ</span>
            )}
            {discount > 0 && (
              <span style={{
                padding: "3px 10px", background: "#ef4444", color: "white",
                fontSize: "10px", fontWeight: 700, borderRadius: 99,
              }}>-%{discount}</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
            style={{
              position: "absolute", top: 10, right: 10,
              width: 34, height: 34,
              borderRadius: "50%",
              border: "none",
              background: wishlisted ? "#FF4FA3" : "rgba(255,255,255,0.9)",
              color: wishlisted ? "white" : "#9ca3af",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              opacity: hovered || wishlisted ? 1 : 0,
              transform: wishlisted ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <Heart size={15} fill={wishlisted ? "white" : "none"} />
          </button>

          {/* Add to cart */}
          <div style={{
            position: "absolute", bottom: 10, left: 10, right: 10,
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.25s ease",
          }}>
            <button
              onClick={handleAddToCart}
              style={{
                width: "100%", height: 40,
                background: added ? "#FF4FA3" : "rgba(255,255,255,0.95)",
                color: added ? "white" : "#111827",
                border: "none",
                borderRadius: 10,
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.2s",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              <ShoppingBag size={14} />
              {added ? "Sepete Eklendi ✓" : "Sepete Ekle"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "12px 14px 14px" }}>
          {product.brand && (
            <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 3 }}>
              {product.brand}
            </p>
          )}
          <h3 style={{
            fontSize: "0.88rem",
            fontWeight: 500,
            color: hovered ? "#FF4FA3" : "#111827",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
            transition: "color 0.2s",
            marginBottom: 8,
          }}>
            {product.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, color: "#FF4FA3", fontSize: "1rem" }}>
              {formatPrice(Number(product.price))}
            </span>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <span style={{ fontSize: "0.8rem", color: "#9ca3af", textDecoration: "line-through" }}>
                {formatPrice(Number(product.compareAtPrice))}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
