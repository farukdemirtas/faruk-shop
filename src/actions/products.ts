"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import type { ProductStatus } from "@prisma/client";

const ProductSchema = z.object({
  title: z.string().min(1, "Ürün adı zorunludur"),
  description: z.string().optional(),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  brand: z.string().optional(),
  price: z.coerce.number().positive("Fiyat pozitif olmalıdır"),
  compareAtPrice: z.coerce.number().positive().optional(),
  costPerItem: z.coerce.number().positive().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
});

export type ProductFormData = z.infer<typeof ProductSchema>;

export async function createProduct(formData: ProductFormData) {
  const parsed = ProductSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };
  }

  const data = parsed.data;
  const slug = slugify(data.title);

  const existing = await db.product.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  try {
    const product = await db.product.create({
      data: {
        title: data.title,
        description: data.description,
        slug: finalSlug,
        barcode: data.barcode,
        sku: data.sku,
        brand: data.brand,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        costPerItem: data.costPerItem,
        status: data.status as ProductStatus,
        tags: data.tags,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        categoryId: data.categoryId,
        collectionId: data.collectionId,
      },
    });

    revalidatePath("/admin/products");
    return { success: true, product };
  } catch (error) {
    return { success: false, error: "Ürün oluşturulurken hata oluştu" };
  }
}

export async function updateProduct(id: string, formData: Partial<ProductFormData>) {
  try {
    const product = await db.product.update({
      where: { id },
      data: {
        ...formData,
        status: formData.status as ProductStatus | undefined,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { success: true, product };
  } catch {
    return { success: false, error: "Ürün güncellenirken hata oluştu" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { success: false, error: "Ürün silinirken hata oluştu" };
  }
}

export async function getProducts(options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
}) {
  const { page = 1, limit = 20, search, status, categoryId } = options ?? {};
  const skip = (page - 1) * limit;

  const where = {
    ...(search ? {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
        { barcode: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(status ? { status: status as ProductStatus } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: true,
        category: true,
        collection: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return { products, total, pages: Math.ceil(total / limit) };
}

export async function getProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
      category: true,
      collection: true,
    },
  });
}
