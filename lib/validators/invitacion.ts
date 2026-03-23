import { z } from "zod/v4"

export const invitacionSchema = z.object({
  curp: z
    .string()
    .length(18, "La CURP debe tener exactamente 18 caracteres")
    .toUpperCase(),
  numero_contrato: z
    .string()
    .min(1, "El número de contrato es requerido"),
  nombre_titular: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  direccion: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres"),
  colonia: z
    .string()
    .min(2, "La colonia es requerida"),
  calle_id: z
    .string()
    .uuid("Selecciona una calle válida")
    .nullable()
    .optional(),
})

export type InvitacionFormValues = z.infer<typeof invitacionSchema>

export const invitacionExcelRowSchema = z.object({
  curp: z.string().length(18, "CURP debe tener 18 caracteres").toUpperCase(),
  numero_contrato: z.string().min(1, "Contrato requerido"),
  nombre_titular: z.string().min(2, "Nombre requerido"),
  direccion: z.string().min(5, "Dirección requerida"),
  colonia: z.string().min(2, "Colonia requerida"),
})
