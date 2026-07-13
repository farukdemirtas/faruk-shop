export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
};

export type CartState = {
  items: CartItem[];
  couponCode?: string;
  couponApplied?: boolean;
};

const CART_KEY = "farukshop_cart";

export function loadCart(): CartState {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    return { items: parsed.items ?? [], couponCode: parsed.couponCode, couponApplied: parsed.couponApplied };
  } catch {
    return { items: [] };
  }
}

export function saveCart(state: CartState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(state));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function calcCartTotals(items: CartItem[], couponApplied: boolean) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.15) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= 600 ? 0 : 49.9;
  const total = afterDiscount + shipping;
  return { subtotal, discount, shipping, total };
}
