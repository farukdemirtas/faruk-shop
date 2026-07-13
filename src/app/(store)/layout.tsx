import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { Toaster } from "sonner";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-1 pt-16 w-full">{children}</main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
}
