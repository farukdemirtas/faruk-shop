import type {
  ShopierListingProduct,
  ShopierPageData,
  ShopierProductDetail,
  ShopierVariationOption,
} from "./types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type ShopierSession = {
  username: string;
  csrfToken: string;
  cookieHeader: string;
};

type ShopierApiProduct = {
  id: number | string;
  subject?: string;
  name?: string;
  picture?: string;
  link?: string;
};

type ShopierSearchResponse = {
  products?: ShopierApiProduct[];
  show_more?: boolean;
};

function normalizeStoreUsername(input: string): string {
  const trimmed = input.trim().replace(/\/$/, "");
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://www.shopier.com/${trimmed}`);
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] ?? trimmed;
    if (last === "store" && parts.length > 1) {
      return parts[parts.length - 2];
    }
    return last;
  } catch {
    return trimmed.replace(/^https?:\/\/(www\.)?shopier\.com\//i, "").split("/")[0];
  }
}

function getStorePageUrl(username: string): string {
  return `https://www.shopier.com/s/store/${username}`;
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

function parseInitialProductsFromHtml(html: string, username: string): ShopierListingProduct[] {
  const products: ShopierListingProduct[] = [];
  const seen = new Set<string>();
  const blocks = html.split("data-back-id=");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const idMatch = block.match(/^"(\d+)"/);
    if (!idMatch || seen.has(idMatch[1])) continue;

    seen.add(idMatch[1]);
    const titleMatch = block.match(/alt="([^"]+)"/);
    const imageMatch = block.match(/src="(https:\/\/cdn\.shopier\.app\/[^"]+)"/);

    products.push({
      id: idMatch[1],
      title: titleMatch?.[1]?.trim() ?? `Ürün ${idMatch[1]}`,
      image: imageMatch?.[1] ? upgradeImageUrl(imageMatch[1]) : "",
      url: `https://www.shopier.com/${username}/${idMatch[1]}`,
    });
  }

  return products;
}

function getTotalProductCountFromHtml(html: string): number {
  const counts = [...html.matchAll(/product_count[^0-9]{0,10}(\d+)/g)].map((m) => Number(m[1]));
  return counts.length > 0 ? Math.max(...counts) : 0;
}

async function fetchHtml(url: string, init?: RequestInit): Promise<string> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html",
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Shopier sayfası alınamadı (${res.status}): ${url}`);
  }

  return res.text();
}

async function createShopierSession(storeInput: string): Promise<ShopierSession & { html: string }> {
  const username = normalizeStoreUsername(storeInput);
  const res = await fetch(getStorePageUrl(username), {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Shopier mağaza sayfası alınamadı (${res.status})`);
  }

  const html = await res.text();
  const csrfToken = html.match(/csrf-token" content="([^"]+)"/)?.[1];
  if (!csrfToken) {
    throw new Error("Shopier CSRF token bulunamadı");
  }

  const setCookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [];
  let cookieHeader = setCookies.map((cookie) => cookie.split(";")[0]).join("; ");

  if (!cookieHeader) {
    const raw = res.headers.get("set-cookie");
    if (raw) {
      cookieHeader = raw
        .split(/,(?=[^;]+?=)/)
        .map((cookie) => cookie.split(";")[0].trim())
        .join("; ");
    }
  }

  return { username, csrfToken, cookieHeader, html };
}

function mapApiProduct(item: ShopierApiProduct, username: string): ShopierListingProduct {
  const id = String(item.id);
  const image = item.picture
    ? upgradeImageUrl(`https://cdn.shopier.app/pictures_mid/${item.picture}`)
    : "";

  return {
    id,
    title: item.subject?.trim() || item.name?.trim() || `Ürün ${id}`,
    image,
    url: item.link ?? `https://www.shopier.com/${username}/${id}`,
  };
}

async function fetchShopierProductsPage(
  session: ShopierSession,
  offset: number,
  start = 24,
): Promise<ShopierSearchResponse> {
  const params = new URLSearchParams({
    start: String(start),
    offset: String(offset),
    filter: "0",
    sort: "0",
    filterMaxPrice: "",
    filterMinPrice: "",
    datesort: "",
    pricesort: "",
    value: "",
  });

  const res = await fetch(`https://www.shopier.com/s/api/v1/search_product/${session.username}`, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-TOKEN": session.csrfToken,
      "X-Requested-With": "XMLHttpRequest",
      Cookie: session.cookieHeader,
      Referer: getStorePageUrl(session.username),
    },
    body: params.toString(),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Shopier ürün listesi alınamadı (${res.status})`);
  }

  return res.json() as Promise<ShopierSearchResponse>;
}

export async function fetchShopierStoreListing(storeInput: string): Promise<ShopierListingProduct[]> {
  const session = await createShopierSession(storeInput);
  const initialProducts = parseInitialProductsFromHtml(session.html, session.username);
  const totalExpected = getTotalProductCountFromHtml(session.html) || initialProducts.length;

  const byId = new Map(initialProducts.map((product) => [product.id, product]));
  let offset = initialProducts.length - 1;
  let safety = 0;

  while (byId.size < totalExpected && safety < 20) {
    safety++;
    const response = await fetchShopierProductsPage(session, offset);
    const batch = response.products ?? [];
    if (batch.length === 0) break;

    for (const item of batch) {
      const mapped = mapApiProduct(item, session.username);
      byId.set(mapped.id, mapped);
    }

    offset = byId.size - 1;
    if (!response.show_more) break;
  }

  return [...byId.values()];
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
