import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { stockAdjustmentSchema } from "@/lib/validations/stock";
import { recordStockMovement, InsufficientStockError } from "@/lib/services/stock";
import { requirePermission } from "@/lib/auth/guard";

export async function POST(req: NextRequest) {
  const guard = await requirePermission("stock:adjust");
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const parsed = stockAdjustmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { productId, direction, quantity, reason } = parsed.data;
  const delta = direction === "ADD" ? quantity : -quantity;
  const type = direction === "ADD" ? "ADJUSTMENT_ADD" : "ADJUSTMENT_REMOVE";

  try {
    const product = await prisma.$transaction(async (tx) =>
      recordStockMovement({ tx, productId, type, delta, reason, userId: guard.userId })
    );
    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return NextResponse.json({ error: "INSUFFICIENT_STOCK", message: err.message }, { status: 400 });
    }
    throw err;
  }
}
