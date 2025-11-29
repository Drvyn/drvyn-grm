"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Phone, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  MoreVertical, 
  Loader2,
  ChevronDown 
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { format, parseISO } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AppProviders"
import {
  Booking,
  BookingIn,
  Employee,
  EmployeeIn,
  CustomerIn,
  useBookings,
  useSaveBooking,
  useDeleteBooking,
  useUpdateBookingStatus,
  useEmployees,
  useSaveEmployee,
  useDeleteEmployee,
  useDepartments,
  useSaveDepartment,
  useSaveCustomer
} from "@/hooks/useApi"

type BookingFormData = Omit<BookingIn, "drivingLicenseExpiry"> & {
  drivingLicenseExpiry?: Date
}

type NewEmployeeData = Omit<EmployeeIn, "joiningDate" | "exitDate"> & {
  joiningDate?: Date
  exitDate?: Date
}

const initialFormData: BookingFormData = {
  customerType: "Individual",
  customerName: "",
  phone: "",
  email: "",
  address: "",
  taxNumber: "",
  drivingLicenseNumber: "",
  drivingLicenseExpiry: undefined,
  businessType: "Car",
  subType: "Convertible",
  carNumber: "",
  makeAndModel: "",
  fuelType: "Petrol",
  transmissionType: "AT",
  engineNumber: "",
  vinNumber: "",
  variant: "",
  makeYear: "",
  color: "",
  runningPerDay: "",
  insuranceDetails: "",
  serviceAdvisor: "",
  bookingType: "At Workshop",
  department: "",
  customerRemark: "",
  odometer: "",
  fuelIndicator: 5,
  status: "pending",
  date: format(new Date(), "yyyy-MM-dd"),
  time: format(new Date(), "HH:mm"),
}

const initialNewEmployeeData: NewEmployeeData = {
  designation: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  joiningDate: undefined,
  exitDate: undefined,
  salary: "",
  bankDetails: "",
}

