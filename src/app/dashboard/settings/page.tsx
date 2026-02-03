"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import DashboardLayout from "@/components/dashboard-layout"
import { useSettings, useSaveSettings } from "@/hooks/useApi"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const { mutate: saveSettings, isPending } = useSaveSettings()
  const { setTheme, theme } = useTheme()
  
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    taxNumber: "",
    website: "",
    invoicePrefix: "INV-",
    invoiceTerms: "Payment due upon receipt.",
    notifications: true,
    darkMode: false,
  })

  // Sync state with backend data
  useEffect(() => {
    if (settings) {
      setFormData({
        businessName: settings.businessName || "",
        email: settings.email || "",
        phone: settings.phone || "",
        address: settings.address || "",
        taxNumber: settings.taxNumber || "",
        website: settings.website || "",
        invoicePrefix: settings.invoicePrefix || "INV-",
        invoiceTerms: settings.invoiceTerms || "Payment due upon receipt.",
        notifications: settings.notifications ?? true,
        darkMode: settings.darkMode ?? false,
      })
      
      // Sync theme with backend preference
      if (settings.darkMode !== undefined) {
         setTheme(settings.darkMode ? "dark" : "light")
      }
    }
  }, [settings, setTheme])

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    saveSettings(formData)
  }
  
  const handleDarkModeToggle = (checked: boolean) => {
      handleChange("darkMode", checked)
      setTheme(checked ? "dark" : "light")
      // Auto-save preference when toggled
      saveSettings({ ...formData, darkMode: checked })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
        <div className="space-y-4">
             <div className="h-40 bg-muted/50 rounded-lg animate-pulse" />
             <div className="h-40 bg-muted/50 rounded-lg animate-pulse" />
        </div>
      </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
    <div className="p-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your business profile and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isPending} className="bg-primary hover:bg-primary/90">
            {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Business Info */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Details used on invoices and reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                placeholder="Drvyn Garage"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contact@drvyn.in"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://drvyn.in"
                />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="taxNumber">Tax Number / GSTIN</Label>
                <Input
                id="taxNumber"
                value={formData.taxNumber}
                onChange={(e) => handleChange("taxNumber", e.target.value)}
                placeholder="22AAAAA0000A1Z5"
                />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Workshop St, Saharanpur, UP"
                rows={3}
                />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
          <CardDescription>Configure how your invoices look</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="prefix">Invoice Prefix</Label>
                    <Input
                    id="prefix"
                    value={formData.invoicePrefix}
                    onChange={(e) => handleChange("invoicePrefix", e.target.value)}
                    placeholder="INV-"
                    />
                </div>
           </div>
           <div className="space-y-2">
                <Label htmlFor="terms">Default Terms & Conditions</Label>
                <Textarea
                id="terms"
                value={formData.invoiceTerms}
                onChange={(e) => handleChange("invoiceTerms", e.target.value)}
                placeholder="Payment is due within 15 days..."
                rows={3}
                />
            </div>
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
              <p className="text-sm text-muted-foreground mt-1">Receive booking and invoice alerts</p>
            </div>
            <Switch
              id="notifications"
              checked={formData.notifications}
              onCheckedChange={(checked) => handleChange("notifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkmode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground mt-1">Enable dark theme interface</p>
            </div>
            <Switch
              id="darkmode"
              checked={formData.darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
         <Button onClick={handleSave} disabled={isPending} size="lg" className="bg-primary hover:bg-primary/90">
            {isPending ? "Saving Changes..." : "Save All Changes"}
        </Button>
      </div>
    </div>
    </DashboardLayout>
  )
}