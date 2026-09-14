import type { Prisma, PrismaClient } from "@prisma/client";
import type { StockMovementType } from "@/types";

type Tx = Prisma.TransactionClient | PrismaClient;

export class InsufficientStockError extends Error {
  constructor(productName: string, requested: number, available: number) {
    super(`Insufficient stock for ${productName}: requested ${requested}, available ${available}`);
    this.name = "InsufficientStockError";
  }
}

interface RecordMovementArgs {
  tx: Tx;
  productId: string;
  type: StockMovementType;
  /** Positive delta adds to stock, negative delta subtracts. */
  delta: number;
  reason?: string;
  transactionId?: string;
  userId?: string;
}

/**
 * Single choke point for every stock change in the app (restock, manual
 * adjustment, sale, return). Every call both updates `Product.stock` and
 * writes a `StockMovement` audit row inside the same operation, so the two
 * can never drift apart — this is what keeps the audit trail trustworthy.
 *
 * Stock is never allowed to go negative.
 */
export async function recordStockMovement({
  tx,
  productId,
  type,
  delta,
  reason,
  transactionId,
  userId,
}: RecordMovementArgs) {
  const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });

  const stockAfter = product.stock + delta;
  if (stockAfter < 0) {
    throw new InsufficientStockError(product.name, Math.abs(delta), product.stock);
  }

  const updated = await tx.product.update({
    where: { id: productId },
    data: { stock: stockAfter },
  });

  await tx.stockMovement.create({
    data: {
      productId,
      type,
      quantity: Math.abs(delta),
      stockBefore: product.stock,
      stockAfter,
      reason,
      transactionId,
      userId,
    },
  });

  return updated;
}
