import Link from "next/link";
import { Store, Mail, Phone, MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4FA3] to-[#c2185b] flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Faruk<span className="text-[#FF4FA3]">Shop</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              Premium kadın giyim ve aksesuar. Şıklığı ve kaliteyi bir araya getiriyoruz.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Heart, href: "#" },
                { icon: Mail, href: "#" },
                { icon: Store, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#FF4FA3] hover:text-white transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/80">
              Koleksiyonlar
            </h3>
            <ul className="space-y-2.5">
              {["Yeni Gelenler", "Elbiseler", "Üst Giyim", "Alt Giyim", "Aksesuarlar", "İndirimler"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/80">
              Müşteri Hizmetleri
            </h3>
            <ul className="space-y-2.5">
              {["Sipariş Takibi", "İade & Değişim", "Boyut Rehberi", "SSS", "İletişim", "Hakkımızda"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white/80">
              İletişim
            </h3>
            <ul className="space-y-3">
              {[
                { icon: Mail, text: "info@farukshop.com" },
                { icon: Phone, text: "+90 555 123 45 67" },
                { icon: MapPin, text: "İstanbul, Türkiye" },
              ].map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-center gap-2 text-white/50 text-sm">
                  <Icon className="w-4 h-4 text-[#FF4FA3] flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <p className="text-xs text-white/30 mb-2">Bültenimize abone ol</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="E-posta"
                  className="flex-1 h-9 px-3 bg-white/10 border border-white/20 rounded-xl text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#FF4FA3]"
                />
                <button className="h-9 px-3 bg-[#FF4FA3] rounded-xl text-white text-xs hover:bg-[#e6388e] transition-colors">
                  Abone
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© 2024 Faruk Shop. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white/60 transition-colors">Gizlilik Politikası</Link>
            <Link href="#" className="hover:text-white/60 transition-colors">Kullanım Koşulları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
