import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Faruk Shop | Premium Kadın Giyim",
    template: "%s | Faruk Shop",
  },
  description: "Premium, modern ve şık kadın giyim mağazası. En güzel koleksiyonları keşfedin.",
  keywords: ["kadın giyim", "elbise", "moda", "premium", "şık"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Faruk Shop",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
