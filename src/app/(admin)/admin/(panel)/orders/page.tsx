import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import Link from "next/link";
import {
  AdminPage,
  AdminPageHeader,
  AdminTable,
  AdminFilterBar,
  AdminFilterChip,
} from "@/components/admin/page-shell";

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
    <AdminPage>
      <AdminPageHeader
        section="Mağaza"
        title="Siparişler"
        description={`Toplam ${total} sipariş`}
      />

      <AdminFilterBar>
        <AdminFilterChip href="/admin/orders" active={!params.status}>
          Tümü
        </AdminFilterChip>
        {statusOptions.map((s) => (
          <AdminFilterChip
            key={s}
            href={`/admin/orders?status=${s}`}
            active={params.status === s}
          >
            <StatusBadge status={s} />
          </AdminFilterChip>
        ))}
      </AdminFilterBar>

      <AdminTable>
        <thead>
          <tr>
            {["Sipariş No", "Müşteri", "Ürün", "Tutar", "Durum", "Ödeme", "Tarih", ""].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan={8} className="text-center text-gray-400 py-12">Sipariş bulunamadı</td></tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td className="font-semibold text-gray-900">#{order.orderNumber}</td>
                <td>
                  <p className="font-medium text-gray-800">
                    {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : order.email}
                  </p>
                  <p className="text-xs text-gray-400">{order.email}</p>
                </td>
                <td>{order.items.length} ürün</td>
                <td className="font-semibold text-gray-900">{formatPrice(Number(order.totalAmount))}</td>
                <td><StatusBadge status={order.status} /></td>
                <td><StatusBadge status={order.paymentStatus} /></td>
                <td className="text-xs text-gray-500">{formatDate(order.createdAt)}</td>
                <td>
                  <Link href={`/admin/orders/${order.id}`} className="text-[#FF4FA3] hover:underline text-xs font-semibold">
                    Detay
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </AdminTable>
    </AdminPage>
  );
}
