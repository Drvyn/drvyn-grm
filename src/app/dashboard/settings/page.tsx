"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import DashboardLayout from "@/components/dashboard-layout"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    workshopName: "",
    email: "",
    notifications: true,
    darkMode: false,
  })
  const [isMounted, setIsMounted] = useState(false)

  // Initialize settings from localStorage after component mounts
  useEffect(() => {
    setIsMounted(true)
    const workshopName = localStorage.getItem("workshopName") || ""
    const email = localStorage.getItem("userEmail") || ""
    const notifications = localStorage.getItem("notifications") !== "false" // Default to true
    const darkMode = localStorage.getItem("darkMode") === "true" // Default to false

    setSettings({
      workshopName,
      email,
      notifications,
      darkMode,
    })
  }, [])

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    if (!isMounted) return
    
    localStorage.setItem("workshopName", settings.workshopName)
    localStorage.setItem("userEmail", settings.email)
    localStorage.setItem("notifications", settings.notifications.toString())
    localStorage.setItem("darkMode", settings.darkMode.toString())
    
    alert("Settings saved successfully!")
  }

  // Apply dark mode to document
  useEffect(() => {
    if (!isMounted) return
    
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode, isMounted])

  // Don't render until component is mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workshop">Workshop Name</Label>
            <Input
              id="workshop"
              value={settings.workshopName}
              onChange={(e) => handleChange("workshopName", e.target.value)}
              placeholder="Your workshop name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground mt-1">Receive booking and invoice notifications</p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => handleChange("notifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkmode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground mt-1">Enable dark theme</p>
            </div>
            <Switch
              id="darkmode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleChange("darkMode", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
