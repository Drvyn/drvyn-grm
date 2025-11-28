"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AppProviders"
import { toast } from "sonner"

// --- API Client ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const apiClient = async (
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
) => {
  if (!token) {
    throw new Error("No auth token provided.")
  }

  const headers = new Headers(options.headers || {})
  headers.set("Authorization", `Bearer ${token}`)
  headers.set("Content-Type", "application/json")

  const response = await fetch(`${API_URL}/workshop${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `API Error: ${response.statusText}`)
  }

  if (response.status === 204) {
    return null
  }
  
  return response.json()
}

// --- Model Types ---

type MongoEntity = {
  id?: string
  _id?: string
}

export interface Employee extends MongoEntity {
  workshop_id: string
  designation: string
  firstName: string
  lastName?: string
  phone: string
  email?: string
  address?: string
  joiningDate?: string
  exitDate?: string
  salary?: string
  bankDetails?: string
}
export type EmployeeIn = Omit<Employee, "id" | "_id" | "workshop_id">

export interface Department extends MongoEntity {
  workshop_id: string
  name: string
}
export type DepartmentIn = Omit<Department, "id" | "_id" | "workshop_id">

export interface Booking extends MongoEntity {
  workshop_id: string
  customerType: string
  customerName: string
  phone: string
  email?: string
  address?: string
  taxNumber?: string
  drivingLicenseNumber?: string
  drivingLicenseExpiry?: string
  businessType: string
  subType: string
  carNumber: string
  makeAndModel: string
  fuelType: string
  transmissionType?: string
  engineNumber?: string
  vinNumber?: string
  variant?: string
  makeYear?: string
  color?: string
  runningPerDay?: string
  insuranceDetails?: string
  serviceAdvisor: string
  bookingType: string
  department: string
  customerRemark?: string
  odometer: string
  fuelIndicator: number
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled"
  date?: string
  time?: string
  created_at: string
  updated_at: string
}
export type BookingIn = Omit<Booking, "id" | "_id" | "workshop_id" | "created_at" | "updated_at">

export interface Customer extends MongoEntity {
  workshop_id: string
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
}
export type CustomerIn = Omit<Customer, "id" | "_id" | "workshop_id">

export interface Part extends MongoEntity {
  workshop_id: string
  name: string
  partNumber: string
  category: string
  quantity: number
  minStock: number
  unitCost: number
  supplier?: string
  notes?: string
}
export type PartIn = Omit<Part, "id" | "_id" | "workshop_id">

export interface SparePartItem {
  id: string
  name: string
  quantity: number
  price: number
  taxPercent: number
}

export interface ServiceItem {
  id: string
  description: string
  cost: number
  taxPercent: number
}

export interface JobCard extends MongoEntity {
  workshop_id: string
  booking_id: string
  customer: string
  phone?: string
  email?: string
  vehicle: string
  service: string
  date: string
  time: string
  workers: string[]
  spareParts: SparePartItem[]
  services: ServiceItem[]
  issues: string[]
  photos: string[]
  signature?: string
  notes?: string
}
export type JobCardIn = Omit<JobCard, "id" | "_id" | "workshop_id">

export interface InvoiceItem {
    description: string
    quantity: number
    unitPrice: number
}

export interface Invoice extends MongoEntity {
    workshop_id: string
    jobCardId: string
    customer: string
    amount: number
    items: InvoiceItem[]
    date: string
    dueDate: string
    status: "draft" | "sent" | "paid" | "overdue"
    notes?: string
}
export type InvoiceIn = Omit<Invoice, "id" | "_id" | "workshop_id">

export interface Activity extends MongoEntity {
    workshop_id: string
    title: string
    icon: string
    created_at: string
}

export interface DashboardStats {
    bookings: number
    completed: number
    revenue: number
    pending: number
}

export interface ChartDataPoint {
    date: string
    bookings: number
    completed: number
    revenue: number
}


// --------------------
// --- API Hooks ---
// --------------------

export const useDashboardStats = (dateRange: { from: string, to: string }) => {
  const { getToken } = useAuth()
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats", dateRange],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({ 
          from_date: dateRange.from, 
          to_date: dateRange.to 
      });
      return apiClient(`/dashboard-stats?${params.toString()}`, token)
    },
    enabled: !!dateRange.from && !!dateRange.to,
  })
}

export const useDashboardChartData = (days: number = 30) => {
  const { getToken } = useAuth()
  return useQuery<ChartDataPoint[]>({
    queryKey: ["dashboardChartData", days],
    queryFn: async () => {
      const token = await getToken()
      return apiClient(`/dashboard-chart-data?days=${days}`, token)
    },
  })
}

export const useRecentActivity = () => {
  const { getToken } = useAuth()
  return useQuery<Activity[]>({
    queryKey: ["recentActivity"],
    queryFn: async () => {
      const token = await getToken()
      return apiClient("/recent-activity", token)
    },
  })
}

export const useBookings = () => {
  const { getToken } = useAuth()
  return useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const token = await getToken()
      return apiClient("/bookings", token)
    },
  })
}

export const useBookingById = (id: string) => {
  const { getToken } = useAuth()
  return useQuery<Booking>({
    queryKey: ["bookings", id],
    queryFn: async () => {
      const token = await getToken()
      const bookings = await apiClient("/bookings", token) as Booking[]
      const booking = bookings.find(b => (b.id === id || b._id === id))
      if (!booking) {
        throw new Error("Booking not found")
      }
      return booking
    },
    enabled: !!id,
  })
}

export const useSaveBooking = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<Booking, Error, { data: BookingIn, id?: string }>({
    mutationFn: async (booking) => {
      const token = await getToken()
      const endpoint = booking.id ? `/bookings/${booking.id}` : "/bookings"
      const method = booking.id ? "PUT" : "POST"
      
      return apiClient(endpoint, token, {
        method: method,
        body: JSON.stringify(booking.data),
      })
    },
    onSuccess: (savedBooking) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })
      queryClient.invalidateQueries({ queryKey: ["dashboardChartData"] })
      const id = savedBooking.id || savedBooking._id
      if (id) {
        queryClient.setQueryData(["bookings", id], savedBooking)
      }
      toast.success(id ? "Booking updated!" : "Booking created successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to save booking: ${error.message}`)
    },
  })
}

