import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  AdminPage,
  AdminPageHeader,
  AdminTable,
} from "@/components/admin/page-shell";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = params.search
    ? {
        OR: [
          { email: { contains: params.search, mode: "insensitive" as const } },
          { firstName: { contains: params.search, mode: "insensitive" as const } },
          { lastName: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.customer.count({ where }),
  ]);

  return (
    <AdminPage>
      <AdminPageHeader
        section="Mağaza"
        title="Müşteriler"
        description={`Toplam ${total} müşteri`}
      />

      <AdminTable>
        <thead>
          <tr>
            {["Müşteri", "E-posta", "Telefon", "Siparişler", "Toplam Harcama", "Kayıt Tarihi"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr><td colSpan={6} className="text-center text-gray-400 py-12">Müşteri bulunamadı</td></tr>
          ) : (
            customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4FA3] to-[#c2185b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {c.firstName[0]?.toUpperCase()}
                    </div>
                    <p className="font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                  </div>
                </td>
                <td>{c.email}</td>
                <td>{c.phone ?? "—"}</td>
                <td>{c.totalOrders}</td>
                <td className="font-semibold">{formatPrice(Number(c.totalSpent))}</td>
                <td className="text-xs text-gray-500">{formatDate(c.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </AdminTable>
    </AdminPage>
  );
}
