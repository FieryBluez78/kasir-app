"use client";

import { useMemo, useState } from "react";
import type { CartLine, DiscountType, Product } from "@/types";
import { calculateChange, calculateDiscount } from "@/lib/services/discount";

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType | null>(null);
  const [discountValue, setDiscountValue] = useState<number>(0);

  const addProduct = (product: Product) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // never exceed available stock
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      if (product.stock <= 0) return prev;
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.product.id === productId
            ? { ...l, quantity: Math.max(1, Math.min(quantity, l.product.stock)) }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  };

  const removeLine = (productId: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  };

  const clear = () => {
    setLines([]);
    setDiscountType(null);
    setDiscountValue(0);
  };

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.product.sellingPrice * l.quantity, 0),
    [lines]
  );

  const { discountAmount, total } = useMemo(
    () => calculateDiscount({ subtotal, discountType, discountValue }),
    [subtotal, discountType, discountValue]
  );

  const computeChange = (payment: number) => calculateChange(total, payment);

  return {
    lines,
    addProduct,
    updateQuantity,
    removeLine,
    clear,
    subtotal,
    discountType,
    discountValue,
    setDiscountType,
    setDiscountValue,
    discountAmount,
    total,
    computeChange,
  };
}

export type CartApi = ReturnType<typeof useCart>;
