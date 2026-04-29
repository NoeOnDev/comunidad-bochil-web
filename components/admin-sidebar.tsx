"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  FileText,
  MapPin,
  QrCode,
  Users,
  ChevronUp,
  LogOut,
} from "lucide-react"
import type { RolUsuario } from "@/lib/types/database"
import { logoutAction } from "@/app/login/actions"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: RolUsuario[]
}

const navItems: NavItem[] = [
  {
    title: "Invitaciones QR",
    href: "/invitaciones",
    icon: QrCode,
    roles: ["admin"],
  },
  {
    title: "Reportes",
    href: "/reportes",
    icon: FileText,
    roles: ["admin", "coordinador"],
  },
  {
    title: "Usuarios",
    href: "/usuarios",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Catálogo de Calles",
    href: "/calles",
    icon: MapPin,
    roles: ["admin"],
  },
]

interface AdminSidebarProps {
  userName: string
  userRole: RolUsuario
}

export function AdminSidebar({ userName, userRole }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const visibleItems = navItems.filter((item) => item.roles.includes(userRole))
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            CB
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Comunidad Bochil</span>
            <span className="text-xs text-muted-foreground">
              Panel Administrativo
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                    <Link
                      href={item.href}
                      prefetch
                      onMouseEnter={() => router.prefetch(item.href)}
                      onFocus={() => router.prefetch(item.href)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col text-left text-xs">
                    <span className="font-medium truncate">{userName}</span>
                    <span className="text-muted-foreground capitalize">
                      {userRole}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <DropdownMenuItem asChild>
                  <form action={logoutAction}>
                    <button type="submit" className="flex w-full items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
