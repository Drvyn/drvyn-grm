"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts"
import { Download, Filter, TrendingUp, TrendingDown, Users, Loader2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useReports } from "@/hooks/useApi"

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export default function ReportsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"admin" | "workshop" | null>(null)
  const [mounted, setMounted] = useState(false)

  const { data: reportData, isLoading } = useReports()

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole") as "admin" | "workshop" | null
    if (!role) {
      router.push("/") 
    } else {
      setUserRole(role)
    }
  }, [router])

  if (!mounted || !userRole) return null

  if (isLoading || !reportData) {
      return (
          <DashboardLayout>
              <div className="flex h-screen items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          </DashboardLayout>
      )
  }

  const { revenue_data, service_breakdown, customer_growth, top_customers, performance } = reportData
  const totalRevenue = revenue_data.reduce((sum, m) => sum + m.revenue, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Real-time business insights</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">From paid invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Job Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">₹{performance.avg_job_value}</div>
              <p className="text-xs text-muted-foreground mt-1">Revenue / Bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{performance.completion_rate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Jobs completed vs total</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Income trend over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                <Legend />
                <Bar dataKey="revenue" fill="var(--chart-1)" radius={[8, 8, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Service Breakdown</CardTitle>
              <CardDescription>Based on Booking Type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {service_breakdown.length > 0 ? (
                <PieChart>
                  <Pie
                    data={service_breakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {service_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">No service data available</div>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customer Growth */}
          <Card>
            <CardHeader>
              <CardTitle>New Customers</CardTitle>
              <CardDescription>First-time bookings per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={customer_growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                  <Legend />
                  <Line type="monotone" dataKey="newCustomers" stroke="var(--chart-2)" strokeWidth={2} name="New Customers" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Highest spending customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {top_customers.length > 0 ? top_customers.map((customer, idx) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.bookings} paid invoices</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <span className="font-sans">₹</span>
                      {customer.spent.toLocaleString()}
                    </p>
                  </div>
                </div>
              )) : (
                  <p className="text-center text-muted-foreground py-4">No data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}