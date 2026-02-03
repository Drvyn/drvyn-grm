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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, MoreHorizontal, Edit, Trash, Loader2 } from "lucide-react"
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
    taxPercent: 18,
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Services Catalog</h1>
            <p className="text-muted-foreground">Manage service rates, tax codes, and details.</p>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if(!open) resetForm() }}>
            <SheetTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Create Service
              </Button>
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

                <Button onClick={handleSubmit} className="mt-4 w-full bg-primary hover:bg-primary/90">
                  {editingId ? "Save Changes" : "Create Service"}
                </Button>

              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Search Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or code..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Service List</CardTitle>
            <CardDescription>All available services ({filteredServices.length})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Service Name</TableHead>
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Code</TableHead>
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">SAC</TableHead>
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Classification</TableHead>
                      <TableHead className="text-right py-3 px-4 font-medium text-muted-foreground">Rate</TableHead>
                      <TableHead className="text-right py-3 px-4 font-medium text-muted-foreground">Tax %</TableHead>
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
                        <TableRow key={service._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <TableCell className="py-3 px-4 font-medium text-foreground">
                            {service.name}
                            {service.isAdditionalService && (
                              <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Add-on</span>
                            )}
                          </TableCell>
                          <TableCell className="py-3 px-4">{service.code || "-"}</TableCell>
                          <TableCell className="py-3 px-4">{service.sacCode || "-"}</TableCell>
                          <TableCell className="py-3 px-4">{service.classification}</TableCell>
                          <TableCell className="py-3 px-4 text-right">₹{service.rate}</TableCell>
                          <TableCell className="py-3 px-4 text-right">{service.taxPercent}%</TableCell>
                          <TableCell className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(service)}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(service._id)}>
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}