"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Package, AlertCircle, Edit2, Trash2, X, Check } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface Part {
  id: string
  name: string
  partNumber: string
  category: string
  quantity: number
  minStock: number
  unitCost: number
  supplier: string
  notes: string
}

const initialParts: Part[] = [
  {
    id: "P001",
    name: "Oil Filter",
    partNumber: "OF-2024-001",
    category: "Filters",
    quantity: 45,
    minStock: 10,
    unitCost: 15,
    supplier: "Auto Parts Co",
    notes: "Standard oil filter",
  },
  {
    id: "P002",
    name: "Brake Pads",
    partNumber: "BP-2024-001",
    category: "Brakes",
    quantity: 8,
    minStock: 15,
    unitCost: 80,
    supplier: "Brake Specialists",
    notes: "Front brake pads",
  },
  {
    id: "P003",
    name: "Air Filter",
    partNumber: "AF-2024-001",
    category: "Filters",
    quantity: 32,
    minStock: 10,
    unitCost: 25,
    supplier: "Auto Parts Co",
    notes: "Engine air filter",
  },
  {
    id: "P004",
    name: "Battery",
    partNumber: "BAT-2024-001",
    category: "Electrical",
    quantity: 5,
    minStock: 5,
    unitCost: 120,
    supplier: "Battery Plus",
    notes: "12V car battery",
  },
]

export default function PartsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"admin" | "workshop" | null>(null)
  const [mounted, setMounted] = useState(false)
  const [parts, setParts] = useState<Part[]>(initialParts)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Part>({
    id: "",
    name: "",
    partNumber: "",
    category: "",
    quantity: 0,
    minStock: 0,
    unitCost: 0,
    supplier: "",
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

  const filteredParts = parts.filter(
    (part) =>
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lowStockParts = parts.filter((p) => p.quantity <= p.minStock)

  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
      id: `P${String(parts.length + 1).padStart(3, "0")}`,
      name: "",
      partNumber: "",
      category: "",
      quantity: 0,
      minStock: 0,
      unitCost: 0,
      supplier: "",
      notes: "",
    })
    setShowForm(true)
  }

  const handleEdit = (part: Part) => {
    setEditingId(part.id)
    setFormData(part)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.partNumber || !formData.category) {
      alert("Please fill in all required fields")
      return
    }

    if (editingId) {
      setParts(parts.map((p) => (p.id === editingId ? formData : p)))
    } else {
      setParts([...parts, formData])
    }

    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this part?")) {
      setParts(parts.filter((p) => p.id !== id))
    }
  }

  if (!mounted || !userRole) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Parts Inventory</h1>
            <p className="text-muted-foreground">Manage your parts and inventory</p>
          </div>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Part
          </Button>
        </div>

        {/* Low Stock Alert */}
        {lowStockParts.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockParts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{part.name}</span>
                    <span className="text-destructive font-medium">
                      {part.quantity} / {part.minStock} units
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parts Form Modal */}
        {showForm && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>{editingId ? "Edit Part" : "Add New Part"}</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Part Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Oil Filter"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Part Number *</label>
                  <Input
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                    placeholder="e.g., OF-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Filters, Brakes"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Stock</label>
                  <Input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number.parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit Cost ($)</label>
                  <Input
                    type="number"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Supplier</label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Supplier name"
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
                  Save Part
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
            <CardTitle>Search Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, part number, or category..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Parts Inventory</CardTitle>
            <CardDescription>All parts and stock levels ({filteredParts.length})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Part Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Part Number</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Unit Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.length > 0 ? (
                    filteredParts.map((part) => (
                      <tr key={part.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-foreground">{part.name}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{part.partNumber}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{part.category}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              part.quantity <= part.minStock
                                ? "bg-destructive/10 text-destructive"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            <Package className="w-3 h-3 mr-1" />
                            {part.quantity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground font-medium">${part.unitCost}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{part.supplier}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(part)}
                            className="hover:bg-primary/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(part.id)}
                            className="hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No parts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
