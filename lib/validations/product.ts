import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nama produk minimal 2 karakter"),
  sku: z
    .string()
    .trim()
    .min(2, "SKU minimal 2 karakter")
    .regex(/^[A-Za-z0-9-_]+$/, "SKU hanya boleh huruf, angka, - dan _"),
  categoryId: z.string().nullable().optional(),
  costPrice: z.coerce.number().int().min(0, "Harga beli tidak boleh negatif"),
  sellingPrice: z.coerce.number().int().min(0, "Harga jual tidak boleh negatif"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif").default(0),
  minimumStock: z.coerce.number().int().min(0, "Stok minimum tidak boleh negatif").default(5),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  imageUrl: z.string().trim().optional().or(z.literal("")),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nama kategori minimal 2 karakter"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