export default function BookingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<BookingFormData>(initialFormData)

  const [employeeSearch, setEmployeeSearch] = useState("")

  const [isSelectEmployeeOpen, setIsSelectEmployeeOpen] = useState(false)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false)
  
  const [newEmployeeData, setNewEmployeeData] = useState<NewEmployeeData>(initialNewEmployeeData)
  const [newItemName, setNewItemName] = useState("")

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  
  const { data: bookings = [], isLoading: isLoadingBookings } = useBookings()
  const { data: serviceAdvisors = [], isLoading: isLoadingEmployees } = useEmployees()
  const { data: departments = [], isLoading: isLoadingDepartments } = useDepartments()

  const saveBookingMutation = useSaveBooking()
  const deleteBookingMutation = useDeleteBooking()
  const updateStatusMutation = useUpdateBookingStatus()
  const saveEmployeeMutation = useSaveEmployee()
  const deleteEmployeeMutation = useDeleteEmployee()
  const saveDepartmentMutation = useSaveDepartment()
  const saveCustomerMutation = useSaveCustomer()

  useEffect(() => {
    setMounted(true)
    if (!user) {
      router.push("/")
    }
  }, [router, user])

  const filteredBookings = bookings.filter(
    (booking) =>
      booking?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.id || booking._id)?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
      ...initialFormData,
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
    })
    setShowForm(true)
  }

  const handleEdit = (booking: Booking) => {
    const id = booking.id || booking._id
    if (!id) return

    setEditingId(id)
    const { id: _id1, _id: _id2, workshop_id, created_at, updated_at, ...formData } = booking
    setFormData({
        ...formData,
        drivingLicenseExpiry: formData.drivingLicenseExpiry ? parseISO(formData.drivingLicenseExpiry) : undefined,
    })
    setShowForm(true)
  }

  const handleSave = () => {
    const mandatoryFields: (keyof BookingIn)[] = [
      "customerType", "customerName", "phone", "email", "businessType", "subType",
      "carNumber", "makeAndModel", "fuelType", "serviceAdvisor",
      "bookingType", "department", "odometer"
    ];
    
    const missingField = mandatoryFields.find(field => !formData[field as keyof BookingFormData]);
    if (missingField) {
      alert(`Please fill in all required fields. Missing: ${missingField}`);
      return;
    }

    if (formData.phone.length > 10) {
      alert("Phone number should be max 10 digits.");
      return;
    }

    if (!formData.email || !formData.email.includes("@")) {
      alert("Please enter a valid email address with '@'.");
      return;
    }

    const apiPayload: BookingIn = {
      ...formData,
      drivingLicenseExpiry: formData.drivingLicenseExpiry 
        ? formData.drivingLicenseExpiry.toISOString() 
        : undefined,
    }

    const customerPayload: CustomerIn = {
      name: formData.customerName,
      email: formData.email || "",
      phone: formData.phone,
      address: formData.address || "",
    }
    saveCustomerMutation.mutate({ data: customerPayload })

    saveBookingMutation.mutate(
      { data: apiPayload, id: editingId ?? undefined },
      {
        onSuccess: () => {
          setShowForm(false)
          setFormData(initialFormData)
          setEditingId(null)
        }
      }
    )
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      deleteBookingMutation.mutate(id)
    }
  }

  const handleStatusChange = (id: string, newStatus: Booking["status"]) => {
    updateStatusMutation.mutate({ id, status: newStatus })
  }
  
  const handleFormChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNewEmployeeChange = (field: keyof NewEmployeeData, value: any) => {
    setNewEmployeeData(prev => ({ ...prev, [field]: value }))
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    const { id, _id, workshop_id, ...editData } = employee
    setNewEmployeeData({
        ...editData,
        joiningDate: editData.joiningDate ? parseISO(editData.joiningDate) : undefined,
        exitDate: editData.exitDate ? parseISO(editData.exitDate) : undefined,
    });
    setIsAddEmployeeOpen(true);
    setIsSelectEmployeeOpen(false);
  };

  const handleSaveEmployee = () => {
    const { firstName, designation, phone } = newEmployeeData
    
    if (!designation || !firstName || !phone) {
      alert("Please fill in Employee designation, First name, and Phone number.")
      return
    }

    const apiPayload: EmployeeIn = {
        ...newEmployeeData,
        joiningDate: newEmployeeData.joiningDate ? newEmployeeData.joiningDate.toISOString() : undefined,
        exitDate: newEmployeeData.exitDate ? newEmployeeData.exitDate.toISOString() : undefined,
    }

    const empId = editingEmployee?.id || editingEmployee?._id

    saveEmployeeMutation.mutate(
      { data: apiPayload, id: empId ?? undefined },
      {
        onSuccess: (savedEmployee) => {
          const fullName = `${savedEmployee.firstName} ${savedEmployee.lastName || ''}`.trim()
          if (!editingEmployee) {
            handleFormChange("serviceAdvisor", fullName);
          }
          else if (editingEmployee && formData.serviceAdvisor === `${editingEmployee.firstName} ${editingEmployee.lastName || ''}`.trim()) {
            handleFormChange("serviceAdvisor", fullName);
          }
          setNewEmployeeData(initialNewEmployeeData);
          setEditingEmployee(null);
          setIsAddEmployeeOpen(false);
        }
      }
    )
  }

  const handleDeleteEmployee = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      const deletedEmployee = serviceAdvisors.find(emp => (emp.id === id || emp._id === id));
      deleteEmployeeMutation.mutate(id, {
        onSuccess: () => {
          if (deletedEmployee) {
              const fullName = `${deletedEmployee.firstName} ${deletedEmployee.lastName || ''}`.trim();
              if (formData.serviceAdvisor === fullName) {
                  handleFormChange("serviceAdvisor", "");
              }
          }
        }
      })
    }
  };

  const handleSaveDepartment = () => {
    if (newItemName.trim()) {
      saveDepartmentMutation.mutate(
        { name: newItemName.trim() },
        {
          onSuccess: (savedDept) => {
            handleFormChange("department", savedDept.name)
            setNewItemName("")
            setIsAddDepartmentOpen(false)
          }
        }
      )
    }
  }

  const filteredEmployees = serviceAdvisors.filter(emp => 
    `${emp.firstName} ${emp.lastName || ''}`.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  if (!mounted || !user) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200"
      case "in-progress": return "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
      case "completed": return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
      case "cancelled": return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
      default: return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
            <p className="text-muted-foreground">Manage your service bookings</p>
          </div>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name or booking ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Your scheduled service appointments ({filteredBookings.length})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {isLoadingBookings ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Booking ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date & Time</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Service</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking, index) => {
                        const bookingId = booking.id || booking._id || ""
                        return (
                          <tr
                            key={bookingId || index}
                            onClick={() => bookingId && router.push(`/dashboard/bookings/${bookingId}`)}
                            className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            <td className="py-3 px-4 text-sm font-medium text-primary hover:underline">
                              {bookingId ? bookingId.slice(-6).toUpperCase() : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-foreground">{booking.customerName}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {booking.phone}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-foreground flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {booking.date ? `${booking.date} ${booking.time}` : 'N/A'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-foreground">{booking.makeAndModel}</td>
                            <td className="py-3 px-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className={`inline-flex items-center justify-between w-[120px] px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${getStatusColor(booking.status)}`}
                                  >
                                    <span className="capitalize truncate">{booking.status}</span>
                                    <ChevronDown className="w-3 h-3 ml-2 opacity-70 shrink-0" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[120px]">
                                  {["pending", "confirmed", "in-progress", "completed", "cancelled"].map((st) => (
                                    <DropdownMenuItem
                                      key={st}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (bookingId) handleStatusChange(bookingId, st as Booking["status"])
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
                                onClick={(e) => { e.stopPropagation(); handleEdit(booking); }}
                                className="hover:bg-primary/10"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); if(bookingId) handleDelete(bookingId); }}
                                className="hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          {isLoadingBookings 
                            ? "Loading bookings..." 
                            : (searchTerm 
                                ? "No bookings match your search." 
                                : "You have no bookings yet. Click 'New Booking' to start."
                              )
                          }
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

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm p-4 md:p-8">
          <Card className="max-w-6xl mx-auto shadow-2xl border-primary/20 w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-card rounded-t-lg p-6">
              <CardTitle>{editingId ? "Edit Booking" : "Create New Booking"}</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 bg-card rounded-b-lg max-h-[85vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">Customer details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerType">Customer type *</Label>
                        <Select value={formData.customerType} onValueChange={(v) => handleFormChange("customerType", v)}>
                          <SelectTrigger id="customerType" className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Individual">Individual</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Customer name *</Label>
                        <Input id="customerName" value={formData.customerName} onChange={(e) => handleFormChange("customerName", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone number *</Label>
                        <Input id="phone" value={formData.phone} onChange={(e) => handleFormChange("phone", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address *</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => handleFormChange("email", e.target.value)} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={formData.address} onChange={(e) => handleFormChange("address", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxNumber">Tax number</Label>
                        <Input id="taxNumber" value={formData.taxNumber} onChange={(e) => handleFormChange("taxNumber", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="drivingLicenseNumber">Driving license number</Label>
                        <Input id="drivingLicenseNumber" value={formData.drivingLicenseNumber} onChange={(e) => handleFormChange("drivingLicenseNumber", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="drivingLicenseExpiry">Driving license expiry</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button id="drivingLicenseExpiry" variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.drivingLicenseExpiry ? format(formData.drivingLicenseExpiry, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single" 
                              selected={formData.drivingLicenseExpiry} 
                              onSelect={(d) => handleFormChange("drivingLicenseExpiry", d)}
                              disabled={(date) => date < new Date()}
                              initialFocus 
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                  </div>
                </div>

                {/* Car details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">Car details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business type *</Label>
                        <Input id="businessType" value="Car" readOnly disabled className="bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subType">Sub type *</Label>
                          <Select value={formData.subType} onValueChange={(v) => handleFormChange("subType", v)}>
                          <SelectTrigger id="subType" className="w-full"><SelectValue placeholder="Select sub-type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Convertible">Convertible</SelectItem>
                            <SelectItem value="Coupe">Coupe</SelectItem>
                            <SelectItem value="Hatchback">Hatchback</SelectItem>
                            <SelectItem value="Sedan">Sedan</SelectItem>
                            <SelectItem value="SUV">SUV</SelectItem>
                            <SelectItem value="Station Wagon">Station Wagon</SelectItem>
                            <SelectItem value="Sports Car">Sports Car</SelectItem>
                            <SelectItem value="Mini Van">Mini Van</SelectItem>
                            <SelectItem value="Pickup Truck">Pickup Truck</SelectItem>
                            <SelectItem value="MPV/MUV">MPV/MUV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carNumber">Car number *</Label>
                        <Input id="carNumber" value={formData.carNumber} onChange={(e) => handleFormChange("carNumber", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="makeAndModel">Make & Model *</Label>
                        <Input id="makeAndModel" value={formData.makeAndModel} onChange={(e) => handleFormChange("makeAndModel", e.target.value)} placeholder="e.g., Honda Civic" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fuelType">Fuel type *</Label>
                        <Select value={formData.fuelType} onValueChange={(v) => handleFormChange("fuelType", v)}>
                          <SelectTrigger id="fuelType" className="w-full"><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Petrol">Petrol</SelectItem>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                            <SelectItem value="EV">EV</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transmissionType">Transmission type</Label>
                        <Select value={formData.transmissionType} onValueChange={(v) => handleFormChange("transmissionType", v)}>
                          <SelectTrigger id="transmissionType" className="w-full"><SelectValue placeholder="Select transmission" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AT">AT</SelectItem>
                            <SelectItem value="MT">MT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="engineNumber">Engine number</Label>
                        <Input id="engineNumber" value={formData.engineNumber} onChange={(e) => handleFormChange("engineNumber", e.target.value)} />
                      </div>
                        <div className="space-y-2">
                        <Label htmlFor="vinNumber">VIN number</Label>
                        <Input id="vinNumber" value={formData.vinNumber} onChange={(e) => handleFormChange("vinNumber", e.target.value)} />
                      </div>
                        <div className="space-y-2">
                        <Label htmlFor="variant">Variant</Label>
                        <Input id="variant" value={formData.variant} onChange={(e) => handleFormChange("variant", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="makeYear">Make year</Label>
                        <Input id="makeYear" value={formData.makeYear} onChange={(e) => handleFormChange("makeYear", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input id="color" value={formData.color} onChange={(e) => handleFormChange("color", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="runningPerDay">Running per day</Label>
                        <Input id="runningPerDay" value={formData.runningPerDay} onChange={(e) => handleFormChange("runningPerDay", e.target.value)} />
                      </div>
                  </div>
                </div>
                
                {/* Insurance details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">Insurance details</h3>
                  <Textarea
                    placeholder="Enter insurance policy details..."
                    value={formData.insuranceDetails}
                    onChange={(e) => handleFormChange("insuranceDetails", e.target.value)}
                  />
                </div>

                {/* Additional details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">Additional details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className="space-y-2">
                      <Label htmlFor="serviceAdvisor">Service advisor *</Label>
                      <Button
                        id="serviceAdvisor"
                        variant="outline"
                        type="button"
                        className={`w-full justify-start text-left font-normal ${
                          formData.serviceAdvisor ? "text-foreground" : "text-muted-foreground"
                        }`}
                        onClick={() => setIsSelectEmployeeOpen(true)}
                        disabled={isLoadingEmployees}
                      >
                        {isLoadingEmployees ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : formData.serviceAdvisor || "Select advisor"}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bookingType">Booking type *</Label>
                      <Select value={formData.bookingType} onValueChange={(v) => handleFormChange("bookingType", v)}>
                        <SelectTrigger id="bookingType" className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="At Workshop">At Workshop</SelectItem>
                          <SelectItem value="Pickup">Pickup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <div className="flex items-center gap-2">
                        <Select value={formData.department} onValueChange={(v) => handleFormChange("department", v)}>
                          <SelectTrigger id="department" className="w-full" disabled={isLoadingDepartments}>
                            <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select department"} />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map(dept => <SelectItem key={dept.id || dept._id} value={dept.name}>{dept.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="icon" onClick={() => setIsAddDepartmentOpen(true)}><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="customerRemark">Customer remark</Label>
                      <Textarea id="customerRemark" value={formData.customerRemark} onChange={(e) => handleFormChange("customerRemark", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="odometer">Odometer in KM *</Label>
                      <Input id="odometer" value={formData.odometer} onChange={(e) => handleFormChange("odometer", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="fuelIndicator">Fuel indicator ({formData.fuelIndicator}%)</Label>
                      <Slider
                        id="fuelIndicator"
                        min={0}
                        max={100}
                        step={5}
                        value={[formData.fuelIndicator]}
                        onValueChange={(v) => handleFormChange("fuelIndicator", v[0])}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-8 border-t pt-6">
                <Button 
                  onClick={handleSave} 
                  className="bg-primary hover:bg-primary/90"
                  disabled={saveBookingMutation.isPending || saveCustomerMutation.isPending}
                >
                  {(saveBookingMutation.isPending || saveCustomerMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} 
                  Save Booking
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Select Employee Modal */}
      <Dialog open={isSelectEmployeeOpen} onOpenChange={setIsSelectEmployeeOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-row items-center justify-between pr-8">
            <DialogTitle>Employee</DialogTitle>
            <Button size="sm" onClick={() => {
              setEditingEmployee(null);
              setNewEmployeeData(initialNewEmployeeData);
              setIsAddEmployeeOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Employee
            </Button>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Type here"
              className="pl-10"
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto mt-4">
            {isLoadingEmployees ? (
              <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              filteredEmployees.map(emp => {
                const fullName = `${emp.firstName} ${emp.lastName || ''}`.trim();
                const empId = emp.id || emp._id
                return (
                  <div
                    key={empId}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted group"
                  >
                    <button
                      className="flex-1 flex items-center gap-3 text-left focus:outline-none"
                      onClick={() => {
                        handleFormChange("serviceAdvisor", fullName);
                        setIsSelectEmployeeOpen(false);
                      }}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{emp.firstName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{fullName}</p>
                        <p className="text-xs text-muted-foreground">{emp.designation}</p>
                      </div>
                    </button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 opacity-0 group-hover:opacity-100 focus-visible:ring-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end">
                        <DropdownMenuItem onClick={() => handleEditEmployee(emp)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => empId && handleDeleteEmployee(empId)} className="text-destructive" variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Employee Modal */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit employee" : "Create employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-y-auto px-1 py-4">
            <div className="space-y-2">
              <Label htmlFor="designation">Employee designation *</Label>
              <Select value={newEmployeeData.designation} onValueChange={(v) => handleNewEmployeeChange("designation", v)}>
                <SelectTrigger id="designation" className="w-full">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => <SelectItem key={dept.id || dept._id} value={dept.name}>{dept.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input
                  id="firstName"
                  value={newEmployeeData.firstName}
                  onChange={(e) => handleNewEmployeeChange("firstName", e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={newEmployeeData.lastName}
                  onChange={(e) => handleNewEmployeeChange("lastName", e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number *</Label>
              <Input
                id="phone"
                value={newEmployeeData.phone}
                onChange={(e) => handleNewEmployeeChange("phone", e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={newEmployeeData.email}
                onChange={(e) => handleNewEmployeeChange("email", e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newEmployeeData.address}
                onChange={(e) => handleNewEmployeeChange("address", e.target.value)}
                placeholder="Address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joiningDate">Joining date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="joiningDate" variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEmployeeData.joiningDate ? format(newEmployeeData.joiningDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={newEmployeeData.joiningDate} 
                    onSelect={(d) => handleNewEmployeeChange("joiningDate", d)}
                    disabled={(date) => date < new Date()}
                    initialFocus 
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitDate">Exit date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="exitDate" variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEmployeeData.exitDate ? format(newEmployeeData.exitDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={newEmployeeData.exitDate} 
                    onSelect={(d) => handleNewEmployeeChange("exitDate", d)}
                    disabled={(date) => date < new Date()}
                    initialFocus 
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary per month</Label>
              <Input
                id="salary"
                value={newEmployeeData.salary}
                onChange={(e) => handleNewEmployeeChange("salary", e.target.value)}
                placeholder="Salary per month"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankDetails">Bank details</Label>
              <Input
                id="bankDetails"
                value={newEmployeeData.bankDetails}
                onChange={(e) => handleNewEmployeeChange("bankDetails", e.target.value)}
                placeholder="Bank details"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => { 
              setIsAddEmployeeOpen(false); 
              setNewEmployeeData(initialNewEmployeeData); 
              setEditingEmployee(null); 
            }}>Cancel</Button>
            <Button 
              onClick={handleSaveEmployee}
              disabled={saveEmployeeMutation.isPending}
            >
              {saveEmployeeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Department Modal */}
      <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="newDepartmentName">Department Name</Label>
            <Input
              id="newDepartmentName"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g., Detailing"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDepartmentOpen(false); setNewItemName(""); }}>Cancel</Button>
            <Button 
              onClick={handleSaveDepartment}
              disabled={saveDepartmentMutation.isPending}
            >
              {saveDepartmentMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}