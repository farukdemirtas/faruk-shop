import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = params.status ? { status: params.status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" } : {};

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  const statusOptions = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
          <p className="text-gray-500 text-sm mt-0.5">Toplam {total} sipariş</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/admin/orders"
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${!params.status ? "bg-[#FF4FA3] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#FF4FA3] hover:text-[#FF4FA3]"}`}
        >
          Tümü
        </Link>
        {statusOptions.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${params.status === s ? "bg-[#FF4FA3] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#FF4FA3] hover:text-[#FF4FA3]"}`}
          >
            <StatusBadge status={s} />
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Sipariş No", "Müşteri", "Ürün Sayısı", "Tutar", "Durum", "Ödeme", "Tarih", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Sipariş bulunamadı</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#fff0f7]/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">#{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">
                        {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : order.email}
                      </p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.items.length}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(Number(order.totalAmount))}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={order.paymentStatus} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-[#FF4FA3] hover:underline text-xs font-medium">
                      Detay
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
