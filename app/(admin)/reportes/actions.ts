"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { getAdminProfile } from "@/lib/supabase/auth"
import { cambiarEstadoSchema, comentarioReporteSchema } from "@/lib/validators/reporte"
import type { EstadoReporte } from "@/lib/types/database"

export async function cambiarEstadoReporte(
  reporteId: string,
  estadoActual: EstadoReporte,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const parsed = cambiarEstadoSchema.safeParse({
    estado_nuevo: formData.get("estado_nuevo"),
    comentario: formData.get("comentario") || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const perfil = await getAdminProfile()
  const supabase = createAdminClient()

  // Insert into historial_estados
  const { error: histErr } = await supabase.from("historial_estados").insert({
    reporte_id: reporteId,
    estado_anterior: estadoActual,
    estado_nuevo: parsed.data.estado_nuevo,
    cambiado_por: perfil.id,
    comentario: parsed.data.comentario || null,
  })

  if (histErr) {
    return { error: "Error al registrar el cambio de estado." }
  }

  // Update reporte
  const { error: updErr } = await supabase
    .from("reportes")
    .update({ estado: parsed.data.estado_nuevo })
    .eq("id", reporteId)

  if (updErr) {
    return { error: "Error al actualizar el reporte." }
  }

  revalidatePath(`/reportes/${reporteId}`)
  revalidatePath("/reportes")
  return { success: true }
}

export async function agregarComentarioReporte(
  reporteId: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const parsed = comentarioReporteSchema.safeParse({
    comentario: formData.get("comentario"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const perfil = await getAdminProfile()
  const supabase = createAdminClient()

  const { error } = await supabase.from("comentarios_reportes").insert({
    reporte_id: reporteId,
    usuario_id: perfil.id,
    comentario: parsed.data.comentario,
  })

  if (error) {
    return { error: "Error al agregar el comentario." }
  }

  revalidatePath(`/reportes/${reporteId}`)
  return { success: true }
}

export async function eliminarReporte(reporteId: string) {
  const perfil = await getAdminProfile()
  if (perfil.rol !== "admin") {
    return { error: "No tienes permisos para eliminar reportes." }
  }

  const supabase = createAdminClient()

  // Delete related records first
  await supabase.from("comentarios_reportes").delete().eq("reporte_id", reporteId)
  await supabase.from("votos_reportes").delete().eq("reporte_id", reporteId)
  await supabase.from("historial_estados").delete().eq("reporte_id", reporteId)

  const { error } = await supabase.from("reportes").delete().eq("id", reporteId)

  if (error) {
    return { error: "Error al eliminar el reporte." }
  }

  revalidatePath("/reportes")
  return { success: true }
}

export async function asignarReporte(reporteId: string, tecnicoId: string | null) {
  const perfil = await getAdminProfile()
  if (perfil.rol !== "admin") {
    return { error: "No tienes permisos para asignar reportes." }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("reportes")
    .update({
      asignado_a: tecnicoId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reporteId)

  if (error) {
    return { error: "Error al asignar el reporte." }
  }

  revalidatePath(`/reportes/${reporteId}`)
  return { success: true }
}
