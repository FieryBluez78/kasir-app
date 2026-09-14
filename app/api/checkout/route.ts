import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validations/checkout";
import {
  checkout,
  EmptyCartError,
  InsufficientPaymentError,
} from "@/lib/services/checkout";
import { InsufficientStockError } from "@/lib/services/stock";
import { requirePermission } from "@/lib/auth/guard";

export async function POST(req: NextRequest) {
  const guard = await requirePermission("transaction:create");
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const transaction = await checkout({
      items: parsed.data.items,
      discountType: parsed.data.discountType ?? null,
      discountValue: parsed.data.discountValue ?? null,
      payment: parsed.data.payment,
      userId: guard.userId,
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return NextResponse.json({ error: "INSUFFICIENT_STOCK", message: err.message }, { status: 400 });
    }
    if (err instanceof InsufficientPaymentError) {
      return NextResponse.json({ error: "INSUFFICIENT_PAYMENT", message: err.message }, { status: 400 });
    }
    if (err instanceof EmptyCartError) {
      return NextResponse.json({ error: "EMPTY_CART", message: err.message }, { status: 400 });
    }
    throw err;
  }
}
