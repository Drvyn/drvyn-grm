"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Wrench,
  FileText,
  Users,
  Package,
  BarChart3,
  Settings,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  userRole: "admin" | "workshop" | null
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["admin", "workshop"] },
    { icon: Calendar, label: "Bookings", href: "/dashboard/bookings", roles: ["admin", "workshop"] },
    { icon: Wrench, label: "Job Cards", href: "/dashboard/job-cards", roles: ["admin", "workshop"] },
    { icon: FileText, label: "Invoices", href: "/dashboard/invoices", roles: ["admin", "workshop"] },
    { icon: Users, label: "Customers", href: "/dashboard/customers", roles: ["admin", "workshop"] },
    { icon: Package, label: "Parts & Services", href: "/dashboard/parts", roles: ["admin", "workshop"] },
    { icon: BarChart3, label: "Reports", href: "/dashboard/reports", roles: ["admin"] },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", roles: ["admin", "workshop"] },
  ]

  const visibleItems = menuItems.filter((item) => item.roles.includes(userRole || ""))

  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-sidebar-primary p-2 rounded-lg">
              <div className="rounded-xl shadow-md">
              <img
                src="/favicon3.png"
                alt="DrvynGRM Logo"
                className="w-10 h-10" 
              />
            </div>
            </div>
            <span className="font-bold text-sidebar-foreground">DrvynGRM</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <ChevronDown
            className={cn(
              "w-5 h-5 text-sidebar-foreground transition-transform",
              isCollapsed ? "rotate-90" : "-rotate-90",
            )}
          />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground border-l-4 border-blue-600 font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-blue-600" : "")} />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}