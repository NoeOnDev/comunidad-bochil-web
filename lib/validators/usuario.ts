import { z } from "zod/v4"
import { curpErrorMessage, curpRegex } from "./patterns"

const telefonoRegex = /^(\+52\d{10}|\d{10})$/

export const crearTecnicoSchema = z.object({
  nombre_completo: z
    .string()
    .trim()
    .min(3, "Escribe el nombre completo del técnico")
    .max(120, "El nombre es demasiado largo"),
  telefono: z
    .string()
    .trim()
    .regex(
      telefonoRegex,
      "Usa un teléfono de 10 dígitos o el formato +52XXXXXXXXXX",
    )
    .transform((value) => {
      if (value.startsWith("+")) return value
      return `+52${value}`
    }),
  curp: z
    .string()
    .trim()
    .toUpperCase()
    .regex(curpRegex, curpErrorMessage),
  email: z
    .string()
    .trim()
    .email("Ingresa un correo válido"),
  direccion: z
    .string()
    .trim()
    .max(200, "La dirección es demasiado larga")
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() || undefined),
  colonia: z
    .string()
    .trim()
    .max(120, "La colonia es demasiado larga")
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() || undefined),
  calle_id: z
    .string()
    .uuid("Selecciona una calle válida")
    .nullable()
    .optional()
})