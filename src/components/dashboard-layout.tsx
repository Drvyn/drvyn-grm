"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation" 
import { Wrench, Users, FileText, Settings, LogOut, Menu, X, Clock, BarChart3, Package } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
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
          { label: "Reports", icon: BarChart3, href: "/dashboard/reports" },
          { label: "Settings", icon: Settings, href: "/dashboard/settings" },
        ]
      : [
          { label: "Dashboard", icon: Wrench, href: "/dashboard" },
          { label: "Bookings", icon: Clock, href: "/dashboard/bookings" },
          { label: "Job Cards", icon: FileText, href: "/dashboard/job-cards" }, 
          { label: "Invoices", icon: FileText, href: "/dashboard/invoices" },
          { label: "Customers", icon: Users, href: "/dashboard/customers" },
          { label: "Parts", icon: Package, href: "/dashboard/parts" }, 
          { label: "Settings", icon: Settings, href: "/dashboard/settings" },
        ]

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col z-20",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Sidebar Header - Height matched to Navbar (h-16) */}
        <div className="h-16 px-4 border-b border-sidebar-border flex items-center justify-between shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="rounded-lg shadow-sm shrink-0">
                <img
                  src="/favicon3.png"
                  alt="Logo"
                  className="w-8 h-8" 
                />
              </div>
              <span className="font-bold text-lg text-sidebar-foreground truncate">DrvynGRM</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors ml-auto text-sidebar-foreground/70"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-r-lg transition-all duration-200 group relative",
                  // Active State: Blue bar on left + background
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-4 border-transparent"
                )}
              >
                <item.icon 
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                {sidebarOpen && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
                
                {/* Tooltip for collapsed state */}
                {!sidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </a>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border shrink-0">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors group",
              !sidebarOpen && "justify-center px-0"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar Header - Height matched to Sidebar (h-16) */}
        <header className="h-16 bg-card border-b border-border shrink-0 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
             {/* Mobile Sidebar Toggle */}
             <button
                className="md:hidden p-1 hover:bg-accent rounded-md"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                {/* Bold Workshop Name */}
                <h1 className="text-base md:text-lg font-bold text-foreground">
                  {workshopName}
                </h1>
              </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
               <span className="text-sm font-medium text-foreground capitalize hidden sm:inline-block">
                  {userRole} Account
               </span>
               <span className="text-xs text-muted-foreground hidden sm:inline-block">
                 {typeof window !== 'undefined' ? localStorage.getItem("userEmail") : ""}
               </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
               {workshopName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-muted/5">
          {children}
        </div>
      </main>
    </div>
  )
}