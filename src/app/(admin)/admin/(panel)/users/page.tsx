import { db } from "@/lib/db";
import { formatDate, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import {
  AdminPage,
  AdminPageHeader,
  AdminTable,
} from "@/components/admin/page-shell";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const roleColors: Record<string, "pink" | "info" | "default"> = {
    SUPER_ADMIN: "pink",
    ADMIN: "info",
    EDITOR: "default",
  };

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Süper Admin",
    ADMIN: "Admin",
    EDITOR: "Editör",
  };

  return (
    <AdminPage>
      <AdminPageHeader
        section="Sistem"
        title="Kullanıcılar"
        description={`${users.length} kullanıcı`}
        actions={
          <button className="inline-flex items-center gap-2 h-10 px-4 bg-[#FF4FA3] text-white rounded-xl text-sm font-semibold hover:bg-[#e6388e] transition-colors">
            <Plus className="w-4 h-4" />
            Yeni Kullanıcı
          </button>
        }
      />

      <AdminTable>
        <thead>
          <tr>
            {["Kullanıcı", "E-posta", "Rol", "Durum", "Kayıt Tarihi", ""].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF4FA3] to-[#c2185b] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {u.name ? getInitials(u.name) : u.email[0]?.toUpperCase()}
                  </div>
                  <p className="font-semibold text-gray-900">{u.name ?? "İsimsiz"}</p>
                </div>
              </td>
              <td>{u.email}</td>
              <td>
                <Badge variant={roleColors[u.role] ?? "default"}>
                  {roleLabels[u.role] ?? u.role}
                </Badge>
              </td>
              <td>
                <Badge variant={u.isActive ? "success" : "danger"}>
                  {u.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </td>
              <td className="text-xs text-gray-500">{formatDate(u.createdAt)}</td>
              <td>
                <button className="text-sm text-[#FF4FA3] hover:underline font-semibold">Düzenle</button>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </AdminPage>
  );
}
