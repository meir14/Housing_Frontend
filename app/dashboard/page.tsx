"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/Navbar"
import MyListings from "@/components/dashboard/MyListings"
import MyProfile from "@/components/dashboard/MyProfile"
import MyApplications from "@/components/dashboard/MyApplications"
import { useAuth } from "@/hooks/useAuth"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("listings")
  const router = useRouter()
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push("/auth")
    return null
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar isHouseOwner={false} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>Manage your listings, profile, and applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="listings">My Listings</TabsTrigger>
                <TabsTrigger value="profile">My Profile</TabsTrigger>
                <TabsTrigger value="applications">My Applications</TabsTrigger>
              </TabsList>
              <TabsContent value="listings">
                <MyListings />
              </TabsContent>
              <TabsContent value="profile">
                <MyProfile />
              </TabsContent>
              <TabsContent value="applications">
                <MyApplications />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

