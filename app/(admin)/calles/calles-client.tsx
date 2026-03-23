"use client"

import { useState, useTransition } from "react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoreHorizontal, Pencil, Plus, Search, ToggleLeft, ToggleRight } from "lucide-react"
import type { CatalogoCalle } from "@/lib/types/database"
import { toggleActivaCalle } from "./actions"
import { CalleDialog } from "./calle-dialog"
import { toast } from "sonner"

interface CallesClientProps {
  calles: CatalogoCalle[]
}

export function CallesClient({ calles }: CallesClientProps) {
  const [search, setSearch] = useState("")
  const [filtroActiva, setFiltroActiva] = useState<string>("todas")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [calleEditing, setCalleEditing] = useState<CatalogoCalle | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = calles.filter((c) => {
    const matchesSearch =
      !search ||
      c.nombre_oficial.toLowerCase().includes(search.toLowerCase()) ||
      c.nombre_normalizado.includes(search.toLowerCase())

    const matchesActiva =
      filtroActiva === "todas" ||
      (filtroActiva === "activas" && c.activa) ||
      (filtroActiva === "inactivas" && !c.activa)

    return matchesSearch && matchesActiva
  })

  function handleToggleActiva(calle: CatalogoCalle) {
    startTransition(async () => {
      const result = await toggleActivaCalle(calle.id, !calle.activa)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(calle.activa ? "Calle desactivada" : "Calle activada")
      }
    })
  }

  function handleEdit(calle: CatalogoCalle) {
    setCalleEditing(calle)
    setDialogOpen(true)
  }

  function handleCreate() {
    setCalleEditing(null)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar calle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Select value={filtroActiva} onValueChange={setFiltroActiva}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="activas">Activas</SelectItem>
              <SelectItem value="inactivas">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva calle
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre Oficial</TableHead>
              <TableHead>Nombre Normalizado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No se encontraron calles.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((calle) => (
                <TableRow key={calle.id}>
                  <TableCell className="font-medium">{calle.nombre_oficial}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {calle.nombre_normalizado}
                  </TableCell>
                  <TableCell>
                    <Badge variant={calle.activa ? "default" : "secondary"}>
                      {calle.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(calle)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActiva(calle)}
                          disabled={isPending}
                        >
                          {calle.activa ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CalleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        calle={calleEditing}
      />
    </div>
  )
}
