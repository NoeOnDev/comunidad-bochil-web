"use client"

import { useCallback, useState, useTransition } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  X,
} from "lucide-react"
import {
  importarInvitaciones,
  type ImportRow,
  type ImportResult,
} from "../actions"
import { invitacionExcelRowSchema } from "@/lib/validators/invitacion"
import { toast } from "sonner"

interface ParsedRow extends ImportRow {
  _error?: string
}

export function ExcelUploader() {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setResult(null)
    setParseError(null)
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

        if (json.length === 0) {
          setParseError("El archivo no contiene datos.")
          setRows([])
          return
        }

        const parsed: ParsedRow[] = json.map((raw) => {
          const row: ParsedRow = {
            curp: String(raw["curp"] ?? raw["CURP"] ?? "").trim(),
            numero_contrato: String(
              raw["numero_contrato"] ?? raw["NUMERO_CONTRATO"] ?? raw["contrato"] ?? raw["CONTRATO"] ?? "",
            ).trim(),
            nombre_titular: String(
              raw["nombre_titular"] ?? raw["NOMBRE_TITULAR"] ?? raw["nombre"] ?? raw["NOMBRE"] ?? "",
            ).trim(),
            direccion: String(
              raw["direccion"] ?? raw["DIRECCION"] ?? raw["dirección"] ?? raw["DIRECCIÓN"] ?? "",
            ).trim(),
            colonia: String(raw["colonia"] ?? raw["COLONIA"] ?? "").trim(),
          }

          const result = invitacionExcelRowSchema.safeParse(row)
          if (!result.success) {
            row._error = result.error.issues[0].message
          }

          return row
        })

        setRows(parsed)
      } catch {
        setParseError("No se pudo leer el archivo. Asegúrate de que sea un .xlsx válido.")
        setRows([])
      }
    }
    reader.readAsArrayBuffer(file)

    // Reset input so user can re-select same file
    e.target.value = ""
  }, [])

  function handleImport() {
    const valid = rows.filter((r) => !r._error)
    if (valid.length === 0) {
      toast.error("No hay filas válidas para importar.")
      return
    }

    startTransition(async () => {
      const importResult = await importarInvitaciones(valid)
      setResult(importResult)
      if (importResult.fallidas === 0) {
        toast.success(`${importResult.exitosas} invitaciones importadas correctamente.`)
      } else {
        toast.warning(
          `${importResult.exitosas} exitosas, ${importResult.fallidas} fallidas.`,
        )
      }
    })
  }

  const validCount = rows.filter((r) => !r._error).length
  const invalidCount = rows.filter((r) => r._error).length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <label className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Seleccionar archivo Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFile}
            />
          </label>
        </Button>
        {fileName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{fileName}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setRows([])
                setFileName(null)
                setResult(null)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {parseError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert variant={result.fallidas === 0 ? "default" : "destructive"}>
          {result.fallidas === 0 ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            Importación completada: {result.exitosas} exitosas, {result.fallidas}{" "}
            fallidas de {result.total} totales.
            {result.errores.length > 0 && (
              <ul className="mt-2 list-disc pl-4 text-xs">
                {result.errores.slice(0, 10).map((e, i) => (
                  <li key={i}>
                    Fila {e.fila}: {e.error}
                  </li>
                ))}
                {result.errores.length > 10 && (
                  <li>...y {result.errores.length - 10} errores más</li>
                )}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {rows.length > 0 && !result && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="default">{validCount} válidas</Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive">{invalidCount} con errores</Badge>
              )}
            </div>
            <Button onClick={handleImport} disabled={isPending || validCount === 0}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Importar {validCount} invitaciones
            </Button>
          </div>

          <div className="max-h-[400px] overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>CURP</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Colonia</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow
                    key={i}
                    className={row._error ? "bg-destructive/5" : ""}
                  >
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{row.curp}</TableCell>
                    <TableCell>{row.numero_contrato}</TableCell>
                    <TableCell>{row.nombre_titular}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {row.direccion}
                    </TableCell>
                    <TableCell>{row.colonia}</TableCell>
                    <TableCell>
                      {row._error ? (
                        <Badge variant="destructive" className="text-xs">
                          {row._error}
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">
                          OK
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {rows.length === 0 && !parseError && !result && (
        <div className="text-sm text-muted-foreground">
          <p>
            El archivo Excel debe tener las columnas:{" "}
            <strong>curp</strong>, <strong>numero_contrato</strong>,{" "}
            <strong>nombre_titular</strong>, <strong>direccion</strong>,{" "}
            <strong>colonia</strong>.
          </p>
        </div>
      )}
    </div>
  )
}
