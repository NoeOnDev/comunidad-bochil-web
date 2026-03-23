import { z } from "zod/v4"

export const calleSchema = z.object({
  nombre_oficial: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres"),
})

export type CalleFormValues = z.infer<typeof calleSchema>
