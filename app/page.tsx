import { redirect } from "next/navigation"
import { getAdminProfile } from "@/lib/supabase/auth"

export default async function HomePage() {
  const perfil = await getAdminProfile()

  // Redirect to the first relevant section based on role
  if (perfil.rol === "coordinador") {
    redirect("/reportes")
  }

  redirect("/invitaciones")
}
