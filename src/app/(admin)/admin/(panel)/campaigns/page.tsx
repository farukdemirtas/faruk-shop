import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  AdminPage,
  AdminPageHeader,
  AdminTable,
} from "@/components/admin/page-shell";

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
    <AdminPage>
      <AdminPageHeader
        section="Pazarlama"
        title="Kampanyalar"
        description={`${campaigns.length} kampanya`}
        actions={
          <Link href="/admin/campaigns/new">
            <button className="inline-flex items-center gap-2 h-10 px-4 bg-[#FF4FA3] text-white rounded-xl text-sm font-semibold hover:bg-[#e6388e] transition-colors">
              <Plus className="w-4 h-4" />
              Yeni Kampanya
            </button>
          </Link>
        }
      />

      <AdminTable>
        <thead>
          <tr>
            {["Kampanya Adı", "Tür", "İndirim", "Başlangıç", "Bitiş", "Durum"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {campaigns.length === 0 ? (
            <tr><td colSpan={6} className="text-center text-gray-400 py-12">Kampanya bulunamadı</td></tr>
          ) : (
            campaigns.map((c) => (
              <tr key={c.id}>
                <td className="font-semibold text-gray-900">{c.name}</td>
                <td><Badge variant="info">{typeLabels[c.type] ?? c.type}</Badge></td>
                <td>
                  {c.type === "PERCENTAGE" ? `%${Number(c.discountValue)}` : formatPrice(Number(c.discountValue))}
                </td>
                <td className="text-xs text-gray-500">{formatDate(c.startDate)}</td>
                <td className="text-xs text-gray-500">{formatDate(c.endDate)}</td>
                <td>
                  <Badge variant={c.isActive ? "success" : "default"}>{c.isActive ? "Aktif" : "Pasif"}</Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </AdminTable>
    </AdminPage>
  );
}
