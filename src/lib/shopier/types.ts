export type ShopierListingProduct = {
  id: string;
  title: string;
  image: string;
  url: string;
};

export type ShopierVariationOption = {
  id: number;
  name: string;
  stock: number;
};

export type ShopierProductDetail = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  variations: Array<{
    name: string;
    options: ShopierVariationOption[];
  }>;
  url: string;
};

export type ShopierPageData = {
  page?: string;
  shop?: { username?: string };
  product?: {
    name?: string;
    absolute_link?: string;
    stock?: number;
    price?: {
      masterpass_amount?: number;
      price_legacy_formatted?: string;
    };
    variations?: Record<string, unknown>;
    variation_details?: unknown[];
  };
};
