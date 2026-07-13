"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAdminNav } from "@/components/admin/admin-shell";
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
  Flame,
  ExternalLink,
  X,
  Store,
  Megaphone,
} from "lucide-react";

type NavLink = {
  type?: undefined;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
};

type NavDivider = {
  type: "divider";
  label: string;
};

type NavItem = NavLink | NavDivider;

const navItems: NavItem[] = [
  { label: "Genel Bakış", href: "/admin", icon: LayoutDashboard },
  { type: "divider", label: "Mağaza" },
  { label: "Ürünler", href: "/admin/products", icon: Package },
  { label: "Siparişler", href: "/admin/orders", icon: ShoppingCart },
  { label: "Müşteriler", href: "/admin/customers", icon: Users },
  { type: "divider", label: "Pazarlama" },
  { label: "Bannerlar", href: "/admin/banners", icon: Image },
  { label: "Kampanyalar", href: "/admin/campaigns", icon: Megaphone },
  { label: "Kuponlar", href: "/admin/coupons", icon: Ticket },
  { type: "divider", label: "Entegrasyon" },
  {
    label: "Shopify Sync",
    href: "/admin/shopify-sync",
    icon: RefreshCw,
    badge: "API",
  },
  { type: "divider", label: "Sistem" },
  { label: "Kargo", href: "/admin/shipping", icon: Truck },
  { label: "Ödeme", href: "/admin/payments", icon: CreditCard },
  { label: "Ayarlar", href: "/admin/settings", icon: Settings },
  { label: "Kullanıcılar", href: "/admin/users", icon: UserCog },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useAdminNav();

  return (
    <>
      {/* Mobil overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Menüyü kapat"
        />
      )}

      <aside
        className={cn(
          "admin-sidebar",
          collapsed && "is-collapsed",
          mobileOpen && "is-mobile-open",
        )}
      >
        {/* Logo */}
        <div className="admin-sidebar-head">
          <Link href="/admin" className="admin-sidebar-brand" onClick={() => setMobileOpen(false)}>
            <div className="admin-sidebar-logo">
              <Flame size={18} color="white" />
            </div>
            {!collapsed && (
              <div>
                <p className="admin-sidebar-title">Faruk<span>Shop</span></p>
                <p className="admin-sidebar-sub">Yönetim Paneli</p>
              </div>
            )}
          </Link>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Menüyü kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="admin-sidebar-nav">
          {navItems.map((item, i) => {
            if (item.type === "divider") {
              if (collapsed) {
                return <div key={`d-${i}`} className="admin-sidebar-divider-line" />;
              }
              return (
                <p key={`d-${i}`} className="admin-sidebar-section">
                  {item.label}
                </p>
              );
            }

            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn("admin-sidebar-link", active && "is-active")}
              >
                <span className="admin-sidebar-link-icon">
                  <Icon size={18} />
                </span>
                {!collapsed && (
                  <>
                    <span className="admin-sidebar-link-label">{item.label}</span>
                    {item.badge && (
                      <span className="admin-sidebar-badge">{item.badge}</span>
                    )}
                  </>
                )}
                {active && <span className="admin-sidebar-active-bar" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-foot">
          {!collapsed && (
            <Link href="/" target="_blank" className="admin-sidebar-store">
              <Store size={15} />
              Mağazayı Görüntüle
              <ExternalLink size={12} />
            </Link>
          )}
          <button
            type="button"
            className="admin-sidebar-collapse"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span>Daralt</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
