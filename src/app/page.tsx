"use client"

import type React from "react"
import { useState, useEffect } from "react"

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

// Import Toast
import { ToastContainer, toast, Slide } from 'react-toastify';
//import 'react-toastify/dist/ReactToastify.css'; // <-- CSS import added

// Assuming these paths are correct in your project structure
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, UserPlus, Mail, Lock, Building, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Shield, Wrench, Sparkles, PartyPopper, Rocket } from "lucide-react" 


// Password validation helper
const validatePassword = (password: string) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    }
  }
}

// Email validation helper
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formType, setFormType] = useState<"admin" | "workshop">("workshop")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [workshopName, setWorkshopName] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Enhanced state management
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof validatePassword> | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Check for existing authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, you could automatically redirect here if desired
        console.log("User already signed in:", user.email)
      }
    })

    return () => unsubscribe()
  }, [])

  // Validate password in real-time
  useEffect(() => {
    if (password && !isLogin) {
      setPasswordStrength(validatePassword(password))
    } else {
      setPasswordStrength(null)
    }
  }, [password, isLogin])

  // Clear messages when form type changes
  useEffect(() => {
    setError(null)
    setSuccess(null)
  }, [formType, isLogin])

const showSuccessToast = (message: string) => {
  toast.success(
    <div className="flex items-center gap-2 p-2">
      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-3 h-3 text-green-600" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white text-xs">Success!</p>
        <p className="text-xs text-white/90">{message}</p>
      </div>
    </div>,
    {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
      icon: false,
      style: {
        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        border: "none",
        borderRadius: "8px",
        boxShadow: "0 4px 12px -2px rgba(16, 185, 129, 0.3)",
        color: "white",
        minHeight: "50px",
        fontFamily: "'Inter', sans-serif",
        padding: "8px",
      },
    }
  );
}

const showCelebrationToast = (message: string) => {
  toast.success(
    <div className="flex items-center gap-2 p-2">
      <div className="flex-shrink-0 w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
        <PartyPopper className="w-3 h-3 text-yellow-600" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white text-xs">Welcome! 🎉</p>
        <p className="text-xs text-white/90">{message}</p>
      </div>
    </div>,
    {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
      icon: false,
      style: {
        background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        border: "none",
        borderRadius: "8px",
        boxShadow: "0 4px 12px -2px rgba(245, 158, 11, 0.3)",
        color: "white",
        minHeight: "50px",
        fontFamily: "'Inter', sans-serif",
        padding: "8px",
      },
    }
  );
}

const showErrorToast = (message: string) => {
  toast.error(
    <div className="flex items-center gap-2 p-2">
      <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-3 h-3 text-red-600" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white text-xs">Oops!</p>
        <p className="text-xs text-white/90">{message}</p>
      </div>
    </div>,
    {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
      icon: false,
      style: {
        background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
        border: "none",
        borderRadius: "8px",
        boxShadow: "0 4px 12px -2px rgba(239, 68, 68, 0.3)",
        color: "white",
        minHeight: "50px",
        fontFamily: "'Inter', sans-serif",
        padding: "8px",
      },
    }
  );
}

const showInfoToast = (message: string) => {
  toast.info(
    <div className="flex items-center gap-2 p-2">
      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
        <Rocket className="w-3 h-3 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white text-xs">Heads up!</p>
        <p className="text-xs text-white/90">{message}</p>
      </div>
    </div>,
    {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
      icon: false,
      style: {
        background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
        border: "none",
        borderRadius: "8px",
        boxShadow: "0 4px 12px -2px rgba(59, 130, 246, 0.3)",
        color: "white",
        minHeight: "50px",
        fontFamily: "'Inter', sans-serif",
        padding: "8px",
      },
    }
  );
}

