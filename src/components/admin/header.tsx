"use client";

import { Bell, LogOut, User, ExternalLink, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { getAdminPageMeta } from "@/lib/admin-nav";
import { useAdminNav } from "@/components/admin/admin-shell";

interface AdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  title?: string;
}

export function AdminHeader({ user, title }: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setMobileOpen } = useAdminNav();
  const pathname = usePathname();
  const pageMeta = getAdminPageMeta(pathname);
  const pageTitle = title ?? pageMeta.title;

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-header-menu"
          onClick={() => setMobileOpen(true)}
          aria-label="Menüyü aç"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="admin-header-title">{pageTitle}</h1>
          <p className="admin-header-sub">{pageMeta.section} · {pageMeta.description}</p>
        </div>
      </div>

      <div className="admin-header-actions">
        <Link href="/" target="_blank" className="admin-header-store">
          <ExternalLink size={15} />
          <span>Mağaza</span>
        </Link>

        <button type="button" className="admin-header-icon" aria-label="Bildirimler">
          <Bell size={18} />
          <span className="admin-header-notif" />
        </button>

        <div className="admin-header-user-wrap">
          <button
            type="button"
            className="admin-header-user"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="admin-header-avatar">
              {user?.name ? getInitials(user.name) : <User size={14} />}
            </div>
            <div className="admin-header-user-info">
              <p>{user?.name ?? "Admin"}</p>
              <span>{user?.email ?? ""}</span>
            </div>
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                className="admin-header-backdrop"
                onClick={() => setMenuOpen(false)}
              />
              <div className="admin-header-dropdown">
                <div className="admin-header-dropdown-head">
                  <p>{user?.name}</p>
                  <span>{user?.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="admin-header-logout"
                >
                  <LogOut size={15} />
                  Çıkış Yap
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
