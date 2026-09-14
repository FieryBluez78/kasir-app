"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt } from "@/components/transactions/receipt";
import { formatCurrency } from "@/lib/utils/currency";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { CartApi } from "@/lib/hooks/use-cart";
import type { Transaction } from "@/types";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartApi;
  onCompleted: () => void;
}

export function CheckoutDialog({ open, onOpenChange, cart, onCompleted }: CheckoutDialogProps) {
  const { t } = useLanguage();
  const [payment, setPayment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  const paymentNum = Number(payment) || 0;
  const { isSufficient, change } = cart.computeChange(paymentNum);

  const reset = () => {
    setPayment("");
    setCompletedTx(null);
  };

  const handleConfirm = async () => {
    if (!isSufficient) return;
    setSubmitting(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        discountType: cart.discountType,
        discountValue: cart.discountValue,
        payment: paymentNum,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (body.error === "INSUFFICIENT_STOCK") {
        toast.error(t("pos.insufficientStock"));
      } else if (body.error === "INSUFFICIENT_PAYMENT") {
        toast.error(t("pos.insufficientPayment"));
      } else {
        toast.error(t("errors.generic"));
      }
      return;
    }

    const transaction = await res.json();
    setCompletedTx(transaction);
    toast.success(t("pos.transactionSuccess"));
    cart.clear();
    onCompleted();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-sm">
        {completedTx ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("pos.transactionSuccess")}</DialogTitle>
            </DialogHeader>
            <Receipt transaction={completedTx} />
            <DialogFooter>
              <Button
                className="w-full"
                onClick={() => {
                  onOpenChange(false);
                  reset();
                }}
              >
                {t("pos.newTransaction")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("pos.confirmCheckout")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1 rounded-md bg-secondary px-3 py-2 text-sm">
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
                <div className="flex justify-between font-semibold">
                  <span>{t("pos.grandTotal")}</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="payment">{t("pos.payment")}</Label>
                <Input
                  id="payment"
                  type="number"
                  min={0}
                  autoFocus
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                />
                {payment && !isSufficient && (
                  <p className="mt-1 text-xs text-destructive">{t("pos.insufficientPayment")}</p>
                )}
              </div>

              {payment && isSufficient && (
                <div className="flex justify-between rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                  <span>{t("pos.change")}</span>
                  <span>{formatCurrency(change)}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleConfirm} disabled={!isSufficient || submitting}>
                {t("pos.checkout")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
