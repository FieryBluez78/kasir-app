"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { DiscountDialog } from "./discount-dialog";
import { CheckoutDialog } from "./checkout-dialog";
import { formatCurrency } from "@/lib/utils/currency";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { CartApi } from "@/lib/hooks/use-cart";

export function CartPanel({ cart, onCheckoutComplete }: { cart: CartApi; onCheckoutComplete: () => void }) {
  const { t } = useLanguage();
  const [discountOpen, setDiscountOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-display text-sm font-semibold">{t("pos.cart")}</h3>
        {cart.lines.length > 0 && (
          <Button variant="ghost" size="sm" onClick={cart.clear} className="text-muted-foreground">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {cart.lines.length === 0 ? (
          <EmptyState icon={ShoppingCart} title={t("pos.emptyCart")} description={t("pos.emptyCartDesc")} className="border-none py-12" />
        ) : (
          <div className="space-y-3">
            {cart.lines.map((line) => (
              <div key={line.product.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{line.product.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(line.product.sellingPrice)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => cart.updateQuantity(line.product.id, line.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={line.quantity >= line.product.stock}
                    onClick={() => cart.updateQuantity(line.product.id, line.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <span className="w-20 shrink-0 text-right text-sm font-medium tabular-nums">
                  {formatCurrency(line.product.sellingPrice * line.quantity)}
                </span>
                <button onClick={() => cart.removeLine(line.product.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <button
          onClick={() => setDiscountOpen(true)}
          className="flex w-full items-center justify-between rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary"
        >
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            {t("pos.applyDiscount")}
          </span>
          {cart.discountAmount > 0 && <span className="font-medium">-{formatCurrency(cart.discountAmount)}</span>}
        </button>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("pos.subtotal")}</span>
            <span>{formatCurrency(cart.subtotal)}</span>
          </div>
          {cart.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("pos.discount")}</span>
              <span>-{formatCurrency(cart.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-display text-base font-semibold">
            <span>{t("pos.grandTotal")}</span>
            <span>{formatCurrency(cart.total)}</span>
          </div>
        </div>

        <Button className="w-full" size="lg" disabled={cart.lines.length === 0} onClick={() => setCheckoutOpen(true)}>
          {t("pos.checkout")}
        </Button>
      </div>

      <DiscountDialog
        open={discountOpen}
        onOpenChange={setDiscountOpen}
        discountType={cart.discountType}
        discountValue={cart.discountValue}
        onApply={(type, value) => {
          cart.setDiscountType(type);
          cart.setDiscountValue(value);
        }}
      />

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} cart={cart} onCompleted={onCheckoutComplete} />
    </div>
  );
}
