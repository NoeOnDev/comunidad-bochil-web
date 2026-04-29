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
import type { ReporteConAutor, EstadoReporte, CategoriaReporte } from "@/lib/types/database"

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

const categoriaColors: Record<CategoriaReporte, string> = {
  Fuga: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "Sin Agua": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  "Baja Presión": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Contaminación: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Infraestructura: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

interface ReportesClientProps {
  reportes: ReporteConAutor[]
}

export function ReportesClient({ reportes }: ReportesClientProps) {
  const [search, setSearch] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [filtroVisibilidad, setFiltroVisibilidad] = useState<string>("todos")

  const filtered = reportes.filter((r) => {
    const matchesSearch =
      !search || r.titulo.toLowerCase().includes(search.toLowerCase())

    const matchesEstado =
      filtroEstado === "todos" || r.estado === filtroEstado

    const matchesCategoria =
      filtroCategoria === "todas" || r.categoria === filtroCategoria

    const matchesVisibilidad =
      filtroVisibilidad === "todos" ||
      (filtroVisibilidad === "publico" && r.es_publico) ||
      (filtroVisibilidad === "privado" && !r.es_publico)

    return matchesSearch && matchesEstado && matchesCategoria && matchesVisibilidad
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-64"
          />
        </div>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos estados</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="En Revision">En Revisión</SelectItem>
            <SelectItem value="En Progreso">En Progreso</SelectItem>
            <SelectItem value="Resuelto">Resuelto</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas categorías</SelectItem>
            <SelectItem value="Fuga">Fuga</SelectItem>
            <SelectItem value="Sin Agua">Sin Agua</SelectItem>
            <SelectItem value="Baja Presión">Baja Presión</SelectItem>
            <SelectItem value="Contaminación">Contaminación</SelectItem>
            <SelectItem value="Infraestructura">Infraestructura</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroVisibilidad} onValueChange={setFiltroVisibilidad}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Visibilidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="publico">Públicos</SelectItem>
            <SelectItem value="privado">Privados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Asignado a</TableHead>
              <TableHead>Colonia</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead className="text-center">Apoyos</TableHead>
              <TableHead>Visibilidad</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center text-muted-foreground py-8"
                >
                  No se encontraron reportes.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((reporte) => (
                <TableRow key={reporte.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {reporte.titulo}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${categoriaColors[reporte.categoria]}`}
                    >
                      {reporte.categoria}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={estadoBadgeVariant[reporte.estado]}>
                      {estadoLabel[reporte.estado]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {reporte.tecnico_asignado?.nombre_completo ?? "Sin asignar"}
                  </TableCell>
                  <TableCell>{reporte.colonia}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {reporte.perfiles_usuarios?.nombre_completo ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {reporte.votos_apoyo}
                  </TableCell>
                  <TableCell>
                    <Badge variant={reporte.es_publico ? "default" : "secondary"}>
                      {reporte.es_publico ? "Público" : "Privado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(reporte.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/reportes/${reporte.id}`}>
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
