import { prisma } from "@/lib/db/prisma";
import { calculateChange, calculateDiscount, type DiscountType } from "./discount";
import { recordStockMovement, InsufficientStockError } from "./stock";
import { generateTransactionCode, startOfToday } from "@/lib/utils/date";

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export interface CheckoutArgs {
  items: CheckoutItemInput[];
  discountType?: DiscountType | null;
  discountValue?: number | null;
  payment: number;
  userId?: string;
}

export class InsufficientPaymentError extends Error {
  constructor(total: number, payment: number) {
    super(`Payment ${payment} is less than total due ${total}`);
    this.name = "InsufficientPaymentError";
  }
}

export class EmptyCartError extends Error {
  constructor() {
    super("Cart must contain at least one item");
    this.name = "EmptyCartError";
  }
}

/**
 * Executes a full point-of-sale checkout as a single atomic database
 * transaction: validates stock and prices live from the DB (never trusts
 * client-supplied prices), creates the Transaction + TransactionItem rows,
 * decrements stock, and writes a StockMovement per line item. If anything
 * fails partway through (e.g. one item runs out of stock), the whole
 * operation rolls back so stock and revenue can never drift out of sync.
 */
export async function checkout({
  items,
  discountType,
  discountValue,
  payment,
  userId,
}: CheckoutArgs) {
  if (items.length === 0) throw new EmptyCartError();

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) {
        throw new InsufficientStockError(product.name, item.quantity, product.stock);
      }
      const lineSubtotal = product.sellingPrice * item.quantity;
      subtotal += lineSubtotal;
      return {
        product,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        unitCost: product.costPrice,
        subtotal: lineSubtotal,
      };
    });

    const { discountAmount, total } = calculateDiscount({ subtotal, discountType, discountValue });
    const { isSufficient, change } = calculateChange(total, payment);

    if (!isSufficient) throw new InsufficientPaymentError(total, payment);

    const todayCount = await tx.transaction.count({
      where: { createdAt: { gte: startOfToday() } },
    });
    const code = generateTransactionCode(todayCount + 1);

    const transaction = await tx.transaction.create({
      data: {
        code,
        subtotal,
        discountType: discountType ?? null,
        discountValue: discountValue ?? null,
        discountAmount,
        total,
        payment,
        change,
        userId,
        items: {
          create: lineItems.map((li) => ({
            productId: li.product.id,
            productName: li.product.name,
            sku: li.product.sku,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            unitCost: li.unitCost,
            subtotal: li.subtotal,
          })),
        },
      },
      include: { items: true },
    });

    for (const li of lineItems) {
      await recordStockMovement({
        tx,
        productId: li.product.id,
        type: "SALE",
        delta: -li.quantity,
        reason: `Sale — ${transaction.code}`,
        transactionId: transaction.id,
        userId,
      });
    }

    return transaction;
  });
}
