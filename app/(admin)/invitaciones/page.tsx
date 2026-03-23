import { createClient } from "@/lib/supabase/server"
import { getAdminProfile } from "@/lib/supabase/auth"
import { redirect } from "next/navigation"
import { InvitacionesClient } from "./invitaciones-client"
import type { InvitacionQR, CatalogoCalle } from "@/lib/types/database"

export default async function InvitacionesPage() {
  const perfil = await getAdminProfile()
  if (perfil.rol !== "admin") redirect("/reportes")

  const supabase = await createClient()

  const [invitacionesRes, callesRes] = await Promise.all([
    supabase
      .from("invitaciones_qr")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("catalogo_calles")
      .select("*")
      .eq("activa", true)
      .order("nombre_oficial", { ascending: true }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Invitaciones QR
        </h2>
        <p className="text-muted-foreground">
          Crea, importa y gestiona las invitaciones de registro ciudadano.
        </p>
      </div>
      <InvitacionesClient
        invitaciones={(invitacionesRes.data ?? []) as InvitacionQR[]}
        calles={(callesRes.data ?? []) as CatalogoCalle[]}
      />
    </div>
  )
}
