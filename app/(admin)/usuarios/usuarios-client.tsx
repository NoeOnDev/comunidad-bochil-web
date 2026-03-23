"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Eye, Search } from "lucide-react"
import type { PerfilUsuario, RolUsuario } from "@/lib/types/database"

const rolBadgeVariant: Record<RolUsuario, "default" | "secondary" | "outline"> = {
  admin: "default",
  coordinador: "outline",
  ciudadano: "secondary",
}

interface UsuariosClientProps {
  usuarios: PerfilUsuario[]
}

export function UsuariosClient({ usuarios }: UsuariosClientProps) {
  const [search, setSearch] = useState("")
  const [filtroRol, setFiltroRol] = useState<string>("todos")

  const filtered = usuarios.filter((u) => {
    const matchesSearch =
      !search ||
      u.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
      u.telefono.includes(search)

    const matchesRol = filtroRol === "todos" || u.rol === filtroRol

    return matchesSearch && matchesRol
  })

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-72"
          />
        </div>
        <Select value={filtroRol} onValueChange={setFiltroRol}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="coordinador">Coordinador</SelectItem>
            <SelectItem value="ciudadano">Ciudadano</SelectItem>
          </SelectContent>
        </Select>
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
