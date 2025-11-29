"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Wrench, Clock, X, Check, Loader2, FileText, ArrowRight } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/AppProviders"
import { 
  useJobCards, 
  useSaveJobCard, 
  JobCard, 
  JobCardIn 
} from "@/hooks/useApi"
import { format } from "date-fns"

// Default empty state for the form (Create only)
const initialJobCardData: JobCardIn = {
  booking_id: "",
  customer: "",
  vehicle: "",
  service: "",
  date: format(new Date(), "yyyy-MM-dd"),
  time: format(new Date(), "HH:mm"),
  workers: [],
  spareParts: [],
  services: [],
  issues: [],
  photos: [],
  notes: ""
}

export default function JobCardsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  // Data Fetching
  const { data: jobCards = [], isLoading } = useJobCards()
  const saveJobCardMutation = useSaveJobCard()

  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<JobCardIn>(initialJobCardData)

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole")
    if (!role || role !== "workshop") {
      router.push("/dashboard")
    }
  }, [router])

  // Filter logic
  const filteredJobCards = jobCards.filter(
    (card) =>
      card.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.id || card._id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.vehicle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate Total Cost dynamically
  const calculateTotal = (card: JobCard) => {
    const partsTotal = card.spareParts?.reduce((acc, part) => acc + (part.price * part.quantity), 0) || 0
    const servicesTotal = card.services?.reduce((acc, service) => acc + service.cost, 0) || 0
    return partsTotal + servicesTotal
  }

  // Handlers
  const handleAddNew = () => {
    setFormData(initialJobCardData)
    setShowForm(true)
  }

  // UPDATED: Navigate to full detail page
  const handleViewDetails = (card: JobCard) => {
    const cardId = card.id || card._id
    if(cardId) {
      router.push(`/dashboard/job-cards/${cardId}`)
    }
  }

  const handleSaveNew = () => {
    if (!formData.customer || !formData.vehicle) {
      alert("Please fill in Customer and Vehicle details")
      return
    }

    saveJobCardMutation.mutate(
      { data: formData },
      {
        onSuccess: () => {
          setShowForm(false)
          setFormData(initialJobCardData)
        }
      }
    )
  }

  if (!mounted || !user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Cards</h1>
            <p className="text-muted-foreground">Active jobs and service history</p>
          </div>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Job Card
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Search Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, vehicle, or Job ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
             <div className="col-span-full flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
          ) : filteredJobCards.length > 0 ? (
            filteredJobCards.map((card) => {
              const cardId = card.id || card._id || ""
              const totalCost = calculateTotal(card)
              
              return (
                <Card 
                  key={cardId} 
                  className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/50 cursor-pointer group"
                  onClick={() => handleViewDetails(card)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                          {cardId.slice(-6).toUpperCase()}
                        </CardTitle>
                        <CardDescription className="font-medium text-foreground/80">{card.customer}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        {card.service || "Service"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Wrench className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{card.vehicle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {card.date} at {card.time}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Est. Total</span>
                        <span className="font-bold text-lg text-primary">
                          ₹{totalCost.toLocaleString()}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-primary/10 -mr-2"
                      >
                        View & Edit <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-lg border border-dashed">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No job cards found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center">
          <Card className="border-border bg-card w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
              <CardTitle>New Job Card</CardTitle>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Name *</label>
                  <Input
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="Customer Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Details *</label>
                  <Input
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    placeholder="e.g., Honda City 2022"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Booking ID (Optional)</label>
                  <Input
                    value={formData.booking_id}
                    onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                    placeholder="Linked Booking ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Type</label>
                  <Input
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    placeholder="e.g., General Service"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveNew} 
                  disabled={saveJobCardMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {saveJobCardMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Create & View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}