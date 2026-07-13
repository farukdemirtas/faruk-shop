"use client";

import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 29.90;
  const total = subtotal + shipping;

  function updateQuantity(id: string, qty: number) {
    if (qty < 1) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/products" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Sepetim</h1>
        <span className="text-gray-400">({items.length} ürün)</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-24 h-24 bg-[#fff0f7] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-[#FF4FA3]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sepetiniz Boş</h2>
          <p className="text-gray-400 mb-8">Ürünlerimizi keşfetmeye başlayın</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 h-12 px-8 bg-[#FF4FA3] text-white rounded-2xl font-semibold hover:bg-[#e6388e] transition-colors"
          >
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-400">{[item.size, item.color].filter(Boolean).join(" / ")}</p>
                  <p className="font-bold text-[#FF4FA3] mt-1">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50">-</button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50">+</button>
                  </div>
                  <button onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))} className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-base">
                  <span>Toplam</span>
                  <span className="text-[#FF4FA3]">{formatPrice(total)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-5 w-full h-12 bg-[#FF4FA3] text-white rounded-2xl font-semibold flex items-center justify-center hover:bg-[#e6388e] transition-colors"
              >
                Ödemeye Geç
              </Link>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">İndirim Kuponu</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kupon kodu"
                  className="flex-1 h-9 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF4FA3]"
                />
                <button className="h-9 px-3 bg-[#FF4FA3] text-white rounded-xl text-sm font-medium hover:bg-[#e6388e] transition-colors">
                  Uygula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
