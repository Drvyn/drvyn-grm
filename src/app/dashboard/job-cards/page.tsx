"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Wrench, Clock, DollarSign, X, Check } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface JobCard {
  id: string
  bookingId: string
  customer: string
  vehicle: string
  services: { name: string; cost: number }[]
  parts: { name: string; quantity: number; cost: number }[]
  labor: number
  status: "pending" | "in-progress" | "completed" | "invoiced"
  startDate: string
  completionDate?: string
  notes: string
}

const initialJobCards: JobCard[] = [
  {
    id: "JC001",
    bookingId: "BK001",
    customer: "John Smith",
    vehicle: "2020 Honda Civic",
    services: [{ name: "Oil Change", cost: 45 }],
    parts: [{ name: "Oil Filter", quantity: 1, cost: 15 }],
    labor: 30,
    status: "completed",
    startDate: "2024-01-10",
    completionDate: "2024-01-10",
    notes: "Regular maintenance completed",
  },
  {
    id: "JC002",
    bookingId: "BK002",
    customer: "Sarah Johnson",
    vehicle: "2019 Toyota Camry",
    services: [{ name: "Tire Rotation", cost: 50 }],
    parts: [],
    labor: 40,
    status: "in-progress",
    startDate: "2024-01-15",
    notes: "Currently rotating tires",
  },
  {
    id: "JC003",
    bookingId: "BK003",
    customer: "Mike Davis",
    vehicle: "2021 Ford F-150",
    services: [{ name: "Brake Inspection", cost: 60 }],
    parts: [
      { name: "Brake Pads", quantity: 1, cost: 80 },
      { name: "Brake Fluid", quantity: 1, cost: 25 },
    ],
    labor: 75,
    status: "pending",
    startDate: "2024-01-16",
    notes: "Waiting for parts approval",
  },
]

export default function JobCardsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"admin" | "workshop" | null>(null)
  const [mounted, setMounted] = useState(false)
  const [jobCards, setJobCards] = useState<JobCard[]>(initialJobCards)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<JobCard>({
    id: "",
    bookingId: "",
    customer: "",
    vehicle: "",
    services: [],
    parts: [],
    labor: 0,
    status: "pending",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole") as "admin" | "workshop" | null
    if (!role || role !== "workshop") {
      router.push("/dashboard")
    }
    setUserRole(role)
  }, [router])

  const filteredJobCards = jobCards.filter(
    (card) =>
      card.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.vehicle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calculateTotal = (card: JobCard) => {
    const servicesCost = card.services.reduce((sum, s) => sum + s.cost, 0)
    const partsCost = card.parts.reduce((sum, p) => sum + p.cost * p.quantity, 0)
    return servicesCost + partsCost + card.labor
  }

  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
      id: `JC${String(jobCards.length + 1).padStart(3, "0")}`,
      bookingId: "",
      customer: "",
      vehicle: "",
      services: [],
      parts: [],
      labor: 0,
      status: "pending",
      startDate: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setShowForm(true)
  }

  const handleEdit = (card: JobCard) => {
    setEditingId(card.id)
    setFormData(card)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!formData.customer || !formData.vehicle || !formData.bookingId) {
      alert("Please fill in all required fields")
      return
    }

    if (editingId) {
      setJobCards(jobCards.map((c) => (c.id === editingId ? formData : c)))
    } else {
      setJobCards([...jobCards, formData])
    }

    setShowForm(false)
  }

  const handleStatusChange = (id: string, newStatus: JobCard["status"]) => {
    setJobCards(
      jobCards.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              completionDate: newStatus === "completed" ? new Date().toISOString().split("T")[0] : c.completionDate,
            }
          : c,
      ),
    )
  }

  if (!mounted || !userRole) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "invoiced":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Cards</h1>
            <p className="text-muted-foreground">Track service jobs and work progress</p>
          </div>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Job Card
          </Button>
        </div>

        {/* Job Card Form Modal */}
        {showForm && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>{editingId ? "Edit Job Card" : "Create New Job Card"}</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Booking ID *</label>
                  <Input
                    value={formData.bookingId}
                    onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                    placeholder="e.g., BK001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Name *</label>
                  <Input
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle *</label>
                  <Input
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    placeholder="e.g., 2020 Honda Civic"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Labor Cost ($)</label>
                  <Input
                    type="number"
                    value={formData.labor}
                    onChange={(e) => setFormData({ ...formData, labor: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as JobCard["status"] })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="invoiced">Invoiced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  <Check className="w-4 h-4 mr-2" />
                  Save Job Card
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Job Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, vehicle, or job ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobCards.length > 0 ? (
            filteredJobCards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{card.id}</CardTitle>
                      <CardDescription>{card.customer}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(card.status)}>
                      {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{card.vehicle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{card.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">${calculateTotal(card).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Services:</p>
                    <div className="space-y-1">
                      {card.services.length > 0 ? (
                        card.services.map((service, idx) => (
                          <p key={idx} className="text-xs text-foreground">
                            • {service.name} - ${service.cost}
                          </p>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No services added</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={card.status}
                      onChange={(e) => handleStatusChange(card.id, e.target.value as JobCard["status"])}
                      className={`flex-1 px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${getStatusColor(card.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="invoiced">Invoiced</option>
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(card)} className="hover:bg-primary/10">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">No job cards found</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
