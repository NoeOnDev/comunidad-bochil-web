"use client"

import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Eye, Loader2, Search, UserPlus } from "lucide-react"
import type { CatalogoCalle, PerfilUsuario, RolUsuario } from "@/lib/types/database"
import { toast } from "sonner"
import { crearTecnicoAction } from "./actions"

const rolBadgeVariant: Record<RolUsuario, "default" | "secondary" | "outline"> = {
  admin: "default",
  coordinador: "outline",
  tecnico: "outline",
  ciudadano: "secondary",
}

interface UsuariosClientProps {
  usuarios: PerfilUsuario[]
  calles: Pick<CatalogoCalle, "id" | "nombre_oficial">[]
}

export function UsuariosClient({ usuarios, calles }: UsuariosClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filtroRol, setFiltroRol] = useState<string>("todos")
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(crearTecnicoAction, null)

  useEffect(() => {
    if (state?.success) {
      toast.success("Técnico creado correctamente")
      setOpen(false)
      router.refresh()
    }
  }, [router, state])

  const filtered = usuarios.filter((u) => {
    const matchesSearch =
      !search ||
      u.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
      u.telefono.includes(search)

    const matchesRol = filtroRol === "todos" || u.rol === filtroRol

    return matchesSearch && matchesRol
  })

  const tecnicos = filtered.filter((user) => user.rol === "tecnico").length

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/70 bg-card/30 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Gestión de cuentas internas</p>
            <p className="text-sm text-muted-foreground">
              {filtered.length} usuarios visibles, {tecnicos} técnicos en este corte.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto] xl:min-w-[760px]">
            <div className="relative min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8"
              />
            </div>
            <Select value={filtroRol} onValueChange={setFiltroRol}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="coordinador">Coordinador</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="ciudadano">Ciudadano</SelectItem>
              </SelectContent>
            </Select>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear técnico
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle>Crear técnico</SheetTitle>
                  <SheetDescription>
                    Registra una cuenta interna para que el técnico pueda entrar a la app con su teléfono y recibir sus reportes asignados.
                  </SheetDescription>
                </SheetHeader>

                <form action={formAction} className="grid gap-4 px-4 py-6">
                  {state?.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="nombre_completo">Nombre completo</Label>
                    <Input
                      id="nombre_completo"
                      name="nombre_completo"
                      placeholder="Nombre y apellidos"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      inputMode="tel"
                      placeholder="9611234567"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="curp">CURP</Label>
                    <Input
                      id="curp"
                      name="curp"
                      placeholder="AAAA000000HCCCCC00"
                      maxLength={18}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tecnico@bochil.gob.mx"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      name="direccion"
                      placeholder="Opcional"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="colonia">Colonia</Label>
                    <Input id="colonia" name="colonia" placeholder="Opcional" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="calle_id">Calle</Label>
                    <Select name="calle_id" defaultValue="none">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar calle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin calle asignada</SelectItem>
                        {calles.map((calle) => (
                          <SelectItem key={calle.id} value={calle.id}>
                            {calle.nombre_oficial}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <SheetFooter className="border-t px-0 pt-4 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar técnico
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
          <Badge variant="outline">{filtered.length} resultados</Badge>
          <Badge variant="secondary">{tecnicos} técnicos</Badge>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Colonia</TableHead>
              <TableHead>Calle</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.nombre_completo}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rolBadgeVariant[user.rol]} className="capitalize">
                      {user.rol}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {user.telefono}
                  </TableCell>
                  <TableCell>{user.colonia ?? "—"}</TableCell>
                  <TableCell>{user.calle ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/usuarios/${user.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
