"use client"

import { useActionState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { crearCalle, editarCalle } from "./actions"
import type { CatalogoCalle } from "@/lib/types/database"
import { toast } from "sonner"

interface CalleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  calle?: CatalogoCalle | null
}

export function CalleDialog({ open, onOpenChange, calle }: CalleDialogProps) {
  const isEdit = !!calle
  const formRef = useRef<HTMLFormElement>(null)

  const action = isEdit
    ? editarCalle.bind(null, calle!.id)
    : crearCalle

  const [state, formAction, isPending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) {
      toast.success(isEdit ? "Calle actualizada" : "Calle creada")
      onOpenChange(false)
    }
  }, [state, isEdit, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar calle" : "Nueva calle"}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="grid gap-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="nombre_oficial">Nombre oficial</Label>
            <Input
              id="nombre_oficial"
              name="nombre_oficial"
              defaultValue={calle?.nombre_oficial ?? ""}
              placeholder="Ej: Calle Benito Juárez"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear calle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
