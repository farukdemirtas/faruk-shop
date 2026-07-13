import { storefrontFetch } from "./client";

// ─── Fragments ────────────────────────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    tags
    vendor
    productType
    createdAt
    updatedAt
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          sku
          barcode
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          availableForSale
          quantityAvailable
          selectedOptions { name value }
        }
      }
    }
    seo { title description }
    metafields(identifiers: []) { key value namespace }
  }
`;

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(options?: {
  first?: number;
  after?: string;
  query?: string;
  sortKey?: string;
  reverse?: boolean;
}) {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProducts(
      $first: Int!
      $after: String
      $query: String
      $sortKey: ProductSortKeys
      $reverse: Boolean
    ) {
      products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
        pageInfo { hasNextPage endCursor }
        edges {
          node { ...ProductFields }
        }
      }
    }
  `;

  type Response = {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string };
      edges: Array<{ node: ShopifyProduct }>;
    };
  };

  const data = await storefrontFetch<Response>(query, {
    first: options?.first ?? 20,
    after: options?.after,
    query: options?.query,
    sortKey: options?.sortKey,
    reverse: options?.reverse,
  });

  return data.products;
}

export async function getProductByHandle(handle: string) {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProductByHandle($handle: String!) {
      product(handle: $handle) { ...ProductFields }
    }
  `;

  type Response = { product: ShopifyProduct | null };
  const data = await storefrontFetch<Response>(query, { handle });
  return data.product;
}

// ─── Collections ─────────────────────────────────────────────────────────────

export async function getCollections(first = 20) {
  const query = `
    query GetCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            image { url altText }
          }
        }
      }
    }
  `;

  type Response = {
    collections: {
      edges: Array<{
        node: { id: string; title: string; handle: string; description: string; image: { url: string; altText: string } | null };
      }>;
    };
  };

  const data = await storefrontFetch<Response>(query, { first });
  return data.collections.edges.map((e) => e.node);
}

export async function getCollectionByHandle(handle: string, productFirst = 20) {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetCollectionByHandle($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        id
        title
        handle
        description
        image { url altText }
        products(first: $first) {
          pageInfo { hasNextPage endCursor }
          edges { node { ...ProductFields } }
        }
      }
    }
  `;

  type Response = {
    collection: {
      id: string;
      title: string;
      handle: string;
      description: string;
      image: { url: string; altText: string } | null;
      products: { pageInfo: { hasNextPage: boolean; endCursor: string }; edges: Array<{ node: ShopifyProduct }> };
    } | null;
  };

  const data = await storefrontFetch<Response>(query, { handle, first: productFirst });
  return data.collection;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  tags: string[];
  vendor: string;
  productType: string;
  createdAt: string;
  updatedAt: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  compareAtPriceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
  seo: { title: string | null; description: string | null };
};

export type ShopifyImage = {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  quantityAvailable: number;
  selectedOptions: Array<{ name: string; value: string }>;
};
