import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { Toaster } from "sonner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8F4F6]">
          {children}
        </main>
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
  );
}
