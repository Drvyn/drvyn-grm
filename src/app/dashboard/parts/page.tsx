"use client"

import { useState, useMemo } from "react"
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Edit2, 
  Trash2, 
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { useParts, useSavePart, useDeletePart, Part, PartIn } from "@/hooks/useApi"

interface FormPart {
  name: string
  partNumber: string
  category: string
  quantity: number | ""
  minStock: number | ""
  unitCost: number | ""
  supplier: string
  notes: string
}

export default function PartsPage() {
  const { toast } = useToast()
  
  // --- Data Fetching ---
  const { data: parts = [], isLoading } = useParts()
  const savePartMutation = useSavePart()
  const deletePartMutation = useDeletePart()

  // --- Local State ---
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") 
  
  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormPart>({
    name: "",
    partNumber: "",
    category: "",
    quantity: "", 
    minStock: "", 
    unitCost: "",
    supplier: "",
    notes: "",
  })

  // --- Computed Data ---
  const stats = useMemo(() => {
    return {
      total: parts.length,
      lowStock: parts.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length,
      outOfStock: parts.filter(p => p.quantity === 0).length,
      inStock: parts.filter(p => p.quantity > p.minStock).length
    }
  }, [parts])

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      // 1. Search Filter
      const matchesSearch =
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.category.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      // 2. Status Filter
      switch (statusFilter) {
        case "low-stock":
          return part.quantity > 0 && part.quantity <= part.minStock
        case "out-of-stock":
          return part.quantity === 0
        case "in-stock":
          return part.quantity > part.minStock
        default:
          return true
      }
    })
  }, [parts, searchTerm, statusFilter])

  // --- Handlers ---

  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
      name: "",
      partNumber: "",
      category: "",
      quantity: "",     
      minStock: "",     
      unitCost: "",     
      supplier: "",
      notes: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (part: Part) => {
    setEditingId(part.id || part._id || null)
    setFormData({
      name: part.name,
      partNumber: part.partNumber,
      category: part.category,
      quantity: part.quantity,
      minStock: part.minStock,
      unitCost: part.unitCost,
      supplier: part.supplier || "",
      notes: part.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.partNumber || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Number, Category)",
        variant: "destructive",
      })
      return
    }

    const payload: PartIn = {
      ...formData,
      quantity: formData.quantity === "" ? 0 : Number(formData.quantity),
      minStock: formData.minStock === "" ? 0 : Number(formData.minStock),
      unitCost: formData.unitCost === "" ? 0 : Number(formData.unitCost),
    }

    try {
      await savePartMutation.mutateAsync({ 
        data: payload, 
        id: editingId || undefined 
      })
      setIsDialogOpen(false)
    } catch (error) {
      // Error handled by hook toast
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this part? This action cannot be undone.")) {
      await deletePartMutation.mutateAsync(id)
    }
  }

  // --- UI Helpers ---

  const getStockBadge = (part: Part) => {
    if (part.quantity === 0) {
      return <Badge variant="destructive" className="flex w-fit items-center gap-1"><XCircle className="h-3 w-3" /> Out of Stock</Badge>
    }
    if (part.quantity <= part.minStock) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 flex w-fit items-center gap-1"><AlertTriangle className="h-3 w-3" /> Low Stock</Badge>
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex w-fit items-center gap-1"><CheckCircle2 className="h-3 w-3" /> In Stock</Badge>
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Parts Inventory</h1>
            <p className="text-muted-foreground">Manage stock levels and suppliers</p>
          </div>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Part
          </Button>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col space-y-4">
          
          {/* Status Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[600px] lg:grid-cols-4">
              <TabsTrigger value="all">
                All Parts <span className="ml-2 text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{stats.total}</span>
              </TabsTrigger>
              <TabsTrigger value="in-stock" className="data-[state=active]:text-green-700">
                In Stock <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">{stats.inStock}</span>
              </TabsTrigger>
              <TabsTrigger value="low-stock" className="data-[state=active]:text-yellow-700">
                Low Stock <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">{stats.lowStock}</span>
              </TabsTrigger>
              <TabsTrigger value="out-of-stock" className="data-[state=active]:text-red-700">
                Empty <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{stats.outOfStock}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by part name, number, or category..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Inventory List</CardTitle>
            <CardDescription>
              Showing {filteredParts.length} {statusFilter !== 'all' ? statusFilter.replace('-', ' ') : ''} parts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Item Details</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stock Level</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Unit Cost</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Supplier</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.length > 0 ? (
                    filteredParts.map((part) => (
                      <tr key={part.id || part._id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="font-medium">{part.name}</div>
                          <div className="text-xs text-muted-foreground">{part.partNumber}</div>
                        </td>
                        <td className="p-4 align-middle">{part.category}</td>
                        <td className="p-4 align-middle">
                          {getStockBadge(part)}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{part.quantity}</span>
                            <span className="text-xs text-muted-foreground">/ min {part.minStock}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">₹{part.unitCost}</td>
                        <td className="p-4 align-middle text-muted-foreground">{part.supplier || "-"}</td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(part)}
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(part.id || part._id!)}
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="h-24 text-center text-muted-foreground">
                        No parts found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* --- Add/Edit Part Modal --- */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Part Details" : "Add New Part"}</DialogTitle>
              <DialogDescription>
                Fill in the details below. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Part Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Oil Filter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partNumber">Part Number *</Label>
                  <Input
                    id="partNumber"
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                    placeholder="e.g. OF-2024-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Filters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Supplier Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value === "" ? "" : Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Min Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value === "" ? "" : Number(e.target.value) })}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitCost">Unit Cost (₹)</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    min="0"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value === "" ? "" : Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={savePartMutation.isPending}>
                {savePartMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Update Part" : "Add Part"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}