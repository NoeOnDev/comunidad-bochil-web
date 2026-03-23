"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: "Credenciales inválidas. Verifica tu email y contraseña." }
  }

  // Verify role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Error al obtener el usuario." }
  }

  const { data: perfil } = await supabase
    .from("perfiles_usuarios")
    .select("rol")
    .eq("id", user.id)
    .single()

  if (!perfil || !["admin", "coordinador"].includes(perfil.rol)) {
    await supabase.auth.signOut()
    return { error: "No tienes permisos para acceder al panel administrativo." }
  }

  redirect("/")
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
