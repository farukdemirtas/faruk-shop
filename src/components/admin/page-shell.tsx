import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminPage({
  children,
  className,
  narrow,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div className={cn("admin-page", narrow && "admin-page-narrow", className)}>
      {children}
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
  section,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  section?: string;
}) {
  return (
    <div className="admin-page-header">
      <div className="admin-page-header-text">
        {section && <span className="admin-page-section">{section}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="admin-page-header-actions">{actions}</div>}
    </div>
  );
}

export function AdminPanel({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={cn("admin-panel", padded && "admin-panel-padded", className)}>
      {children}
    </div>
  );
}

export function AdminPanelHeader({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="admin-panel-header">
      <h2>{title}</h2>
      {action}
      {children}
    </div>
  );
}

export function AdminTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AdminPanel padded={false} className={className}>
      <div className="admin-table-wrap">
        <table className="admin-table">{children}</table>
      </div>
    </AdminPanel>
  );
}

export function AdminFilterBar({ children }: { children: React.ReactNode }) {
  return <div className="admin-filter-bar">{children}</div>;
}

export function AdminFilterChip({
  href,
  active,
  children,
  onClick,
}: {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const className = cn("admin-filter-chip", active && "is-active");

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export function AdminEmpty({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <AdminPanel className="admin-empty">
      {icon && <div className="admin-empty-icon">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </AdminPanel>
  );
}

export function AdminAlert({
  children,
  variant = "warning",
  action,
}: {
  children: React.ReactNode;
  variant?: "warning" | "info" | "success";
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("admin-alert", `is-${variant}`)}>
      <div className="admin-alert-body">{children}</div>
      {action}
    </div>
  );
}

export function AdminToolbar({ children }: { children: React.ReactNode }) {
  return <div className="admin-toolbar">{children}</div>;
}
