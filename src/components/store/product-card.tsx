"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
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
  const [addingToCart, setAddingToCart] = useState(false);

  const discount = product.compareAtPrice
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    setAddingToCart(true);
    await new Promise((r) => setTimeout(r, 600));
    setAddingToCart(false);
  }

  return (
    <Link
      href={`/products/${product.handle ?? product.id}`}
      className={cn("group block", className)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag className="w-16 h-16" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="px-2.5 py-1 bg-[#FF4FA3] text-white text-xs font-bold rounded-full shadow-sm">
              YENİ
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setWishlisted(!wishlisted);
          }}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all",
            wishlisted
              ? "bg-[#FF4FA3] text-white scale-110"
              : "bg-white/90 text-gray-400 hover:text-[#FF4FA3] opacity-0 group-hover:opacity-100"
          )}
        >
          <Heart className={cn("w-4 h-4", wishlisted && "fill-current")} />
        </button>

        {/* Quick Add */}
        <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={handleAddToCart}
            className={cn(
              "w-full h-10 bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#FF4FA3] hover:text-white transition-colors shadow-md",
              addingToCart && "bg-[#FF4FA3] text-white"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            {addingToCart ? "Eklendi ✓" : "Sepete Ekle"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-1">
        {product.brand && (
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{product.brand}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-2 group-hover:text-[#FF4FA3] transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-base font-bold text-[#FF4FA3]">
            {formatPrice(Number(product.price))}
          </span>
          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(Number(product.compareAtPrice))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
