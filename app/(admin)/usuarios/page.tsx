import { createAdminClient } from "@/lib/supabase/admin"
import { getAdminProfile } from "@/lib/supabase/auth"
import { redirect } from "next/navigation"
import { UsuariosClient } from "./usuarios-client"
import type { CatalogoCalle, PerfilUsuario } from "@/lib/types/database"

export default async function UsuariosPage() {
  const perfil = await getAdminProfile()
  if (perfil.rol !== "admin") redirect("/reportes")

  const supabase = createAdminClient()
  const [usuariosRes, callesRes] = await Promise.all([
    supabase.from("perfiles_usuarios").select("*").order("nombre_completo", { ascending: true }),
    supabase
      .from("catalogo_calles")
      .select("id, nombre_oficial")
      .eq("activa", true)
      .order("nombre_oficial", { ascending: true }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
        <p className="text-muted-foreground">
          Consulta los perfiles de usuarios registrados.
        </p>
      </div>
      <UsuariosClient
        usuarios={(usuariosRes.data ?? []) as PerfilUsuario[]}
        calles={(callesRes.data ?? []) as Pick<CatalogoCalle, "id" | "nombre_oficial">[]}
      />
    </div>
  )
}
