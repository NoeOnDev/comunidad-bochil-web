"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { invitacionSchema } from "@/lib/validators/invitacion"

export type InvitacionActionResult = {
  error?: string
  success?: boolean
  invitacionId?: string
}

export async function crearInvitacion(
  _prev: InvitacionActionResult | null,
  formData: FormData,
): Promise<InvitacionActionResult> {
  const parsed = invitacionSchema.safeParse({
    curp: formData.get("curp"),
    numero_contrato: formData.get("numero_contrato"),
    nombre_titular: formData.get("nombre_titular"),
    direccion: formData.get("direccion"),
    colonia: formData.get("colonia"),
    calle_id: formData.get("calle_id") || null,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("invitaciones_qr")
    .insert({
      curp: parsed.data.curp,
      numero_contrato: parsed.data.numero_contrato,
      nombre_titular: parsed.data.nombre_titular,
      direccion: parsed.data.direccion,
      colonia: parsed.data.colonia,
      calle_id: parsed.data.calle_id ?? null,
    })
    .select("id")
    .single()

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una invitación con esa CURP." }
    }
    return { error: "Error al crear la invitación." }
  }

  revalidatePath("/invitaciones")
  return { success: true, invitacionId: data.id }
}

export interface ImportRow {
  curp: string
  numero_contrato: string
  nombre_titular: string
  direccion: string
  colonia: string
}

export type ImportResult = {
  total: number
  exitosas: number
  fallidas: number
  errores: { fila: number; error: string }[]
}

export async function importarInvitaciones(
  rows: ImportRow[],
): Promise<ImportResult> {
  const supabase = createAdminClient()
  const result: ImportResult = {
    total: rows.length,
    exitosas: 0,
    fallidas: 0,
    errores: [],
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const { error } = await supabase.from("invitaciones_qr").insert({
      curp: row.curp.toUpperCase().trim(),
      numero_contrato: row.numero_contrato.trim(),
      nombre_titular: row.nombre_titular.trim(),
      direccion: row.direccion.trim(),
      colonia: row.colonia.trim(),
    })

    if (error) {
      result.fallidas++
      result.errores.push({
        fila: i + 1,
        error:
          error.code === "23505"
            ? "CURP duplicada"
            : error.message,
      })
    } else {
      result.exitosas++
    }
  }

  revalidatePath("/invitaciones")
  return result
}
