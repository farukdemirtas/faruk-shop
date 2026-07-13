#!/bin/bash
set -e

echo "=== FARUK SHOP - SERVER SETUP ==="

# 1. PostgreSQL setup
echo "--- Setting up PostgreSQL database ---"
export PGPASSWORD=""
PG_BIN="/usr/lib/postgresql/14/bin"

# Create user and database
$PG_BIN/psql -U postgres <<'EOF'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'shopuser') THEN
    CREATE USER shopuser WITH PASSWORD 'ShopPass2024!' CREATEDB;
  END IF;
END
$$;

SELECT 'User exists' WHERE EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'shopuser');
EOF

$PG_BIN/psql -U postgres <<'EOF'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'faruk_shop') THEN
    CREATE DATABASE faruk_shop OWNER shopuser;
  END IF;
END
$$;
GRANT ALL PRIVILEGES ON DATABASE faruk_shop TO shopuser;
EOF

echo "PostgreSQL setup complete"

# 2. Clone or update the repo
echo "--- Cloning/updating repository ---"
if [ -d "/var/www/faruk-shop" ]; then
  cd /var/www/faruk-shop
  git pull origin master 2>&1
else
  cd /var/www
  git clone https://github.com/farukdemirtas/faruk-shop.git faruk-shop
  cd /var/www/faruk-shop
fi

# 3. Set up .env file
echo "--- Creating .env file ---"
cat > /var/www/faruk-shop/.env << 'ENVEOF'
DATABASE_URL="postgresql://shopuser:ShopPass2024!@localhost:5432/faruk_shop"
NEXTAUTH_URL="https://shop.farukdemirtas.com"
NEXTAUTH_SECRET="faruk-shop-super-secret-2024-jwt-key-change-this"
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=""
SHOPIFY_API_VERSION="2024-10"
SHOPIFY_ADMIN_ACCESS_TOKEN=""
SHOPIFY_WEBHOOK_SECRET=""
UPLOAD_DIR="public/uploads"
MAX_FILE_SIZE="10485760"
ENVEOF

echo ".env file created"

# 4. Install dependencies
echo "--- Installing npm dependencies ---"
cd /var/www/faruk-shop
npm install --omit=dev 2>&1 | tail -5

# 5. Generate Prisma client
echo "--- Generating Prisma client ---"
npx prisma generate 2>&1

# 6. Run database migration
echo "--- Running database migration ---"
npx prisma migrate deploy 2>&1 || npx prisma db push --accept-data-loss 2>&1

# 7. Seed database
echo "--- Seeding database ---"
npx tsx prisma/seed.ts 2>&1 || echo "Seed skipped (already done)"

# 8. Build the app
echo "--- Building Next.js app ---"
npm run build 2>&1 | tail -20

echo ""
echo "=== BUILD COMPLETE ==="
echo "Run: pm2 start npm --name faruk-shop -- start -- -p 3001"
