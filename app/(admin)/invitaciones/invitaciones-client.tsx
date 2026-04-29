"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Search, QrCode, FileSpreadsheet } from "lucide-react"
import type { CatalogoCalle, InvitacionQR } from "@/lib/types/database"
import { CrearInvitacionDialog } from "./components/crear-invitacion-dialog"
import { QrViewer } from "./components/qr-viewer"
import { QrPdfGenerator } from "./components/qr-pdf-generator"
import { ExcelUploader } from "./components/excel-uploader"

interface InvitacionesClientProps {
  invitaciones: InvitacionQR[]
  calles: CatalogoCalle[]
}

export function InvitacionesClient({
  invitaciones,
  calles,
}: InvitacionesClientProps) {
  const [search, setSearch] = useState("")
  const [filtroUsado, setFiltroUsado] = useState<string>("todas")
  const [crearOpen, setCrearOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [qrViewId, setQrViewId] = useState<string | null>(null)
  const [qrViewLabel, setQrViewLabel] = useState<string>("")

  const filtered = invitaciones.filter((inv) => {
    const matchesSearch =
      !search ||
      inv.nombre_titular.toLowerCase().includes(search.toLowerCase()) ||
      inv.curp.toLowerCase().includes(search.toLowerCase()) ||
      inv.numero_contrato.toLowerCase().includes(search.toLowerCase())

    const matchesUsado =
      filtroUsado === "todas" ||
      (filtroUsado === "usadas" && inv.usado) ||
      (filtroUsado === "no_usadas" && !inv.usado)

    return matchesSearch && matchesUsado
  })

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((i) => i.id)))
    }
  }

  const selectedItems = invitaciones
    .filter((i) => selectedIds.has(i.id))
    .map((i) => ({ id: i.id, nombre_titular: i.nombre_titular }))

  const disponibles = filtered.filter((inv) => !inv.usado).length
  const usadas = filtered.length - disponibles

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Tabs defaultValue="listado" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="listado">
            <QrCode className="mr-2 h-4 w-4" />
            Invitaciones
          </TabsTrigger>
          <TabsTrigger value="importar">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Importar Excel
          </TabsTrigger>
        </TabsList>
        <Button onClick={() => setCrearOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva invitación
        </Button>
      </div>

      <TabsContent value="listado" className="space-y-4">
        <div className="rounded-lg border border-border/70 bg-card/30 p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Consulta y preparación de folios</p>
              <p className="text-sm text-muted-foreground">
                {filtered.length} invitaciones visibles, {disponibles} disponibles y {usadas} usadas.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] xl:min-w-[620px]">
              <div className="relative min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, CURP o contrato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8"
              />
              </div>
              <Select value={filtroUsado} onValueChange={setFiltroUsado}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="usadas">Usadas</SelectItem>
                  <SelectItem value="no_usadas">No usadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <Badge variant="outline">{filtered.length} resultados</Badge>
            {selectedIds.size > 0 && (
              <>
                <Badge variant="secondary">{selectedIds.size} seleccionadas</Badge>
                <QrPdfGenerator items={selectedItems} />
              </>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      filtered.length > 0 &&
                      selectedIds.size === filtered.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Titular</TableHead>
                <TableHead>CURP</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Colonia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha uso</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    No se encontraron invitaciones.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(inv.id)}
                        onCheckedChange={() => toggleSelect(inv.id)}
                      />
                    </TableCell>
                    <TableCell className="max-w-[280px] font-medium">
                      {inv.nombre_titular}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {inv.curp}
                    </TableCell>
                    <TableCell>{inv.numero_contrato}</TableCell>
                    <TableCell>{inv.colonia}</TableCell>
                    <TableCell>
                      <Badge variant={inv.usado ? "secondary" : "default"}>
                        {inv.usado ? "Usada" : "Disponible"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(inv.fecha_uso)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setQrViewId(inv.id)
                          setQrViewLabel(inv.nombre_titular)
                        }}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="importar" className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Importación masiva desde Excel</h3>
          <p className="text-sm text-muted-foreground">
            Sube un archivo .xlsx con las invitaciones a crear.
          </p>
        </div>
        <ExcelUploader />
      </TabsContent>

      <CrearInvitacionDialog
        open={crearOpen}
        onOpenChange={setCrearOpen}
        calles={calles}
      />

      <Dialog
        open={!!qrViewId}
        onOpenChange={(open) => {
          if (!open) setQrViewId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código QR</DialogTitle>
          </DialogHeader>
          {qrViewId && (
            <div className="flex justify-center py-4">
              <QrViewer value={qrViewId} label={qrViewLabel} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}
