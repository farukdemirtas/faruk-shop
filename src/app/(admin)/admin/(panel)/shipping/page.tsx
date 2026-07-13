import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus } from "lucide-react";
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminEmpty,
} from "@/components/admin/page-shell";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const zones = await db.shippingZone.findMany({
    include: { methods: true },
    orderBy: { name: "asc" },
  });

  return (
    <AdminPage>
      <AdminPageHeader
        section="Sistem"
        title="Kargo"
        description="Kargo bölgeleri ve teslimat yöntemleri"
        actions={
          <button className="inline-flex items-center gap-2 h-10 px-4 bg-[#FF4FA3] text-white rounded-xl text-sm font-semibold hover:bg-[#e6388e] transition-colors">
            <Plus className="w-4 h-4" />
            Yeni Bölge
          </button>
        }
      />

      {zones.length === 0 ? (
        <AdminEmpty
          icon={<Truck size={24} />}
          title="Henüz kargo bölgesi eklenmemiş"
          description="Kargo bölgeleri ekleyerek teslimat yöntemlerinizi yönetin"
        />
      ) : (
        <div className="space-y-4">
          {zones.map((zone) => (
            <AdminPanel key={zone.id} padded={false}>
              <AdminPanelHeader
                title={zone.name}
                action={
                  <Badge variant={zone.isActive ? "success" : "default"}>
                    {zone.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                }
              />
              {zone.countries.length > 0 && (
                <p className="px-5 pb-3 text-sm text-gray-500 -mt-2">
                  Ülkeler: {zone.countries.join(", ")}
                </p>
              )}
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {["Yöntem", "Firma", "Fiyat", "Min. Sipariş", "Ücretsiz Kargo", "Süre"].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {zone.methods.map((m) => (
                      <tr key={m.id}>
                        <td className="font-semibold text-gray-800">{m.name}</td>
                        <td className="text-gray-500">{m.carrier ?? "—"}</td>
                        <td>{formatPrice(Number(m.price))}</td>
                        <td>{m.minOrderAmount ? formatPrice(Number(m.minOrderAmount)) : "—"}</td>
                        <td>{m.freeShippingThreshold ? formatPrice(Number(m.freeShippingThreshold)) : "—"}</td>
                        <td className="text-gray-500">{m.estimatedDays ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
