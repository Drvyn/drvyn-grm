"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation" 
import { Wrench, Users, FileText, Settings, LogOut, Menu, ChevronsLeft, Clock, BarChart3, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<"admin" | "workshop" | null>(null)
  const [workshopName, setWorkshopName] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
        ]
      : [
          { label: "Dashboard", icon: Wrench, href: "/dashboard" },
          { label: "Bookings", icon: Clock, href: "/dashboard/bookings" },
          { label: "Job Cards", icon: FileText, href: "/dashboard/job-cards" }, 
          { label: "Invoices", icon: FileText, href: "/dashboard/invoices" },
          { label: "Customers", icon: Users, href: "/dashboard/customers" },
          { label: "Parts", icon: Package, href: "/dashboard/parts" }, 
        ]

  // Reusable Navigation Content
  // isMobile: true if rendered inside the Mobile Sheet, false if Desktop Sidebar
  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className={cn(
        "h-16 flex items-center shrink-0 border-b border-sidebar-border/50 transition-all duration-300",
        // Center content when collapsed on desktop, otherwise space between
        (sidebarOpen || isMobile) ? "px-4 justify-between" : "justify-center"
      )}>
        {/* Logo & Text - Show ONLY if Sidebar is Open OR on Mobile */}
        {(sidebarOpen || isMobile) && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="rounded-lg shadow-sm shrink-0 bg-white/80 p-1">
              <img
                src="/favicon3.png"
                alt="Logo"
                className="w-7 h-7" 
              />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground truncate tracking-tight">DrvynGRM</span>
          </div>
        )}
        
        {/* Toggle Button (Desktop Only) */}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "p-2 rounded-md transition-all duration-200 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 focus:outline-none",
            )}
          >
            {sidebarOpen ? <ChevronsLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                // Center icons when desktop sidebar is collapsed
                (!sidebarOpen && !isMobile) && "justify-center px-2"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon 
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                )} 
              />
              {/* Text Label - Show ONLY if Open or Mobile */}
              {(sidebarOpen || isMobile) && (
                <span className="text-sm truncate">{item.label}</span>
              )}
              
              {/* Tooltip for collapsed state (Desktop only) */}
              {!sidebarOpen && !isMobile && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border">
                  {item.label}
                </div>
              )}
            </a>
          )
        })}
      </nav>

      {/* Footer Group */}
      <div className="p-3 shrink-0 border-t border-sidebar-border/50 space-y-1">
        <a
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
            pathname === "/dashboard/settings"
              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            (!sidebarOpen && !isMobile) && "justify-center px-2"
          )}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Settings 
              className={cn(
              "w-5 h-5 flex-shrink-0 transition-colors",
              pathname === "/dashboard/settings" ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
              )} 
          />
          {(sidebarOpen || isMobile) && <span className="text-sm truncate">Settings</span>}
          
          {!sidebarOpen && !isMobile && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border">
              Settings
            </div>
          )}
        </a>

        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors group relative",
            (!sidebarOpen && !isMobile) && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(sidebarOpen || isMobile) && <span className="text-sm font-medium">Logout</span>}
          
          {!sidebarOpen && !isMobile && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-sidebar overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "bg-sidebar transition-all duration-300 flex-col z-20 border-r border-sidebar-border/50 hidden md:flex overflow-x-hidden", // Added overflow-x-hidden
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <NavContent isMobile={false} />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r border-sidebar-border">
          <NavContent isMobile={true} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Navbar Header */}
        <header className="h-16 bg-sidebar shrink-0 flex items-center justify-between px-4 md:px-8 text-sidebar-foreground z-10 border-b border-sidebar-border/50 md:border-none">
          
          <div className="flex items-center gap-4 flex-1">
             {/* Mobile Menu Button */}
             <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-sidebar-foreground/80"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
               <span className="text-sm font-semibold text-sidebar-foreground capitalize hidden sm:inline-block">
                  {userRole} Account
               </span>
               <span className="text-xs text-sidebar-foreground/60 hidden sm:inline-block">
                 {typeof window !== 'undefined' ? localStorage.getItem("userEmail") : ""}
               </span>
            </div>
            
            <div className="h-9 w-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm shadow-md">
               {workshopName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-[#f8f9fa] md:rounded-tl-3xl shadow-inner relative w-full">
          {children}
        </main>
      </div>
    </div>
  )
}