import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { getAdminProfile } from "@/lib/supabase/auth"
import { ReporteDetalleClient } from "./reporte-detalle-client"
import type {
  Reporte,
  HistorialEstadoConUsuario,
  ComentarioReporteConUsuario,
  PerfilUsuario,
} from "@/lib/types/database"

export default async function ReporteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const perfil = await getAdminProfile()
  const supabase = createAdminClient()

  const [reporteRes, historialRes, comentariosRes, coordinadoresRes] =
    await Promise.all([
      supabase
        .from("reportes")
        .select("*, perfiles_usuarios!reportes_usuario_id_fkey(nombre_completo)")
        .eq("id", id)
        .single(),
      supabase
        .from("historial_estados")
        .select("*, perfiles_usuarios(nombre_completo)")
        .eq("reporte_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("comentarios_reportes")
        .select("*, perfiles_usuarios(nombre_completo)")
        .eq("reporte_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("perfiles_usuarios")
        .select("id, nombre_completo")
        .eq("rol", "coordinador"),
    ])

  if (!reporteRes.data) notFound()

  const reporte = reporteRes.data as Reporte & {
    perfiles_usuarios: Pick<PerfilUsuario, "nombre_completo"> | null
  }

  return (
    <ReporteDetalleClient
      reporte={reporte}
      autor={reporte.perfiles_usuarios}
      historial={(historialRes.data ?? []) as HistorialEstadoConUsuario[]}
      comentarios={(comentariosRes.data ?? []) as ComentarioReporteConUsuario[]}
      coordinadores={
        (coordinadoresRes.data ?? []) as Pick<PerfilUsuario, "id" | "nombre_completo">[]
      }
      userRole={perfil.rol}
    />
  )
}
