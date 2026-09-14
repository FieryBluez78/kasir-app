import { z } from "zod";

export const accountUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter"),
    email: z.string().trim().email("Email tidak valid"),
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    newPassword: z.string().min(6, "Kata sandi baru minimal 6 karakter").optional().or(z.literal("")),
  })
  .transform((data) => ({
    ...data,
    email: data.email.toLowerCase(),
  }));

export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;