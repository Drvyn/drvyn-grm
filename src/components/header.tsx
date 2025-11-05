"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface HeaderProps {
  userRole: "admin" | "workshop" | null
}

export function Header({ userRole }: HeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("workshopName")
    router.push("/")
  }

  const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : ""
  const workshopName = typeof window !== "undefined" ? localStorage.getItem("workshopName") : ""

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {userRole === "admin" ? "Admin Dashboard" : workshopName || "Workshop Dashboard"}
        </h2>
        <p className="text-sm text-muted-foreground">{userEmail}</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </header>
  )
}
