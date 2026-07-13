"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, RefreshCw, Trash2, Upload, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { ConfirmModal } from "@/components/ui/modal";
import { formatPrice, formatDate } from "@/lib/utils";
import { deleteProduct } from "@/actions/products";
import { syncProductToShopify, bulkSyncToShopify } from "@/actions/shopify-sync";
import type { Prisma } from "@prisma/client";
import Link from "next/link";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: true;
    category: true;
    collection: true;
  };
}>;

interface ProductsClientProps {
  products: ProductWithRelations[];
  total: number;
  pages: number;
  page: number;
  categories: { id: string; name: string }[];
  collections: { id: string; name: string }[];
}

export function ProductsClient({ products, total, pages, page, categories }: ProductsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    router.push(`/admin/products?${params.toString()}`);
  }

  async function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteProduct(deleteId);
      if (result.success) {
        toast.success("Ürün silindi.");
        setDeleteId(null);
      } else {
        toast.error(result.error ?? "Ürün silinemedi.");
      }
    });
  }

  async function handleSync(productId: string) {
    setSyncingId(productId);
    const result = await syncProductToShopify(productId);
    setSyncingId(null);
    if (result.success) {
      toast.success("Ürün Shopify'a senkronize edildi.");
    } else {
      toast.error(result.error ?? "Senkronizasyon başarısız.");
    }
  }

  async function handleBulkSync() {
    if (selectedIds.length === 0) {
      toast.error("Lütfen en az bir ürün seçin.");
      return;
    }
    const result = await bulkSyncToShopify(selectedIds);
    toast.success(`${result.successCount} ürün senkronize edildi.`);
    if (result.failCount > 0) {
      toast.error(`${result.failCount} ürün başarısız.`);
    }
    setSelectedIds([]);
  }

  const columns: Column<ProductWithRelations>[] = [
    {
      key: "product",
      header: "Ürün",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
            {p.images[0] ? (
              <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{p.title}</p>
            <p className="text-xs text-gray-400">{p.sku ?? "SKU yok"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Fiyat",
      cell: (p) => (
        <div>
          <p className="font-semibold text-gray-900">{formatPrice(Number(p.price))}</p>
          {p.compareAtPrice && (
            <p className="text-xs text-gray-400 line-through">
              {formatPrice(Number(p.compareAtPrice))}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Durum",
      cell: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: "category",
      header: "Kategori",
      cell: (p) => (
        <span className="text-sm text-gray-600">{p.category?.name ?? "-"}</span>
      ),
    },
    {
      key: "shopify",
      header: "Shopify",
      cell: (p) => (
        p.shopifySynced ? (
          <Badge variant="success" dot>Senkronize</Badge>
        ) : (
          <Badge variant="warning" dot>Senkronize Değil</Badge>
        )
      ),
    },
    {
      key: "variants",
      header: "Varyant",
      cell: (p) => (
        <span className="text-sm text-gray-600">{p.variants.length}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (p) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => handleSync(p.id)}
            disabled={syncingId === p.id}
            title="Shopify'a Gönder"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#FF4FA3] hover:bg-[#fff0f7] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncingId === p.id ? "animate-spin" : ""}`} />
          </button>
          <Link
            href={`/admin/products/${p.id}/edit`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
          <button
            onClick={() => setDeleteId(p.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-0.5">Toplam {total} ürün</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="outline" onClick={handleBulkSync}>
              <RefreshCw className="w-4 h-4" />
              Seçilileri Senkronize Et ({selectedIds.length})
            </Button>
          )}
          <Link href="/admin/shopify-sync">
            <Button variant="secondary">
              <Upload className="w-4 h-4" />
              Toplu İçe Aktar
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="w-4 h-4" />
              Yeni Ürün
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün adı, SKU veya barkod ara..."
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" variant="outline">
            <Filter className="w-4 h-4" />
            Filtrele
          </Button>
        </form>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        keyExtractor={(p) => p.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyMessage="Ürün bulunamadı."
        pagination={{ page, pages, total, onPageChange: (p) => router.push(`/admin/products?page=${p}`) }}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Ürünü Sil"
        description="Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Evet, Sil"
        variant="danger"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </div>
  );
}
