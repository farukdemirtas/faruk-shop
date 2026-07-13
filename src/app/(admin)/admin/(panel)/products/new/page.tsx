"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropzone, ImagePreviewGrid } from "@/components/ui/file-dropzone";
import { createProduct } from "@/actions/products";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  type FormStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    barcode: string;
    sku: string;
    brand: string;
    price: string;
    compareAtPrice: string;
    costPerItem: string;
    status: FormStatus;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
    categoryId: string;
    collectionId: string;
  }>({
    title: "",
    description: "",
    barcode: "",
    sku: "",
    brand: "",
    price: "",
    compareAtPrice: "",
    costPerItem: "",
    status: "DRAFT",
    tags: [],
    seoTitle: "",
    seoDescription: "",
    categoryId: "",
    collectionId: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [variants, setVariants] = useState<Array<{ size: string; color: string; price: string; inventory: string; sku: string }>>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Array<{ url: string; name: string }>>([]);

  function handleFilesAccepted(files: File[]) {
    setImageFiles(files);
    const urls = files.map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setImagePreviewUrls(urls);
  }

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
    setVariants((prev) => [...prev, { size: "", color: "", price: formData.price, inventory: "0", sku: "" }]);
  }

  function updateVariant(i: number, field: string, value: string) {
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }

  function removeVariant(i: number) {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createProduct({
        ...formData,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        costPerItem: formData.costPerItem ? parseFloat(formData.costPerItem) : undefined,
      });

      if (result.success) {
        toast.success("Ürün oluşturuldu!");
        router.push("/admin/products");
      } else {
        toast.error(result.error ?? "Ürün oluşturulamadı.");
      }
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Yeni Ürün</h1>
            <p className="text-gray-500 text-sm">Yeni ürün bilgilerini girin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      <form id="product-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
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
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader><CardTitle>Fiyatlandırma</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
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

            {/* Inventory */}
            <Card>
              <CardHeader><CardTitle>Stok Bilgileri</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="SKU"
                    value={formData.sku}
                    onChange={(e) => setFormData((p) => ({ ...p, sku: e.target.value }))}
                    placeholder="Stok Kodu"
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

            {/* Variants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Varyantlar</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="w-4 h-4" /> Varyant Ekle
                  </Button>
                </div>
              </CardHeader>
              {variants.length > 0 && (
                <CardContent className="space-y-3">
                  {variants.map((v, i) => (
                    <div key={i} className="flex items-end gap-3 p-3 bg-gray-50 rounded-xl">
                      <Input label="Beden" value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} placeholder="S, M, L..." className="flex-1" />
                      <Input label="Renk" value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} placeholder="Kırmızı..." className="flex-1" />
                      <Input label="Fiyat" type="number" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} className="w-24" />
                      <Input label="Stok" type="number" value={v.inventory} onChange={(e) => updateVariant(i, "inventory", e.target.value)} className="w-20" />
                      <Input label="SKU" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="flex-1" />
                      <button type="button" onClick={() => removeVariant(i)} className="w-9 h-10 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>

            {/* SEO */}
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
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Images */}
            <Card>
              <CardHeader><CardTitle>Görseller</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <FileDropzone
                  onFilesAccepted={handleFilesAccepted}
                  maxFiles={10}
                  hint="PNG, JPG, WEBP desteklenir"
                />
                {imagePreviewUrls.length > 0 && (
                  <ImagePreviewGrid
                    images={imagePreviewUrls}
                    onRemove={(i) => {
                      const newFiles = imageFiles.filter((_, idx) => idx !== i);
                      setImageFiles(newFiles);
                      setImagePreviewUrls(newFiles.map((f) => ({ url: URL.createObjectURL(f), name: f.name })));
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader><CardTitle>Organizasyon</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Marka"
                  value={formData.brand}
                  onChange={(e) => setFormData((p) => ({ ...p, brand: e.target.value }))}
                  placeholder="Marka adı"
                />
                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Etiketler</label>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="Etiket ekle..."
                      className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4FA3]"
                    />
                    <button type="button" onClick={addTag} className="px-3 h-9 bg-[#FFD6E8] text-[#FF4FA3] rounded-xl text-sm font-medium hover:bg-[#ffc0dc] transition-colors">
                      Ekle
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-[#FFD6E8] text-[#FF4FA3] text-xs px-2 py-1 rounded-lg">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-[#c2185b]">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
