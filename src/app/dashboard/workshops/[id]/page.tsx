"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Phone, Calendar as CalendarIcon, FileText } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAdminJobCards } from "@/hooks/useApi"

export default function WorkshopDetailPage() {
  const router = useRouter()
  const params = useParams()
  const workshopId = params.id as string
  const [mounted, setMounted] = useState(false)

  const { data: jobCards = [], isLoading } = useAdminJobCards(workshopId)

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole") as "admin" | "workshop" | null
    if (!role || role !== "admin") {
      router.push("/dashboard")
    }
  }, [router])

  if (!mounted) return null

  // Calculate amount summary per job card
  const getJobCardTotal = (card: any) => {
      const partsTotal = card.spareParts?.reduce((acc: number, p: any) => acc + (p.price * p.quantity), 0) || 0
      const servicesTotal = card.services?.reduce((acc: number, s: any) => acc + s.cost, 0) || 0
      return partsTotal + servicesTotal
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workshops
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workshop Details</h1>
            <p className="text-muted-foreground">Job Cards and Performance Data</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Cards List</CardTitle>
            <CardDescription>All job cards created by this workshop</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer Name</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vehicle</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contact</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount Summary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobCards.length > 0 ? (
                                jobCards.map((card) => {
                                    const total = getJobCardTotal(card)
                                    return (
                                        <tr key={card.id || card._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4 font-medium">{card.customer}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{card.vehicle}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                                    {card.phone || "N/A"}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                                                    {card.date}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-foreground">
                                                ₹{total.toLocaleString()}
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                        No job cards found for this workshop.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}