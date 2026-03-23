import { z } from "zod/v4"

export const cambiarEstadoSchema = z.object({
  estado_nuevo: z.enum(["Pendiente", "En Revision", "En Progreso", "Resuelto"]),
  comentario: z.string().optional(),
})

export const comentarioReporteSchema = z.object({
  comentario: z
    .string()
    .min(1, "El comentario no puede estar vacío")
    .max(2000, "El comentario no puede exceder 2000 caracteres"),
})
