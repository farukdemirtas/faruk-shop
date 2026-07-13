"use client";

import { createContext, useContext, useState } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { Toaster } from "sonner";

interface AdminShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  children: React.ReactNode;
}

interface AdminNavContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AdminNavContext = createContext<AdminNavContextValue | null>(null);

export function useAdminNav() {
  const ctx = useContext(AdminNavContext);
  if (!ctx) throw new Error("useAdminNav must be used within AdminShell");
  return ctx;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AdminNavContext.Provider value={{ mobileOpen, setMobileOpen, collapsed, setCollapsed }}>
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
          <AdminHeader user={user} />
          <main className="admin-content">{children}</main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "bg-white border border-gray-100 shadow-lg rounded-xl",
              success: "border-l-4 border-l-green-500",
              error: "border-l-4 border-l-red-500",
            },
          }}
        />
      </div>
    </AdminNavContext.Provider>
  );
}
