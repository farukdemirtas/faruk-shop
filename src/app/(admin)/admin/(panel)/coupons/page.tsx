import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kuponlar</h1>
          <p className="text-gray-500 text-sm mt-0.5">{coupons.length} kupon</p>
        </div>
        <button className="inline-flex items-center gap-2 h-10 px-4 bg-[#FF4FA3] text-white rounded-xl text-sm font-medium hover:bg-[#e6388e] transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Yeni Kupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Kod", "Tür", "İndirim", "Min. Tutar", "Kullanım", "Durum", "Son Kullanım"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Kupon bulunamadı</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#fff0f7]/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-[#FF4FA3] bg-[#FFD6E8] px-2 py-1 rounded-lg text-sm">
                      {c.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{c.type === "PERCENTAGE" ? "Yüzde" : c.type === "FIXED_AMOUNT" ? "Sabit" : "Kargo"}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.type === "PERCENTAGE" ? `%${Number(c.discountValue)}` : formatPrice(Number(c.discountValue))}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.minOrderAmount ? formatPrice(Number(c.minOrderAmount)) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.usageCount}{c.maxUsage ? ` / ${c.maxUsage}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.isActive ? "success" : "default"}>{c.isActive ? "Aktif" : "Pasif"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.endDate ? formatDate(c.endDate) : "Süresiz"}
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
