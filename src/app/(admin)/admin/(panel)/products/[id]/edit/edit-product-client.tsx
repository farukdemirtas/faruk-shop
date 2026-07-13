"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/modal";
import { deleteProduct, updateProduct } from "@/actions/products";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/page-shell";
import type { Prisma } from "@prisma/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: true;
    category: true;
    collection: true;
  };
}>;

type FormStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

type VariantForm = {
  id?: string;
  size: string;
  color: string;
  price: string;
  inventory: string;
  sku: string;
};

interface EditProductClientProps {
  product: ProductWithRelations;
  categories: { id: string; name: string }[];
  collections: { id: string; name: string }[];
}

function toVariantForm(variant: ProductWithRelations["variants"][number]): VariantForm {
  return {
    id: variant.id,
    size: variant.size ?? "",
    color: variant.color ?? "",
    price: String(Number(variant.price)),
    inventory: String(variant.inventory),
    sku: variant.sku ?? "",
  };
}

export function EditProductClient({ product, categories, collections }: EditProductClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const storeHandle = product.shopifyHandle ?? product.slug;
  const totalStock = product.variants.reduce((sum, v) => sum + v.inventory, 0);

  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description ?? "",
    barcode: product.barcode ?? "",
    sku: product.sku ?? "",
    brand: product.brand ?? "",
    price: String(Number(product.price)),
    compareAtPrice: product.compareAtPrice ? String(Number(product.compareAtPrice)) : "",
    costPerItem: product.costPerItem ? String(Number(product.costPerItem)) : "",
    status: product.status as FormStatus,
    tags: product.tags,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    categoryId: product.categoryId ?? "",
    collectionId: product.collectionId ?? "",
  });

  const [tagInput, setTagInput] = useState("");
  const [variants, setVariants] = useState<VariantForm[]>(
    product.variants.map(toVariantForm)
  );

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { size: "", color: "", price: formData.price, inventory: "0", sku: "" },
    ]);
  }

  function updateVariant(index: number, field: keyof VariantForm, value: string) {
    setVariants((prev) =>
      prev.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant))
    );
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProduct(product.id, {
        ...formData,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        costPerItem: formData.costPerItem ? parseFloat(formData.costPerItem) : undefined,
        categoryId: formData.categoryId || undefined,
        collectionId: formData.collectionId || undefined,
        variants: variants.map((variant) => ({
          id: variant.id,
          size: variant.size || undefined,
          color: variant.color || undefined,
          price: parseFloat(variant.price),
          inventory: parseInt(variant.inventory, 10) || 0,
          sku: variant.sku || undefined,
        })),
      });

      if (result.success) {
        toast.success("Ürün güncellendi!");
        router.refresh();
      } else {
        toast.error(result.error ?? "Ürün güncellenemedi.");
      }
    });
  }

  async function handleDelete() {
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.success) {
        toast.success("Ürün silindi.");
        router.push("/admin/products");
      } else {
        toast.error(result.error ?? "Ürün silinemedi.");
      }
    });
  }

  return (
    <AdminPage>
      <AdminPageHeader
        section="Mağaza"
        title="Ürünü Düzenle"
        description={product.title}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/products"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              href={`/products/${storeHandle}`}
              target="_blank"
              className="h-9 px-3 flex items-center gap-1.5 rounded-xl border border-gray-200 text-gray-600 hover:text-[#FF4FA3] hover:border-[#FFD6E8] text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Mağazada Gör
            </Link>
            <Button
              type="button"
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4" />
              Sil
            </Button>
            <Select
              options={[
                { value: "DRAFT", label: "Taslak" },
                { value: "ACTIVE", label: "Aktif" },
                { value: "ARCHIVED", label: "Arşivlendi" },
              ]}
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as FormStatus }))}
              className="w-36"
            />
            <Button type="submit" form="product-form" loading={isPending}>
              <Save className="w-4 h-4" />
              Kaydet
            </Button>
          </div>
        }
      />

      <AdminPanel className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={formData.status} />
          {product.shopifySynced ? (
            <Badge variant="success" dot>Shopier'dan</Badge>
          ) : (
            <Badge variant="warning" dot>Yerel</Badge>
          )}
          <span className="text-sm text-gray-500">
            Slug: <span className="font-mono text-gray-700">{product.slug}</span>
          </span>
          <span className="text-sm text-gray-500">
            Toplam stok: <span className="font-semibold text-gray-800">{totalStock}</span>
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            Oluşturulma: {formatDate(product.createdAt)}
            {product.updatedAt && ` · Güncelleme: ${formatDate(product.updatedAt)}`}
          </span>
        </div>
      </AdminPanel>

      <form id="product-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardHeader><CardTitle>Temel Bilgiler</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Ürün Adı"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ürün adını girin"
                />
                <Textarea
                  label="Açıklama"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Ürün açıklaması"
                  rows={5}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Fiyatlandırma</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Fiyat (₺)"
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    placeholder="0.00"
                  />
                  <Input
                    label="Karşılaştırma Fiyatı (₺)"
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData((p) => ({ ...p, compareAtPrice: e.target.value }))}
                    placeholder="0.00"
                    hint="İndirimli fiyat gösterimi için"
                  />
                  <Input
                    label="Maliyet (₺)"
                    type="number"
                    step="0.01"
                    value={formData.costPerItem}
                    onChange={(e) => setFormData((p) => ({ ...p, costPerItem: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Stok Bilgileri</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="SKU"
                    value={formData.sku}
                    onChange={(e) => setFormData((p) => ({ ...p, sku: e.target.value }))}
                    placeholder="Stok kodu"
                  />
                  <Input
                    label="Barkod"
                    value={formData.barcode}
                    onChange={(e) => setFormData((p) => ({ ...p, barcode: e.target.value }))}
                    placeholder="EAN, UPC..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>Varyantlar</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="w-4 h-4" />
                    Varyant Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {variants.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">
                    Henüz varyant yok. Beden, renk veya stok bilgisi eklemek için varyant ekleyin.
                  </p>
                ) : (
                  variants.map((variant, index) => (
                    <div
                      key={variant.id ?? `new-${index}`}
                      className="grid grid-cols-2 sm:grid-cols-6 gap-3 p-3 bg-gray-50 rounded-xl items-end"
                    >
                      <Input
                        label="Beden"
                        value={variant.size}
                        onChange={(e) => updateVariant(index, "size", e.target.value)}
                        placeholder="S, M, L..."
                      />
                      <Input
                        label="Renk"
                        value={variant.color}
                        onChange={(e) => updateVariant(index, "color", e.target.value)}
                        placeholder="Kırmızı..."
                      />
                      <Input
                        label="Fiyat"
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, "price", e.target.value)}
                      />
                      <Input
                        label="Stok"
                        type="number"
                        value={variant.inventory}
                        onChange={(e) => updateVariant(index, "inventory", e.target.value)}
                      />
                      <Input
                        label="SKU"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, "sku", e.target.value)}
                        placeholder="Varyant SKU"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="w-full h-10 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>SEO Bilgileri</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="SEO Başlığı"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData((p) => ({ ...p, seoTitle: e.target.value }))}
                  placeholder="Arama motoru başlığı"
                />
                <Textarea
                  label="Meta Açıklama"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData((p) => ({ ...p, seoDescription: e.target.value }))}
                  placeholder="Arama motoru açıklaması (max 160 karakter)"
                  rows={3}
                  hint={`${formData.seoDescription.length}/160 karakter`}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle>Görseller</CardTitle></CardHeader>
              <CardContent>
                {product.images.length > 0 ? (
                  <div className="space-y-2">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].altText ?? product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {product.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {product.images.slice(1).map((image) => (
                          <div
                            key={image.id}
                            className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                          >
                            <img
                              src={image.url}
                              alt={image.altText ?? product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 pt-1">
                      {product.images.length} görsel · Shopier senkronizasyonu ile güncellenir
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Görsel yok</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Organizasyon</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Marka"
                  value={formData.brand}
                  onChange={(e) => setFormData((p) => ({ ...p, brand: e.target.value }))}
                  placeholder="Marka adı"
                />
                <Select
                  label="Kategori"
                  placeholder="Kategori seçin"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={formData.categoryId}
                  onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                />
                <Select
                  label="Koleksiyon"
                  placeholder="Koleksiyon seçin"
                  options={collections.map((c) => ({ value: c.id, label: c.name }))}
                  value={formData.collectionId}
                  onChange={(e) => setFormData((p) => ({ ...p, collectionId: e.target.value }))}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Etiketler</label>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Etiket ekle..."
                      className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4FA3]"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 h-9 bg-[#FFD6E8] text-[#FF4FA3] rounded-xl text-sm font-medium hover:bg-[#ffc0dc] transition-colors"
                    >
                      Ekle
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 bg-[#FFD6E8] text-[#FF4FA3] text-xs px-2 py-1 rounded-lg"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-[#c2185b]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Ürün Özeti</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Liste fiyatı</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(Number(formData.price))}
                  </span>
                </div>
                {formData.compareAtPrice && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Karşılaştırma</span>
                    <span className="text-gray-400 line-through">
                      {formatPrice(Number(formData.compareAtPrice))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Varyant sayısı</span>
                  <span className="font-medium text-gray-800">{variants.length}</span>
                </div>
                {product.shopifyId && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Shopier ID</span>
                    <span className="font-mono text-xs text-gray-600">{product.shopifyId}</span>
                  </div>
                )}
                {product.lastSyncedAt && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Son senkron</span>
                    <span className="text-xs text-gray-600">{formatDate(product.lastSyncedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Ürünü Sil"
        description={`"${product.title}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmLabel="Evet, Sil"
        variant="danger"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </AdminPage>
  );
}
