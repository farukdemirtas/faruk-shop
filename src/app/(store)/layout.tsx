import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { Toaster } from "sonner";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-wrapper">
      <Navbar />
      {/* pt-[93px] = 33px uyarı şeridi + 60px navbar */}
      <main style={{ flex: 1, paddingTop: "93px" }}>{children}</main>
      <Footer />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
