"use client";

import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { DiscountType } from "@/types";

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discountType: DiscountType | null;
  discountValue: number;
  onApply: (type: DiscountType | null, value: number) => void;
}

export function DiscountDialog({ open, onOpenChange, discountType, discountValue, onApply }: DiscountDialogProps) {
  const { t } = useLanguage();
  const [type, setType] = useState<DiscountType>(discountType ?? "PERCENTAGE");
  const [value, setValue] = useState(String(discountValue || ""));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("pos.applyDiscount")}</DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as DiscountType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="PERCENTAGE">{t("pos.discountPercent")}</TabsTrigger>
            <TabsTrigger value="FIXED">{t("pos.discountFixed")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div>
          <Label htmlFor="discountValue">{type === "PERCENTAGE" ? t("pos.discountPercent") : t("pos.discountFixed")}</Label>
          <Input
            id="discountValue"
            type="number"
            min={0}
            max={type === "PERCENTAGE" ? 100 : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onApply(null, 0);
              onOpenChange(false);
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => {
              onApply(type, Number(value) || 0);
              onOpenChange(false);
            }}
          >
            {t("common.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
