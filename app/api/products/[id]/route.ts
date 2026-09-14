import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { productSchema } from "@/lib/validations/product";
import { requirePermission, requireSession } from "@/lib/auth/guard";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireSession();
  if (guard instanceof NextResponse) return guard;

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requirePermission("product:update");
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const parsed = productSchema.omit({ stock: true }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const duplicate = await prisma.product.findFirst({
    where: { sku: parsed.data.sku, NOT: { id: params.id } },
  });
  if (duplicate) {
    return NextResponse.json({ error: "DUPLICATE_SKU" }, { status: 409 });
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: { ...parsed.data, categoryId: parsed.data.categoryId || null },
    include: { category: true },
  });

  await prisma.auditLog.create({
    data: {
      entityType: "Product",
      entityId: product.id,
      action: "UPDATE",
      summary: `Updated product ${product.name} (${product.sku})`,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requirePermission("product:delete");
  if (guard instanceof NextResponse) return guard;

  // Soft delete: keeps historical transaction/stock data fully intact.
  const product = await prisma.product.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      entityType: "Product",
      entityId: product.id,
      action: "DELETE",
      summary: `Soft-deleted product ${product.name} (${product.sku})`,
    },
  });

  return NextResponse.json({ success: true });
}
