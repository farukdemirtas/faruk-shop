import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const banners = await db.banner.findMany({
    orderBy: { position: "asc" },
  });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    title: string;
    subtitle?: string;
    image: string;
    link?: string;
    buttonText?: string;
  };

  if (!body.title || !body.image) {
    return NextResponse.json({ error: "Başlık ve görsel zorunludur" }, { status: 400 });
  }

  const count = await db.banner.count();
  const banner = await db.banner.create({
    data: {
      title: body.title,
      subtitle: body.subtitle,
      image: body.image,
      link: body.link,
      buttonText: body.buttonText,
      position: count,
      isActive: true,
    },
  });

  return NextResponse.json(banner, { status: 201 });
}
