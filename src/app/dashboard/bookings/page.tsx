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
import { Plus, Search, Calendar as CalendarIcon, Phone, Edit2, Trash2, X, Check, User, MoreVertical, Building } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { format } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Expanded interface to match the screenshot (Unchanged)
interface BookingFormData {
  id: string
  // Customer details
  customerType: string // *
  customerName: string // *
  phone: string // *
  email: string
  address: string
  taxNumber: string
  drivingLicenseNumber: string
  drivingLicenseExpiry?: Date
  // Car details
  businessType: string // * (Fixed to 'Car')
  subType: string // *
  carNumber: string // *
  makeAndModel: string // * (Text input)
  fuelType: string // *
  transmissionType: string
  engineNumber: string
  vinNumber: string
  variant: string
  makeYear: string
  color: string
  runningPerDay: string
  // Insurance details
  insuranceDetails: string
  // Additional details
  serviceAdvisor: string // *
  bookingType: string // *
  department: string // *
  customerRemark: string
  odometer: string // *
  fuelIndicator: number
  // Original Booking fields
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled"
  // NEW: Added date and time for job card
  date?: string
  time?: string
}

// Interface for the new employee form
interface NewEmployeeData {
  designation: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  joiningDate?: Date
  exitDate?: Date
  salary: string
  bankDetails: string
}

// Employee interface now includes all details
interface Employee extends NewEmployeeData {
  id: string
}

// UPDATED: initialBookings now uses the full BookingFormData
const initialBookings: BookingFormData[] = [
  {
    id: "BK001",
    customerType: "Individual",
    customerName: "John Smith",
    phone: "555-0101",
    email: "john@example.com",
    address: "123 Main St",
    taxNumber: "",
    drivingLicenseNumber: "",
    businessType: "Car",
    subType: "Sedan",
    carNumber: "NY-123",
    makeAndModel: "Oil Change", // Using this field for 'service' as in old data
    fuelType: "Petrol",
    transmissionType: "AT",
    engineNumber: "",
    vinNumber: "",
    variant: "",
    makeYear: "2020",
    color: "Blue",
    runningPerDay: "50",
    insuranceDetails: "",
    serviceAdvisor: "BALAJI BALAJI",
    bookingType: "At Workshop",
    department: "General Service",
    customerRemark: "Regular maintenance",
    odometer: "45000",
    fuelIndicator: 50,
    status: "confirmed",
    date: "2024-01-15",
    time: "09:00 AM",
  },
  {
    id: "BK002",
    customerType: "Individual",
    customerName: "Sarah Johnson",
    phone: "555-0102",
    email: "sarah@example.com",
    address: "456 Oak Ave",
    taxNumber: "",
    drivingLicenseNumber: "",
    businessType: "Car",
    subType: "SUV",
    carNumber: "CA-456",
    makeAndModel: "Tire Rotation", // Using this field for 'service' as in old data
    fuelType: "Diesel",
    transmissionType: "AT",
    engineNumber: "",
    vinNumber: "",
    variant: "",
    makeYear: "2019",
    color: "Red",
    runningPerDay: "30",
    insuranceDetails: "",
    serviceAdvisor: "Harish",
    bookingType: "Pickup",
    department: "Quick Lube",
    customerRemark: "",
    odometer: "32000",
    fuelIndicator: 75,
    status: "pending",
    date: "2024-01-15",
    time: "10:30 AM",
  },
]

// Default state for the new form (Unchanged)
const initialFormData: BookingFormData = {
  id: "",
  customerType: "Individual",
  customerName: "",
  phone: "",
  email: "",
  address: "",
  taxNumber: "",
  drivingLicenseNumber: "",
  drivingLicenseExpiry: undefined,
  businessType: "Car", // Fixed value
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
}

// Initial state for the new employee form (Unchanged)
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

