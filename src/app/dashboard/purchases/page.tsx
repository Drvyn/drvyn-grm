"use client"

import { useState, useMemo } from "react"
import { 
  Plus, 
  Search, 
  Loader2, 
  Save,
  ShoppingBag,
  ChevronsUpDown,
  Check
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { useJobCards } from "@/hooks/useApi" 
import { cn } from "@/lib/utils"

interface PurchaseForm {
  itemName: string
  quantity: number | ""
  totalCost: number | ""
  supplier: string
  jobCardId: string
  invoiceNumber: string
  remarks: string
  purchaseDate: string
}

export default function PurchasesPage() {
  const { toast } = useToast()
  
  // --- Data Fetching ---
  const { data: jobCards = [], isLoading: jobsLoading } = useJobCards()

  // --- Computed: Active Job Cards ---
  const activeJobCards = useMemo(() => {
    return jobCards.filter(j => {
      const status = (j.status || "").toLowerCase()
      // Show only jobs that are NOT completed and NOT cancelled
      return status !== 'completed' && status !== 'cancelled'
    })
  }, [jobCards])

  // --- State ---
  const [searchTerm, setSearchTerm] = useState("")
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openJobSelect, setOpenJobSelect] = useState(false)

  const [formData, setFormData] = useState<PurchaseForm>({
    itemName: "",
    quantity: "",
    totalCost: "",
    supplier: "",
    jobCardId: "",
    invoiceNumber: "",
    remarks: "",
    purchaseDate: new Date().toISOString().split('T')[0]
  })

  // --- Handlers ---

  const handleOpenPurchase = () => {
    setFormData({
        itemName: "",
        quantity: "",
        totalCost: "",
        supplier: "",
        jobCardId: "",
        invoiceNumber: "",
        remarks: "",
        purchaseDate: new Date().toISOString().split('T')[0]
    })
    setIsPurchaseOpen(true)
  }

  const handleSavePurchase = async () => {
    if (!formData.itemName || formData.quantity === "" || formData.totalCost === "") {
       toast({ 
         title: "Validation Error", 
         description: "Please fill in Item Name, Quantity, and Total Cost.", 
         variant: "destructive" 
       })
       return
    }

    setIsSubmitting(true)

    // Simulate Backend Save
    setTimeout(() => {
      console.log("Saving Purchase Data to Backend:", formData)
      
      toast({
        title: "Purchase Recorded",
        description: `Successfully saved record for ${formData.itemName}.`,
      })
      
      setIsSubmitting(false)
      setIsPurchaseOpen(false)
    }, 1000)
  }

  // Helper to safely get ID
  const getJobId = (job: any) => job.id || job._id || ""

  // Helper to find selected job object
  const selectedJob = useMemo(() => {
    return activeJobCards.find(j => getJobId(j) === formData.jobCardId)
  }, [activeJobCards, formData.jobCardId])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
            <p className="text-muted-foreground">Record stock purchases and view history</p>
          </div>
          <Button onClick={handleOpenPurchase} className="bg-primary hover:bg-primary/90 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Purchase
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search purchase history by invoice, supplier, or item name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* History Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>History of stock additions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-12 text-center text-muted-foreground bg-muted/5">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-background rounded-full border shadow-sm">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                </div>
                <h3 className="font-medium text-lg text-foreground">No purchases found</h3>
                <p className="mb-1">Purchase history records will appear here.</p>
                 </div>
          </CardContent>
        </Card>

        {/* --- New Purchase Modal --- */}
        <Dialog open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>New Purchase Entry</DialogTitle>
              <DialogDescription>
                Enter the details for the new purchase.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
               {/* Row 1: Item Name & Supplier */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name *</Label>
                    <Input
                      id="itemName"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      placeholder="e.g. Office Stationery"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="p-supplier">Supplier</Label>
                    <Input
                      id="p-supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="Supplier Name"
                    />
                  </div>
               </div>

               {/* Row 2: Qty, Cost, Date */}
               <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2">
                      <Label htmlFor="p-qty">Quantity *</Label>
                      <Input
                        id="p-qty"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value === "" ? "" : Number(e.target.value) })}
                        placeholder="0"
                      />
                   </div>
                   <div className="space-y-2">
                      <Label htmlFor="p-cost">Total Cost (₹) *</Label>
                      <Input
                        id="p-cost"
                        type="number"
                        min="0"
                        value={formData.totalCost}
                        onChange={(e) => setFormData({ ...formData, totalCost: e.target.value === "" ? "" : Number(e.target.value) })}
                        placeholder="0.00"
                      />
                   </div>
                   <div className="space-y-2">
                      <Label htmlFor="p-date">Purchase Date</Label>
                      <div className="relative">
                        <Input
                          id="p-date"
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                        />
                      </div>
                   </div>
               </div>

               {/* Row 3: Job Order Selection (Combobox) */}
               <div className="space-y-2 flex flex-col">
                  <Label>Job Order (Optional)</Label>
                  <Popover open={openJobSelect} onOpenChange={setOpenJobSelect} modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openJobSelect}
                        className="w-full justify-between text-muted-foreground"
                        disabled={jobsLoading}
                      >
                        {jobsLoading ? (
                           <span className="flex items-center gap-2">
                             <Loader2 className="h-4 w-4 animate-spin" /> Loading jobs...
                           </span>
                        ) : selectedJob ? (
                           <span className="text-foreground">
                             #{getJobId(selectedJob).slice(-6)} - {selectedJob.vehicle}
                           </span>
                        ) : (
                           "Select active job order..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search job #, vehicle, customer..." />
                        <CommandList>
                          <CommandEmpty>No active job order found.</CommandEmpty>
                          <CommandGroup heading="Active Jobs">
                            {activeJobCards.map((job) => {
                                const id = getJobId(job)
                                const searchString = `${id} ${job.vehicle} ${job.customer}`.toLowerCase()
                                
                                return (
                                    <CommandItem
                                      key={id}
                                      value={searchString} // Passing unique search string
                                      onSelect={() => {
                                        setFormData({ ...formData, jobCardId: id === formData.jobCardId ? "" : id })
                                        setOpenJobSelect(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.jobCardId === id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">#{id.slice(-6)}</span>
                                            <span className="text-muted-foreground">-</span>
                                            <span className="font-medium">{job.vehicle}</span>
                                          </div>
                                          <span className="text-xs text-muted-foreground">{job.customer} • {job.service}</span>
                                      </div>
                                    </CommandItem>
                                )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
               </div>

               {/* Row 4: Invoice & Remarks */}
               <div className="space-y-2">
                  <Label htmlFor="p-invoice">Invoice Number</Label>
                  <Input
                    id="p-invoice"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="e.g. INV-998877"
                  />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="p-remarks">Remarks</Label>
                  <Textarea
                    id="p-remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Details about purchase..."
                    rows={2}
                    className="resize-none"
                  />
               </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPurchaseOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePurchase} disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Save Record
                    </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}