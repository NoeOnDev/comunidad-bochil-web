import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans-source" })

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif-source",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-source",
})

export const metadata: Metadata = {
  title: "Comunidad Bochil — Panel Administrativo",
  description: "Portal de administración del municipio de Bochil, Chiapas",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
