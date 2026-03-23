import { createClient } from "@/lib/supabase/server"
import { getAdminProfile } from "@/lib/supabase/auth"
import { redirect } from "next/navigation"
import { CallesClient } from "./calles-client"
import type { CatalogoCalle } from "@/lib/types/database"

export default async function CallesPage() {
  const perfil = await getAdminProfile()
  if (perfil.rol !== "admin") redirect("/reportes")

  const supabase = await createClient()
  const { data } = await supabase
    .from("catalogo_calles")
    .select("*")
    .order("nombre_oficial", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Catálogo de Calles</h2>
        <p className="text-muted-foreground">
          Gestiona las calles del municipio de Bochil.
        </p>
      </div>
      <CallesClient calles={(data ?? []) as CatalogoCalle[]} />
    </div>
  )
}
