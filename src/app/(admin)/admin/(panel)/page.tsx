import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/card";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Package, ShoppingCart, Users, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminAlert,
} from "@/components/admin/page-shell";

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
  const syncPercent = stats.totalProducts > 0
    ? Math.round((stats.syncedProducts / stats.totalProducts) * 100)
    : 0;

  return (
    <AdminPage>
      <AdminPageHeader
        section="Ana"
        title="Genel Bakış"
        description="Mağazanıza genel bakış"
      />

      {stats.unsyncedCount > 0 && (
        <AdminAlert
          variant="warning"
          action={
            <Link href="/admin/shopier-sync">Ürünleri Çek</Link>
          }
        >
          <AlertCircle size={18} />
          {stats.unsyncedCount} ürün henüz Shopier'dan aktarılmamış
        </AdminAlert>
      )}

      <div className="admin-stat-grid">
        <StatCard
          title="Toplam Ürün"
          value={stats.totalProducts}
          icon={<Package className="w-6 h-6" />}
          color="pink"
          trend={{ value: 0, label: "bu ay" }}
        />
        <StatCard
          title="Shopier'dan Aktarılan"
          value={stats.syncedProducts}
          icon={<RefreshCw className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Toplam Sipariş"
          value={stats.totalOrders}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="blue"
          trend={{ value: stats.pendingOrders, label: "bekleyen" }}
        />
        <StatCard
          title="Müşteriler"
          value={stats.totalCustomers}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
      </div>

      <div className="admin-grid-2">
        <AdminPanel padded={false}>
          <AdminPanelHeader
            title="Son Siparişler"
            action={
              <Link href="/admin/orders" className="text-sm text-[#FF4FA3] hover:underline font-medium">
                Tümünü gör
              </Link>
            }
          />
          <div className="divide-y divide-gray-50">
            {stats.recentOrders.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">Henüz sipariş yok</div>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#fff0f7]/40 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.customer?.firstName ?? order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatPrice(Number(order.totalAmount))}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminPanel>

        <AdminPanel padded={false}>
          <AdminPanelHeader
            title="Shopier Aktarımı"
            action={
              <Link href="/admin/shopier-sync" className="text-sm text-[#FF4FA3] hover:underline font-medium">
                Yönet
              </Link>
            }
          />
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#fff0f7] rounded-xl">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aktarılan</p>
                <p className="text-2xl font-bold text-[#FF4FA3] mt-0.5">{stats.syncedProducts}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Toplam</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalProducts}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Senkronizasyon oranı</span>
                <span className="font-semibold">{syncPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-[#FF4FA3] rounded-full h-2 transition-all"
                  style={{ width: `${syncPercent}%` }}
                />
              </div>
            </div>
            {stats.lastSync && (
              <p className="text-xs text-gray-400">
                Son senkronizasyon: {formatDate(stats.lastSync.createdAt)}
              </p>
            )}
          </div>
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
