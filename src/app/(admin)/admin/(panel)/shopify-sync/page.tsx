import { redirect } from "next/navigation";

export default function LegacyShopifySyncRedirect() {
  redirect("/admin/shopier-sync");
}
