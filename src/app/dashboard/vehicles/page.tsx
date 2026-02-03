"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/hooks/useApi"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash, Search, User, Fuel, Gauge, Settings2, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Slider } from "@/components/ui/slider" 

// --- Types ---
type Vehicle = {
  _id: string
  carNumber: string
  make: string
  model: string
  makeYear?: string
  color?: string
  vinNumber?: string
  engineNumber?: string
  fuelType?: string
  transmissionType?: string
  odometer?: string
  fuelLevel?: number
  customerName?: string
  customerPhone?: string
}

export default function VehiclesPage() {
  const api = useApi()
  
  // --- State ---
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  
  // Form State
  const initialForm = {
    carNumber: "",
    make: "",
    model: "",
    makeYear: "",
    color: "",
    vinNumber: "",
    engineNumber: "",
    fuelType: "Petrol",
    transmissionType: "Manual",
    odometer: "",
    fuelLevel: 50,
    customerName: "",
    customerPhone: ""
  }
  const [formData, setFormData] = useState(initialForm)

  // --- Effects ---
  useEffect(() => {
    fetchVehicles()
  }, [])

  // --- Handlers ---
  const fetchVehicles = async () => {
    try {
      const data = await api.get("/workshop/vehicles")
      setVehicles(data)
    } catch (error) {
      console.error("Failed to load vehicles", error)
    }
  }

  const handleImport = async () => {
    if(!confirm("This will scan all your Job Cards and add any missing vehicles to this list. Continue?")) return
    
    setIsImporting(true)
    try {
      const res = await api.post("/workshop/vehicles/import-from-jobcards", {})
      toast.success(`Imported ${res.added} new vehicles! (Skipped ${res.skipped} existing)`)
      fetchVehicles() // Refresh list
    } catch (error) {
      toast.error("Import failed")
      console.error(error)
    } finally {
      setIsImporting(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.carNumber || !formData.make) {
        return toast.error("Reg Number and Make are required")
      }
      
      await api.post("/workshop/vehicles", formData)
      
      toast.success("Vehicle saved")
      setIsDialogOpen(false)
      setFormData(initialForm)
      fetchVehicles()
    } catch (error) {
      toast.error("Failed to save vehicle")
    }
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this vehicle?")) return
    try {
      await api.delete(`/workshop/vehicles/${id}`)
      setVehicles(vehicles.filter(v => v._id !== id))
      toast.success("Vehicle deleted")
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  // --- Filtering ---
  const filtered = vehicles.filter(v => 
    v.carNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.vinNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // --- Render ---
  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vehicles</h1>
            <p className="text-muted-foreground">Manage fleet and customer vehicle specifications.</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleImport} disabled={isImporting}>
               {isImporting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
               {isImporting ? "Importing..." : "Import from Job Cards"}
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Vehicle Details</DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  {/* 1. Identification */}
                  <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <User className="w-4 h-4" /> Identification
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                              <Label>Reg Number *</Label>
                              <Input 
                                  placeholder="e.g. DL10CA1234" 
                                  value={formData.carNumber} 
                                  onChange={e => setFormData({...formData, carNumber: e.target.value.toUpperCase()})} 
                              />
                          </div>
                          <div className="grid gap-2">
                              <Label>Year</Label>
                              <Input 
                                  type="number" 
                                  placeholder="YYYY"
                                  value={formData.makeYear} 
                                  onChange={e => setFormData({...formData, makeYear: e.target.value})} 
                              />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                              <Label>Make (Brand)</Label>
                              <Input placeholder="Honda" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                              <Label>Model</Label>
                              <Input placeholder="City" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                          </div>
                      </div>
                  </div>

                  {/* 2. Technical Specs */}
                  <div className="space-y-4 pt-2 border-t">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Settings2 className="w-4 h-4" /> Technical Specs
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                              <Label>VIN / Chassis No</Label>
                              <Input value={formData.vinNumber} onChange={e => setFormData({...formData, vinNumber: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                              <Label>Engine No</Label>
                              <Input value={formData.engineNumber} onChange={e => setFormData({...formData, engineNumber: e.target.value})} />
                          </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                          <div className="grid gap-2">
                              <Label>Color</Label>
                              <Input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                              <Label>Fuel Type</Label>
                              <Select value={formData.fuelType} onValueChange={v => setFormData({...formData, fuelType: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Petrol">Petrol</SelectItem>
                                  <SelectItem value="Diesel">Diesel</SelectItem>
                                  <SelectItem value="CNG">CNG</SelectItem>
                                  <SelectItem value="Electric">Electric</SelectItem>
                                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                              </SelectContent>
                              </Select>
                          </div>
                          <div className="grid gap-2">
                              <Label>Transmission</Label>
                              <Select value={formData.transmissionType} onValueChange={v => setFormData({...formData, transmissionType: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Manual">Manual</SelectItem>
                                  <SelectItem value="Automatic">Automatic</SelectItem>
                                  <SelectItem value="CVT">CVT</SelectItem>
                                  <SelectItem value="DCT">DCT</SelectItem>
                              </SelectContent>
                              </Select>
                          </div>
                      </div>
                  </div>

                  {/* 3. Status & Owner */}
                  <div className="space-y-4 pt-2 border-t">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Gauge className="w-4 h-4" /> Status & Owner
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                          <div className="grid gap-2">
                              <Label>Odometer (KM)</Label>
                              <div className="relative">
                                  <Gauge className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                      className="pl-9" 
                                      type="number" 
                                      value={formData.odometer} 
                                      onChange={e => setFormData({...formData, odometer: e.target.value})} 
                                  />
                              </div>
                          </div>
                          <div className="grid gap-2">
                              <div className="flex justify-between">
                                  <Label>Fuel Level</Label>
                                  <span className="text-xs text-muted-foreground">{formData.fuelLevel}%</span>
                              </div>
                              <Slider 
                                  value={[formData.fuelLevel || 50]} 
                                  max={100} 
                                  step={5}
                                  onValueChange={(v) => setFormData({...formData, fuelLevel: v[0]})}
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                              <Label>Customer Name</Label>
                              <Input value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                              <Label>Phone</Label>
                              <Input value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
                          </div>
                      </div>
                  </div>

                  <Button onClick={handleSubmit} className="w-full mt-4 bg-primary hover:bg-primary/90">Save Vehicle</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Search Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
               <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search Reg No, VIN, or Customer..." 
                    className="pl-10" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                />
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
            <CardHeader>
                <CardTitle>Vehicle List</CardTitle>
                <CardDescription>All registered vehicles ({filtered.length})</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border">
                        <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Vehicle Info</TableHead>
                        <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Specs</TableHead>
                        <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Status</TableHead>
                        <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Owner</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {isImporting ? "Scanning Job Cards..." : "No vehicles found."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((v) => (
                          <TableRow key={v._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <TableCell className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-base uppercase text-foreground">{v.carNumber}</span>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <span>{v.make} {v.model}</span>
                                    {v.makeYear && <span>• {v.makeYear}</span>}
                                </div>
                                {v.vinNumber && <span className="text-[10px] text-muted-foreground/80">VIN: {v.vinNumber}</span>}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="flex flex-col gap-1 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-muted text-foreground border capitalize">{v.fuelType || '-'}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-muted text-foreground border capitalize">{v.transmissionType || '-'}</span>
                                  </div>
                                  {v.engineNumber && <span className="text-[10px] text-muted-foreground">Eng: {v.engineNumber}</span>}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                                <div className="space-y-1">
                                    {v.odometer && (
                                        <div className="flex items-center gap-1 text-xs text-foreground">
                                            <Gauge className="h-3 w-3" /> {v.odometer} km
                                        </div>
                                    )}
                                    {v.fuelLevel !== undefined && (
                                        <div className="flex items-center gap-1 text-xs text-foreground">
                                            <Fuel className="h-3 w-3" /> {v.fuelLevel}%
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              {v.customerName ? (
                                <div className="flex flex-col text-sm text-foreground">
                                   <div className="flex items-center gap-2">
                                      <User className="h-3 w-3 text-muted-foreground" />
                                      <span>{v.customerName}</span>
                                   </div>
                                   <span className="text-xs text-muted-foreground pl-5">{v.customerPhone}</span>
                                </div>
                              ) : <span className="text-muted-foreground text-xs">-</span>}
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(v._id)} className="hover:bg-destructive/10">
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}