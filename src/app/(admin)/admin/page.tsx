import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/card";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Package, ShoppingCart, Users, RefreshCw, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const [
    totalProducts,
    syncedProducts,
    totalOrders,
    pendingOrders,
    totalCustomers,
    recentOrders,
    lastSync,
    unsyncedCount,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { shopifySynced: true } }),
    db.order.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.customer.count(),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    db.syncHistory.findFirst({ orderBy: { createdAt: "desc" } }),
    db.product.count({ where: { shopifySynced: false, status: "ACTIVE" } }),
  ]);

  return {
    totalProducts,
    syncedProducts,
    totalOrders,
    pendingOrders,
    totalCustomers,
    recentOrders,
    lastSync,
    unsyncedCount,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Mağazanıza genel bakış</p>
      </div>

      {/* Sync Alert */}
      {stats.unsyncedCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              {stats.unsyncedCount} aktif ürün Shopify ile senkronize edilmemiş
            </p>
          </div>
          <Link
            href="/admin/shopify-sync"
            className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
          >
            Senkronize Et
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Ürün"
          value={stats.totalProducts}
          icon={<Package className="w-6 h-6" />}
          color="pink"
          trend={{ value: 0, label: "bu ay" }}
        />
        <StatCard
          title="Shopify'da"
          value={stats.syncedProducts}
          icon={<RefreshCw className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Toplam Sipariş"
          value={stats.totalOrders}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="blue"
          trend={{ value: 0, label: "bu ay" }}
        />
        <StatCard
          title="Müşteriler"
          value={stats.totalCustomers}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Son Siparişler</h2>
            <Link href="/admin/orders" className="text-sm text-[#FF4FA3] hover:underline">
              Tümünü gör
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentOrders.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">Henüz sipariş yok</div>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.customer?.firstName ?? order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(Number(order.totalAmount))}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sync Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Shopify Senkronizasyonu</h2>
            <Link href="/admin/shopify-sync" className="text-sm text-[#FF4FA3] hover:underline">
              Yönet
            </Link>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#fff0f7] rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-700">Senkronize Edilmiş</p>
                <p className="text-2xl font-bold text-[#FF4FA3]">{stats.syncedProducts}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Toplam Ürün</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Senkronizasyon oranı</span>
                <span>
                  {stats.totalProducts > 0
                    ? Math.round((stats.syncedProducts / stats.totalProducts) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-[#FF4FA3] rounded-full h-2 transition-all"
                  style={{
                    width: `${stats.totalProducts > 0 ? (stats.syncedProducts / stats.totalProducts) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            {stats.lastSync && (
              <p className="text-xs text-gray-400">
                Son senkronizasyon: {formatDate(stats.lastSync.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
