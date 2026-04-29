"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { getAdminProfile } from "@/lib/supabase/auth"
import { crearTecnicoSchema } from "@/lib/validators/usuario"

type CrearTecnicoState = { error?: string; success?: boolean }

export async function crearTecnicoAction(
  _prev: CrearTecnicoState | null,
  formData: FormData,
): Promise<CrearTecnicoState> {
  const perfil = await getAdminProfile()
  if (perfil.rol !== "admin") {
    return { error: "Solo la administración puede crear técnicos." }
  }

  const parsed = crearTecnicoSchema.safeParse({
    nombre_completo: formData.get("nombre_completo"),
    telefono: formData.get("telefono"),
    curp: formData.get("curp"),
    email: formData.get("email"),
    direccion: formData.get("direccion"),
    colonia: formData.get("colonia"),
    calle_id:
      formData.get("calle_id") === "none" ? null : formData.get("calle_id"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const { nombre_completo, telefono, curp, email, direccion, colonia, calle_id } = parsed.data

  let calle: string | null = null
  if (calle_id) {
    const { data: calleData, error: calleError } = await supabase
      .from("catalogo_calles")
      .select("nombre_oficial")
      .eq("id", calle_id)
      .maybeSingle()

    if (calleError || !calleData) {
      return { error: "No fue posible usar la calle seleccionada." }
    }

    calle = calleData.nombre_oficial
  }

  const passwordTemporal = `${randomUUID()}Aa1!`

  const { data: authData, error: createError } = await supabase.auth.admin.createUser({
    phone: telefono,
    phone_confirm: true,
    email,
    email_confirm: email ? true : undefined,
    password: passwordTemporal,
    user_metadata: {
      nombre_completo,
      rol: "tecnico",
    },
  })

  if (createError || !authData.user) {
    return {
      error:
        createError?.message ||
        "No fue posible crear la cuenta de acceso del técnico.",
    }
  }

  const userId = authData.user.id

  const { error: perfilError } = await supabase.from("perfiles_usuarios").insert({
    id: userId,
    rol: "tecnico",
    nombre_completo,
    curp,
    telefono,
    email,
    direccion: direccion ?? null,
    colonia: colonia ?? null,
    calle,
    calle_id: calle_id ?? null,
    numero_contrato: null,
    invitacion_id: null,
  })

  if (perfilError) {
    await supabase.auth.admin.deleteUser(userId)
    return {
      error:
        perfilError.message ||
        "Se creó la cuenta de acceso, pero falló el perfil del técnico.",
    }
  }

  revalidatePath("/usuarios")
  return { success: true }
}