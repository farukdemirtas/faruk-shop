import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const zones = await db.shippingZone.findMany({
    include: { methods: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kargo Ayarları</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kargo bölgeleri ve yöntemlerini yönetin</p>
        </div>
        <button className="inline-flex items-center gap-2 h-10 px-4 bg-[#FF4FA3] text-white rounded-xl text-sm font-medium hover:bg-[#e6388e] transition-colors">
          <Plus className="w-4 h-4" />
          Yeni Bölge
        </button>
      </div>

      {zones.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Henüz kargo bölgesi eklenmemiş</p>
          <p className="text-sm text-gray-300 mt-1">Kargo bölgeleri ekleyerek teslimat yöntemlerinizi yönetin</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {zones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{zone.name}</CardTitle>
                  <Badge variant={zone.isActive ? "success" : "default"}>
                    {zone.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
                {zone.countries.length > 0 && (
                  <p className="text-sm text-gray-500">Ülkeler: {zone.countries.join(", ")}</p>
                )}
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Yöntem", "Firma", "Fiyat", "Min. Sipariş", "Ücretsiz Kargo Üzeri", "Süre"].map((h) => (
                        <th key={h} className="pb-2 text-left text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {zone.methods.map((m) => (
                      <tr key={m.id} className="border-b border-gray-50">
                        <td className="py-2 font-medium text-gray-800">{m.name}</td>
                        <td className="py-2 text-gray-500">{m.carrier ?? "-"}</td>
                        <td className="py-2">{formatPrice(Number(m.price))}</td>
                        <td className="py-2">{m.minOrderAmount ? formatPrice(Number(m.minOrderAmount)) : "-"}</td>
                        <td className="py-2">{m.freeShippingThreshold ? formatPrice(Number(m.freeShippingThreshold)) : "-"}</td>
                        <td className="py-2 text-gray-500">{m.estimatedDays ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
