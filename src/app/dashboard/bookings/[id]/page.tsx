"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Edit2,
  Upload,
  UserPlus,
  Loader2, 
  Check,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useBookingById, useSaveJobCard, JobCardIn, SparePartItem, ServiceItem } from "@/hooks/useApi"

interface JobCardState {
  id: string
  bookingId: string
  customer: string
  phone: string
  email: string
  vehicle: string
  service: string
  date: string
  time: string
  spareParts: SparePartItem[]
  services: ServiceItem[]
  notes: string
  issues: string[]
  workers: string[]
  photos: string[]
  signature: string
}

const initialServiceState: ServiceItem = {
  id: "",
  description: "",
  cost: 0,
  taxPercent: 0,
}
const initialPartState: SparePartItem = {
  id: "",
  name: "",
  quantity: 1,
  price: 0,
  taxPercent: 0,
}

const initialJobCardState: JobCardState = {
  id: "",
  bookingId: "",
  customer: "",
  phone: "",
  email: "",
  vehicle: "",
  service: "",
  date: "",
  time: "",
  spareParts: [],
  services: [],
  notes: "",
  issues: [],
  workers: [],
  photos: [],
  signature: ""
}

export default function JobCardPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [userRole, setUserRole] = useState<"admin" | "workshop" | null>(null)
  const [mounted, setMounted] = useState(false)
  
  const [jobCard, setJobCard] = useState<JobCardState>(initialJobCardState)

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isPartModalOpen, setIsPartModalOpen] = useState(false)
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)

  const [currentIssue, setCurrentIssue] = useState("")
  const [currentWorker, setCurrentWorker] = useState("")
  const [currentService, setCurrentService] =
    useState<ServiceItem>(initialServiceState)
  const [currentPart, setCurrentPart] =
    useState<SparePartItem>(initialPartState)

  const { data: apiBooking, isLoading, isError } = useBookingById(bookingId)
  
  const saveJobCardMutation = useSaveJobCard()

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole") as "admin" | "workshop" | null
    if (!role || role !== "workshop") {
      router.push("/dashboard")
      return
    }
    setUserRole(role)

    if (apiBooking) {
      const bId = apiBooking.id || apiBooking._id || "UNKNOWN"
      
      setJobCard(prev => ({
        ...prev,
        id: `JC${bId.slice(-6).toUpperCase()}`, 
        bookingId: bId,
        customer: apiBooking.customerName,
        phone: apiBooking.phone,
        email: apiBooking.email || "",
        vehicle: `${apiBooking.makeYear || ''} ${apiBooking.makeAndModel} ${apiBooking.color || ''}`.trim(),
        service: apiBooking.bookingType || "Service", 
        date: apiBooking.date || new Date().toISOString().split("T")[0],
        time: apiBooking.time || "09:00",
        notes: apiBooking.customerRemark || "",
        issues: apiBooking.customerRemark ? [apiBooking.customerRemark] : []
      }))
    }
  }, [router, apiBooking])

  const partsSubtotal = jobCard.spareParts.reduce(
    (sum, part) => sum + part.quantity * part.price,
    0,
  )
  const servicesSubtotal = jobCard.services.reduce(
    (sum, labor) => sum + labor.cost,
    0,
  )
  const subtotal = partsSubtotal + servicesSubtotal

  const partsTax = jobCard.spareParts.reduce(
    (sum, part) => sum + part.quantity * part.price * (part.taxPercent / 100),
    0,
  )
  const servicesTax = jobCard.services.reduce(
    (sum, labor) => sum + labor.cost * (labor.taxPercent / 100),
    0,
  )
  const totalTax = partsTax + servicesTax
  const total = subtotal + totalTax

  const handleAddIssue = () => {
    if (currentIssue.trim()) {
      setJobCard(prev => ({ ...prev, issues: [...prev.issues, currentIssue.trim()] }))
      setCurrentIssue("")
      setIsIssueModalOpen(false)
    }
  }

  const handleAddWorker = () => {
    if (currentWorker.trim()) {
      setJobCard(prev => ({ ...prev, workers: [...prev.workers, currentWorker.trim()] }))
      setCurrentWorker("")
      setIsWorkerModalOpen(false)
    }
  }

  const openServiceModal = (service: ServiceItem | null) => {
    if (service) {
      setCurrentService(service)
    } else {
      setCurrentService({
        ...initialServiceState,
        id: `S${Date.now()}`,
      })
    }
    setIsServiceModalOpen(true)
  }

  const handleSaveService = () => {
    const existing = jobCard.services.find(
      (s) => s.id === currentService.id,
    )
    if (existing) {
      setJobCard({
        ...jobCard,
        services: jobCard.services.map((s) =>
          s.id === currentService.id ? currentService : s,
        ),
      })
    } else {
      setJobCard({
        ...jobCard,
        services: [...jobCard.services, currentService],
      })
    }
    setIsServiceModalOpen(false)
  }

  const handleDeleteService = (id: string) => {
    setJobCard({
      ...jobCard,
      services: jobCard.services.filter((s) => s.id !== id),
    })
  }

  const openPartModal = (part: SparePartItem | null) => {
    if (part) {
      setCurrentPart(part)
    } else {
      setCurrentPart({ ...initialPartState, id: `P${Date.now()}` })
    }
    setIsPartModalOpen(true)
  }

  const handleSavePart = () => {
    const existing = jobCard.spareParts.find((p) => p.id === currentPart.id)
    if (existing) {
      setJobCard({
        ...jobCard,
        spareParts: jobCard.spareParts.map((p) =>
          p.id === currentPart.id ? currentPart : p,
        ),
      })
    } else {
      setJobCard({
        ...jobCard,
        spareParts: [...jobCard.spareParts, currentPart],
      })
    }
    setIsPartModalOpen(false)
  }

  const handleDeletePart = (id: string) => {
    setJobCard({
      ...jobCard,
      spareParts: jobCard.spareParts.filter((part) => part.id !== id),
    })
  }

  const handleGenerateInvoice = async () => {
    const jobCardPayload: JobCardIn = {
        booking_id: jobCard.bookingId,
        customer: jobCard.customer,
        phone: jobCard.phone,
        email: jobCard.email,
        vehicle: jobCard.vehicle,
        service: jobCard.service,
        date: jobCard.date,
        time: jobCard.time,
        spareParts: jobCard.spareParts,
        services: jobCard.services,
        notes: jobCard.notes,
        issues: jobCard.issues,
        workers: jobCard.workers,
        photos: jobCard.photos,
        signature: jobCard.signature,
    }

    try {
        await saveJobCardMutation.mutateAsync({ data: jobCardPayload })
        localStorage.setItem("jobCardData", JSON.stringify(jobCard))
        router.push(`/dashboard/invoices?jobCardId=${jobCard.bookingId}`)
    } catch (error) {
        console.error("Failed to save job card", error)
    }
  }

  if (!mounted || !userRole) return null

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !apiBooking) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-destructive">Failed to load booking data.</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Card</h1>
            <p className="text-muted-foreground">Booking ID: {bookingId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p className="text-foreground font-medium">{jobCard.customer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <p className="text-foreground font-medium">{jobCard.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-foreground font-medium">{jobCard.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Vehicle
                </label>
                <p className="text-foreground font-medium">{jobCard.vehicle}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Service
                </label>
                <p className="text-foreground font-medium">{jobCard.service}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Date & Time
                </label>
                <p className="text-foreground font-medium">
                  {jobCard.date} at {jobCard.time}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Notes
                </label>
                <Textarea
                  value={jobCard.notes}
                  onChange={(e) =>
                    setJobCard({ ...jobCard, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Reported Issues</CardTitle>
                <CardDescription>
                  Customer reported issues or diagnostics
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsIssueModalOpen(true)}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Issue
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground">
                {jobCard.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
                {jobCard.issues.length === 0 && (
                  <p className="text-muted-foreground">No issues reported.</p>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Technicians</CardTitle>
                <CardDescription>
                  Workers assigned to this job
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsWorkerModalOpen(true)}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Worker
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {jobCard.workers.length === 0 && <p className="text-sm text-muted-foreground">No workers assigned.</p>}
                {jobCard.workers.map((worker, idx) => (
                  <Badge key={idx} variant="outline" className="text-base">
                    {worker}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Spare Parts</CardTitle>
              <CardDescription>
                Add and manage parts used in this job
              </CardDescription>
            </div>
            <Button
              onClick={() => openPartModal(null)}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Part
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Part Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Qty
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Unit Price
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Tax
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobCard.spareParts.map((part) => {
                    const lineTotal = part.quantity * part.price
                    const taxAmount = lineTotal * (part.taxPercent / 100)
                    const totalWithTax = lineTotal + taxAmount
                    return (
                      <tr
                        key={part.id}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="py-3 px-4 text-sm">{part.name}</td>
                        <td className="py-3 px-4 text-sm">{part.quantity}</td>
                        <td className="py-3 px-4 text-sm">
                          ₹{part.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          ₹{taxAmount.toFixed(2)} ({part.taxPercent}%)
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">
                          ₹{totalWithTax.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPartModal(part)}
                            className="hover:bg-primary/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePart(part.id)}
                            className="hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                   {jobCard.spareParts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-muted-foreground">
                        No parts added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Services</CardTitle>
              <CardDescription>
                Add and manage labor charges for this job
              </CardDescription>
            </div>
            <Button
              onClick={() => openServiceModal(null)}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Cost
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Tax
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobCard.services.map((service) => {
                    const taxAmount = service.cost * (service.taxPercent / 100)
                    const totalWithTax = service.cost + taxAmount
                    return (
                      <tr
                        key={service.id}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="py-3 px-4 text-sm">
                          {service.description}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          ₹{service.cost.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          ₹{taxAmount.toFixed(2)} ({service.taxPercent}%)
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">
                          ₹{totalWithTax.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openServiceModal(service)}
                            className="hover:bg-primary/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                            className="hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {jobCard.services.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-muted-foreground">
                        No services added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Car Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg border-border">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag & drop images here, or click to browse
                </p>
                <Input type="file" multiple className="mt-4" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-40 bg-muted border-dashed border-2 rounded-lg flex items-center justify-center text-muted-foreground">
                <Button
                  variant="outline"
                  onClick={() => setIsSignatureModalOpen(true)}
                >
                  Capture Signature
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-foreground">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Tax:</span>
                <span className="font-medium text-foreground">
                  ₹{totalTax.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-semibold text-foreground">
                  Total Amount:
                </span>
                <span className="text-xl font-bold text-primary">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
            <Button
              onClick={handleGenerateInvoice}
              disabled={saveJobCardMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {saveJobCardMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Save & Generate Invoice
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* --- MODALS --- */}

      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Issue</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="issue">Issue Description</Label>
            <Textarea
              id="issue"
              value={currentIssue}
              onChange={(e) => setCurrentIssue(e.target.value)}
              placeholder="e.g., Check engine light is on"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsIssueModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddIssue}>Add Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isWorkerModalOpen} onOpenChange={setIsWorkerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Additional Worker</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="worker">Worker Name</Label>
            <Input
              id="worker"
              value={currentWorker}
              onChange={(e) => setCurrentWorker(e.target.value)}
              placeholder="e.g., Technician Jane"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsWorkerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddWorker}>Add Worker</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentService.description ? "Edit Service" : "Add New Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-desc">Service Description</Label>
              <Input
                id="service-desc"
                value={currentService.description}
                onChange={(e) =>
                  setCurrentService({
                    ...currentService,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-cost">Cost (₹)</Label>
                <Input
                  id="service-cost"
                  type="number"
                  value={currentService.cost}
                  onChange={(e) =>
                    setCurrentService({
                      ...currentService,
                      cost: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-tax">Tax (%)</Label>
                <Input
                  id="service-tax"
                  type="number"
                  value={currentService.taxPercent}
                  onChange={(e) =>
                    setCurrentService({
                      ...currentService,
                      taxPercent: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsServiceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveService}>Save Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPartModalOpen} onOpenChange={setIsPartModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPart.name ? "Edit Part" : "Add New Part"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="part-name">Part Name</Label>
              <Input
                id="part-name"
                value={currentPart.name}
                onChange={(e) =>
                  setCurrentPart({ ...currentPart, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="part-qty">Quantity</Label>
                <Input
                  id="part-qty"
                  type="number"
                  value={currentPart.quantity}
                  onChange={(e) =>
                    setCurrentPart({
                      ...currentPart,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="part-price">Unit Price (₹)</Label>
                <Input
                  id="part-price"
                  type="number"
                  value={currentPart.price}
                  onChange={(e) =>
                    setCurrentPart({
                      ...currentPart,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="part-tax">Tax (%)</Label>
                <Input
                  id="part-tax"
                  type="number"
                  value={currentPart.taxPercent}
                  onChange={(e) =>
                    setCurrentPart({
                      ...currentPart,
                      taxPercent: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPartModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePart}>Save Part</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Signature</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="w-full h-48 bg-muted border-dashed border-2 rounded-lg flex items-center justify-center text-muted-foreground">
              Signature Pad Placeholder
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSignatureModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsSignatureModalOpen(false)}>
              Save Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}