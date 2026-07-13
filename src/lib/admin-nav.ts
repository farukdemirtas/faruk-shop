export type AdminPageMeta = {
  title: string;
  description: string;
  section: string;
};

export const ADMIN_PAGE_META: { href: string; meta: AdminPageMeta }[] = [
  { href: "/admin/products/new", meta: { title: "Yeni Ürün", description: "Yeni ürün bilgilerini girin", section: "Mağaza" } },
  { href: "/admin/products", meta: { title: "Ürünler", description: "Ürün kataloğunu yönetin", section: "Mağaza" } },
  { href: "/admin/orders", meta: { title: "Siparişler", description: "Siparişleri takip edin ve yönetin", section: "Mağaza" } },
  { href: "/admin/customers", meta: { title: "Müşteriler", description: "Müşteri listesi ve sipariş geçmişi", section: "Mağaza" } },
  { href: "/admin/banners", meta: { title: "Bannerlar", description: "Ana sayfa banner görsellerini yönetin", section: "Pazarlama" } },
  { href: "/admin/campaigns", meta: { title: "Kampanyalar", description: "İndirim ve promosyon kampanyaları", section: "Pazarlama" } },
  { href: "/admin/coupons", meta: { title: "Kuponlar", description: "İndirim kuponlarını yönetin", section: "Pazarlama" } },
  { href: "/admin/shopier-sync", meta: { title: "Shopier Senkronizasyonu", description: "Shopier mağazanızdaki ürünleri siteye çekin", section: "Entegrasyon" } },
  { href: "/admin/shipping", meta: { title: "Kargo", description: "Kargo bölgeleri ve teslimat yöntemleri", section: "Sistem" } },
  { href: "/admin/payments", meta: { title: "Ödeme", description: "Ödeme sağlayıcılarını yapılandırın", section: "Sistem" } },
  { href: "/admin/settings", meta: { title: "Ayarlar", description: "Shopify ve mağaza ayarları", section: "Sistem" } },
  { href: "/admin/users", meta: { title: "Kullanıcılar", description: "Admin panel kullanıcı yönetimi", section: "Sistem" } },
  { href: "/admin", meta: { title: "Genel Bakış", description: "Mağazanıza genel bakış", section: "Ana" } },
];

export function getAdminPageMeta(pathname: string): AdminPageMeta {
  for (const { href, meta } of ADMIN_PAGE_META) {
    if (href === "/admin") {
      if (pathname === "/admin") return meta;
      continue;
    }
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      return meta;
    }
  }
  return { title: "Yönetim Paneli", description: "Faruk Shop Admin", section: "Ana" };
}
