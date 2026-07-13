"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  RefreshCw,
  Image,
  Tag,
  Ticket,
  Truck,
  CreditCard,
  Settings,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Store,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Shopify Senkronizasyonu",
    href: "/admin/shopify-sync",
    icon: RefreshCw,
    badge: "Shopify",
  },
  { type: "divider", label: "Mağaza" },
  {
    label: "Ürün Yönetimi",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Siparişler",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Müşteriler",
    href: "/admin/customers",
    icon: Users,
  },
  { type: "divider", label: "Pazarlama" },
  {
    label: "Banner Yönetimi",
    href: "/admin/banners",
    icon: Image,
  },
  {
    label: "Kampanyalar",
    href: "/admin/campaigns",
    icon: Sparkles,
  },
  {
    label: "Kuponlar",
    href: "/admin/coupons",
    icon: Ticket,
  },
  { type: "divider", label: "Ayarlar" },
  {
    label: "Kargo Ayarları",
    href: "/admin/shipping",
    icon: Truck,
  },
  {
    label: "Ödeme Ayarları",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    label: "Shopify Ayarları",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    label: "Kullanıcı Yönetimi",
    href: "/admin/users",
    icon: UserCog,
  },
];

type NavItem = {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  type?: string;
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-[#1A1A2E] border-r border-white/5 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-4 border-b border-white/10", collapsed && "justify-center")}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4FA3] to-[#c2185b] flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">Faruk Shop</p>
            <p className="text-white/40 text-xs">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {(navItems as NavItem[]).map((item, i) => {
          if (item.type === "divider") {
            if (collapsed) return <div key={i} className="my-2 border-t border-white/10" />;
            return (
              <div key={i} className="px-3 pt-4 pb-1">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">{item.label}</p>
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href!);

          return (
            <Link
              key={item.href}
              href={item.href!}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-[#FF4FA3] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10",
                collapsed && "justify-center"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-white/60 group-hover:text-white")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs bg-[#FFD6E8] text-[#FF4FA3] px-1.5 py-0.5 rounded-md font-semibold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#1A1A2E] border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
