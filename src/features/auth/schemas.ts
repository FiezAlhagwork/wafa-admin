import { z } from "zod";

export const signInEmailSchema = z.object({
  email: z.email({ error: (issue) => (issue.input ? "صيغة البريد غير صحيحة" : "أدخل البريد الإلكتروني") }),
});

export type SignInEmailValues = z.infer<typeof signInEmailSchema>;
