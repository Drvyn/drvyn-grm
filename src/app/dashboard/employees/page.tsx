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
import { Plus, Trash, Search, Phone, Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Employee = {
  _id: string
  firstName: string
  lastName?: string
  designation: string
  phone: string
  email?: string
  salary?: string
}

export default function EmployeesPage() {
  const api = useApi()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    designation: "Mechanic",
    phone: "",
    email: "",
    salary: "",
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const data = await api.get("/workshop/employees")
      setEmployees(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.firstName || !formData.phone) return toast.error("Name and Phone are required")
      await api.post("/workshop/employees", formData)
      toast.success("Employee added")
      setIsDialogOpen(false)
      setFormData({ firstName: "", lastName: "", designation: "Mechanic", phone: "", email: "", salary: "" })
      fetchEmployees()
    } catch (error) {
      toast.error("Failed to add employee")
    }
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Remove this employee?")) return
    try {
      await api.delete(`/workshop/employees/${id}`)
      setEmployees(employees.filter(e => e._id !== id))
      toast.success("Employee removed")
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const filtered = employees.filter(e => 
    e.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.phone.includes(searchQuery)
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground">Manage your staff and technicians.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>First Name *</Label>
                    <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Last Name</Label>
                    <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Designation</Label>
                    <Select value={formData.designation} onValueChange={v => setFormData({...formData, designation: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mechanic">Mechanic</SelectItem>
                        <SelectItem value="Service Advisor">Service Advisor</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Helper">Helper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Salary (₹)</Label>
                    <Input value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Phone Number *</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <Button onClick={handleSubmit} className="w-full mt-2 bg-primary hover:bg-primary/90">Save Employee</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Search Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
               <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or phone..." 
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
            <CardTitle>Staff List</CardTitle>
            <CardDescription>All registered employees ({filtered.length})</CardDescription>
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
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Name</TableHead>
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Role</TableHead>
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Contact</TableHead>
                      <TableHead className="text-left py-3 px-4 font-medium text-muted-foreground">Salary</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No employees found.</TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((emp) => (
                        <TableRow key={emp._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <TableCell className="py-3 px-4 font-medium text-foreground flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                              {emp.firstName[0]}
                            </div>
                            {emp.firstName} {emp.lastName}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                              {emp.designation}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <div className="flex flex-col text-xs text-muted-foreground gap-1">
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {emp.phone}</span>
                              {emp.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {emp.email}</span>}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4">{emp.salary ? `₹${emp.salary}` : '-'}</TableCell>
                          <TableCell className="py-3 px-4">
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(emp._id)} className="hover:bg-destructive/10">
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