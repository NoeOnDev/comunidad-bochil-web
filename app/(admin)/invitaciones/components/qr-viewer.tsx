"use client"

import { useEffect, useRef, useCallback } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface QrViewerProps {
  value: string
  label?: string
  size?: number
}

export function QrViewer({ value, label, size = 256 }: QrViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    })
  }, [value, size])

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = `qr-${label?.replace(/\s+/g, "_") || value}.png`
    a.click()
  }, [value, label])

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} />
      {label && (
        <p className="text-sm font-medium text-center max-w-[256px] truncate">
          {label}
        </p>
      )}
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" />
        Descargar PNG
      </Button>
    </div>
  )
}
