"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "recharts"
import { Wrench, Users, FileText, Settings, TrendingUp, Clock, Calendar as CalendarIcon } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns"

// Helper function to generate daily data for the last 30 days
const generateDailyData = () => {
  const data = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i)
    data.push({
      date: format(date, "MM/dd"),
      bookings: Math.floor(Math.random() * 15) + 5,
      completed: Math.floor(Math.random() * 10) + 5,
      revenue: (Math.floor(Math.random() * 10) + 5) * 100 + Math.floor(Math.random() * 99),
    })
  }
  return data
}

const dailyChartData = generateDailyData()

// Mock data for stats simulation
const MOCK_STATS_DB = {
  day: { bookings: 12, completed: 9, revenue: 1150, pending: 3 },
  week: { bookings: 84, completed: 72, revenue: 9200, pending: 12 },
  month: { bookings: 312, completed: 289, revenue: 34200, pending: 23 },
  year: { bookings: 3500, completed: 3200, revenue: 410000, pending: 150 },
  custom: { bookings: 42, completed: 38, revenue: 4800, pending: 4 },
}

export default function DashboardPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"admin" | "workshop" | null>(null)
  const [workshopName, setWorkshopName] = useState("")
  const [mounted, setMounted] = useState(false)

  // State for stats
  const [stats, setStats] = useState(MOCK_STATS_DB.day)
  // State for date range picker
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const [filterType, setFilterType] = useState<"day" | "week" | "month" | "year" | "custom">("day")

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole") as "admin" | "workshop" | null
    const workshop = localStorage.getItem("workshopName") || "My Workshop"

    if (!role) {
      router.push("/")
      return
    }

    setUserRole(role)
    setWorkshopName(workshop)
  }, [router])

  // Effect to "fetch" data when date changes
  useEffect(() => {
    // Simulate API call based on filterType
    console.log("Fetching data for:", filterType, date)
    switch (filterType) {
      case "day":
        setStats(MOCK_STATS_DB.day)
        break
      case "week":
        setStats(MOCK_STATS_DB.week)
        break
      case "month":
        setStats(MOCK_STATS_DB.month)
        break
      case "year":
        setStats(MOCK_STATS_DB.year)
        break
      case "custom":
        // In a real app, you'd fetch using the 'date' range
        setStats(MOCK_STATS_DB.custom)
        break
      default:
        setStats(MOCK_STATS_DB.day)
    }
  }, [date, filterType])

  const setDateFilter = (type: "day" | "week" | "month" | "year") => {
    setFilterType(type)
    const today = new Date()
    if (type === "day") {
      setDate({ from: today, to: today })
    } else if (type === "week") {
      setDate({ from: startOfWeek(today), to: endOfWeek(today) })
    } else if (type === "month") {
      setDate({ from: startOfMonth(today), to: endOfMonth(today) })
    } else if (type === "year") {
      setDate({ from: new Date(today.getFullYear(), 0, 1), to: new Date(today.getFullYear(), 11, 31) })
    }
  }
  
  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate)
    setFilterType("custom")
  }

  if (!mounted || !userRole) {
    return null
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{workshopName}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant={filterType === "day" ? "default" : "outline"} onClick={() => setDateFilter("day")}>Today</Button>
          <Button variant={filterType === "week" ? "default" : "outline"} onClick={() => setDateFilter("week")}>This Week</Button>
          <Button variant={filterType === "month" ? "default" : "outline"} onClick={() => setDateFilter("month")}>This Month</Button>
          <Button variant={filterType === "year" ? "default" : "outline"} onClick={() => setDateFilter("year")}>This Year</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full sm:w-[240px] justify-start text-left font-normal ${filterType === "custom" ? "border-primary" : ""}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.bookings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.completed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">92.6% completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹{stats.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">+8% from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.pending.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bookings Trend</CardTitle>
              <CardDescription>Past 30 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="bookings" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
              <CardDescription>Past 30 days revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} refX="₹" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest bookings and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "New booking from John Smith", time: "2 hours ago", icon: Clock },
                { title: "Invoice #INV-2024-001 sent", time: "4 hours ago", icon: FileText },
                { title: "Job #JOB-2024-045 completed", time: "6 hours ago", icon: Wrench },
                { title: "Payment received: $1,250", time: "1 day ago", icon: TrendingUp },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <activity.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
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