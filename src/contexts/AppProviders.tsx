"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { getAuth, onAuthStateChanged, User, IdTokenResult } from "firebase/auth"
import { auth } from "@/lib/firebase" // <-- CORRECTED IMPORT
import { Loader2 } from "lucide-react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner" // Using sonner from your files

// --- Auth Context ---
interface AuthContextType {
  user: User | null
  loading: boolean
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const getToken = async (): Promise<string | null> => {
    if (!user) return null
    try {
      const token = await user.getIdToken()
      return token
    } catch (error) {
      console.error("Error getting auth token:", error)
      return null
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

// --- Query Client ---
const queryClient = new QueryClient()

// --- Combined Providers ---
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}