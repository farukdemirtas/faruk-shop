export type ShopifyFetchOptions = {
  query: string;
  variables?: Record<string, unknown>;
  apiType?: "storefront" | "admin";
  cache?: RequestCache;
  tags?: string[];
};

export type ShopifyResponse<T> = {
  data: T;
  errors?: Array<{ message: string; locations?: unknown; path?: unknown }>;
};

async function shopifyFetch<T>({
  query,
  variables,
  apiType = "storefront",
  cache = "force-cache",
  tags,
}: ShopifyFetchOptions): Promise<ShopifyResponse<T>> {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2024-10";

  if (!domain) {
    throw new Error("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not set");
  }

  let endpoint: string;
  let headers: Record<string, string>;

  if (apiType === "admin") {
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    if (!adminToken) throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is not set");
    endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`;
    headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
    };
  } else {
    const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    if (!storefrontToken) throw new Error("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set");
    endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;
    headers = {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache,
    ...(tags ? { next: { tags } } : {}),
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json() as ShopifyResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }

  return json;
}

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { cache?: RequestCache; tags?: string[] }
): Promise<T> {
  const result = await shopifyFetch<T>({
    query,
    variables,
    apiType: "storefront",
    ...options,
  });
  return result.data;
}

export async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const result = await shopifyFetch<T>({
    query,
    variables,
    apiType: "admin",
    cache: "no-store",
  });
  return result.data;
}
