import { getSyncStats, getSyncHistory, getShopifySettings } from "@/actions/shopify-sync";
import { ShopifySyncClient } from "./shopify-sync-client";

export const dynamic = "force-dynamic";

export default async function ShopifySyncPage() {
  const [stats, history, settings] = await Promise.all([
    getSyncStats(),
    getSyncHistory(10),
    getShopifySettings(),
  ]);

  return (
    <ShopifySyncClient
      stats={stats}
      history={history}
      isConnected={settings?.isConnected ?? false}
      lastConnectedAt={settings?.lastConnectedAt ?? null}
    />
  );
}
