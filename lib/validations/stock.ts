import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  direction: z.enum(["ADD", "REMOVE"]),
  quantity: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
  reason: z.string().trim().min(3, "Alasan wajib diisi").max(500),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
