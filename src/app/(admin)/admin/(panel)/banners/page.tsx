"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  AdminPage,
  AdminPageHeader,
  AdminEmpty,
} from "@/components/admin/page-shell";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  buttonText: string | null;
  isActive: boolean;
  position: number;
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", link: "", buttonText: "" });

  async function loadBanners() {
    const res = await fetch("/api/admin/banners");
    if (res.ok) {
      const data = await res.json() as Banner[];
      setBanners(data);
    }
    setLoading(false);
  }

  useEffect(() => { loadBanners(); }, []);

  async function handleSave() {
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Banner eklendi!");
      setEditModal(false);
      setForm({ title: "", subtitle: "", image: "", link: "", buttonText: "" });
      loadBanners();
    } else {
      toast.error("Banner eklenemedi.");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/banners/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Banner silindi.");
      setDeleteId(null);
      loadBanners();
    }
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/admin/banners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) loadBanners();
  }

  return (
    <AdminPage>
      <AdminPageHeader
        section="Pazarlama"
        title="Bannerlar"
        description="Ana sayfa banner görsellerini yönetin"
        actions={
          <Button onClick={() => setEditModal(true)}>
            <Plus className="w-4 h-4" />
            Yeni Banner
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : banners.length === 0 ? (
        <AdminEmpty
          icon={<Plus size={22} />}
          title="Henüz banner eklenmemiş"
          description="Ana sayfa için yeni banner ekleyerek başlayın"
          action={
            <Button onClick={() => setEditModal(true)} className="mt-4">
              <Plus className="w-4 h-4" />
              İlk Bannerı Ekle
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map((b) => (
            <Card key={b.id} className="overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                {b.image ? (
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Görsel Yok</div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge variant={b.isActive ? "success" : "default"}>{b.isActive ? "Aktif" : "Pasif"}</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{b.title}</h3>
                {b.subtitle && <p className="text-sm text-gray-500 mt-0.5">{b.subtitle}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">Pozisyon: {b.position}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(b.id, b.isActive)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#FF4FA3] hover:bg-[#fff0f7] transition-colors"
                      title={b.isActive ? "Pasif Yap" : "Aktif Yap"}
                    >
                      {b.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setDeleteId(b.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={editModal} onOpenChange={setEditModal} title="Yeni Banner Ekle" size="md">
        <div className="space-y-4">
          <Input label="Başlık" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <Input label="Alt Başlık" value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
          <Input label="Görsel URL" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="https://..." />
          <Input label="Link" value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} placeholder="/collections/yeni-gelenler" />
          <Input label="Buton Metni" value={form.buttonText} onChange={(e) => setForm((p) => ({ ...p, buttonText: e.target.value }))} placeholder="Keşfet" />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setEditModal(false)}>İptal</Button>
            <Button className="flex-1" onClick={handleSave} loading={isPending}>Kaydet</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Banner Sil"
        description="Bu banneri silmek istediğinizden emin misiniz?"
        variant="danger"
        confirmLabel="Evet, Sil"
        onConfirm={handleDelete}
      />
    </AdminPage>
  );
}
