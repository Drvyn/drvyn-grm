"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, Filter, TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

const monthlyRevenueData = [
  { month: "Jan", revenue: 4500, target: 5000, expenses: 2000 },
  { month: "Feb", revenue: 5200, target: 5000, expenses: 2100 },
  { month: "Mar", revenue: 4800, target: 5000, expenses: 2050 },
  { month: "Apr", revenue: 6100, target: 5500, expenses: 2200 },
  { month: "May", revenue: 5500, target: 5500, expenses: 2150 },
  { month: "Jun", revenue: 6700, target: 6000, expenses: 2300 },
]

const serviceBreakdown = [
  { name: "Oil Changes", value: 28 },
  { name: "Tire Services", value: 22 },
  { name: "Brake Work", value: 18 },
  { name: "Diagnostics", value: 15 },
  { name: "Other", value: 17 },
]

const customerMetrics = [
  { month: "Jan", newCustomers: 12, returning: 45, total: 57 },
  { month: "Feb", newCustomers: 15, returning: 52, total: 67 },
  { month: "Mar", newCustomers: 10, returning: 58, total: 68 },
  { month: "Apr", newCustomers: 18, returning: 65, total: 83 },
  { month: "May", newCustomers: 14, returning: 72, total: 86 },
  { month: "Jun", newCustomers: 20, returning: 78, total: 98 },
]

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export default function ReportsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"admin" | "workshop" | null>(null)
  const [mounted, setMounted] = useState(false)

useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole") as "admin" | "workshop" | null
    // Allow if the role exists (is either "admin" or "workshop")
    if (!role) {
      router.push("/") // Redirect to login if no role found
    } else {
      setUserRole(role)
    }
  }, [router])

  if (!mounted || !userRole) return null

  const totalRevenue = monthlyRevenueData.reduce((sum, m) => sum + m.revenue, 0)
  const totalExpenses = monthlyRevenueData.reduce((sum, m) => sum + m.expenses, 0)
  const profit = totalRevenue - totalExpenses
  const profitMargin = ((profit / totalRevenue) * 100).toFixed(1)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Business performance and insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${(totalRevenue / 1000).toFixed(1)}K</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${(totalExpenses / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Operating costs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${(profit / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-1">{profitMargin}% margin</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Job Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">$285</div>
              <p className="text-xs text-muted-foreground mt-1">Per service</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue & Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                <Legend />
                <Bar dataKey="revenue" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Service Breakdown</CardTitle>
              <CardDescription>Distribution of services provided</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customer Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
              <CardDescription>New vs returning customers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={customerMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                  <Legend />
                  <Line type="monotone" dataKey="newCustomers" stroke="var(--chart-1)" strokeWidth={2} />
                  <Line type="monotone" dataKey="returning" stroke="var(--chart-2)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Booking Completion Rate</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-foreground">92.6%</span>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +2.1%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-foreground">4.7/5</span>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +0.2
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-foreground">2.3h</span>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    -0.5h
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Highest value customers this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Mike Davis", spent: 2100, bookings: 8 },
                { name: "John Smith", spent: 1250, bookings: 5 },
                { name: "Sarah Johnson", spent: 750, bookings: 3 },
                { name: "Emily Brown", spent: 680, bookings: 2 },
                { name: "Robert Wilson", spent: 620, bookings: 2 },
              ].map((customer, idx) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {customer.spent}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
