"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, TrendingUp, Loader2, Mail, Eye } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAdminWorkshops } from "@/hooks/useApi"

export default function WorkshopsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"admin" | "workshop" | null>(null)
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch admin workshop data
  const { data: workshops = [], isLoading } = useAdminWorkshops()

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole") as "admin" | "workshop" | null
    if (!role || role !== "admin") {
      router.push("/dashboard")
    }
    setUserRole(role)
  }, [router])

  if (!mounted || !userRole) return null

  // Filter workshops based on search
  const filteredWorkshops = workshops.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (workshopId: string) => {
      router.push(`/dashboard/workshops/${workshopId}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workshops</h1>
            <p className="text-muted-foreground">Manage all registered workshops</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Workshops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by workshop name or email..." 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workshop List</CardTitle>
            <CardDescription>All registered workshops on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {isLoading ? (
                  <div className="flex justify-center p-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
              ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Workshop Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Bookings</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pending Tasks</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkshops.length > 0 ? (
                    filteredWorkshops.map((workshop) => (
                        <tr key={workshop.workshop_id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-foreground">{workshop.name}</td>
                        <td className="py-3 px-4">
                            <div className="text-sm text-foreground flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {workshop.email}
                            </div>
                        </td>
                        <td className="py-3 px-4">
                            <div className="text-sm text-foreground flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {workshop.total_bookings}
                            </div>
                        </td>
                        <td className="py-3 px-4">
                            <div className="text-sm font-medium text-foreground flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            ₹{workshop.revenue.toLocaleString()}
                            </div>
                        </td>
                        <td className="py-3 px-4">
                            <Badge variant={workshop.pending_tasks > 0 ? "destructive" : "secondary"}>
                                {workshop.pending_tasks} Pending
                            </Badge>
                        </td>
                        <td className="py-3 px-4">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-primary/10"
                                onClick={() => handleViewDetails(workshop.workshop_id)}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                            </Button>
                        </td>
                        </tr>
                    ))
                  ) : (
                      <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                              No workshops found.
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}