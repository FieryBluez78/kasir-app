"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { Product } from "@/types";

interface StockAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onAdjusted: () => void;
}

export function StockAdjustmentModal({ open, onOpenChange, product, onAdjusted }: StockAdjustmentModalProps) {
  const { t } = useLanguage();
  const [direction, setDirection] = useState<"ADD" | "REMOVE">("ADD");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDirection("ADD");
      setQuantity("");
      setReason("");
    }
  }, [open]);

  if (!product) return null;

  const qtyNum = Number(quantity) || 0;
  const preview = direction === "ADD" ? product.stock + qtyNum : product.stock - qtyNum;
  const exceedsStock = direction === "REMOVE" && qtyNum > product.stock;

  const handleSubmit = async () => {
    if (qtyNum <= 0 || !reason.trim() || exceedsStock) return;
    setSubmitting(true);
    const res = await fetch("/api/stock/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, direction, quantity: qtyNum, reason }),
    });
    setSubmitting(false);

    if (!res.ok) {
      toast.error(t("errors.generic"));
      return;
    }

    toast.success(t("inventory.adjustSuccess"));
    onOpenChange(false);
    onAdjusted();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={direction} onValueChange={(v) => setDirection(v as "ADD" | "REMOVE")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ADD">{t("inventory.addStock")}</TabsTrigger>
            <TabsTrigger value="REMOVE">{t("inventory.reduceStock")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          <div>
            <Label htmlFor="quantity">{t("inventory.quantity")}</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {exceedsStock && <p className="mt-1 text-xs text-destructive">{t("inventory.exceedsStock")}</p>}
          </div>

          <div>
            <Label htmlFor="reason">{t("inventory.reason")}</Label>
            <Textarea
              id="reason"
              rows={2}
              placeholder={t("inventory.reasonPlaceholder")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm">
            <span className="text-muted-foreground">
              {product.stock} → <span className="font-medium text-foreground">{Math.max(preview, 0)}</span>
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || qtyNum <= 0 || !reason.trim() || exceedsStock}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
