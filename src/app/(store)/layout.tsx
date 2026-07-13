import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { Toaster } from "sonner";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
      <Toaster position="bottom-right" />
    </>
  );
}
