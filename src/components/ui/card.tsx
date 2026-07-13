import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm",
        hover && "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4 border-b border-gray-100", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-gray-900", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-gray-500 mt-0.5", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4 border-t border-gray-100", className)} {...props} />;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
  color?: "pink" | "blue" | "green" | "orange" | "purple";
}

const colorMap = {
  pink: { bg: "bg-[#fff0f7]", icon: "text-[#FF4FA3]", badge: "bg-[#FFD6E8] text-[#FF4FA3]" },
  blue: { bg: "bg-blue-50", icon: "text-blue-500", badge: "bg-blue-100 text-blue-600" },
  green: { bg: "bg-green-50", icon: "text-green-500", badge: "bg-green-100 text-green-600" },
  orange: { bg: "bg-orange-50", icon: "text-orange-500", badge: "bg-orange-100 text-orange-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", badge: "bg-purple-100 text-purple-600" },
};

export function StatCard({ title, value, icon, trend, className, color = "pink" }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-2", colors.badge)}>
              <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
              <span className="opacity-70">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors.bg)}>
            <span className={colors.icon}>{icon}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
