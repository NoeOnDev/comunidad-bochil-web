import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { getAdminProfile } from "@/lib/supabase/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Eye } from "lucide-react"
import type {
  PerfilUsuario,
  Reporte,
  TemaForo,
  InvitacionQR,
  RolUsuario,
  EstadoReporte,
} from "@/lib/types/database"

const rolBadgeVariant: Record<RolUsuario, "default" | "secondary" | "outline"> = {
  admin: "default",
  coordinador: "outline",
  tecnico: "outline",
  ciudadano: "secondary",
}

const estadoBadgeVariant: Record<EstadoReporte, "default" | "secondary" | "outline" | "destructive"> = {
  Pendiente: "secondary",
  "En Revision": "outline",
  "En Progreso": "default",
  Resuelto: "destructive",
}

const estadoLabel: Record<EstadoReporte, string> = {
  Pendiente: "Pendiente",
  "En Revision": "En Revisión",
  "En Progreso": "En Progreso",
  Resuelto: "Resuelto",
}

export default async function UsuarioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const perfil = await getAdminProfile()
  if (perfil.rol !== "admin") redirect("/reportes")

  const supabase = createAdminClient()

  const [userRes, reportesRes, temasRes, invitacionRes] = await Promise.all([
    supabase
      .from("perfiles_usuarios")
      .select("*")
      .eq("id", id)
      .single(),
    supabase
      .from("reportes")
      .select("id, titulo, categoria, estado, created_at")
      .eq("usuario_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("temas_foro")
      .select("id, titulo, categoria, created_at")
      .eq("usuario_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("invitaciones_qr")
      .select("*")
      .eq("usado_por", id)
      .maybeSingle(),
  ])

  if (!userRes.data) notFound()

  const user = userRes.data as PerfilUsuario
  const reportes = (reportesRes.data ?? []) as Pick<
    Reporte,
    "id" | "titulo" | "categoria" | "estado" | "created_at"
  >[]
  const temas = (temasRes.data ?? []) as Pick<
    TemaForo,
    "id" | "titulo" | "categoria" | "created_at"
  >[]
  const invitacion = invitacionRes.data as InvitacionQR | null

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/usuarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {user.nombre_completo}
          </h2>
          <Badge variant={rolBadgeVariant[user.rol]} className="capitalize mt-1">
            {user.rol}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información del perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="Teléfono" value={user.telefono} />
            <InfoRow label="Email" value={user.email ?? "No vinculado"} />
            <InfoRow label="CURP" value={user.curp} />
            <InfoRow label="No. Contrato" value={user.numero_contrato ?? "—"} />
            <InfoRow label="Dirección" value={user.direccion ?? "—"} />
            <InfoRow label="Colonia" value={user.colonia ?? "—"} />
            <InfoRow label="Calle" value={user.calle ?? "—"} />
            <Separator />
            <InfoRow label="Registrado" value={formatDate(user.created_at)} />
            {invitacion && (
              <InfoRow
                label="Invitación"
                value={`${invitacion.nombre_titular} (${invitacion.curp})`}
              />
            )}
          </CardContent>
        </Card>

        {/* Reportes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Reportes ({reportes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Este usuario no ha creado reportes.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportes.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {r.titulo}
                      </TableCell>
                      <TableCell>{r.categoria}</TableCell>
                      <TableCell>
                        <Badge variant={estadoBadgeVariant[r.estado]}>
                          {estadoLabel[r.estado]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(r.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/reportes/${r.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Temas de foro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Temas de foro ({temas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {temas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este usuario no ha creado temas en el foro.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {temas.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.titulo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.categoria}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(t.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%] break-words">{value}</span>
    </div>
  )
}