// Mock list now uses the full Employee interface
const mockServiceAdvisors: Employee[] = [
  { id: "E1", firstName: "BALAJI", lastName: "BALAJI", designation: "SERVICE • SUPERVISOR", phone: "555-0101", email: "balaji@example.com", address: "123 Main St", salary: "50000", bankDetails: "123456789" },
  { id: "E2", firstName: "Harish", lastName: "", designation: "Workshop • Administrator", phone: "555-0102", email: "harish@example.com", address: "456 Oak Ave", salary: "60000", bankDetails: "987654321" },
  { id: "E3", firstName: "Karthik", lastName: "", designation: "Workshop • Administrator", phone: "555-0103", email: "karthik@example.com", address: "", salary: "", bankDetails: "" },
  { id: "E4", firstName: "MUHESH", lastName: "", designation: "Workshop • SERVICE ADVISOR", phone: "555-0104", email: "muhesh@example.com", address: "", salary: "", bankDetails: "" },
  { id: "E5", firstName: "Shakthivel", lastName: "", designation: "Workshop • Administrator", phone: "555-0105", email: "shakthivel@example.com", address: "", salary: "", bankDetails: "" },
  { id: "E6", firstName: "VINOTH", lastName: "", designation: "SERVICE • SERVICE ADVISOR", phone: "555-0106", email: "vinoth@example.com", address: "", salary: "", bankDetails: "" },
  { id: "E7", firstName: "VINOTH", lastName: "KUMAR", designation: "BODYSHOP • BODYSHOP MANAGER", phone: "555-0107", email: "vinoth.k@example.com", address: "", salary: "", bankDetails: "" },
]

const mockDepartments = ["General Service", "Body Shop", "Quick Lube", "Service", "Workshop", "Bodyshop", "SERVICE ADVISOR", "SUPERVISOR", "Administrator", "BODYSHOP MANAGER"]

