import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const orderSchema = z.object({
  firstName: z.string().min(2, "Ad gerekli"),
  lastName: z.string().min(2, "Soyad gerekli"),
  email: z.string().email("Geçerli e-posta girin"),
  phone: z.string().min(10, "Telefon gerekli"),
  address: z.string().min(10, "Adres gerekli"),
  city: z.string().min(1, "İl seçin"),
  district: z.string().min(1, "İlçe seçin"),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["cod", "transfer"]),
  couponCode: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    image: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
  })).min(1, "Sepet boş"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = orderSchema.parse(body);

    const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const couponApplied = data.couponCode?.toUpperCase() === "YEVA15";
    const discount = couponApplied ? Math.round(subtotal * 0.15) : 0;
    const afterDiscount = subtotal - discount;
    const shipping = afterDiscount >= 600 ? 0 : 49.9;
    const total = afterDiscount + shipping;

    const customer = await db.customer.upsert({
      where: { email: data.email },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      create: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      },
    });

    const shippingAddress = {
      firstName: data.firstName,
      lastName: data.lastName,
      address1: data.address,
      city: data.city,
      district: data.district ?? "",
      postalCode: data.postalCode ?? "",
      country: "TR",
      phone: data.phone,
    };

    const order = await db.order.create({
      data: {
        customerId: customer.id,
        email: data.email,
        phone: data.phone,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        discountAmount: discount,
        shippingAmount: shipping,
        taxAmount: 0,
        totalAmount: total,
        couponCode: couponApplied ? "YEVA15" : null,
        notes: [
          data.notes,
          `Ödeme: ${data.paymentMethod === "cod" ? "Kapıda Ödeme" : "Havale/EFT"}`,
        ].filter(Boolean).join("\n"),
        shippingAddress,
        billingAddress: shippingAddress,
        items: {
          create: data.items.map((item) => ({
            productId: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            image: item.image,
          })),
        },
      },
      include: { items: true },
    });

    await db.customer.update({
      where: { id: customer.id },
      data: { totalOrders: { increment: 1 }, totalSpent: { increment: total } },
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      orderId: order.id,
      total,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Geçersiz veri" }, { status: 400 });
    }
    console.error("Order create error:", err);
    return NextResponse.json({ error: "Sipariş oluşturulamadı" }, { status: 500 });
  }
}
