import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { WhatsAppButton } from "@/components/store/whatsapp-button";
import { WishlistProvider } from "@/lib/wishlist-context";
import { Toaster } from "sonner";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content" style={{ flex: 1 }}>{children}</main>
        <Footer />
        <WhatsAppButton />
        <Toaster position="top-right" richColors />
      </div>
    </WishlistProvider>
  );
}
