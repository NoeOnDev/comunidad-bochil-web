import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AdminSidebar } from "@/components/admin-sidebar"
import { getAdminProfile } from "@/lib/supabase/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const perfil = await getAdminProfile()

  return (
    <SidebarProvider>
      <AdminSidebar
        userName={perfil.nombre_completo}
        userRole={perfil.rol}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium">Panel Administrativo</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