export const useDeleteBooking = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<null, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken()
      return apiClient(`/bookings/${id}`, token, { method: "DELETE" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })
      queryClient.invalidateQueries({ queryKey: ["dashboardChartData"] })
      toast.success("Booking deleted.")
    },
    onError: (error) => {
      toast.error(`Failed to delete booking: ${error.message}`)
    },
  })
}

export const useUpdateBookingStatus = () => {
    const queryClient = useQueryClient()
    const { getToken } = useAuth()

    return useMutation<Booking, Error, { id: string; status: Booking["status"] }>({
        mutationFn: async (variables) => {
            const { id, status } = variables
            const token = await getToken()
            return apiClient(`/bookings/${id}/status`, token, {
                method: "PUT",
                body: JSON.stringify({ status: status }),
            })
        },
        onSuccess: (updatedBooking) => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] })
            const id = updatedBooking.id || updatedBooking._id
            if (id) {
                queryClient.setQueryData(["bookings", id], updatedBooking)
            }
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })
            queryClient.invalidateQueries({ queryKey: ["dashboardChartData"] })
            toast.success("Booking status updated.")
        },
        onError: (error) => {
            toast.error(`Failed to update status: ${error.message}`)
        },
    })
}

export const useEmployees = () => {
  const { getToken } = useAuth()
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const token = await getToken()
      return apiClient("/employees", token)
    },
  })
}

export const useSaveEmployee = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<Employee, Error, { data: EmployeeIn, id?: string }>({
    mutationFn: async (employee) => {
      const token = await getToken()
      const endpoint = employee.id ? `/employees/${employee.id}` : "/employees"
      const method = employee.id ? "PUT" : "POST"
      
      return apiClient(endpoint, token, {
        method: method,
        body: JSON.stringify(employee.data),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      toast.success(variables.id ? "Employee updated!" : "Employee added!")
    },
    onError: (error) => {
      toast.error(`Failed to save employee: ${error.message}`)
    },
  })
}

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<null, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken()
      return apiClient(`/employees/${id}`, token, { method: "DELETE" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      toast.success("Employee deleted.")
    },
    onError: (error) => {
      toast.error(`Failed to delete employee: ${error.message}`)
    },
  })
}

export const useDepartments = () => {
  const { getToken } = useAuth()
  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const token = await getToken()
      return apiClient("/departments", token)
    },
  })
}

export const useSaveDepartment = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<Department, Error, DepartmentIn>({
    mutationFn: async (department) => {
      const token = await getToken()
      return apiClient("/departments", token, {
        method: "POST",
        body: JSON.stringify(department),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] })
      toast.success("Department created!")
    },
    onError: (error) => {
      toast.error(`Failed to create department: ${error.message}`)
    },
  })
}

export const useCustomers = () => {
  const { getToken } = useAuth()
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const token = await getToken()
      return apiClient("/customers", token)
    },
  })
}

