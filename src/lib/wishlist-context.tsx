"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface WishlistItem {
  id: string;
  title: string;
  handle: string;
  price: number;
  compareAtPrice?: number | null;
  image?: string;
  brand?: string;
}

interface WishlistCtx {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  has: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistCtx>({
  items: [], toggle: () => {}, has: () => false, count: 0,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  /* localStorage'dan yükle */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("farukshop_wishlist");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  /* değişince kaydet */
  useEffect(() => {
    localStorage.setItem("farukshop_wishlist", JSON.stringify(items));
  }, [items]);

  function toggle(item: WishlistItem) {
    setItems(prev =>
      prev.some(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  }

  function has(id: string) {
    return items.some(i => i.id === id);
  }

  return (
    <WishlistContext.Provider value={{ items, toggle, has, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
