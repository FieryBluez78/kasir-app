"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploadField } from "./image-upload-field";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { Category, Product } from "@/types";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: Category[];
  onSaved: () => void;
}

export function ProductFormDialog({ open, onOpenChange, product, categories, onSaved }: ProductFormDialogProps) {
  const { t } = useLanguage();
  const isEdit = Boolean(product);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      categoryId: "",
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      minimumStock: 5,
      description: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              name: product.name,
              sku: product.sku,
              categoryId: product.categoryId ?? "",
              costPrice: product.costPrice,
              sellingPrice: product.sellingPrice,
              stock: product.stock,
              minimumStock: product.minimumStock,
              description: product.description ?? "",
              imageUrl: product.imageUrl ?? "",
            }
          : {
              name: "",
              sku: "",
              categoryId: "",
              costPrice: 0,
              sellingPrice: 0,
              stock: 0,
              minimumStock: 5,
              description: "",
              imageUrl: "",
            }
      );
    }
  }, [open, product, reset]);

  const onSubmit = async (values: ProductInput) => {
    const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (body.error === "DUPLICATE_SKU") {
        toast.error(t("products.duplicateSku"));
      } else {
        toast.error(t("errors.generic"));
      }
      return;
    }

    toast.success(isEdit ? t("products.updateSuccess") : t("products.addSuccess"));
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("products.editProduct") : t("products.addProduct")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => <ImageUploadField value={field.value ?? ""} onChange={field.onChange} />}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="name">{t("products.productName")}</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="sku">{t("products.sku")}</Label>
              <Input id="sku" {...register("sku")} placeholder="FOOD-001" />
              {errors.sku && <p className="mt-1 text-xs text-destructive">{errors.sku.message}</p>}
            </div>

            <div>
              <Label>{t("products.category")}</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("products.category")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="costPrice">{t("products.costPrice")}</Label>
              <Input id="costPrice" type="number" min={0} {...register("costPrice")} />
              {errors.costPrice && <p className="mt-1 text-xs text-destructive">{errors.costPrice.message}</p>}
            </div>

            <div>
              <Label htmlFor="sellingPrice">{t("products.sellingPrice")}</Label>
              <Input id="sellingPrice" type="number" min={0} {...register("sellingPrice")} />
              {errors.sellingPrice && <p className="mt-1 text-xs text-destructive">{errors.sellingPrice.message}</p>}
            </div>

            {!isEdit && (
              <div>
                <Label htmlFor="stock">{t("products.initialStock")}</Label>
                <Input id="stock" type="number" min={0} {...register("stock")} />
              </div>
            )}

            <div>
              <Label htmlFor="minimumStock">{t("products.minimumStock")}</Label>
              <Input id="minimumStock" type="number" min={0} {...register("minimumStock")} />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">{t("products.description")}</Label>
              <Textarea id="description" rows={3} {...register("description")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