export default function BookingsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"admin" | "workshop" | null>(null)
  const [mounted, setMounted] = useState(false)
  // UPDATED: State now holds the full BookingFormData
  const [bookings, setBookings] = useState<BookingFormData[]>(initialBookings)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<BookingFormData>(initialFormData)

  // State for dynamic dropdowns
  const [serviceAdvisors, setServiceAdvisors] = useState<Employee[]>(mockServiceAdvisors)
  const [departments, setDepartments] = useState(mockDepartments)
  const [employeeSearch, setEmployeeSearch] = useState("")

  // State for new item modals
  const [isSelectEmployeeOpen, setIsSelectEmployeeOpen] = useState(false)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false)
  
  const [newEmployeeData, setNewEmployeeData] = useState<NewEmployeeData>(initialNewEmployeeData)
  const [newItemName, setNewItemName] = useState("")

  // State to track which employee is being edited
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole") as "admin" | "workshop" | null
    if (!role || role !== "workshop") {
      router.push("/dashboard")
    }
    setUserRole(role)

    // UPDATED: Load bookings from localStorage
    try {
      const savedBookings = localStorage.getItem("allBookings")
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings))
      } else {
        setBookings(initialBookings) // Fallback to initial mocks
      }
    } catch (error) {
      console.error("Failed to parse bookings from localStorage", error)
      setBookings(initialBookings)
    }
  }, [router])

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
      ...initialFormData,
      id: `BK${String(bookings.length + 1).padStart(3, "0")}`,
    })
    setShowForm(true)
  }

  // UPDATED: handleEdit now loads the full booking object into the form
  const handleEdit = (booking: BookingFormData) => {
    setEditingId(booking.id)
    setFormData(booking)
    setShowForm(true)
  }

  // UPDATED: handleSave now saves the full formData and stores it in localStorage
  const handleSave = () => {
    const mandatoryFields: (keyof BookingFormData)[] = [
      "customerType", "customerName", "phone", "businessType", "subType",
      "carNumber", "makeAndModel", "fuelType", "serviceAdvisor",
      "bookingType", "department", "odometer"
    ];
    
    const missingField = mandatoryFields.find(field => !formData[field]);

    if (missingField) {
      alert(`Please fill in all required fields. Missing: ${missingField}`);
      return;
    }

    let updatedBookings: BookingFormData[] = []

    if (editingId) {
      // Update existing booking
      const updatedBooking = { ...formData }
      updatedBookings = bookings.map((b) => (b.id === editingId ? updatedBooking : b))
      
    } else {
      // Add new booking with current date and time
      const newBooking = {
        ...formData,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      updatedBookings = [...bookings, newBooking]
    }

    setBookings(updatedBookings)
    localStorage.setItem("allBookings", JSON.stringify(updatedBookings)) // Save to localStorage

    setShowForm(false)
    setFormData(initialFormData)
  }

  // UPDATED: handleDelete now also updates localStorage
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      const newBookings = bookings.filter((b) => b.id !== id)
      setBookings(newBookings)
      localStorage.setItem("allBookings", JSON.stringify(newBookings)) // Update localStorage
    }
  }

  // UPDATED: handleStatusChange now also updates localStorage
  const handleStatusChange = (id: string, newStatus: BookingFormData["status"]) => {
    const newBookings = bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    setBookings(newBookings)
    localStorage.setItem("allBookings", JSON.stringify(newBookings)) // Update localStorage
  }
  
  const handleFormChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNewEmployeeChange = (field: keyof NewEmployeeData, value: any) => {
    setNewEmployeeData(prev => ({ ...prev, [field]: value }))
  }

  // Function to open the edit modal
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee); // Set the employee to edit
    setNewEmployeeData(employee); // Load all existing data into the form
    setIsAddEmployeeOpen(true); // Open the modal
    setIsSelectEmployeeOpen(false); // Close the selection modal
  };

  // Now handles both Save and Update
  const handleSaveEmployee = () => {
    const { firstName, lastName, designation, phone } = newEmployeeData
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    
    if (!designation || !firstName || !phone) {
      alert("Please fill in Employee designation, First name, and Phone number.")
      return
    }

    if (editingEmployee) {
      // This is an UPDATE
      const updatedEmployee: Employee = { ...newEmployeeData, id: editingEmployee.id };
      setServiceAdvisors(serviceAdvisors.map(emp => 
        emp.id === editingEmployee.id ? updatedEmployee : emp
      ));
      
      // Update main form if this was the selected advisor
      const oldFullName = `${editingEmployee.firstName} ${editingEmployee.lastName}`.trim();
      if (formData.serviceAdvisor === oldFullName) {
        handleFormChange("serviceAdvisor", fullName);
      }
    } else {
      // This is a NEW employee
      const newEmployee: Employee = {
        ...newEmployeeData,
        id: `E${Date.now()}`,
      };
      setServiceAdvisors([...serviceAdvisors, newEmployee]);
      handleFormChange("serviceAdvisor", fullName); // Select new employee
    }
    
    setNewEmployeeData(initialNewEmployeeData); // Reset employee form
    setEditingEmployee(null); // Clear editing state
    setIsAddEmployeeOpen(false); // Close create/edit modal
  }

  // *** NEW *** Function to delete an employee
  const handleDeleteEmployee = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      const deletedEmployee = serviceAdvisors.find(emp => emp.id === id);
      
      setServiceAdvisors(serviceAdvisors.filter((emp) => emp.id !== id));
      
      // Also, clear from main form if they were selected
      if (deletedEmployee) {
          const fullName = `${deletedEmployee.firstName} ${deletedEmployee.lastName}`.trim();
          if (formData.serviceAdvisor === fullName) {
              handleFormChange("serviceAdvisor", "");
          }
      }
    }
  };

  const handleSaveDepartment = () => {
    if (newItemName.trim()) {
      const newDepartments = [...departments, newItemName.trim()]
      setDepartments(newDepartments)
      handleFormChange("department", newItemName.trim())
      setNewItemName("")
      setIsAddDepartmentOpen(false)
    }
  }

  // Filter for employee list now uses first/last name
  const filteredEmployees = serviceAdvisors.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  if (!mounted || !userRole) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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

        {/* Search & Table */}
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
            {/* Responsive Table */}
            <div className="overflow-x-auto">
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
                    // UPDATED: Table now maps over full BookingFormData
                    filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td 
                          className="py-3 px-4 text-sm font-medium text-foreground cursor-pointer"
                          onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                        >
                          {booking.id}
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
                          <select
                            value={booking.status}
                            onClick={(e) => e.stopPropagation()} // Prevent row click
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(booking.id, e.target.value as BookingFormData["status"])
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(booking.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(booking);
                            }}
                            className="hover:bg-primary/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(booking.id);
                            }}
                            className="hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NEW BOOKING FORM MODAL --- MOVED HERE --- */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm p-4 md:p-8">
          <Card className="max-w-6xl mx-auto shadow-2xl border-primary/20 w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-card rounded-t-lg p-6">
              <CardTitle>{editingId ? "Edit Booking" : "Create New Booking"}</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 bg-card rounded-b-lg">
              <div className="space-y-4">
                {/* Customer details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">Customer details</h3>
                  {/* Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerType">Customer type *</Label>
                        <Select value={formData.customerType} onValueChange={(v) => handleFormChange("customerType", v)}>
                          <SelectTrigger id="customerType" className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)] bg-white">
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
                        <Label htmlFor="email">Email address</Label>
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
                          <PopoverContent className="w-auto p-0 bg-white" align="start">
                            <Calendar mode="single" selected={formData.drivingLicenseExpiry} onSelect={(d) => handleFormChange("drivingLicenseExpiry", d)} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                  </div>
                </div>

                {/* Car details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">Car details</h3>
                  {/* Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business type *</Label>
                        <Input id="businessType" value="Car" readOnly disabled className="bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subType">Sub type *</Label>
                          <Select value={formData.subType} onValueChange={(v) => handleFormChange("subType", v)}>
                          <SelectTrigger id="subType" className="w-full"><SelectValue placeholder="Select sub-type" /></SelectTrigger>
                          <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)] bg-white">
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
                          <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)] bg-white">
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
                          <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)] bg-white">
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
                  {/* Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* UPDATED Service Advisor Field */}
                    <div className="space-y-2">
                      <Label htmlFor="serviceAdvisor">Service advisor *</Label>
                      <Button
                        id="serviceAdvisor"
                        variant="outline"
                        className={`w-full justify-start text-left font-normal hover:bg-primary hover:text-white group ${
                          formData.serviceAdvisor ? "text-foreground" : "text-muted-foreground"
                        }`}
                        onClick={() => setIsSelectEmployeeOpen(true)}
                      >
                        {formData.serviceAdvisor ? (
                          <span className="group-hover:text-white">{formData.serviceAdvisor}</span>
                        ) : (
                          <span className="group-hover:text-white">Select advisor</span>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bookingType">Booking type *</Label>
                      <Select value={formData.bookingType} onValueChange={(v) => handleFormChange("bookingType", v)}>
                        <SelectTrigger id="bookingType" className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)] bg-white">
                          <SelectItem value="At Workshop">At Workshop</SelectItem>
                          <SelectItem value="Pickup">Pickup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <div className="flex items-center gap-2">
                        <Select value={formData.department} onValueChange={(v) => handleFormChange("department", v)}>
                          <SelectTrigger id="department" className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                          <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)] bg-white">
                            {departments.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={() => setIsAddDepartmentOpen(true)}><Plus className="w-4 h-4" /></Button>
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
              
              {/* Form Actions */}
              <div className="flex gap-2 mt-8 border-t pt-6">
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  <Check className="w-4 h-4 mr-2" />
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
              setEditingEmployee(null); // Ensure we are creating, not editing
              setNewEmployeeData(initialNewEmployeeData); // Clear form
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
            {/* UPDATED Employee list item with Edit button */}
            {filteredEmployees.map(emp => {
              const fullName = `${emp.firstName} ${emp.lastName}`.trim();
              return (
                <div
                  key={emp.id}
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
                  
                  {/* NEW Dropdown menu for Edit action */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 opacity-0 group-hover:opacity-100 focus-visible:ring-0" // Removed focus ring
                        onClick={(e) => e.stopPropagation()} // Stop propagation
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="bg-white" align="end">
                      <DropdownMenuItem onClick={() => handleEditEmployee(emp)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteEmployee(emp.id)} className="text-destructive" variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Employee Modal */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit employee" : "Create employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="designation">Employee designation *</Label>
              <Select value={newEmployeeData.designation} onValueChange={(v) => handleNewEmployeeChange("designation", v)}>
                <SelectTrigger id="designation" className="w-full">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)] bg-white">
                  {departments.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
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
                    {newEmployeeData.joiningDate ? format(new Date(newEmployeeData.joiningDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <Calendar mode="single" selected={newEmployeeData.joiningDate} onSelect={(d) => handleNewEmployeeChange("joiningDate", d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitDate">Exit date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="exitDate" variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEmployeeData.exitDate ? format(new Date(newEmployeeData.exitDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <Calendar mode="single" selected={newEmployeeData.exitDate} onSelect={(d) => handleNewEmployeeChange("exitDate", d)} initialFocus />
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
            <Button onClick={handleSaveEmployee}>Save Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Department Modal */}
      <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
        <DialogContent className="sm:max-w-md bg-white">
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
            <Button onClick={handleSaveDepartment}>Save Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}