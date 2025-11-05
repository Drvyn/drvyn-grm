"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MapPin, Users, TrendingUp } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

const workshopsData = [
  {
    id: "W001",
    name: "Downtown Auto Repair",
    location: "New York, NY",
    owner: "John Smith",
    bookings: 156,
    revenue: "$12,450",
    status: "active",
  },
  {
    id: "W002",
    name: "Quick Fix Garage",
    location: "Los Angeles, CA",
    owner: "Sarah Johnson",
    bookings: 98,
    revenue: "$8,320",
    status: "active",
  },
  {
    id: "W003",
    name: "Pro Mechanics",
    location: "Chicago, IL",
    owner: "Mike Davis",
    bookings: 203,
    revenue: "$18,750",
    status: "active",
  },
  {
    id: "W004",
    name: "Express Service",
    location: "Houston, TX",
    owner: "Emily Brown",
    bookings: 45,
    revenue: "$3,200",
    status: "inactive",
  },
  {
    id: "W005",
    name: "Elite Auto Care",
    location: "Phoenix, AZ",
    owner: "Robert Wilson",
    bookings: 178,
    revenue: "$15,600",
    status: "active",
  },
]

export default function WorkshopsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"admin" | "workshop" | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole") as "admin" | "workshop" | null
    if (!role || role !== "admin") {
      router.push("/dashboard")
    }
    setUserRole(role)
  }, [router])

  if (!mounted || !userRole) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workshops</h1>
            <p className="text-muted-foreground">Manage all registered workshops</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Workshop
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Workshops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by workshop name..." className="pl-10" />
              </div>
              <Button variant="outline">Filter</Button>
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
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Workshop Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Owner</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Bookings</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workshopsData.map((workshop) => (
                    <tr key={workshop.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{workshop.name}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-foreground flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {workshop.location}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">{workshop.owner}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-foreground flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {workshop.bookings}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-foreground flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {workshop.revenue}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            workshop.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }
                        >
                          {workshop.status.charAt(0).toUpperCase() + workshop.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
