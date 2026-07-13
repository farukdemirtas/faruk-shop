import { adminFetch } from "./client";

// ─── Product Mutations ───────────────────────────────────────────────────────

const PRODUCT_CREATE_MUTATION = `
  mutation ProductCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
    productCreate(input: $input, media: $media) {
      product {
        id
        handle
        variants(first: 100) {
          edges { node { id sku } }
        }
      }
      userErrors { field message }
    }
  }
`;

const PRODUCT_UPDATE_MUTATION = `
  mutation ProductUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id handle }
      userErrors { field message }
    }
  }
`;

const PRODUCT_DELETE_MUTATION = `
  mutation ProductDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors { field message }
    }
  }
`;

const INVENTORY_ADJUST_MUTATION = `
  mutation inventorySetOnHandQuantities($input: InventorySetOnHandQuantitiesInput!) {
    inventorySetOnHandQuantities(input: $input) {
      userErrors { field message }
    }
  }
`;

// ─── Admin Product Types ─────────────────────────────────────────────────────

export type AdminProductInput = {
  id?: string;
  title: string;
  bodyHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  seo?: { title?: string; description?: string };
  variants?: AdminVariantInput[];
};

export type AdminVariantInput = {
  id?: string;
  title?: string;
  sku?: string;
  barcode?: string;
  price: string;
  compareAtPrice?: string;
  inventoryQuantity?: number;
  weight?: number;
  weightUnit?: "KILOGRAMS" | "GRAMS" | "POUNDS" | "OUNCES";
  requiresShipping?: boolean;
  option1?: string;
  option2?: string;
  option3?: string;
};

export type CreateMediaInput = {
  originalSource: string;
  alt?: string;
  mediaContentType: "IMAGE" | "VIDEO" | "EXTERNAL_VIDEO";
};

// ─── Product Operations ───────────────────────────────────────────────────────

export async function createShopifyProduct(
  input: AdminProductInput,
  media?: CreateMediaInput[]
) {
  type Response = {
    productCreate: {
      product: { id: string; handle: string; variants: { edges: Array<{ node: { id: string; sku: string | null } }> } } | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  };

  const data = await adminFetch<Response>(PRODUCT_CREATE_MUTATION, { input, media });
  const { product, userErrors } = data.productCreate;

  if (userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join(", "));
  }

  return product;
}

export async function updateShopifyProduct(input: AdminProductInput & { id: string }) {
  type Response = {
    productUpdate: {
      product: { id: string; handle: string } | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  };

  const data = await adminFetch<Response>(PRODUCT_UPDATE_MUTATION, { input });
  const { product, userErrors } = data.productUpdate;

  if (userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join(", "));
  }

  return product;
}

export async function deleteShopifyProduct(id: string) {
  type Response = {
    productDelete: {
      deletedProductId: string | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  };

  const data = await adminFetch<Response>(PRODUCT_DELETE_MUTATION, { input: { id } });
  const { deletedProductId, userErrors } = data.productDelete;

  if (userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join(", "));
  }

  return deletedProductId;
}

// ─── Admin Product Queries ────────────────────────────────────────────────────

export async function getAdminProducts(first = 50, after?: string) {
  const query = `
    query GetAdminProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            id
            title
            handle
            status
            totalInventory
            priceRangeV2 {
              minVariantPrice { amount currencyCode }
            }
            images(first: 1) {
              edges { node { url altText } }
            }
            variants(first: 100) {
              edges { node { id sku inventoryQuantity } }
            }
          }
        }
      }
    }
  `;

  type Response = {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string };
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          status: string;
          totalInventory: number;
          priceRangeV2: { minVariantPrice: { amount: string; currencyCode: string } };
          images: { edges: Array<{ node: { url: string; altText: string | null } }> };
          variants: { edges: Array<{ node: { id: string; sku: string | null; inventoryQuantity: number } }> };
        };
      }>;
    };
  };

  const data = await adminFetch<Response>(query, { first, after });
  return data.products;
}

export async function testShopifyConnection() {
  const query = `
    query TestConnection {
      shop {
        name
        email
        primaryDomain { url }
        plan { displayName }
      }
    }
  `;

  type Response = {
    shop: {
      name: string;
      email: string;
      primaryDomain: { url: string };
      plan: { displayName: string };
    };
  };

  const data = await adminFetch<Response>(query);
  return data.shop;
}

export async function getAdminCollections(first = 50) {
  const query = `
    query GetAdminCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            productsCount { count }
          }
        }
      }
    }
  `;

  type Response = {
    collections: {
      edges: Array<{
        node: { id: string; title: string; handle: string; productsCount: { count: number } };
      }>;
    };
  };

  const data = await adminFetch<Response>(query, { first });
  return data.collections.edges.map((e) => e.node);
}
