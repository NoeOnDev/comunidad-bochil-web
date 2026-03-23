"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { calleSchema } from "@/lib/validators/calle"

function normalizar(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

export async function crearCalle(_prev: { error?: string; success?: boolean } | null, formData: FormData) {
  const parsed = calleSchema.safeParse({
    nombre_oficial: formData.get("nombre_oficial"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("catalogo_calles").insert({
    nombre_oficial: parsed.data.nombre_oficial.trim(),
    nombre_normalizado: normalizar(parsed.data.nombre_oficial),
  })

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una calle con ese nombre." }
    }
    return { error: "Error al crear la calle." }
  }

  revalidatePath("/calles")
  return { success: true }
}

export async function editarCalle(
  id: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const parsed = calleSchema.safeParse({
    nombre_oficial: formData.get("nombre_oficial"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("catalogo_calles")
    .update({
      nombre_oficial: parsed.data.nombre_oficial.trim(),
      nombre_normalizado: normalizar(parsed.data.nombre_oficial),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una calle con ese nombre." }
    }
    return { error: "Error al actualizar la calle." }
  }

  revalidatePath("/calles")
  return { success: true }
}

export async function toggleActivaCalle(id: string, activa: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("catalogo_calles")
    .update({ activa, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return { error: "Error al actualizar el estado." }
  }

  revalidatePath("/calles")
  return { success: true }
}
