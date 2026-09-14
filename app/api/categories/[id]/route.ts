import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { categorySchema } from "@/lib/validations/product";
import { requirePermission } from "@/lib/auth/guard";

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requirePermission("category:manage");
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const category = await prisma.category.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requirePermission("category:manage");
  if (guard instanceof NextResponse) return guard;

  // Products keep their history; only the category link is removed.
  await prisma.product.updateMany({ where: { categoryId: params.id }, data: { categoryId: null } });
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
