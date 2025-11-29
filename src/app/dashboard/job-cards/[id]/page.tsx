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
  Save,
  X
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
import { useJobCard, useSaveJobCard, JobCardIn, SparePartItem, ServiceItem } from "@/hooks/useApi"

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

export default function JobCardDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobCardId = params.id as string

  const [mounted, setMounted] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState<JobCardIn | null>(null)

  // Modals State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isPartModalOpen, setIsPartModalOpen] = useState(false)
  
  // Temporary State for Modal Inputs
  const [currentIssue, setCurrentIssue] = useState("")
  const [currentWorker, setCurrentWorker] = useState("")
  const [currentService, setCurrentService] = useState<ServiceItem>(initialServiceState)
  const [currentPart, setCurrentPart] = useState<SparePartItem>(initialPartState)

  // API Hooks
  const { data: apiJobCard, isLoading, isError } = useJobCard(jobCardId)
  const saveJobCardMutation = useSaveJobCard()

  useEffect(() => {
    setMounted(true)
    if (apiJobCard) {
      // Destructure to remove DB specific fields for editing
      const { id, _id, workshop_id, ...rest } = apiJobCard
      setFormData(rest)
    }
  }, [apiJobCard])

  if (!mounted) return null

  // --- Handlers for Main Fields ---
  const handleFieldChange = (field: keyof JobCardIn, value: any) => {
    if(formData) {
        setFormData({ ...formData, [field]: value })
    }
  }

  // --- Handlers for Arrays (Issues, Workers) ---
  const handleAddIssue = () => {
    if (currentIssue.trim() && formData) {
      setFormData({ ...formData, issues: [...formData.issues, currentIssue.trim()] })
      setCurrentIssue("")
      setIsIssueModalOpen(false)
    }
  }

  const handleDeleteIssue = (index: number) => {
    if(formData) {
        const newIssues = [...formData.issues]
        newIssues.splice(index, 1)
        setFormData({ ...formData, issues: newIssues })
    }
  }

  const handleAddWorker = () => {
    if (currentWorker.trim() && formData) {
      setFormData({ ...formData, workers: [...formData.workers, currentWorker.trim()] })
      setCurrentWorker("")
      setIsWorkerModalOpen(false)
    }
  }

  const handleDeleteWorker = (index: number) => {
    if(formData) {
        const newWorkers = [...formData.workers]
        newWorkers.splice(index, 1)
        setFormData({ ...formData, workers: newWorkers })
    }
  }

  // --- Handlers for Services ---
  const openServiceModal = (service: ServiceItem | null) => {
    if (service) {
      setCurrentService(service)
    } else {
      setCurrentService({ ...initialServiceState, id: `S${Date.now()}` })
    }
    setIsServiceModalOpen(true)
  }

  const handleSaveService = () => {
    if(!formData) return
    const existingIndex = formData.services.findIndex(s => s.id === currentService.id)
    let newServices = [...formData.services]
    
    if (existingIndex >= 0) {
      newServices[existingIndex] = currentService
    } else {
      newServices.push(currentService)
    }
    setFormData({ ...formData, services: newServices })
    setIsServiceModalOpen(false)
  }

  const handleDeleteService = (id: string) => {
    if(formData) {
        setFormData({ ...formData, services: formData.services.filter(s => s.id !== id) })
    }
  }

  // --- Handlers for Parts ---
  const openPartModal = (part: SparePartItem | null) => {
    if (part) {
      setCurrentPart(part)
    } else {
      setCurrentPart({ ...initialPartState, id: `P${Date.now()}` })
    }
    setIsPartModalOpen(true)
  }

  const handleSavePart = () => {
    if(!formData) return
    const existingIndex = formData.spareParts.findIndex(p => p.id === currentPart.id)
    let newParts = [...formData.spareParts]
    
    if (existingIndex >= 0) {
        newParts[existingIndex] = currentPart
    } else {
        newParts.push(currentPart)
    }
    setFormData({ ...formData, spareParts: newParts })
    setIsPartModalOpen(false)
  }

  const handleDeletePart = (id: string) => {
    if(formData) {
        setFormData({ ...formData, spareParts: formData.spareParts.filter(p => p.id !== id) })
    }
  }

  // --- Save Entire Job Card ---
  const handleSaveChanges = async () => {
    if (!formData) return
    saveJobCardMutation.mutate({ data: formData, id: jobCardId })
  }

  const handleGenerateInvoice = () => {
    if(!formData) return
    // Save current state to local storage to pass to Invoice page
    const invoiceData = {
        id: jobCardId,
        bookingId: jobCardId,
        customer: formData.customer,
        notes: formData.notes || "",
        spareParts: formData.spareParts,
        services: formData.services
    }
    localStorage.setItem("jobCardData", JSON.stringify(invoiceData))
    router.push(`/dashboard/invoices?jobCardId=${jobCardId}`)
  }

  // --- Calculations ---
  const partsSubtotal = formData?.spareParts.reduce((sum, p) => sum + p.quantity * p.price, 0) || 0
  const servicesSubtotal = formData?.services.reduce((sum, s) => sum + s.cost, 0) || 0
  const subtotal = partsSubtotal + servicesSubtotal
  
  const partsTax = formData?.spareParts.reduce((sum, p) => sum + (p.quantity * p.price * (p.taxPercent / 100)), 0) || 0
  const servicesTax = formData?.services.reduce((sum, s) => sum + (s.cost * (s.taxPercent / 100)), 0) || 0
  const totalTax = partsTax + servicesTax
  const grandTotal = subtotal + totalTax

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !formData) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
          <p className="text-destructive font-medium">Failed to load Job Card.</p>
          <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* HEADER ACTIONS
          - Added negative margins (-mt, -mx) to pull it up into the layout padding 
          - Added padding (px) to re-align inner content
          - Solid background to prevent overlap
        */}
        <div className="flex items-center justify-between sticky top fixed bg-[#f8f9fa] z-30 py-4 border-b border-border/50 shadow-sm -mt-4 -mx-4 md:-mt-8 md:-mx-8 px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-muted">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Job Card <span className="text-primary px-1">{jobCardId.slice(-6).toUpperCase()}</span>
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={handleGenerateInvoice}>
                <FileText className="w-4 h-4 mr-2" /> Generate Invoice
             </Button>
             <Button onClick={handleSaveChanges} disabled={saveJobCardMutation.isPending} className="bg-primary hover:bg-primary/90">
                {saveJobCardMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
             </Button>
          </div>
        </div>

        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Customer & Vehicle</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Customer Name</Label>
                    <Input value={formData.customer} onChange={(e) => handleFieldChange("customer", e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={formData.phone || ""} onChange={(e) => handleFieldChange("phone", e.target.value)} placeholder="Phone number" />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={formData.email || ""} onChange={(e) => handleFieldChange("email", e.target.value)} placeholder="Email address" />
                </div>
                <div className="space-y-2">
                    <Label>Vehicle Details</Label>
                    <Input value={formData.vehicle} onChange={(e) => handleFieldChange("vehicle", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Service Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Input value={formData.service} onChange={(e) => handleFieldChange("service", e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Booking ID</Label>
                    <Input value={formData.booking_id} onChange={(e) => handleFieldChange("booking_id", e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={formData.date} onChange={(e) => handleFieldChange("date", e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={formData.time} onChange={(e) => handleFieldChange("time", e.target.value)} />
                </div>
                <div className="col-span-2 space-y-2">
                    <Label>Internal Notes</Label>
                    <Textarea 
                        value={formData.notes || ""} 
                        onChange={(e) => handleFieldChange("notes", e.target.value)} 
                        rows={2}
                        placeholder="Notes for mechanics..."
                    />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issues & Workers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Reported Issues</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setIsIssueModalOpen(true)}><Plus className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
                {formData.issues.length === 0 ? <p className="text-sm text-muted-foreground italic">No issues reported</p> : (
                    <ul className="space-y-2">
                        {formData.issues.map((issue, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-muted/30 p-2 rounded text-sm">
                                <span>{issue}</span>
                                <button onClick={() => handleDeleteIssue(idx)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 className="w-3 h-3" /></button>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Assigned Workers</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setIsWorkerModalOpen(true)}><UserPlus className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {formData.workers.length === 0 && <p className="text-sm text-muted-foreground italic">No workers assigned</p>}
                    {formData.workers.map((worker, idx) => (
                        <Badge key={idx} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                            {worker}
                            <button onClick={() => handleDeleteWorker(idx)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                        </Badge>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Parts Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
                <CardTitle className="text-base">Spare Parts</CardTitle>
                <CardDescription>Parts consumed for this job</CardDescription>
            </div>
            <Button size="sm" onClick={() => openPartModal(null)}><Plus className="w-4 h-4 mr-2" />Add Part</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border text-muted-foreground">
                            <th className="text-left py-2 px-2">Part Name</th>
                            <th className="text-center py-2 px-2">Qty</th>
                            <th className="text-right py-2 px-2">Unit Price</th>
                            <th className="text-right py-2 px-2">Tax</th>
                            <th className="text-right py-2 px-2">Total</th>
                            <th className="text-right py-2 px-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.spareParts.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-4 text-muted-foreground">No parts added</td></tr>
                        ) : formData.spareParts.map((part) => {
                            const lineTotal = part.quantity * part.price
                            const tax = lineTotal * (part.taxPercent / 100)
                            return (
                                <tr key={part.id} className="border-b border-border/50">
                                    <td className="py-3 px-2 font-medium">{part.name}</td>
                                    <td className="text-center py-3 px-2">{part.quantity}</td>
                                    <td className="text-right py-3 px-2">₹{part.price}</td>
                                    <td className="text-right py-3 px-2">{part.taxPercent}%</td>
                                    <td className="text-right py-3 px-2 font-bold">₹{(lineTotal + tax).toFixed(2)}</td>
                                    <td className="text-right py-3 px-2">
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openPartModal(part)}><Edit2 className="w-3 h-3" /></Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeletePart(part.id)}><Trash2 className="w-3 h-3" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
                <CardTitle className="text-base">Services & Labor</CardTitle>
                <CardDescription>Labor charges and services applied</CardDescription>
            </div>
            <Button size="sm" onClick={() => openServiceModal(null)}><Plus className="w-4 h-4 mr-2" />Add Service</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border text-muted-foreground">
                            <th className="text-left py-2 px-2">Description</th>
                            <th className="text-right py-2 px-2">Cost</th>
                            <th className="text-right py-2 px-2">Tax</th>
                            <th className="text-right py-2 px-2">Total</th>
                            <th className="text-right py-2 px-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.services.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-4 text-muted-foreground">No services added</td></tr>
                        ) : formData.services.map((service) => {
                            const tax = service.cost * (service.taxPercent / 100)
                            return (
                                <tr key={service.id} className="border-b border-border/50">
                                    <td className="py-3 px-2 font-medium">{service.description}</td>
                                    <td className="text-right py-3 px-2">₹{service.cost}</td>
                                    <td className="text-right py-3 px-2">{service.taxPercent}%</td>
                                    <td className="text-right py-3 px-2 font-bold">₹{(service.cost + tax).toFixed(2)}</td>
                                    <td className="text-right py-3 px-2">
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openServiceModal(service)}><Edit2 className="w-3 h-3" /></Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteService(service.id)}><Trash2 className="w-3 h-3" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Footer */}
        <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Subtotal: ₹{subtotal.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Total Tax: ₹{totalTax.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-foreground uppercase tracking-wide">Grand Total</p>
                        <p className="text-3xl font-bold text-primary">₹{grandTotal.toFixed(2)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

      </div>

      {/* --- MODALS --- */}

      {/* 1. Add Issue Modal */}
      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Reported Issue</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label>Issue Description</Label>
            <Input value={currentIssue} onChange={(e) => setCurrentIssue(e.target.value)} placeholder="e.g., Strange noise from engine" className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIssueModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddIssue}>Add Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Add Worker Modal */}
      <Dialog open={isWorkerModalOpen} onOpenChange={setIsWorkerModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Worker</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label>Worker Name</Label>
            <Input value={currentWorker} onChange={(e) => setCurrentWorker(e.target.value)} placeholder="e.g., Technician Dave" className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWorkerModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddWorker}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Add/Edit Service Modal */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentService.description ? "Edit Service" : "Add Service"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
                <Label>Description</Label>
                <Input value={currentService.description} onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Cost (₹)</Label>
                    <Input 
                        type="number" 
                        value={currentService.cost || ""} 
                        onChange={(e) => setCurrentService({ ...currentService, cost: parseFloat(e.target.value) || 0 })} 
                        placeholder="0"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Tax (%)</Label>
                    <Input 
                        type="number" 
                        value={currentService.taxPercent || ""} 
                        onChange={(e) => setCurrentService({ ...currentService, taxPercent: parseFloat(e.target.value) || 0 })} 
                        placeholder="0"
                    />
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServiceModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveService}>Save Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Add/Edit Part Modal */}
      <Dialog open={isPartModalOpen} onOpenChange={setIsPartModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentPart.name ? "Edit Part" : "Add Part"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
                <Label>Part Name</Label>
                <Input value={currentPart.name} onChange={(e) => setCurrentPart({ ...currentPart, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={currentPart.quantity || ""} onChange={(e) => setCurrentPart({ ...currentPart, quantity: parseInt(e.target.value) || 0 })} placeholder="1" />
                </div>
                <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" value={currentPart.price || ""} onChange={(e) => setCurrentPart({ ...currentPart, price: parseFloat(e.target.value) || 0 })} placeholder="0" />
                </div>
                <div className="space-y-2">
                    <Label>Tax (%)</Label>
                    <Input type="number" value={currentPart.taxPercent || ""} onChange={(e) => setCurrentPart({ ...currentPart, taxPercent: parseFloat(e.target.value) || 0 })} placeholder="0" />
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPartModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePart}>Save Part</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  )
}