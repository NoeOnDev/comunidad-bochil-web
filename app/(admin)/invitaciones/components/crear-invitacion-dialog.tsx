"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { crearInvitacion } from "../actions"
import { QrViewer } from "./qr-viewer"
import type { CatalogoCalle } from "@/lib/types/database"
import { toast } from "sonner"

interface CrearInvitacionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  calles: CatalogoCalle[]
}

export function CrearInvitacionDialog({
  open,
  onOpenChange,
  calles,
}: CrearInvitacionDialogProps) {
  const [state, formAction, isPending] = useActionState(crearInvitacion, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [showQr, setShowQr] = useState(false)
  const [nombreForQr, setNombreForQr] = useState("")

  useEffect(() => {
    if (state?.success && state.invitacionId) {
      toast.success("Invitación creada exitosamente")
      setShowQr(true)
    }
  }, [state])

  function handleClose(open: boolean) {
    if (!open) {
      setShowQr(false)
      setNombreForQr("")
    }
    onOpenChange(open)
  }

  if (showQr && state?.invitacionId) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader className="border-b pb-4">
            <SheetTitle>Invitación creada</SheetTitle>
            <SheetDescription>
              El folio ya quedó registrado y su código QR está listo para entregarse o descargarse.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 items-center justify-center px-4 py-6">
            <QrViewer value={state.invitacionId} label={nombreForQr} />
          </div>
          <SheetFooter className="border-t pt-4 sm:flex-row sm:justify-end">
            <Button onClick={() => handleClose(false)}>Cerrar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>Nueva invitación</SheetTitle>
          <SheetDescription>
            Captura el folio de registro con los datos necesarios para generar su acceso por QR sin salir del listado.
          </SheetDescription>
        </SheetHeader>
        <form
          ref={formRef}
          action={(fd: FormData) => {
            setNombreForQr(fd.get("nombre_titular") as string)
            formAction(fd)
          }}
          className="grid gap-4 px-4 py-6"
        >
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="curp">CURP</Label>
            <Input
              id="curp"
              name="curp"
              placeholder="18 caracteres"
              maxLength={18}
              className="uppercase"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="numero_contrato">No. Contrato</Label>
            <Input
              id="numero_contrato"
              name="numero_contrato"
              placeholder="Ej. 54621"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nombre_titular">Nombre del titular</Label>
            <Input
              id="nombre_titular"
              name="nombre_titular"
              placeholder="Nombre y apellidos del titular"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="colonia">Colonia</Label>
            <Input id="colonia" name="colonia" placeholder="Barrio o colonia" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="calle_id">Calle (opcional)</Label>
            <Select name="calle_id">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar calle" />
              </SelectTrigger>
              <SelectContent>
                {calles.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre_oficial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              name="direccion"
              rows={3}
              placeholder="Número, referencias o detalles útiles del domicilio"
              required
            />
          </div>

          <SheetFooter className="border-t px-0 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear invitación
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
