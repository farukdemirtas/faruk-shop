import type { ShopierListingProduct, ShopierPageData, ShopierProductDetail, ShopierVariationOption } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function normalizeStoreUsername(input: string): string {
  const trimmed = input.trim().replace(/\/$/, "");
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://www.shopier.com/${trimmed}`);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? trimmed;
  } catch {
    return trimmed.replace(/^https?:\/\/(www\.)?shopier\.com\//i, "").split("/")[0];
  }
}

function extractEmbeddedJson(html: string): ShopierPageData | null {
  const marker = "} = ";
  const letIdx = html.indexOf("let {");
  if (letIdx === -1) return null;

  const jsonStart = html.indexOf(marker, letIdx);
  if (jsonStart === -1) return null;

  let braceStart = html.indexOf("{", jsonStart + marker.length);
  if (braceStart === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = braceStart; i < html.length; i++) {
    const char = html[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") depth++;
    if (char === "}") {
      depth--;
      if (depth === 0) {
        const jsonText = html.slice(braceStart, i + 1);
        try {
          return JSON.parse(jsonText) as ShopierPageData;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function upgradeImageUrl(url: string): string {
  return url
    .replace("/pictures_mid/", "/pictures_large/")
    .replace("/scaledoriginal/", "/pictures_large/");
}

function parseVariations(raw: Record<string, unknown> | undefined): ShopierProductDetail["variations"] {
  if (!raw) return [];

  const result: ShopierProductDetail["variations"] = [];

  for (const key of ["variation_1", "variation_2", "variation_3"]) {
    const nameKey = `${key}_name`;
    const label = raw[nameKey];
    const options = raw[key];

    if (typeof label !== "string" || !Array.isArray(options)) continue;

    result.push({
      name: label,
      options: options.map((opt) => {
        const item = opt as { id?: number; name?: string; stock?: number };
        return {
          id: item.id ?? 0,
          name: item.name ?? "Standart",
          stock: item.stock ?? 0,
        } satisfies ShopierVariationOption;
      }),
    });
  }

  return result;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Shopier sayfası alınamadı (${res.status}): ${url}`);
  }

  return res.text();
}

export async function fetchShopierStoreListing(storeInput: string): Promise<ShopierListingProduct[]> {
  const username = normalizeStoreUsername(storeInput);
  const html = await fetchHtml(`https://www.shopier.com/s/store/${username}`);

  const products: ShopierListingProduct[] = [];
  const seen = new Set<string>();

  const cardRegex =
    /data-back-id="(\d+)"[\s\S]*?alt="([^"]+)"[\s\S]*?src="(https:\/\/cdn\.shopier\.app\/[^"]+)"/g;

  let match: RegExpExecArray | null;
  while ((match = cardRegex.exec(html)) !== null) {
    const [, id, title, image] = match;
    if (!id || seen.has(id)) continue;
    seen.add(id);

    products.push({
      id,
      title: title.trim(),
      image: upgradeImageUrl(image),
      url: `https://www.shopier.com/${username}/${id}`,
    });
  }

  if (products.length === 0) {
    const linkRegex = /https:\/\/www\.shopier\.com\/([^/"']+)\/(\d+)/g;
    while ((match = linkRegex.exec(html)) !== null) {
      const [, shop, id] = match;
      if (shop !== username || seen.has(id)) continue;
      seen.add(id);
      products.push({
        id,
        title: `Ürün ${id}`,
        image: "",
        url: `https://www.shopier.com/${username}/${id}`,
      });
    }
  }

  return products;
}

export async function fetchShopierProductDetail(
  storeInput: string,
  productId: string,
): Promise<ShopierProductDetail | null> {
  const username = normalizeStoreUsername(storeInput);
  const html = await fetchHtml(`https://www.shopier.com/${username}/${productId}`);
  const data = extractEmbeddedJson(html);

  if (!data?.product?.name) return null;

  const images = [
    ...new Set(
      [...html.matchAll(/https:\/\/cdn\.shopier\.app\/(?:pictures_large|scaledoriginal)\/[^"'\s]+/g)].map(
        (m) => upgradeImageUrl(m[0]),
      ),
    ),
  ];

  const priceAmount = data.product.price?.masterpass_amount;
  const price = priceAmount ? priceAmount / 100 : 0;

  return {
    id: productId,
    name: data.product.name,
    description: null,
    price,
    stock: data.product.stock ?? 0,
    images,
    variations: parseVariations(data.product.variations as Record<string, unknown> | undefined),
    url: data.product.absolute_link ?? `https://www.shopier.com/${username}/${productId}`,
  };
}

export function getDefaultShopierStoreUrl(): string {
  return "https://www.shopier.com/Privatetime";
}
