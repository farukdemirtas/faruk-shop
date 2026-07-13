"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  RefreshCw, Download, CheckCircle2, XCircle, Clock, Wifi, WifiOff,
  ExternalLink, Store, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { SyncProgress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import {
  pullProductsFromShopier,
  testShopierStoreAction,
  updateShopierSettings,
} from "@/actions/shopier-sync";
import type { ShopierSettings, SyncHistory } from "@prisma/client";
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/page-shell";

interface ShopierSyncClientProps {
  stats: {
    totalProducts: number;
    importedProducts: number;
    lastSync: SyncHistory | null;
    settings: ShopierSettings;
  };
  history: SyncHistory[];
}

export function ShopierSyncClient({ stats, history }: ShopierSyncClientProps) {
  const [isPending, startTransition] = useTransition();
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storeUrl, setStoreUrl] = useState(stats.settings.storeUrl);
  const [patToken, setPatToken] = useState(stats.settings.patToken ?? "");
  const [syncProgress, setSyncProgress] = useState<{
    total: number;
    success: number;
    failed: number;
    isRunning: boolean;
  } | null>(null);
  const [lastResult, setLastResult] = useState<{
    totalRows: number;
    importedCount: number;
    errorCount: number;
    errors: Array<{ productId: string; title: string; error: string }>;
  } | null>(null);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      await updateShopierSettings({ storeUrl, patToken: patToken || undefined });
      toast.success("Shopier ayarları kaydedildi.");
    } catch {
      toast.error("Ayarlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    const result = await testShopierStoreAction();
    setTesting(false);
    if (result.success) {
      toast.success(`Mağaza bağlantısı başarılı! ${result.productCount} ürün bulundu.`);
    } else {
      toast.error(`Bağlantı başarısız: ${result.error}`);
    }
  }

  async function handlePullProducts() {
    startTransition(async () => {
      setSyncProgress({ total: 0, success: 0, failed: 0, isRunning: true });
      const result = await pullProductsFromShopier();
      setSyncProgress({
        total: result.totalProducts,
        success: result.successCount,
        failed: result.failCount,
        isRunning: false,
      });
      setLastResult({
        totalRows: result.totalProducts,
        importedCount: result.successCount,
        errorCount: result.failCount,
        errors: result.errors,
      });

      if (result.success) {
        toast.success(`${result.successCount} ürün Shopier'dan siteye aktarıldı!`);
      } else if (result.successCount > 0) {
        toast.warning(`${result.successCount} ürün aktarıldı, ${result.failCount} hata.`);
      } else {
        toast.error(result.errors[0]?.error ?? "Ürün çekme başarısız.");
      }
    });
  }

  return (
    <AdminPage>
      <AdminPageHeader
        section="Entegrasyon"
        title="Shopier Senkronizasyonu"
        description="Shopier mağazanızdaki ürünleri siteye çekin"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-[#FF4FA3] hover:text-[#FF4FA3] transition-colors"
            >
              <ExternalLink size={15} />
              Mağazayı Aç
            </a>
            <Button variant="outline" onClick={handleTestConnection} loading={testing}>
              {stats.settings.isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              Bağlantıyı Test Et
            </Button>
            <Button onClick={handlePullProducts} loading={isPending || (syncProgress?.isRunning ?? false)}>
              <Download className="w-4 h-4" />
              Ürünleri Çek
            </Button>
          </div>
        }
      />

      <AdminPanel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Shopier Mağaza URL"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            placeholder="https://www.shopier.com/Privatetime"
            hint="Ürünlerin çekileceği Shopier mağaza adresi"
          />
          <Input
            label="PAT Token (opsiyonel)"
            type="password"
            value={patToken}
            onChange={(e) => setPatToken(e.target.value)}
            placeholder="Shopier kişisel erişim anahtarı"
            hint="İleride resmi API ile senkron için — şimdilik gerekmez"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={handleSaveSettings} loading={saving}>
            Ayarları Kaydet
          </Button>
        </div>
      </AdminPanel>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.settings.isConnected ? "bg-green-50" : "bg-red-50"}`}>
              <Store className={`w-5 h-5 ${stats.settings.isConnected ? "text-green-500" : "text-red-500"}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Shopier Mağaza</p>
              <p className="font-semibold text-gray-900">{stats.settings.storeUsername}</p>
              {stats.settings.lastConnectedAt && (
                <p className="text-xs text-gray-400">{formatDate(stats.settings.lastConnectedAt)}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff0f7] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#FF4FA3]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sitedeki Ürünler</p>
              <p className="font-bold text-xl text-gray-900">
                {stats.importedProducts} <span className="text-sm font-normal text-gray-400">/ {stats.totalProducts}</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Son Çekim</p>
              <p className="font-semibold text-gray-900 text-sm">
                {stats.lastSync ? formatDate(stats.lastSync.createdAt) : "Henüz yapılmadı"}
              </p>
              <p className="text-xs text-gray-400">{stats.settings.lastProductCount} ürün listelendi</p>
            </div>
          </div>
        </Card>
      </div>

      <AdminPanel className="admin-panel-padded">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <Package className="w-5 h-5 text-[#FF4FA3] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800">Shopier → Faruk Shop</p>
            <p className="mt-1">
              Bu sayfa <strong>Privatetime</strong> Shopier mağazanızdaki ürünleri otomatik olarak siteye aktarır.
              Ürün adı, fiyat, stok, görseller ve beden/renk varyantları dahil edilir.
            </p>
          </div>
        </div>
      </AdminPanel>

      {syncProgress && (
        <Card>
          <CardHeader><CardTitle>Çekme İlerlemesi</CardTitle></CardHeader>
          <CardContent>
            <SyncProgress
              total={syncProgress.total}
              success={syncProgress.success}
              failed={syncProgress.failed}
              isRunning={syncProgress.isRunning}
            />
          </CardContent>
        </Card>
      )}

      {lastResult && (
        <Card>
          <CardHeader><CardTitle>Son Aktarım Sonucu</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-gray-900">{lastResult.totalRows}</p>
                <p className="text-xs text-gray-500 mt-0.5">Shopier'da Bulunan</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-600">{lastResult.importedCount}</p>
                <p className="text-xs text-green-500 mt-0.5">Siteye Aktarılan</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-red-500">{lastResult.errorCount}</p>
                <p className="text-xs text-red-400 mt-0.5">Hatalı</p>
              </div>
            </div>

            {lastResult.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Hata Detayları:</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {lastResult.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-red-700">{err.title}:</span>
                        <span className="text-xs text-red-500 ml-1">{err.error}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Çekme Geçmişi</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Durum", "Toplam", "Başarılı", "Başarısız", "Süre", "Tarih"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Henüz ürün çekme yapılmadı</td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><StatusBadge status={h.status} /></td>
                    <td className="px-4 py-3 text-gray-700">{h.totalProducts}</td>
                    <td className="px-4 py-3"><span className="text-green-600 font-medium">{h.successCount}</span></td>
                    <td className="px-4 py-3">
                      <span className={h.failCount > 0 ? "text-red-500 font-medium" : "text-gray-400"}>{h.failCount}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {h.duration ? `${(h.duration / 1000).toFixed(1)}s` : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(h.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminPage>
  );
}
