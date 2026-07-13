import { getShopierSyncHistory, getShopierSyncStats } from "@/actions/shopier-sync";
import { ShopierSyncClient } from "./shopier-sync-client";

export const dynamic = "force-dynamic";

export default async function ShopierSyncPage() {
  const [stats, history] = await Promise.all([
    getShopierSyncStats(),
    getShopierSyncHistory(10),
  ]);

  return <ShopierSyncClient stats={stats} history={history} />;
}
