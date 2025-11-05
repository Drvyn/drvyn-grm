"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Wrench, Users, FileText, Settings, LogOut, Menu, X, Clock } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"admin" | "workshop" | null>(null)
  const [workshopName, setWorkshopName] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole") as "admin" | "workshop" | null
    const workshop = localStorage.getItem("workshopName") || "My Workshop"

    if (!role) {
      router.push("/")
      return
    }

    setUserRole(role)
    setWorkshopName(workshop)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("workshopName")
    router.push("/")
  }

  if (!mounted || !userRole) {
    return null
  }

  const navigationItems =
    userRole === "admin"
      ? [
          { label: "Dashboard", icon: Wrench, href: "/dashboard" },
          { label: "Workshops", icon: Users, href: "/dashboard/workshops" },
          { label: "Reports", icon: FileText, href: "/dashboard/reports" },
          { label: "Settings", icon: Settings, href: "/dashboard/settings" },
        ]
      : [
          { label: "Dashboard", icon: Wrench, href: "/dashboard" },
          { label: "Bookings", icon: Clock, href: "/dashboard/bookings" },
          { label: "Customers", icon: Users, href: "/dashboard/customers" },
          { label: "Invoices", icon: FileText, href: "/dashboard/invoices" },
          { label: "Settings", icon: Settings, href: "/dashboard/settings" },
        ]

  return (
    <div
      className="flex h-screen bg-background"
    >
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              
               <div className="rounded-xl shadow-md">
              <img
                src="/favicon3.png"
                alt="DrvynGRM Logo"
                className="w-10 h-10" 
              />
            </div>
              
              <span className="font-bold text-sidebar-foreground">DrvynGRM</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground hover:text-sidebar-accent-foreground"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{workshopName}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground capitalize">{userRole} Account</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}