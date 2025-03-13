"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [schoolName, setSchoolName] = useState("")
  const [email, setEmail] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    } else if (user) {
      const fetchUserData = async () => {
        const { data, error } = await supabase.from("users").select("school_name, email").eq("id", user.id).single()

        if (error) {
          console.error("Error fetching user data:", error)
          setMessage("Error fetching user data. Please try again.")
        } else if (data) {
          setSchoolName(data.school_name || "")
          setEmail(data.email || "")
        }
      }
      fetchUserData()
    }
  }, [user, loading, router])

  const handleUpdateSchoolName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({ school_name: schoolName, last_updated: new Date().toISOString() })
        .eq("id", user.id)

      if (error) throw error

      setMessage("School name updated successfully!")
    } catch (error) {
      setMessage("Error updating school name. Please try again.")
      console.error("Error updating school name:", error)
    }
    setIsUpdating(false)
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      setMessage("Error signing out. Please try again.")
    }
  }

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Navbar isHouseOwner={false} hideProfileButton={true} />
      <div className="flex-grow py-8">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>View and update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSchoolName} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-name">School Name</Label>
                  <Input
                    id="school-name"
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update School Name"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-4">
              {message && (
                <p
                  className={`text-center w-full ${
                    message.includes("successfully") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700"
              >
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

