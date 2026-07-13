import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const limit = 24;
  const skip = (page - 1) * limit;

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where: {
        status: "ACTIVE",
        ...(params.category ? { category: { slug: params.category } } : {}),
      },
      include: { images: { take: 1, orderBy: { position: "asc" } } },
      orderBy: params.sort === "price-asc" ? { price: "asc" }
        : params.sort === "price-desc" ? { price: "desc" }
        : { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({
      where: { status: "ACTIVE", ...(params.category ? { category: { slug: params.category } } : {}) },
    }),
    db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tüm Ürünler</h1>
          <p className="text-gray-500 text-sm mt-1">{total} ürün</p>
        </div>
        <select className="h-10 px-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-[#FF4FA3]">
          <option value="">Sıralama: Yeniden Eskiye</option>
          <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
          <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Kategoriler</h3>
            <ul className="space-y-1">
              <li>
                <a href="/products" className={`block px-3 py-2 rounded-xl text-sm transition-colors ${!params.category ? "bg-[#FF4FA3] text-white" : "text-gray-600 hover:bg-[#fff0f7] hover:text-[#FF4FA3]"}`}>
                  Tümü
                </a>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <a
                    href={`/products?category=${c.slug}`}
                    className={`block px-3 py-2 rounded-xl text-sm transition-colors ${params.category === c.slug ? "bg-[#FF4FA3] text-white" : "text-gray-600 hover:bg-[#fff0f7] hover:text-[#FF4FA3]"}`}
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Bu kategoride ürün bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    title: p.title,
                    handle: p.shopifyHandle ?? p.slug,
                    price: p.price.toString(),
                    compareAtPrice: p.compareAtPrice?.toString(),
                    image: p.images[0]?.url,
                    brand: p.brand ?? undefined,
                    isNew: i < 4,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
