import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { PerfilUsuario, RolUsuario } from "@/lib/types/database"

/**
 * Get the authenticated user's profile. Redirects to /login if not
 * authenticated or if the user has no admin/coordinator profile.
 */
export const getAdminProfile = cache(async (): Promise<PerfilUsuario> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: perfil } = await supabase
    .from("perfiles_usuarios")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!perfil) redirect("/login")

  const allowedRoles: RolUsuario[] = ["admin", "coordinador"]
  if (!allowedRoles.includes(perfil.rol)) redirect("/login")

  return perfil as PerfilUsuario
})
