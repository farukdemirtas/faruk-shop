"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Save, Wifi, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateShopifySettings, getShopifySettings, testShopifyConnectionAction } from "@/actions/shopify-sync";
import {
  AdminPage,
  AdminPageHeader,
} from "@/components/admin/page-shell";

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [testing, setTesting] = useState(false);
  const [showAdminToken, setShowAdminToken] = useState(false);
  const [showStorefrontToken, setShowStorefrontToken] = useState(false);

  const [form, setForm] = useState({
    storeUrl: "",
    storefrontToken: "",
    adminToken: "",
    apiVersion: "2024-10",
    webhookSecret: "",
    autoSync: false,
    deleteOnRemove: false,
    syncInventory: true,
    syncPrices: true,
  });

  useEffect(() => {
    getShopifySettings().then((s) => {
      if (s) {
        setForm({
          storeUrl: s.storeUrl,
          storefrontToken: s.storefrontToken,
          adminToken: s.adminToken,
          apiVersion: s.apiVersion,
          webhookSecret: s.webhookSecret ?? "",
          autoSync: s.autoSync,
          deleteOnRemove: s.deleteOnRemove,
          syncInventory: s.syncInventory,
          syncPrices: s.syncPrices,
        });
      }
    });
  }, []);

  function handleSave() {
    startTransition(async () => {
      await updateShopifySettings(form);
      toast.success("Shopify ayarları kaydedildi.");
    });
  }

  async function handleTest() {
    setTesting(true);
    const result = await testShopifyConnectionAction();
    setTesting(false);
    if (result.success) {
      toast.success(`Bağlantı başarılı! Mağaza: ${(result.shop as { name?: string })?.name}`);
    } else {
      toast.error(`Bağlantı başarısız: ${result.error}`);
    }
  }

  return (
    <AdminPage narrow>
      <AdminPageHeader
        section="Sistem"
        title="Ayarlar"
        description="Shopify mağaza bağlantı bilgilerini yapılandırın"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTest} loading={testing}>
              <Wifi className="w-4 h-4" />
              Bağlantıyı Test Et
            </Button>
            <Button onClick={handleSave} loading={isPending}>
              <Save className="w-4 h-4" />
              Kaydet
            </Button>
          </div>
        }
      />

      {/* API Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>API Bağlantı Bilgileri</CardTitle>
          <CardDescription>Shopify mağaza URL ve erişim token bilgilerini girin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Shopify Mağaza URL"
            value={form.storeUrl}
            onChange={(e) => setForm((p) => ({ ...p, storeUrl: e.target.value }))}
            placeholder="your-store.myshopify.com"
            hint="myshopify.com uzantısı dahil girin"
          />
          <div className="relative">
            <Input
              label="Storefront Access Token"
              type={showStorefrontToken ? "text" : "password"}
              value={form.storefrontToken}
              onChange={(e) => setForm((p) => ({ ...p, storefrontToken: e.target.value }))}
              placeholder="shpat_..."
              hint="Shopify Admin → Apps → Private Apps → Storefront API"
              rightIcon={
                <button type="button" onClick={() => setShowStorefrontToken(!showStorefrontToken)}>
                  {showStorefrontToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>
          <div className="relative">
            <Input
              label="Admin API Access Token"
              type={showAdminToken ? "text" : "password"}
              value={form.adminToken}
              onChange={(e) => setForm((p) => ({ ...p, adminToken: e.target.value }))}
              placeholder="shpat_..."
              hint="Shopify Admin → Apps → Develop apps → Admin API access token"
              rightIcon={
                <button type="button" onClick={() => setShowAdminToken(!showAdminToken)}>
                  {showAdminToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="API Versiyonu"
              options={[
                { value: "2024-10", label: "2024-10 (Önerilen)" },
                { value: "2024-07", label: "2024-07" },
                { value: "2024-04", label: "2024-04" },
              ]}
              value={form.apiVersion}
              onChange={(e) => setForm((p) => ({ ...p, apiVersion: e.target.value }))}
            />
            <Input
              label="Webhook Secret"
              type="password"
              value={form.webhookSecret}
              onChange={(e) => setForm((p) => ({ ...p, webhookSecret: e.target.value }))}
              placeholder="Webhook doğrulama anahtarı"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sync Options */}
      <Card>
        <CardHeader>
          <CardTitle>Senkronizasyon Ayarları</CardTitle>
          <CardDescription>Otomatik senkronizasyon ve davranış ayarları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "autoSync", label: "Otomatik Senkronizasyon", desc: "Yeni ürün eklendiğinde otomatik olarak Shopify'a gönder" },
            { key: "syncInventory", label: "Stok Senkronizasyonu", desc: "Stok değişikliklerini Shopify ile senkronize et" },
            { key: "syncPrices", label: "Fiyat Senkronizasyonu", desc: "Fiyat güncellemelerini otomatik senkronize et" },
            { key: "deleteOnRemove", label: "Shopify'dan Sil", desc: "Ürün silindiğinde Shopify'dan da kaldır (dikkatli kullanın)" },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-[#FFD6E8] hover:bg-[#fff0f7]/50 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={form[key as keyof typeof form] as boolean}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                className="mt-0.5 rounded border-gray-300 text-[#FF4FA3] focus:ring-[#FF4FA3]"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>
    </AdminPage>
  );
}
