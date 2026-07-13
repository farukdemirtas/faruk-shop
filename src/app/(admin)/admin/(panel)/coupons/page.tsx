import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import {
  AdminPage,
  AdminPageHeader,
  AdminTable,
} from "@/components/admin/page-shell";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminPage>
      <AdminPageHeader
        section="Pazarlama"
        title="Kuponlar"
        description={`${coupons.length} kupon`}
        actions={
          <button className="inline-flex items-center gap-2 h-10 px-4 bg-[#FF4FA3] text-white rounded-xl text-sm font-semibold hover:bg-[#e6388e] transition-colors">
            <Plus className="w-4 h-4" />
            Yeni Kupon
          </button>
        }
      />

      <AdminTable>
        <thead>
          <tr>
            {["Kod", "Tür", "İndirim", "Min. Tutar", "Kullanım", "Durum", "Son Kullanım"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {coupons.length === 0 ? (
            <tr><td colSpan={7} className="text-center text-gray-400 py-12">Kupon bulunamadı</td></tr>
          ) : (
            coupons.map((c) => (
              <tr key={c.id}>
                <td>
                  <span className="font-mono font-bold text-[#FF4FA3] bg-[#FFD6E8] px-2.5 py-1 rounded-lg text-sm">
                    {c.code}
                  </span>
                </td>
                <td>
                  <Badge variant="info">
                    {c.type === "PERCENTAGE" ? "Yüzde" : c.type === "FIXED_AMOUNT" ? "Sabit" : "Kargo"}
                  </Badge>
                </td>
                <td className="font-semibold">
                  {c.type === "PERCENTAGE" ? `%${Number(c.discountValue)}` : formatPrice(Number(c.discountValue))}
                </td>
                <td className="text-gray-500">
                  {c.minOrderAmount ? formatPrice(Number(c.minOrderAmount)) : "—"}
                </td>
                <td>
                  {c.usageCount}{c.maxUsage ? ` / ${c.maxUsage}` : ""}
                </td>
                <td>
                  <Badge variant={c.isActive ? "success" : "default"}>{c.isActive ? "Aktif" : "Pasif"}</Badge>
                </td>
                <td className="text-xs text-gray-500">
                  {c.endDate ? formatDate(c.endDate) : "Süresiz"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </AdminTable>
    </AdminPage>
  );
}
