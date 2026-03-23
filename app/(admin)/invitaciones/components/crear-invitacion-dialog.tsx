"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitación creada</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <QrViewer value={state.invitacionId} label={nombreForQr} />
          </div>
          <DialogFooter>
            <Button onClick={() => handleClose(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva invitación</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          action={(fd: FormData) => {
            setNombreForQr(fd.get("nombre_titular") as string)
            formAction(fd)
          }}
          className="grid gap-4"
        >
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
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
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nombre_titular">Nombre del titular</Label>
            <Input id="nombre_titular" name="nombre_titular" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea id="direccion" name="direccion" rows={2} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="colonia">Colonia</Label>
              <Input id="colonia" name="colonia" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="calle_id">Calle (opcional)</Label>
              <Select name="calle_id">
                <SelectTrigger>
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
          </div>
          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
