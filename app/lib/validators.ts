import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(1, "Informe um slug")
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas minúsculas, números e hífens");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Informe a senha atual"),
    next: z.string().min(8, "A nova senha precisa ter ao menos 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { path: ["confirm"], message: "As senhas não coincidem" });

export const hotelSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do hotel").max(120),
  slug,
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  logoUrl: z.string().trim().url("URL inválida").optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida").default("#0e7490"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida").default("#f59e0b"),
  whatsapp: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),
  instagram: z.string().trim().max(200).optional().or(z.literal("")),
  facebook: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
});

export const campaignMetaSchema = z.object({
  hotelId: z.string().min(1, "Selecione um hotel"),
  name: z.string().trim().min(2, "Informe o nome da campanha").max(120),
  slug,
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  timezone: z.string().default("America/Sao_Paulo"),
});

// Entrada pública do formulário de lead. Validação no servidor (fronteira de confiança).
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  // campos personalizados (cpf, city, adults, children, ...) chegam como strings
  custom: z.record(z.string(), z.string()).optional(),
  consentMarketing: z.boolean().default(false),
  campaignId: z.string().min(1),
  landingPage: z.string().max(500).optional(),
  utm: z.record(z.string(), z.string()).optional(),
  fbclid: z.string().max(255).optional(),
  gclid: z.string().max(255).optional(),
  // honeypot: deve chegar vazio (bot preenche)
  website: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
