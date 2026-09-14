import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { categorySchema } from "@/lib/validations/product";
import { requirePermission, requireSession } from "@/lib/auth/guard";

export async function GET() {
  const guard = await requireSession();
  if (guard instanceof NextResponse) return guard;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const guard = await requirePermission("category:manage");
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await prisma.category.create({ data: parsed.data });
  return NextResponse.json(category, { status: 201 });
}
