"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AppProviders"
import { useApi } from "@/hooks/useApi"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

type ExpenseItem = {
  description: string
  amount: number
}

type Expense = {
  _id: string
  expense_type: string
  supplier: string
  items: ExpenseItem[]
  remark?: string
  created_at: string
}

export default function ExpensesPage() {
  const { user } = useAuth()
  const api = useApi()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Form State
  const initialForm = {
    expense_type: "",
    supplier: "",
    items: [{ description: "", amount: 0 }],
    remark: "",
    created_at: new Date().toISOString().split('T')[0]
  }
  const [formData, setFormData] = useState(initialForm)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const data = await api.get("/workshop/expenses")
      setExpenses(data)
    } catch (error) {
      console.error("Failed to fetch expenses", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", amount: 0 }]
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleItemChange = (index: number, field: keyof ExpenseItem, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async () => {
    if (!formData.expense_type || !formData.supplier) {
      return toast.error("Type and Supplier are required")
    }

    try {
      const payload = {
        ...formData,
        created_at: new Date(formData.created_at).toISOString()
      }

      await api.post("/workshop/expenses", payload)
      toast.success("Expense created successfully")
      setIsDialogOpen(false)
      setFormData(initialForm)
      fetchExpenses()
    } catch (error) {
      toast.error("Failed to create expense")
    }
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this expense record?")) return
    try {
      await api.delete(`/workshop/expenses/${id}`)
      setExpenses(expenses.filter(e => e._id !== id))
      toast.success("Expense deleted")
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const totalAmount = (items: ExpenseItem[]) => items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground">Track purchases and operational costs.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Create Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[650px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Expense</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Expense Type *</Label>
                    <Select onValueChange={(v) => setFormData({...formData, expense_type: v})}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Inventory">Inventory</SelectItem>
                            <SelectItem value="Utilities">Utilities</SelectItem>
                            <SelectItem value="Rent">Rent</SelectItem>
                            <SelectItem value="Salary">Salary</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Created On *</Label>
                    <Input 
                        type="date" 
                        value={formData.created_at} 
                        onChange={e => setFormData({...formData, created_at: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Input 
                    placeholder="Supplier Name" 
                    value={formData.supplier}
                    onChange={e => setFormData({...formData, supplier: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label>Expense Item List</Label>
                        <Button variant="outline" size="sm" onClick={handleAddItem}>
                            <Plus className="h-3 w-3 mr-1" /> Add Item
                        </Button>
                    </div>
                    <div className="border rounded-md p-3 space-y-3 bg-muted/20">
                        {formData.items.map((item, index) => (
                            <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <Input 
                                        placeholder="Goods or services..." 
                                        value={item.description}
                                        onChange={e => handleItemChange(index, "description", e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <Input 
                                        type="number" 
                                        placeholder="Amount" 
                                        value={item.amount}
                                        onChange={e => handleItemChange(index, "amount", parseFloat(e.target.value))}
                                    />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                    <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="text-right text-sm font-medium">
                        Total: ₹{totalAmount(formData.items)}
                    </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="remark">Remark</Label>
                  <Textarea 
                    placeholder="Additional notes..." 
                    value={formData.remark}
                    onChange={e => setFormData({...formData, remark: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">Create Expense</Button>
                </div>

              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Expense List */}
        <Card>
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
            <CardDescription>Recent expenses and operational costs ({expenses.length})</CardDescription>
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
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Date</TableHead>
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Type</TableHead>
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Supplier</TableHead>
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Items</TableHead>
                      <TableHead className="text-right py-3 px-4 font-medium text-muted-foreground">Total Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No expenses recorded.
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((expense) => (
                        <TableRow key={expense._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <TableCell className="py-3 px-4">{format(new Date(expense.created_at), "dd MMM yyyy")}</TableCell>
                          <TableCell className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {expense.expense_type}
                              </span>
                          </TableCell>
                          <TableCell className="py-3 px-4 font-medium text-foreground">{expense.supplier}</TableCell>
                          <TableCell className="py-3 px-4 max-w-[300px] truncate text-muted-foreground text-sm">
                              {expense.items.map(i => i.description).join(", ")}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-right font-bold text-foreground">₹{totalAmount(expense.items)}</TableCell>
                          <TableCell className="py-3 px-4">
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(expense._id)} className="hover:bg-destructive/10">
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
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