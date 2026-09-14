export type DiscountType = "PERCENTAGE" | "FIXED";

export interface DiscountInput {
  subtotal: number;
  discountType?: DiscountType | null;
  discountValue?: number | null;
}

export interface DiscountResult {
  discountAmount: number;
  total: number;
}

/**
 * Computes the discount amount and final total from a subtotal.
 * Pure function — no I/O — so it can be unit tested in isolation from
 * the database and reused identically by the POS UI (live preview) and
 * the checkout API route (source of truth).
 *
 * Invariants enforced:
 * - discountAmount is never negative
 * - discountAmount never exceeds the subtotal (total never goes below 0)
 */
export function calculateDiscount({
  subtotal,
  discountType,
  discountValue,
}: DiscountInput): DiscountResult {
  if (!discountType || !discountValue || discountValue <= 0) {
    return { discountAmount: 0, total: subtotal };
  }

  let discountAmount =
    discountType === "PERCENTAGE"
      ? Math.round(subtotal * (discountValue / 100))
      : Math.round(discountValue);

  // Never let a discount push the total below zero or exceed the subtotal.
  discountAmount = Math.min(Math.max(discountAmount, 0), subtotal);

  return { discountAmount, total: subtotal - discountAmount };
}

export interface ChangeResult {
  isSufficient: boolean;
  change: number;
}

export function calculateChange(total: number, payment: number): ChangeResult {
  const isSufficient = payment >= total;
  return { isSufficient, change: isSufficient ? payment - total : 0 };
}
