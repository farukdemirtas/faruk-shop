import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as Partial<{
    title: string;
    subtitle: string;
    image: string;
    link: string;
    buttonText: string;
    isActive: boolean;
    position: number;
  }>;

  const banner = await db.banner.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(banner);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.banner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
