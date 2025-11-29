"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  Plus, 
  Search, 
  Download, 
  Eye, 
  X, 
  Check, 
  Trash2, 
  Loader2,
  ChevronDown 
} from "lucide-react" 
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/AppProviders"
import { useInvoices, useSaveInvoice, useDeleteInvoice, Invoice, InvoiceIn } from "@/hooks/useApi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Interface for JobCard data coming from localStorage (Job Card Page)
interface JobCardData {
  id: string
  bookingId: string
  customer: string
  notes: string
  spareParts: {
    name: string
    quantity: number
    price: number
    taxPercent: number 
  }[]
  services: {
    description: string
    cost: number
    taxPercent: number 
  }[]
}

export default function InvoicesPageWrapper() {
  return <InvoicesPage />
}

function InvoicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams() 
  const { user } = useAuth()

  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<InvoiceIn>({
    jobCardId: "",
    customer: "",
    amount: 0,
    items: [],
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "draft",
    notes: "",
  })

  // --- API Hooks ---
  const { data: invoices = [], isLoading } = useInvoices()
  const saveInvoiceMutation = useSaveInvoice()
  const deleteInvoiceMutation = useDeleteInvoice()

  useEffect(() => {
    setMounted(true)
    if (!user) {
      router.push("/")
      return
    }

    // Check for jobCardId from URL
    const jobCardId = searchParams.get("jobCardId")
    if (jobCardId) {
      const data = localStorage.getItem("jobCardData")
      if (data) {
        try {
          const jobCard: JobCardData = JSON.parse(data)
          
          if (jobCard.bookingId === jobCardId) {
            // Convert Job Card items to Invoice items
            const newItems = [
              ...jobCard.spareParts.map(p => ({
                description: p.name,
                quantity: p.quantity,
                unitPrice: p.price,
              })),
              ...jobCard.services.map(s => ({
                description: s.description,
                quantity: 1,
                unitPrice: s.cost,
              })),
            ]

            const totalAmount = newItems.reduce(
              (sum, item) => sum + item.quantity * item.unitPrice,
              0,
            )

            // Pre-populate the form
            setFormData({
              jobCardId: jobCard.id,
              customer: jobCard.customer,
              amount: totalAmount,
              items: newItems,
              date: new Date().toISOString().split("T")[0],
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              status: "draft",
              notes: jobCard.notes || "Thank you for your business!",
            })

            setShowForm(true) // Show the form
            localStorage.removeItem("jobCardData") // Clean up localStorage
            router.replace("/dashboard/invoices", undefined)
          }
        } catch (error) {
          console.error("Failed to parse job card data", error)
          localStorage.removeItem("jobCardData")
        }
      }
    }

  }, [router, searchParams, user]) 

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.id || invoice._id)?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
      jobCardId: "",
      customer: "",
      amount: 0,
      items: [],
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "draft",
      notes: "",
    })
    setShowForm(true)
  }

  const handleEdit = (invoice: Invoice) => {
    const invId = invoice.id || invoice._id
    if (!invId) return

    setEditingId(invId)
    // Extract editable fields, ignoring db specific fields
    const { id, _id, workshop_id, ...rest } = invoice
    setFormData(rest)
    setShowForm(true)
  }

  const handleSave = () => {
    if (
      !formData.customer ||
      !formData.jobCardId ||
      formData.items.length === 0
    ) {
      alert("Please fill in all required fields and add at least one item")
      return
    }

    const total = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    )
    const updatedFormData = { ...formData, amount: total }

    saveInvoiceMutation.mutate(
      { data: updatedFormData, id: editingId ?? undefined },
      {
        onSuccess: () => {
          setShowForm(false)
          setEditingId(null)
        }
      }
    )
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(id)
    }
  }

  const handleStatusChange = (id: string, newStatus: Invoice["status"]) => {
    // We can reuse the save mutation to update just the status
    // First find the invoice
    const inv = invoices.find(i => (i.id === id || i._id === id))
    if(!inv) return

    const { id: _1, _id: _2, workshop_id, ...invData } = inv
    const updatedData = { ...invData, status: newStatus }

    saveInvoiceMutation.mutate({ data: updatedData, id })
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", quantity: 1, unitPrice: 0 },
      ],
    })
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  if (!mounted || !user) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
      case "sent": return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
      case "paid": return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
      case "overdue": return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
      default: return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
            <p className="text-muted-foreground">Manage your invoices and payments</p>
          </div>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Invoice Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm p-4 flex items-center justify-center">
          <Card className="border-primary/50 bg-card w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>
                {editingId ? "Edit Invoice" : "Create New Invoice"}
              </CardTitle>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Card ID *</label>
                  <Input
                    value={formData.jobCardId}
                    onChange={(e) =>
                      setFormData({ ...formData, jobCardId: e.target.value })
                    }
                    placeholder="e.g., JC001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Name *</label>
                  <Input
                    value={formData.customer}
                    onChange={(e) =>
                      setFormData({ ...formData, customer: e.target.value })
                    }
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Invoice Items *</h3>
                  <Button onClick={handleAddItem} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...formData.items]
                          newItems[idx].description = e.target.value
                          setFormData({ ...formData, items: newItems })
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...formData.items]
                          newItems[idx].quantity =
                            Number.parseFloat(e.target.value) || 0
                          setFormData({ ...formData, items: newItems })
                        }}
                        className="w-20"
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const newItems = [...formData.items]
                          newItems[idx].unitPrice =
                            Number.parseFloat(e.target.value) || 0
                          setFormData({ ...formData, items: newItems })
                        }}
                        className="w-24"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(idx)}
                        className="hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="text-lg font-bold flex items-center gap-1">
                      ₹
                      {formData.items
                        .reduce(
                          (sum, item) => sum + item.quantity * item.unitPrice,
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Invoice["status"],
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Add any additional notes..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" disabled={saveInvoiceMutation.isPending}>
                  {saveInvoiceMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Save Invoice
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number or customer..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
            <CardDescription>
              All invoices and payment status ({filteredInvoices.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Invoice ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => {
                      const invId = invoice.id || invoice._id || ""
                      return (
                      <tr
                        key={invId}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-foreground">
                          {invId.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {invoice.customer}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground flex items-center gap-1">
                          ₹{invoice.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {invoice.date}
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {invoice.dueDate}
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className={`inline-flex items-center justify-between w-[100px] px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${getStatusColor(invoice.status)}`}
                              >
                                <span className="capitalize truncate">{invoice.status}</span>
                                <ChevronDown className="w-3 h-3 ml-2 opacity-70 shrink-0" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[100px]">
                              {["draft", "sent", "paid", "overdue"].map((st) => (
                                <DropdownMenuItem
                                  key={st}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(invId, st as Invoice["status"])
                                  }}
                                  className="capitalize cursor-pointer text-xs py-2"
                                >
                                  {st}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(invoice)}
                            className="hover:bg-primary/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invId)}
                            className="hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    )})
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No invoices found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}