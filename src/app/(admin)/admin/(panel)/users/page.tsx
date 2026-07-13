import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} kullanıcı</p>
        </div>
        <button className="inline-flex items-center gap-2 h-10 px-4 bg-[#FF4FA3] text-white rounded-xl text-sm font-medium hover:bg-[#e6388e] transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Yeni Kullanıcı
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Kullanıcı", "E-posta", "Rol", "Durum", "Kayıt Tarihi", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#fff0f7]/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF4FA3] to-[#c2185b] flex items-center justify-center text-white text-sm font-bold">
                      {u.name ? getInitials(u.name) : u.email[0]?.toUpperCase()}
                    </div>
                    <p className="font-medium text-gray-900">{u.name ?? "İsimsiz"}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={roleColors[u.role] ?? "default"}>
                    {roleLabels[u.role] ?? u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.isActive ? "success" : "danger"}>
                    {u.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <button className="text-sm text-[#FF4FA3] hover:underline">Düzenle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