const showRedirectToast = () => {
  toast.info(
    <div className="flex items-center gap-2 p-2">
      <div className="flex-shrink-0">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white text-xs">Almost there!</p>
        <p className="text-xs text-white/90">Redirecting...</p>
      </div>
    </div>,
    {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "light",
      transition: Slide,
      icon: false,
      style: {
        background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
        border: "none",
        borderRadius: "8px",
        boxShadow: "0 4px 12px -2px rgba(139, 92, 246, 0.3)",
        color: "white",
        minHeight: "50px",
        fontFamily: "'Inter', sans-serif",
        padding: "8px",
      },
    }
  );
}

  // -----------------------------------------------------------------
  // ------------------ [UPDATED] handleSubmit Function ------------------
  // -----------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Client-side validation
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      showErrorToast("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    if (!isLogin && formType === "workshop" && !workshopName.trim()) {
      setError("Workshop name is required")
      showErrorToast("Workshop name is required")
      setIsLoading(false)
      return
    }

    try {
      // --- [NEW] ADMIN-SPECIFIC API LOGIN ---
      if (formType === "admin") {
        
        // Call our secure server-side API route
        const response = await fetch('/api/admin-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          // If response is not 200-299 (e.g., 401 Unauthorized), throw an error
          throw new Error(data.message || 'Admin login failed');
        }

        // Admin login SUCCESS
        localStorage.setItem("userRole", "admin")
        localStorage.setItem("userEmail", email)
        localStorage.setItem("userId", "admin_static_user_001") // Static ID for non-Firebase admin
        
        showCelebrationToast(data.message || "Admin login successful! 🚀")
        setIsRedirecting(true)
        showRedirectToast()

        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 2000)

      
      // --- [EXISTING] WORKSHOP LOGIN/SIGNUP LOGIC ---
      } else if (formType === "workshop") {
        
        if (isLogin) {
          // --- User is logging in (Workshop) ---
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          const user = userCredential.user

          if (!user.emailVerified) {
             // Check for email verification on login
            setSuccess("Please verify your email before signing in.")
            showInfoToast("Please verify your email before signing in.")
            setIsLoading(false) // Stop loading, don't log in
            return;
          }

          localStorage.setItem("userRole", formType)
          localStorage.setItem("userEmail", user.email || "")
          localStorage.setItem("userId", user.uid)
          localStorage.setItem("workshopName", user.displayName || "Workshop")

          showCelebrationToast("Login successful! Welcome back! 🚀")
          setIsRedirecting(true)
          showRedirectToast()

          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 2000)

        } else {
          // --- User is signing up (Workshop only) ---
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          const user = userCredential.user

          await updateProfile(user, {
            displayName: workshopName.trim(),
          })

          await sendEmailVerification(user)

          showSuccessToast("Account created successfully! 🎉")
          setTimeout(() => {
            showCelebrationToast("Welcome to DrvynGRM! Get ready to streamline your garage operations!")
          }, 500)

          setIsLogin(true)
          setSuccess("Account created! Please check your email to verify your account before signing in.")
          showInfoToast("Please check your email to verify your account before signing in.")
          
          setEmail("")
          setPassword("")
          setWorkshopName("")
          setPasswordStrength(null)
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err)
      
      let friendlyError = "An unexpected error occurred. Please try again."
      
      if (err.code) { // This is a Firebase error
        switch (err.code) {
          case "auth/email-already-in-use":
            friendlyError = "This email is already registered. Please sign in instead."
            setIsLogin(true)
            break
          // Use modern error codes
          case "auth/user-does-not-exist":
            friendlyError = "No account found with this email. Please sign up first."
            if (formType === "workshop") setIsLogin(false)
            break
          case "auth/invalid-credential":
            friendlyError = "Incorrect email or password. Please try again."
            break
          case "auth/too-many-requests":
            friendlyError = "Too many failed attempts. Please try again later."
            break
          case "auth/network-request-failed":
            friendlyError = "Network error. Please check your connection and try again."
            break
          case "auth/invalid-email":
            friendlyError = "Invalid email address format."
            break
          case "auth/weak-password":
            friendlyError = "Password is too weak. Please use a stronger password."
            break
          default:
            friendlyError = err.message
              .replace("Firebase: ", "")
              .replace(/ *\([^)]*\) */g, "")
        }
      } else if (err.message) { // This is likely our admin fetch error
          friendlyError = err.message
      }
      
      setError(friendlyError)
      showErrorToast(friendlyError)

    } finally {
      // Only stop loading if we aren't in the middle of a successful redirect
      if (!isRedirecting) {
        setIsLoading(false)
      }
    }
  }
  // -----------------------------------------------------------------
  // ------------------ End of handleSubmit Function -----------------
  // -----------------------------------------------------------------

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div
      className="min-h-screen bg-background flex"
    >
      {/* Enhanced Toast Container with Custom Styling */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
        style={{
          top: '20px',
          right: '20px',
        }}
        toastStyle={{
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)',
          minHeight: '80px',
        }}
      />

      {/* Left Side - Auth Form (40%) */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        {/* Admin Button - Top Right Corner */}
        <div className="absolute top-6 right-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFormType("admin")
              setIsLogin(true) // Admin is always a login
              setError(null)
              setSuccess(null)
            }}
            disabled={isLoading || isRedirecting}
            className="flex items-center gap-2 border-primary/30 hover:border-primary/50"
          >
            <Shield className="w-4 h-4" />
            Admin
          </Button>
        </div>

        <div className="mx-auto w-full max-w-sm">
          {/* Header - Centered as before */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <img
                src="/favicon3.png"
                alt="DrvynGRM Logo"
                className="w-14 h-14" 
              />
              <h1 className="text-3xl font-bold text-foreground">DrvynGRM</h1>
            </div>
            <p className="text-lg text-muted-foreground font-medium">Professional Garage Management</p>
          </div>

          {/* Role Toggle - Only show workshop option now */}
          <div className="flex mb-6 bg-muted/50 rounded-lg p-1 w-full">
            <button
              type="button"
              onClick={() => {
                setFormType("workshop")
                setIsLogin(true)
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                formType === "workshop" 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              disabled={isLoading || isRedirecting}
            >
              <Wrench className="w-4 h-4" />
              Workshop
            </button>
          </div>

          {/* Auth Card */}
          <Card className="border-border shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex justify-center items-center gap-2">
                {formType === "admin" ? (
                  <>Admin Sign In</>
                ) : isLogin ? (
                  <>Workshop Sign In</>
                ) : (
                  <>Create Workshop Account</>
                )}
              </CardTitle>
              <CardDescription className="text-center">
                {formType === "admin"
                  ? "Access the platform admin dashboard"
                  : isLogin
                    ? "Access your garage dashboard"
                    : "Set up your garage account in minutes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form Fields */}
                <div className="space-y-3">
                  {!isLogin && formType === "workshop" && (
                    <div className="space-y-2">
                      <Label htmlFor="workshop" className="text-sm font-medium">
                        Workshop Name *
                      </Label>
                      <div className="relative">
                        <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="workshop"
                          placeholder="e.g., City Auto Repair"
                          value={workshopName}
                          onChange={(e) => setWorkshopName(e.target.value)}
                          required
                          disabled={isLoading || isRedirecting}
                          className="pl-10"
                          minLength={2}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading || isRedirecting}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password *
                    </Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading || isRedirecting}
                        className="pl-10 pr-10"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading || isRedirecting}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Messages */}
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200"
                  size="lg"
                  disabled={isLoading || isRedirecting}
                >
                  {isLoading || isRedirecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isRedirecting ? "Redirecting..." : "Processing..."}
                    </>
                  ) : isLogin || formType === "admin" ? (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>

                {/* Toggle between Login and Signup */}
                {formType === "workshop" && (
                  <div className="text-center text-sm pt-2">
                    <span className="text-muted-foreground">
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-primary hover:underline font-medium transition-colors"
                      disabled={isLoading || isRedirecting}
                    >
                      {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} DrvynGRM. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Background Image (60%) */}
      <div className="hidden lg:flex w-3/5 relative bg-cover bg-center bg-no-repeat 
                  [background-image:url('/bg4.png')]">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content on background */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="space-y-6 max-w-lg">
            <h2 className="text-4xl font-bold leading-tight">
              Streamline Your Garage Operations
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed">
              Manage appointments, inventory, customers, and billing all in one place with DrvynGRM's comprehensive garage management solution.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-base">Automated appointment scheduling</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-base">Real-time inventory tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-base">Customer relationship management</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-base">Comprehensive billing & reporting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}