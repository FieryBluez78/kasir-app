import { z } from "zod";

export const storeSettingsSchema = z.object({
  storeName: z.string().trim().min(2, "Nama toko minimal 2 karakter"),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  logoUrl: z.string().trim().optional().or(z.literal("")),
  currency: z.enum(["IDR", "USD"]).default("IDR"),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
