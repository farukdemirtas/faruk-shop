import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "pink" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  pink: "bg-[#FFD6E8] text-[#FF4FA3]",
  outline: "border border-gray-200 text-gray-600 bg-transparent",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-gray-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  pink: "bg-[#FF4FA3]",
  outline: "bg-gray-400",
};

export function Badge({ children, variant = "default", className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    ACTIVE: { label: "Aktif", variant: "success" },
    DRAFT: { label: "Taslak", variant: "warning" },
    ARCHIVED: { label: "Arşivlendi", variant: "default" },
    PENDING: { label: "Bekliyor", variant: "warning" },
    CONFIRMED: { label: "Onaylandı", variant: "info" },
    PROCESSING: { label: "İşleniyor", variant: "info" },
    SHIPPED: { label: "Kargoya Verildi", variant: "pink" },
    DELIVERED: { label: "Teslim Edildi", variant: "success" },
    CANCELLED: { label: "İptal", variant: "danger" },
    REFUNDED: { label: "İade", variant: "danger" },
    PAID: { label: "Ödendi", variant: "success" },
    FAILED: { label: "Başarısız", variant: "danger" },
    UNFULFILLED: { label: "Hazırlanmadı", variant: "warning" },
    FULFILLED: { label: "Hazırlandı", variant: "success" },
    COMPLETED: { label: "Tamamlandı", variant: "success" },
    RUNNING: { label: "Çalışıyor", variant: "info" },
    PARTIAL: { label: "Kısmi", variant: "warning" },
  };

  const config = map[status] ?? { label: status, variant: "default" as BadgeVariant };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
