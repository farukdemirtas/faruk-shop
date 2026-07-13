"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Lock, User, Flame, ArrowRight, Shield, ExternalLink,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { BANNER_IMAGES } from "@/lib/banner-images";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Kullanıcı adı veya şifre hatalı.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      {/* Sol — marka paneli */}
      <div className="admin-login-brand">
        <img
          src={BANNER_IMAGES.pageHeader.default}
          alt=""
          className="admin-login-brand-img"
        />
        <div className="admin-login-brand-overlay" />
        <div className="admin-login-brand-content">
          <div className="admin-login-brand-logo">
            <Flame size={22} color="white" />
          </div>
          <h1>
            Faruk<span>Shop</span>
          </h1>
          <p className="admin-login-brand-tag">+18 Fantazi İç Giyim Yönetim Paneli</p>
          <ul className="admin-login-features">
            <li><Shield size={14} /> Güvenli admin erişimi</li>
            <li><Flame size={14} /> Ürün & sipariş yönetimi</li>
            <li><ExternalLink size={14} /> Mağaza entegrasyonu</li>
          </ul>
        </div>
      </div>

      {/* Sağ — giriş formu */}
      <div className="admin-login-form-wrap">
        <div className="admin-login-form-card">
          <div className="admin-login-form-header">
            <div className="admin-login-form-logo sm-only">
              <Flame size={18} color="white" />
            </div>
            <h2>Hoş Geldiniz</h2>
            <p>Devam etmek için hesabınıza giriş yapın</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-login-field">
              <label htmlFor="username">Kullanıcı Adı</label>
              <div className="admin-login-input-wrap">
                <User size={16} aria-hidden />
                <input
                  id="username"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="samsun"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="admin-login-field">
              <label htmlFor="password">Şifre</label>
              <div className="admin-login-input-wrap">
                <Lock size={16} aria-hidden />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-login-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="admin-login-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="admin-login-spinner" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Panele Giriş Yap
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="admin-login-note">
            Bu alan yalnızca yetkili personel içindir.
          </p>

          <Link href="/" className="admin-login-store-link">
            <ExternalLink size={14} />
            Mağazaya Dön
          </Link>
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
}
