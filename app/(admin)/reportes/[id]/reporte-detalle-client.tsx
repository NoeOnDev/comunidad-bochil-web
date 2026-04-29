"use client"

import { useActionState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  ThumbsUp,
  Trash2,
  User,
} from "lucide-react"
import {
  cambiarEstadoReporte,
  agregarComentarioReporte,
  eliminarReporte,
  asignarReporte,
} from "../actions"
import type {
  Reporte,
  HistorialEstadoConUsuario,
  ComentarioReporteConUsuario,
  PerfilUsuario,
  EstadoReporte,
  RolUsuario,
} from "@/lib/types/database"
import { toast } from "sonner"
import Link from "next/link"

interface ReporteDetalleClientProps {
  reporte: Reporte
  autor: Pick<PerfilUsuario, "nombre_completo"> | null
  historial: HistorialEstadoConUsuario[]
  comentarios: ComentarioReporteConUsuario[]
  tecnicos: Pick<PerfilUsuario, "id" | "nombre_completo">[]
  userRole: RolUsuario
}

const ESTADOS: EstadoReporte[] = ["Pendiente", "En Revision", "En Progreso", "Resuelto"]
const ESTADO_LABEL: Record<EstadoReporte, string> = {
  Pendiente: "Pendiente",
  "En Revision": "En Revisión",
  "En Progreso": "En Progreso",
  Resuelto: "Resuelto",
}

export function ReporteDetalleClient({
  reporte,
  autor,
  historial,
  comentarios,
  tecnicos,
  userRole,
}: ReporteDetalleClientProps) {
  const router = useRouter()
  const isAdmin = userRole === "admin"

  // ── Change status action ───────────────────────────────────────
  const cambiarEstadoAction = cambiarEstadoReporte.bind(null, reporte.id, reporte.estado)
  const [estadoState, estadoFormAction, estadoPending] = useActionState(cambiarEstadoAction, null)

  useEffect(() => {
    if (estadoState?.success) toast.success("Estado actualizado")
  }, [estadoState])

  // ── Comment action ─────────────────────────────────────────────
  const comentarAction = agregarComentarioReporte.bind(null, reporte.id)
  const [comentarioState, comentarioFormAction, comentarioPending] = useActionState(comentarAction, null)
  const comentarioRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (comentarioState?.success) {
      toast.success("Comentario agregado")
      comentarioRef.current?.reset()
    }
  }, [comentarioState])

  // ── Delete ─────────────────────────────────────────────────────
  const [deletePending, startDeleteTransition] = useTransition()

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await eliminarReporte(reporte.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Reporte eliminado")
        router.push("/reportes")
      }
    })
  }

  // ── Assign ─────────────────────────────────────────────────────
  const [assignPending, startAssignTransition] = useTransition()

  function handleAssign(tecnicoId: string) {
    startAssignTransition(async () => {
      const result = await asignarReporte(
        reporte.id,
        tecnicoId === "none" ? null : tecnicoId,
      )
      if (result.error) toast.error(result.error)
      else toast.success("Reporte asignado")
    })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reportes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{reporte.titulo}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{autor?.nombre_completo ?? "Desconocido"}</span>
            <span>·</span>
            <Clock className="h-3.5 w-3.5" />
            <span suppressHydrationWarning>{formatDate(reporte.created_at)}</span>
            <span>·</span>
            <MapPin className="h-3.5 w-3.5" />
            <span>{reporte.colonia}</span>
          </div>
        </div>
        <Badge variant={reporte.es_publico ? "default" : "secondary"}>
          {reporte.es_publico ? "Público" : "Privado"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Photos */}
          {reporte.fotos_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evidencia fotográfica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {reporte.fotos_urls.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-md border"
                    >
                      <Image
                        src={url}
                        alt={`Foto ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {reporte.descripcion}
              </p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de estados</CardTitle>
            </CardHeader>
            <CardContent>
              {historial.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin cambios registrados aún.</p>
              ) : (
                <div className="space-y-4">
                  {historial.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">
                            {entry.estado_anterior ?? "—"}
                          </span>
                          {" → "}
                          <span className="font-medium">{entry.estado_nuevo}</span>
                        </p>
                        {entry.comentario && (
                          <p className="text-xs text-muted-foreground">
                            {entry.comentario}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {entry.perfiles_usuarios?.nombre_completo ?? "Sistema"} ·{" "}
                          <span suppressHydrationWarning>{formatDate(entry.created_at)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comentarios ({comentarios.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comentarios.map((c) => (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {c.perfiles_usuarios?.nombre_completo ?? "Anónimo"}
                    </span>
                    <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {formatDate(c.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.comentario}</p>
                </div>
              ))}

              <Separator />

              <form ref={comentarioRef} action={comentarioFormAction} className="space-y-3">
                {comentarioState?.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{comentarioState.error}</AlertDescription>
                  </Alert>
                )}
                <Textarea
                  name="comentario"
                  placeholder="Agregar comentario..."
                  rows={3}
                  required
                />
                <Button size="sm" type="submit" disabled={comentarioPending}>
                  {comentarioPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Comentar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría</span>
                <span className="font-medium">{reporte.categoria}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <Badge>{reporte.estado}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Apoyos</span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {reporte.votos_apoyo}
                </span>
              </div>
              {reporte.latitud && reporte.longitud && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ubicación</span>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${reporte.latitud}&mlon=${reporte.longitud}#map=17/${reporte.latitud}/${reporte.longitud}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs"
                  >
                    Ver en mapa
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cambiar estado</CardTitle>
              <CardDescription>
                Actualiza el estado del reporte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={estadoFormAction} className="space-y-3">
                {estadoState?.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{estadoState.error}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="estado_nuevo">Nuevo estado</Label>
                  <Select name="estado_nuevo" defaultValue={reporte.estado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((e) => (
                        <SelectItem key={e} value={e}>
                          {ESTADO_LABEL[e]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comentario">Comentario (opcional)</Label>
                  <Textarea
                    name="comentario"
                    placeholder="Motivo del cambio..."
                    rows={2}
                  />
                </div>
                <Button size="sm" type="submit" disabled={estadoPending} className="w-full">
                  {estadoPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Actualizar estado
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Assign tecnico (admin only) */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Asignar</CardTitle>
                <CardDescription>
                  Asigna el reporte a un técnico.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  defaultValue={reporte.asignado_a ?? "none"}
                  onValueChange={handleAssign}
                  disabled={assignPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {tecnicos.map((tecnico) => (
                      <SelectItem key={tecnico.id} value={tecnico.id}>
                        {tecnico.nombre_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Delete (admin only) */}
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar reporte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Eliminar reporte?</DialogTitle>
                  <DialogDescription>
                    Esta acción eliminará el reporte y todos sus datos asociados
                    (comentarios, votos, historial). No se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={handleDelete} disabled={deletePending}>
                    {deletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sí, eliminar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}
