"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AppProviders"
import { useApi } from "@/hooks/useApi"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Edit, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

type Service = {
  _id: string
  name: string
  code?: string
  barcode?: string
  rate: number
  taxPercent: number
  sacCode?: string
  classification?: string
  isTaxExclusive: boolean
  isAdditionalService: boolean
}

export default function ServicesPage() {
  const { user } = useAuth()
  const api = useApi()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Form State
  const initialFormState = {
    name: "",
    code: "",
    barcode: "",
    rate: 0,
    taxPercent: 18, // Default tax
    sacCode: "",
    classification: "General",
    isTaxExclusive: false,
    isAdditionalService: false
  }
  const [formData, setFormData] = useState<Partial<Service>>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const data = await api.get("/workshop/services")
      setServices(data)
    } catch (error) {
      console.error("Failed to fetch services", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name || formData.rate === undefined) {
        return toast.error("Name and Rate are required")
      }

      if (editingId) {
        await api.put(`/workshop/services/${editingId}`, formData)
        toast.success("Service updated")
      } else {
        await api.post("/workshop/services", formData)
        toast.success("Service created")
      }
      
      setIsSheetOpen(false)
      resetForm()
      fetchServices()
    } catch (error) {
      toast.error("Operation failed")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    try {
      await api.delete(`/workshop/services/${id}`)
      setServices(services.filter(s => s._id !== id))
      toast.success("Service deleted")
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setEditingId(null)
  }

  const handleEdit = (service: Service) => {
    setFormData(service)
    setEditingId(service._id)
    setIsSheetOpen(true)
  }

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services Catalog</h1>
            <p className="text-muted-foreground">Manage service rates, tax codes, and details.</p>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if(!open) resetForm() }}>
            <SheetTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Create Service</Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{editingId ? "Edit Service" : "New Service"}</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                
                <div className="grid gap-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Service Code</Label>
                    <Input id="code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input id="barcode" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rate">Rate (₹) *</Label>
                    {/* Fixed NaN error here */}
                    <Input 
                      id="rate" 
                      type="number" 
                      value={formData.rate} 
                      onChange={e => {
                        const val = e.target.value;
                        setFormData({...formData, rate: val === "" ? 0 : parseFloat(val)})
                      }} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tax">Tax %</Label>
                    {/* Fixed NaN error here */}
                    <Input 
                      id="tax" 
                      type="number" 
                      value={formData.taxPercent} 
                      onChange={e => {
                        const val = e.target.value;
                        setFormData({...formData, taxPercent: val === "" ? 0 : parseFloat(val)})
                      }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sac">SAC Code</Label>
                    <Input id="sac" value={formData.sacCode} onChange={e => setFormData({...formData, sacCode: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="class">Classification</Label>
                     <Select 
                      value={formData.classification} 
                      onValueChange={(v) => setFormData({...formData, classification: v})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Body Shop">Body Shop</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exclusive" className="flex flex-col">
                      <span>Exclusive of Tax</span>
                      <span className="font-normal text-xs text-muted-foreground">Rate does not include tax</span>
                    </Label>
                    <Switch 
                      id="exclusive" 
                      checked={formData.isTaxExclusive} 
                      onCheckedChange={c => setFormData({...formData, isTaxExclusive: c})} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="additional" className="flex flex-col">
                      <span>Is Additional Service</span>
                      <span className="font-normal text-xs text-muted-foreground">Shown as extra on invoice</span>
                    </Label>
                    <Switch 
                      id="additional" 
                      checked={formData.isAdditionalService} 
                      onCheckedChange={c => setFormData({...formData, isAdditionalService: c})} 
                    />
                  </div>
                </div>

                <Button onClick={handleSubmit} className="mt-4 w-full">
                  {editingId ? "Save Changes" : "Create Service"}
                </Button>

              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or code..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>SAC</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Tax %</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No services found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell className="font-medium">
                      {service.name}
                      {service.isAdditionalService && (
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Add-on</span>
                      )}
                    </TableCell>
                    <TableCell>{service.code || "-"}</TableCell>
                    <TableCell>{service.sacCode || "-"}</TableCell>
                    <TableCell>{service.classification}</TableCell>
                    <TableCell className="text-right">₹{service.rate}</TableCell>
                    <TableCell className="text-right">{service.taxPercent}%</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(service)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(service._id)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}