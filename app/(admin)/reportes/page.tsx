import { createAdminClient } from "@/lib/supabase/admin"
import { getAdminProfile } from "@/lib/supabase/auth"
import { ReportesClient } from "./reportes-client"
import type { ReporteConAutor } from "@/lib/types/database"

export default async function ReportesPage() {
  await getAdminProfile()
  const supabase = createAdminClient()

  const { data } = await supabase
    .from("reportes")
    .select(
      "*, perfiles_usuarios!reportes_usuario_id_fkey(nombre_completo), tecnico_asignado:perfiles_usuarios!reportes_asignado_a_fkey(nombre_completo)",
    )
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reportes</h2>
        <p className="text-muted-foreground">
          Gestiona los reportes ciudadanos de incidencias.
        </p>
      </div>
      <ReportesClient reportes={(data ?? []) as ReporteConAutor[]} />
    </div>
  )
}
