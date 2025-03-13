"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { isSupabaseConfigured } from "@/lib/supabase"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signupSchema = loginSchema.extend({
  school_name: z.string().min(2, "School name must be at least 2 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

export default function LoginSignupForms() {
  const [activeTab, setActiveTab] = useState("login")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      if (!isSupabaseConfigured()) {
        setMessage("Supabase is not properly configured. Please check your environment variables.")
        return
      }
      setIsLoading(true)
      setMessage("")

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email.toLowerCase(),
        password: data.password,
      })
      if (error) throw error

      setMessage("Logged in successfully!")
      window.location.href = "/"
    } catch (error: any) {
      console.error("Login error:", error)
      setMessage(error.message || "Failed to log in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      if (!isSupabaseConfigured()) {
        setMessage("Supabase is not properly configured. Please check your environment variables.")
        return
      }
      setIsLoading(true)
      setMessage("")

      const email = data.email.toLowerCase()

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: {
            school_name: data.school_name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        console.error("Signup error:", signUpError)
        throw signUpError
      }

      if (!authData.user) {
        throw new Error("Failed to create user account")
      }

      // Always redirect to confirmation page after successful signup
      // Don't wait for profile creation
      router.push("/signup-confirmation")

      // Try to create user profile in the background
      try {
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            email: email,
            school_name: data.school_name,
            account_creation_date: new Date().toISOString(),
            last_updated: new Date().toISOString(),
          },
        ])

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }
      } catch (profileError) {
        console.error("Profile creation exception:", profileError)
        // We don't throw this error since we've already redirected
      }
    } catch (error: any) {
      console.error("Signup process error:", error)
      setMessage(error.message || "Failed to create account. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-blue-100">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-blue-900">Welcome</CardTitle>
        <CardDescription>Login or create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...loginForm.register("email")}
                  className="border-blue-100 focus:border-blue-200 focus:ring-blue-200"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-sm">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  {...loginForm.register("password")}
                  className="border-blue-100 focus:border-blue-200 focus:ring-blue-200"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-sm">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Loading..." : "Login"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...signupForm.register("email")}
                  className="border-blue-100 focus:border-blue-200 focus:ring-blue-200"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-red-500 text-sm">{signupForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  {...signupForm.register("password")}
                  className="border-blue-100 focus:border-blue-200 focus:ring-blue-200"
                />
                {signupForm.formState.errors.password && (
                  <p className="text-red-500 text-sm">{signupForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-school">School Name</Label>
                <Input
                  id="signup-school"
                  type="text"
                  placeholder="e.g., University of Oxford"
                  {...signupForm.register("school_name")}
                  className="border-blue-100 focus:border-blue-200 focus:ring-blue-200"
                />
                {signupForm.formState.errors.school_name && (
                  <p className="text-red-500 text-sm">{signupForm.formState.errors.school_name.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Loading..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        {message && (
          <p className={`text-center w-full ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </CardFooter>
    </Card>
  )
}

