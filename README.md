# Faruk Shop - Premium Kadın Giyim E-Ticaret Platformu

Premium, modern ve kadın odaklı tam kapsamlı Next.js e-ticaret platformu. Shopify entegrasyonu, kapsamlı admin paneli ve çarpıcı müşteri arayüzü ile birlikte gelir.

## Özellikler

### Shopify Entegrasyonu
- Shopify Admin GraphQL API ve Storefront API entegrasyonu
- Tek tıkla veya toplu ürün senkronizasyonu
- CSV ve Excel (.xlsx) dosyası içe aktarma
- Sürükle-bırak görsel yükleme
- Senkronizasyon geçmişi ve raporlama
- Webhook desteği (sipariş oluşturma, ürün güncelleme)
- Otomatik senkronizasyon seçeneği

### Admin Paneli
- Dashboard (istatistikler, son siparişler, sync durumu)
- Ürün yönetimi (CRUD, varyantlar, görseller, SEO)
- Shopify Senkronizasyonu sayfası
- Siparişler yönetimi
- Müşteri yönetimi
- Banner yönetimi
- Kampanya yönetimi
- Kupon sistemi
- Kargo ayarları
- Ödeme ayarları
- Shopify API ayarları
- Kullanıcı yönetimi

### Müşteri Arayüzü
- Pembe temalı premium tasarım
- Hero banner + koleksiyonlar
- Ürün listesi ve detay sayfaları
- Sepet
- Responsive ve mobil öncelikli
- Framer Motion animasyonları

## Teknoloji

- **Framework:** Next.js 15 (App Router)
- **Veritabanı:** Prisma v7 + PostgreSQL
- **Auth:** NextAuth v5
- **UI:** Tailwind CSS v4
- **Animasyon:** Framer Motion
- **Import:** papaparse, xlsx

## Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Ortam Değişkenleri
`.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun:
```bash
cp .env.example .env
```

Doldurulacak değerler:
```env
DATABASE_URL="postgresql://postgres:şifre@localhost:5432/faruk_shop"
NEXTAUTH_SECRET="güçlü-secret-üretin"
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="mağazanız.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN="..."
SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_..."
```

### 3. Veritabanı Kurulumu

PostgreSQL'de `faruk_shop` veritabanını oluşturun:
```sql
CREATE DATABASE faruk_shop;
```

Migration ve seed:
```bash
npm run db:migrate
npm run db:seed
```

### 4. Uygulamayı Başlat
```bash
npm run dev
```

## Admin Girişi

URL: `http://localhost:3000/admin/login`

Varsayılan bilgiler (seed sonrası):
- **E-posta:** `admin@farukshop.com`
- **Şifre:** `admin123`

> Üretim ortamında şifreyi değiştirmeyi unutmayın!

## Shopify Ayarları

Admin panelinde **Shopify Ayarları** sayfasına gidin ve şu bilgileri doldurun:

1. **Store URL:** `mağazanız.myshopify.com`
2. **Storefront Access Token:** Shopify Admin → Settings → Apps → Develop Apps
3. **Admin API Token:** Shopify Admin → Settings → Apps → Develop Apps → Admin API

## NPM Komutları

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run db:migrate   # Veritabanı migration
npm run db:seed      # Örnek veri ekle
npm run db:studio    # Prisma Studio (veritabanı görselleştirici)
```

## Proje Yapısı

```
src/
├── app/
│   ├── (store)/          # Müşteri arayüzü
│   ├── (admin)/admin/    # Admin paneli
│   └── api/              # API routes
├── components/
│   ├── ui/               # Temel UI bileşenleri
│   ├── store/            # Müşteri arayüzü bileşenleri
│   └── admin/            # Admin bileşenleri
├── lib/
│   ├── shopify/          # Shopify API entegrasyonu
│   ├── db.ts             # Prisma client
│   ├── auth.ts           # NextAuth
│   └── utils.ts
└── actions/
    ├── products.ts       # Ürün Server Actions
    ├── shopify-sync.ts   # Senkronizasyon Actions
    └── import.ts         # CSV/Excel import Actions
```
