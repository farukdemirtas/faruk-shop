import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";

async function verifyWebhook(req: NextRequest, body: string): Promise<boolean> {
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!hmacHeader || !secret) return false;

  const digest = createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  return digest === hmacHeader;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const topic = req.headers.get("x-shopify-topic");
  const shopDomain = req.headers.get("x-shopify-shop-domain");

  const isValid = await verifyWebhook(req, body);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log(`Shopify Webhook: ${topic} from ${shopDomain}`);

  switch (topic) {
    case "products/update": {
      const shopifyId = `gid://shopify/Product/${(payload as { id?: number }).id}`;
      await db.product.updateMany({
        where: { shopifyId },
        data: { lastSyncedAt: new Date() },
      });
      break;
    }

    case "products/delete": {
      const shopifyId = `gid://shopify/Product/${(payload as { id?: number }).id}`;
      const settings = await db.shopifySettings.findFirst();
      if (settings?.deleteOnRemove) {
        await db.product.updateMany({
          where: { shopifyId },
          data: { shopifyId: null, shopifySynced: false },
        });
      }
      break;
    }

    case "orders/create": {
      const orderPayload = payload as {
        id?: number;
        name?: string;
        email?: string;
        total_price?: string;
        subtotal_price?: string;
        total_shipping_price_set?: { shop_money?: { amount?: string } };
        total_tax?: string;
        financial_status?: string;
        fulfillment_status?: string;
        line_items?: Array<{
          title?: string;
          sku?: string;
          quantity?: number;
          price?: string;
        }>;
        customer?: {
          id?: number;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
        };
        shipping_address?: unknown;
        billing_address?: unknown;
      };

      if (orderPayload.email) {
        await db.order.create({
          data: {
            email: orderPayload.email,
            shopifyId: String(orderPayload.id),
            shopifyOrderName: orderPayload.name,
            totalAmount: parseFloat(orderPayload.total_price ?? "0"),
            subtotal: parseFloat(orderPayload.subtotal_price ?? "0"),
            shippingAmount: parseFloat(
              orderPayload.total_shipping_price_set?.shop_money?.amount ?? "0"
            ),
            taxAmount: parseFloat(orderPayload.total_tax ?? "0"),
            status: "CONFIRMED",
            paymentStatus: orderPayload.financial_status === "paid" ? "PAID" : "PENDING",
            shippingAddress: orderPayload.shipping_address as never,
            billingAddress: orderPayload.billing_address as never,
            items: {
              create: (orderPayload.line_items ?? []).map((item) => ({
                title: item.title ?? "",
                sku: item.sku,
                quantity: item.quantity ?? 1,
                price: parseFloat(item.price ?? "0"),
                total: (item.quantity ?? 1) * parseFloat(item.price ?? "0"),
              })),
            },
          },
        });
      }
      break;
    }

    default:
      console.log(`Unhandled webhook topic: ${topic}`);
  }

  return NextResponse.json({ received: true });
}
