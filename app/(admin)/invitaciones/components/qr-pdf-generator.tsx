"use client"

import QRCode from "qrcode"
import { jsPDF } from "jspdf"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { useState } from "react"

interface QrItem {
  id: string
  nombre_titular: string
}

interface QrPdfGeneratorProps {
  items: QrItem[]
}

export function QrPdfGenerator({ items }: QrPdfGeneratorProps) {
  const [generating, setGenerating] = useState(false)

  async function generatePdf() {
    if (items.length === 0) return
    setGenerating(true)

    try {
      const doc = new jsPDF("p", "mm", "letter")
      const pageWidth = doc.internal.pageSize.getWidth()
      const cols = 3
      const qrSize = 50
      const gapX = (pageWidth - cols * qrSize) / (cols + 1)
      const gapY = 12
      const startY = 20
      const labelHeight = 8

      doc.setFontSize(14)
      doc.text("Invitaciones QR — Comunidad Bochil", pageWidth / 2, 12, {
        align: "center",
      })

      let col = 0
      let row = 0

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const x = gapX + col * (qrSize + gapX)
        const y = startY + row * (qrSize + labelHeight + gapY)

        // Check page overflow
        if (y + qrSize + labelHeight > doc.internal.pageSize.getHeight() - 10) {
          doc.addPage()
          col = 0
          row = 0
          const xNew = gapX + col * (qrSize + gapX)
          const yNew = startY

          const dataUrl = await QRCode.toDataURL(item.id, {
            width: 400,
            margin: 1,
          })
          doc.addImage(dataUrl, "PNG", xNew, yNew, qrSize, qrSize)
          doc.setFontSize(7)
          doc.text(item.nombre_titular, xNew + qrSize / 2, yNew + qrSize + 4, {
            align: "center",
            maxWidth: qrSize,
          })
        } else {
          const dataUrl = await QRCode.toDataURL(item.id, {
            width: 400,
            margin: 1,
          })
          doc.addImage(dataUrl, "PNG", x, y, qrSize, qrSize)
          doc.setFontSize(7)
          doc.text(item.nombre_titular, x + qrSize / 2, y + qrSize + 4, {
            align: "center",
            maxWidth: qrSize,
          })
        }

        col++
        if (col >= cols) {
          col = 0
          row++
        }
      }

      doc.save("invitaciones-qr-bochil.pdf")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={generatePdf}
      disabled={items.length === 0 || generating}
    >
      {generating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      Generar PDF ({items.length})
    </Button>
  )
}
