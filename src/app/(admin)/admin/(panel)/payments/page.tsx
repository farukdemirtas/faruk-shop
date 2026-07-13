import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/page-shell";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const providers = await db.paymentSettings.findMany();

  const providerInfo: Record<string, { name: string; logo: string; desc: string }> = {
    iyzico: { name: "İyzico", logo: "💳", desc: "Türkiye'nin önde gelen ödeme çözümü" },
    paytr: { name: "PayTR", logo: "💳", desc: "Hızlı ve güvenli ödeme altyapısı" },
    stripe: { name: "Stripe", logo: "💳", desc: "Uluslararası ödeme platformu" },
    cod: { name: "Kapıda Ödeme", logo: "💵", desc: "Teslimat sırasında nakit/kart ödeme" },
  };

  return (
    <AdminPage>
      <AdminPageHeader
        section="Sistem"
        title="Ödeme"
        description="Ödeme sağlayıcılarını yapılandırın"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(providerInfo).map(([key, info]) => {
          const setting = providers.find((p) => p.provider === key);
          return (
            <AdminPanel key={key}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl">
                    {info.logo}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{info.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{info.desc}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={setting?.isActive ? "success" : "default"}>
                    {setting?.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                  {setting?.isTestMode && (
                    <Badge variant="warning">Test Modu</Badge>
                  )}
                </div>
              </div>
              <button className="w-full mt-4 h-9 border border-gray-200 text-gray-600 text-sm rounded-xl hover:border-[#FF4FA3] hover:text-[#FF4FA3] hover:bg-[#fff0f7] transition-all font-medium">
                {setting ? "Düzenle" : "Yapılandır"}
              </button>
            </AdminPanel>
          );
        })}
      </div>
    </AdminPage>
  );
}
