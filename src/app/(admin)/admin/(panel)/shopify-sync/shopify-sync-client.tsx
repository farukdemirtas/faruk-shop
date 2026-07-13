"use client";

import { useState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw, Upload, FileText, CheckCircle2, XCircle, Clock, Wifi, WifiOff, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { SyncProgress } from "@/components/ui/progress";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { formatDate } from "@/lib/utils";
import { bulkSyncToShopify, testShopifyConnectionAction } from "@/actions/shopify-sync";
import { importProducts, type ImportRow } from "@/actions/import";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { SyncHistory } from "@prisma/client";
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/page-shell";

interface ShopifySyncClientProps {
  stats: {
    totalProducts: number;
    syncedProducts: number;
    lastSync: SyncHistory | null;
  };
  history: SyncHistory[];
  isConnected: boolean;
  lastConnectedAt: Date | null;
}

export function ShopifySyncClient({ stats, history, isConnected, lastConnectedAt }: ShopifySyncClientProps) {
  const [isPending, startTransition] = useTransition();
  const [syncProgress, setSyncProgress] = useState<{
    total: number;
    success: number;
    failed: number;
    isRunning: boolean;
  } | null>(null);
  const [importResult, setImportResult] = useState<{
    totalRows: number;
    importedCount: number;
    errorCount: number;
    errors: Array<{ row: number; title: string; error: string }>;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  async function handleTestConnection() {
    setTesting(true);
    const result = await testShopifyConnectionAction();
    setTesting(false);
    if (result.success) {
      toast.success(`Shopify bağlantısı başarılı! Mağaza: ${(result.shop as { name?: string })?.name ?? ""}`);
    } else {
      toast.error(`Bağlantı başarısız: ${result.error}`);
    }
  }

  async function handleFullSync() {
    setSyncProgress({ total: stats.totalProducts, success: 0, failed: 0, isRunning: true });
    const result = await bulkSyncToShopify();
    setSyncProgress({
      total: result.totalProducts,
      success: result.successCount,
      failed: result.failCount,
      isRunning: false,
    });
    if (result.success) {
      toast.success(`${result.successCount} ürün senkronize edildi!`);
    } else {
      toast.error(`${result.failCount} ürün başarısız.`);
    }
  }

  async function handleCSVFiles(files: File[]) {
    const file = files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as ImportRow[];
        toast.loading(`${rows.length} satır içe aktarılıyor...`, { id: "import" });
        const result = await importProducts(rows);
        toast.dismiss("import");
        setImportResult(result);
        if (result.importedCount > 0) {
          toast.success(`${result.importedCount} ürün içe aktarıldı!`);
        }
        if (result.errorCount > 0) {
          toast.error(`${result.errorCount} satırda hata oluştu.`);
        }
      },
    });
  }

  async function handleExcelFiles(files: File[]) {
    const file = files[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<ImportRow>(ws);

    toast.loading(`${rows.length} satır içe aktarılıyor...`, { id: "import" });
    const result = await importProducts(rows);
    toast.dismiss("import");
    setImportResult(result);
    if (result.importedCount > 0) {
      toast.success(`${result.importedCount} ürün içe aktarıldı!`);
    }
    if (result.errorCount > 0) {
      toast.error(`${result.errorCount} satırda hata oluştu.`);
    }
  }

  function downloadTemplate() {
    const headers = ["title", "description", "price", "compareAtPrice", "sku", "barcode", "brand", "tags", "status", "size", "color", "inventory", "image", "seoTitle", "seoDescription"];
    const sample = ["Örnek Ürün", "Ürün açıklaması", "299.90", "399.90", "SKU001", "1234567890", "Marka Adı", "elbise,yaz", "ACTIVE", "M", "Pembe", "10", "https://example.com/image.jpg", "SEO Başlığı", "Meta açıklama"];
    const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ürünler");
    XLSX.writeFile(wb, "urun-sablonu.xlsx");
  }

  return (
    <AdminPage>
      <AdminPageHeader
        section="Entegrasyon"
        title="Shopify Senkronizasyonu"
        description="Ürünlerinizi Shopify mağazanızla senkronize edin"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={handleTestConnection} loading={testing}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              Bağlantıyı Test Et
            </Button>
            <Button onClick={handleFullSync} loading={isPending || (syncProgress?.isRunning ?? false)}>
              <RefreshCw className="w-4 h-4" />
              Tümünü Senkronize Et
            </Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConnected ? "bg-green-50" : "bg-red-50"}`}>
              {isConnected ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
            </div>
            <div>
              <p className="text-sm text-gray-500">Bağlantı Durumu</p>
              <p className={`font-semibold ${isConnected ? "text-green-600" : "text-red-500"}`}>
                {isConnected ? "Bağlı" : "Bağlı Değil"}
              </p>
              {lastConnectedAt && (
                <p className="text-xs text-gray-400">{formatDate(lastConnectedAt)}</p>
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
              <p className="text-sm text-gray-500">Senkronize Ürünler</p>
              <p className="font-bold text-xl text-gray-900">
                {stats.syncedProducts} <span className="text-sm font-normal text-gray-400">/ {stats.totalProducts}</span>
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
              <p className="text-sm text-gray-500">Son Senkronizasyon</p>
              <p className="font-semibold text-gray-900 text-sm">
                {stats.lastSync ? formatDate(stats.lastSync.createdAt) : "Henüz yapılmadı"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sync Progress */}
      {syncProgress && (
        <Card>
          <CardHeader><CardTitle>Senkronizasyon İlerlemesi</CardTitle></CardHeader>
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

      {/* Import Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CSV Import */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>CSV Dosyası İçe Aktar</CardTitle>
              <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs text-[#FF4FA3] hover:underline">
                <Download className="w-3 h-3" />
                Şablon İndir
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <FileDropzone
              accept={{ "text/csv": [".csv"], "text/plain": [".txt"] }}
              maxFiles={1}
              onFilesAccepted={handleCSVFiles}
              label="CSV dosyasını buraya sürükleyin"
              hint="UTF-8 formatında CSV dosyası"
            />
          </CardContent>
        </Card>

        {/* Excel Import */}
        <Card>
          <CardHeader>
            <CardTitle>Excel Dosyası İçe Aktar</CardTitle>
          </CardHeader>
          <CardContent>
            <FileDropzone
              accept={{
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                "application/vnd.ms-excel": [".xls"],
              }}
              maxFiles={1}
              onFilesAccepted={handleExcelFiles}
              label="Excel dosyasını buraya sürükleyin"
              hint=".xlsx veya .xls formatı"
            />
          </CardContent>
        </Card>
      </div>

      {/* Import Result */}
      {importResult && (
        <Card>
          <CardHeader><CardTitle>İçe Aktarma Sonucu</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-gray-900">{importResult.totalRows}</p>
                <p className="text-xs text-gray-500 mt-0.5">Toplam Satır</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-600">{importResult.importedCount}</p>
                <p className="text-xs text-green-500 mt-0.5">Başarılı</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-red-500">{importResult.errorCount}</p>
                <p className="text-xs text-red-400 mt-0.5">Başarısız</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Hata Detayları:</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-red-700">Satır {err.row} - {err.title}:</span>
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

      {/* Sync History */}
      <Card>
        <CardHeader><CardTitle>Senkronizasyon Geçmişi</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tür</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Toplam</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Başarılı</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Başarısız</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Süre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Henüz senkronizasyon yapılmadı</td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Badge variant="outline">{h.type}</Badge>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={h.status} /></td>
                    <td className="px-4 py-3 text-gray-700">{h.totalProducts}</td>
                    <td className="px-4 py-3">
                      <span className="text-green-600 font-medium">{h.successCount}</span>
                    </td>
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