export const useSaveCustomer = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<Customer, Error, { data: CustomerIn, id?: string }>({
    mutationFn: async (customer) => {
      const token = await getToken()
      if (customer.id) {
        const endpoint = `/customers/${customer.id}`;
        return apiClient(endpoint, token, { method: "PUT", body: JSON.stringify(customer.data) });
      }
      const endpoint = "/customers";
      return apiClient(endpoint, token, { method: "POST", body: JSON.stringify(customer.data) });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success(variables.id ? "Customer updated!" : "Customer added!")
    },
    onError: (error) => {
      toast.error(`Failed to save customer: ${error.message}`)
    },
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<null, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken()
      return apiClient(`/customers/${id}`, token, { method: "DELETE" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Customer deleted.")
    },
    onError: (error) => {
      toast.error(`Failed to delete customer: ${error.message}`)
    },
  })
}

export const useParts = () => {
  const { getToken } = useAuth()
  return useQuery<Part[]>({
    queryKey: ["parts"],
    queryFn: async () => {
      const token = await getToken()
      return apiClient("/parts", token)
    },
  })
}

export const useSavePart = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<Part, Error, { data: PartIn, id?: string }>({
    mutationFn: async (part) => {
      const token = await getToken()
      if (part.id) {
        const endpoint = `/parts/${part.id}`;
        return apiClient(endpoint, token, { method: "PUT", body: JSON.stringify(part.data) });
      }
      const endpoint = "/parts";
      return apiClient(endpoint, token, { method: "POST", body: JSON.stringify(part.data) });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["parts"] })
      toast.success(variables.id ? "Part updated!" : "Part added!")
    },
    onError: (error) => {
      toast.error(`Failed to save part: ${error.message}`)
    },
  })
}

export const useDeletePart = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<null, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken()
      return apiClient(`/parts/${id}`, token, { method: "DELETE" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] })
      toast.success("Part deleted.")
    },
    onError: (error) => {
      toast.error(`Failed to delete part: ${error.message}`)
    },
  })
}

export const useJobCards = () => {
  const { getToken } = useAuth()
  return useQuery<JobCard[]>({
    queryKey: ["jobcards"],
    queryFn: async () => {
      const token = await getToken()
      return apiClient("/jobcards", token)
    },
  })
}

export const useJobCard = (id: string) => {
  const { getToken } = useAuth()
  return useQuery<JobCard>({
    queryKey: ["jobcards", id],
    queryFn: async () => {
      const token = await getToken()
      const jobcards = await apiClient("/jobcards", token) as JobCard[]
      const jobcard = jobcards.find(j => (j.id === id || j._id === id))
      if (!jobcard) {
        throw new Error("JobCard not found")
      }
      return jobcard
    },
    enabled: !!id,
  })
}

export const useSaveJobCard = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<JobCard, Error, { data: JobCardIn, id?: string }>({
    mutationFn: async (jobcard) => {
      const token = await getToken()
      if (jobcard.id) {
        const endpoint = `/jobcards/${jobcard.id}`;
        return apiClient(endpoint, token, { method: "PUT", body: JSON.stringify(jobcard.data) });
      }
      const endpoint = "/jobcards";
      return apiClient(endpoint, token, { method: "POST", body: JSON.stringify(jobcard.data) });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["jobcards"] })
      toast.success(variables.id ? "Job Card updated!" : "Job Card created!")
    },
    onError: (error) => {
      toast.error(`Failed to save Job Card: ${error.message}`)
    },
  })
}

export const useInvoices = () => {
  const { getToken } = useAuth()
  return useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const token = await getToken()
      return apiClient("/invoices", token)
    },
  })
}

export const useSaveInvoice = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<Invoice, Error, { data: InvoiceIn, id?: string }>({
    mutationFn: async (invoice) => {
      const token = await getToken()
      if (invoice.id) {
        const endpoint = `/invoices/${invoice.id}`;
        return apiClient(endpoint, token, { method: "PUT", body: JSON.stringify(invoice.data) });
      }
      const endpoint = "/invoices";
      return apiClient(endpoint, token, { method: "POST", body: JSON.stringify(invoice.data) });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })
      queryClient.invalidateQueries({ queryKey: ["dashboardChartData"] })
      toast.success(variables.id ? "Invoice updated!" : "Invoice created!")
    },
    onError: (error) => {
      toast.error(`Failed to save invoice: ${error.message}`)
    },
  })
}

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<null, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken()
      return apiClient(`/invoices/${id}`, token, { method: "DELETE" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] })
      queryClient.invalidateQueries({ queryKey: ["dashboardChartData"] })
      toast.success("Invoice deleted.")
    },
    onError: (error) => {
      toast.error(`Failed to delete invoice: ${error.message}`)
    },
  })
}