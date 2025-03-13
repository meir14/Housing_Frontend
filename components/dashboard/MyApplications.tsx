"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { ChatInterface } from "@/components/chat/ChatInterface"

interface Application {
  id: string
  listing_id: string
  message: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  listing: {
    listing_title: string
    location: string
  }
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchApplications() {
      if (!user) return

      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          listing_id,
          status,
          message,
          created_at,
          listing:listings(listing_title, location)
        `,
        )
        .eq("user_id", user.id)

      if (error) {
        console.error("Error fetching applications:", error)
      } else {
        setApplications(data || [])
        if (data && data.length > 0) {
          setSelectedApplication(data[0])
        }
      }
      setLoading(false)
    }

    fetchApplications()
  }, [user])

  if (loading) {
    return <div>Loading your applications...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Applications</h2>
      {applications.length === 0 ? (
        <p>You haven't applied to any listings yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-4">
            {applications.map((application) => (
              <Card
                key={application.id}
                className={`cursor-pointer transition-colors ${
                  selectedApplication?.id === application.id ? "border-blue-500" : ""
                }`}
                onClick={() => setSelectedApplication(application)}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold">{application.listing.listing_title}</h3>
                  <p className="text-sm text-muted-foreground">{application.listing.location}</p>
                  <div className="mt-2">
                    <Badge
                      variant={
                        application.status === "accepted"
                          ? "success"
                          : application.status === "rejected"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Applied on: {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="col-span-2">
            {selectedApplication ? (
              <ChatInterface
                applicationId={selectedApplication.id}
                currentUserId={user?.id || ""}
                listingTitle={selectedApplication.listing.listing_title}
                initialMessage={selectedApplication.message}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Select an application to view the chat
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

