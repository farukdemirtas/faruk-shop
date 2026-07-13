import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Heart, Share2, CheckCircle, Truck, RotateCcw, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const product = await db.product.findFirst({
    where: {
      OR: [{ slug: handle }, { shopifyHandle: handle }],
      status: "ACTIVE",
    },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
      category: true,
    },
  });

  if (!product) notFound();

  const sizes = [...new Set(product.variants.filter((v) => v.size).map((v) => v.size!))];
  const colors = [...new Set(product.variants.filter((v) => v.color).map((v) => v.color!))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100">
            {product.images[0] ? (
              <img
                src={product.images[0].url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingBag className="w-24 h-24" />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-[#FF4FA3] transition-all">
                  <img src={img.url} alt={`${product.title} ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            {product.brand && (
              <p className="text-[#FF4FA3] text-sm font-semibold uppercase tracking-wider">{product.brand}</p>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.title}</h1>
            {product.category && (
              <p className="text-gray-400 text-sm mt-1">{product.category.name}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-[#FF4FA3]">
              {formatPrice(Number(product.price))}
            </span>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(Number(product.compareAtPrice))}
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-lg">
                  {Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)}% İndirim
                </span>
              </>
            )}
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Renk</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#FF4FA3] hover:text-[#FF4FA3] transition-all"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Beden</p>
                <button className="text-xs text-[#FF4FA3] hover:underline">Beden Rehberi</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className="w-12 h-12 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-[#FF4FA3] hover:text-[#FF4FA3] transition-all"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div className="flex gap-3">
            <button className="flex-1 h-14 bg-[#FF4FA3] text-white rounded-2xl font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#e6388e] transition-colors shadow-lg shadow-pink-300/30 active:scale-[0.98]">
              <ShoppingBag className="w-5 h-5" />
              Sepete Ekle
            </button>
            <button className="w-14 h-14 border-2 border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 hover:border-[#FF4FA3] hover:text-[#FF4FA3] transition-all">
              <Heart className="w-5 h-5" />
            </button>
            <button className="w-14 h-14 border-2 border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 hover:border-gray-400 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck, title: "Ücretsiz Kargo", sub: "500₺ üzeri" },
              { icon: RotateCcw, title: "Ücretsiz İade", sub: "30 gün" },
              { icon: Shield, title: "Güvenli Ödeme", sub: "SSL korumalı" },
            ].map(({ icon: Icon, title, sub }, i) => (
              <div key={i} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <Icon className="w-5 h-5 text-[#FF4FA3] mb-1.5" />
                <p className="text-xs font-medium text-gray-700">{title}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Ürün Açıklaması</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* SKU & Barcode */}
          <div className="flex gap-4 text-xs text-gray-400">
            {product.sku && <span>SKU: {product.sku}</span>}
            {product.barcode && <span>Barkod: {product.barcode}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
