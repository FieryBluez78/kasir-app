import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

export const checkoutSchema = z
  .object({
    items: z.array(cartItemSchema).min(1, "Keranjang tidak boleh kosong"),
    discountType: z.enum(["PERCENTAGE", "FIXED"]).nullable().optional(),
    discountValue: z.coerce.number().min(0).nullable().optional(),
    payment: z.coerce.number().min(0),
  })
  .refine(
    (data) =>
      !data.discountType ||
      (data.discountType === "PERCENTAGE" ? (data.discountValue ?? 0) <= 100 : true),
    { message: "Diskon persentase tidak boleh lebih dari 100%", path: ["discountValue"] }
  );

export type CheckoutInput = z.infer<typeof checkoutSchema>;
