"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  ExternalLink,
  Store,
  Package,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { SyncProgress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import {
  listShopierStoreProducts,
  pullProductsFromShopier,
  testShopierStoreAction,
  updateShopierSettings,
} from "@/actions/shopier-sync";
import type { ShopierSettings, SyncHistory } from "@prisma/client";
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminTable,
} from "@/components/admin/page-shell";

type ShopierPreviewProduct = {
  id: string;
  title: string;
  image: string;
  url: string;
  alreadyImported: boolean;
  localProductId: string | null;
  localTitle: string | null;
};

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
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storeUrl, setStoreUrl] = useState(stats.settings.storeUrl);
  const [patToken, setPatToken] = useState(stats.settings.patToken ?? "");
  const [search, setSearch] = useState("");
  const [previewProducts, setPreviewProducts] = useState<ShopierPreviewProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return previewProducts;
    return previewProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(q) ||
        product.id.includes(q),
    );
  }, [previewProducts, search]);

  const allVisibleSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) => selectedIds.includes(product.id));

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

  async function handleLoadProducts() {
    setLoadingList(true);
    const result = await listShopierStoreProducts();
    setLoadingList(false);

    if (!result.success) {
      toast.error(result.error ?? "Ürün listesi alınamadı.");
      return;
    }

    setPreviewProducts(result.products);
    setSelectedIds(
      result.products
        .filter((product) => !product.alreadyImported)
        .map((product) => product.id),
    );
    toast.success(`${result.total} ürün listelendi. Aktarmak istediklerinizi seçin.`);
  }

  function toggleProduct(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredProducts.map((product) => product.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
      return;
    }

    const merged = new Set(selectedIds);
    filteredProducts.forEach((product) => merged.add(product.id));
    setSelectedIds([...merged]);
  }

  function selectOnlyNew() {
    setSelectedIds(
      previewProducts
        .filter((product) => !product.alreadyImported)
        .map((product) => product.id),
    );
  }

  function selectAllProducts() {
    setSelectedIds(previewProducts.map((product) => product.id));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  async function handlePullSelected() {
    if (selectedIds.length === 0) {
      toast.error("Lütfen en az bir ürün seçin.");
      return;
    }

    startTransition(async () => {
      setSyncProgress({ total: selectedIds.length, success: 0, failed: 0, isRunning: true });
      const result = await pullProductsFromShopier(selectedIds);
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

      const refreshed = await listShopierStoreProducts();
      if (refreshed.success) {
        setPreviewProducts(refreshed.products);
        setSelectedIds(
          refreshed.products
            .filter((product) => !product.alreadyImported)
            .map((product) => product.id),
        );
      }
    });
  }

  return (
    <AdminPage>
      <AdminPageHeader
        section="Entegrasyon"
        title="Shopier Senkronizasyonu"
        description="Shopier mağazanızdaki ürünleri listeleyin ve seçerek siteye aktarın"
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
            <Button variant="secondary" onClick={handleLoadProducts} loading={loadingList}>
              <RefreshCw className="w-4 h-4" />
              Ürünleri Listele
            </Button>
            <Button
              onClick={handlePullSelected}
              loading={isPending || (syncProgress?.isRunning ?? false)}
              disabled={selectedIds.length === 0}
            >
              <Download className="w-4 h-4" />
              Seçilenleri Aktar ({selectedIds.length})
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
              Önce <strong>Ürünleri Listele</strong> ile mağazadaki tüm ürünleri görün, ardından aktarmak
              istediklerinizi seçip <strong>Seçilenleri Aktar</strong> butonuna basın.
            </p>
          </div>
        </div>
      </AdminPanel>

      {previewProducts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Mağaza Ürünleri</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {previewProducts.length} ürün bulundu · {selectedIds.length} seçili
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAllProducts}>
                  <CheckSquare className="w-4 h-4" />
                  Hepsini Seç
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={selectOnlyNew}>
                  Yenileri Seç
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={clearSelection}>
                  <Square className="w-4 h-4" />
                  Seçimi Temizle
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün adı veya ID ile ara..."
              leftIcon={<Search className="w-4 h-4" />}
            />

            <AdminTable>
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      className="rounded border-gray-300 text-[#FF4FA3] focus:ring-[#FF4FA3]"
                    />
                  </th>
                  <th>Ürün</th>
                  <th>Shopier ID</th>
                  <th>Durum</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-10">
                      Arama sonucu bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const isSelected = selectedIds.includes(product.id);
                    return (
                      <tr key={product.id} className={isSelected ? "bg-[#fff0f7]/60" : undefined}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProduct(product.id)}
                            className="rounded border-gray-300 text-[#FF4FA3] focus:ring-[#FF4FA3]"
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-3 min-w-[220px]">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                              {product.image ? (
                                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{product.title}</p>
                              {product.localTitle && product.localTitle !== product.title && (
                                <p className="text-xs text-gray-400">Sitede: {product.localTitle}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-xs text-gray-500">{product.id}</td>
                        <td>
                          {product.alreadyImported ? (
                            <Badge variant="success" dot>Siteye aktarılmış</Badge>
                          ) : (
                            <Badge variant="warning" dot>Yeni</Badge>
                          )}
                        </td>
                        <td>
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FF4FA3] hover:underline text-xs font-semibold"
                          >
                            Shopier'da Gör
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </AdminTable>
          </CardContent>
        </Card>
      )}

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
                <p className="text-xs text-gray-500 mt-0.5">Seçilen Ürün</p>
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
