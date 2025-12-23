"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from "recharts"
import { Clock, Calendar as CalendarIcon, Loader2, TrendingUp, AlertCircle, Building, FileText, Wrench, Users } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from "date-fns"
import { useAuth } from "@/contexts/AppProviders"
import { useDashboardStats, useRecentActivity, useDashboardChartData } from "@/hooks/useApi"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [workshopName, setWorkshopName] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // State for date range picker
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const [filterType, setFilterType] = useState<"day" | "week" | "month" | "year" | "custom">("day")
  
  // Format dates for API query
  const apiDateRange = {
    from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
    to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
  }

  // --- Live Data Fetching ---
  const { data: stats, isLoading: isLoadingStats, isError: isErrorStats } = useDashboardStats(apiDateRange)
  const { data: activities, isLoading: isLoadingActivity, isError: isErrorActivity } = useRecentActivity()
  const { data: chartData, isLoading: isLoadingCharts } = useDashboardChartData(30) 

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole")
    setUserRole(role)
    
    // Redirect if not logged in (neither admin nor user)
    if (!role && !user) {
      router.push("/")
      return
    }
    
    if (role === 'admin') {
        setWorkshopName("Admin Dashboard")
    } else {
        setWorkshopName(user?.displayName || "My Workshop")
    }
  }, [router, user])

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


  if (!mounted || (!user && userRole !== 'admin')) {
    return null 
  }


  const renderStat = (value: number | undefined, prefix = "") => {
    if (isLoadingStats) return <Skeleton className="h-8 w-24" />
    if (isErrorStats) return <span className="text-destructive text-sm">Error</span>
    return <div className="text-3xl font-bold">{prefix}{value?.toLocaleString() || 0}</div>
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {userRole === 'admin' ? "Global Overview" : workshopName}
          </p>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {userRole === 'admin' ? "Global Bookings" : "Total Bookings"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStat(stats?.bookings)}
              <p className="text-xs text-muted-foreground mt-1">Total volume</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                 {userRole === 'admin' ? "Global Completed Jobs" : "Completed Jobs"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStat(stats?.completed)}
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.bookings && stats.bookings > 0 ? `${((stats.completed / stats.bookings) * 100).toFixed(0)}% rate` : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {userRole === 'admin' ? "Global Revenue" : "Revenue"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStat(stats?.revenue, "₹")}
              <p className="text-xs text-muted-foreground mt-1">From paid invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {userRole === 'admin' ? "Global Pending" : "Pending Tasks"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStat(stats?.pending)}
              <p className="text-xs text-muted-foreground mt-1">Active jobs</p>
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
                {isLoadingCharts ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : (
                <BarChart data={chartData || []}>
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
                  <Bar dataKey="bookings" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Bookings" />
                  <Bar dataKey="completed" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Completed" />
                </BarChart>
                )}
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
                {isLoadingCharts ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : (
                <LineChart data={chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
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
                    name="Revenue"
                  />
                </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Hidden for Admin */}
        {userRole !== 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest bookings and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingActivity && <Loader2 className="animate-spin" />}
                {isErrorActivity && <p className="text-destructive">Failed to load activity.</p>}
                {activities && activities.length === 0 && (
                  <p className="text-muted-foreground">No recent activity.</p>
                )}
                {activities?.map((activity, index) => (
                  <div key={activity.id || activity._id || index} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconForActivity iconName={activity.icon} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.created_at ? format(parseISO(activity.created_at), "MMM d, h:mm a") : "Just now"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

const IconForActivity = ({ iconName }: { iconName: string }) => {
    const iconMap: { [key: string]: React.ElementType } = {
        Clock: Clock,
        FileText: FileText,
        Wrench: Wrench,
        TrendingUp: TrendingUp,
        UserPlus: Users, 
        Building: Building, 
        Users: Users, 
        DollarSign: FileText,
        Package: Wrench, 
        Trash2: AlertCircle,
        Edit2: Wrench,
    };
    const Icon = iconMap[iconName] || Clock; 
    return <Icon className="w-4 h-4 text-primary" />;
}