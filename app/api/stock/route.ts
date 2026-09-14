import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/guard";

export async function GET(req: NextRequest) {
  const guard = await requirePermission("reports:view");
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const movements = await prisma.stockMovement.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { product: { select: { name: true, sku: true } } },
  });

  return NextResponse.json(movements);
}
