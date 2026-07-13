import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Faruk Shop | +18 Fantazi İç Giyim",
    template: "%s | Faruk Shop",
  },
  description: "+18 Premium fantazi iç giyim, babydoll, kostüm ve korse. Gizli paket ile Türkiye geneli kargo.",
  keywords: ["iç giyim", "babydoll", "fantazi kostüm", "korse", "+18", "gizli paket"],
  openGraph: { type: "website", locale: "tr_TR", siteName: "Faruk Shop" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
