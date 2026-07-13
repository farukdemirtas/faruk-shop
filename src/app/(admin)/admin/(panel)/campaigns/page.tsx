import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge, StatusBadge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await db.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  const typeLabels: Record<string, string> = {
    PERCENTAGE: "Yüzde İndirim",
    FIXED_AMOUNT: "Sabit İndirim",
    FREE_SHIPPING: "Ücretsiz Kargo",
    BUY_X_GET_Y: "Al X Öde Y",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kampanyalar</h1>
          <p className="text-gray-500 text-sm mt-0.5">{campaigns.length} kampanya</p>
        </div>
        <Link href="/admin/campaigns/new">
          <button className="inline-flex items-center gap-2 h-10 px-4 bg-[#FF4FA3] text-white rounded-xl text-sm font-medium hover:bg-[#e6388e] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Yeni Kampanya
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Kampanya Adı", "Tür", "İndirim", "Başlangıç", "Bitiş", "Durum"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {campaigns.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Kampanya bulunamadı</td></tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-[#fff0f7]/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3"><Badge variant="info">{typeLabels[c.type] ?? c.type}</Badge></td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.type === "PERCENTAGE" ? `%${Number(c.discountValue)}` : formatPrice(Number(c.discountValue))}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.startDate)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.endDate)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.isActive ? "success" : "default"}>{c.isActive ? "Aktif" : "Pasif"}</Badge>
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
