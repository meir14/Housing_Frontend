"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import Navbar from "@/components/Navbar"
import { ChatInterface } from "@/components/chat/ChatInterface"
import Image from "next/image"

interface Applicant {
  id: string
  user_id: string
  full_name: string
  age: number
  gender_pronouns: string
  study_level: string
  field_of_study: string
  about_me: string
  profile_photo: string | null
  application: {
    id: string
    message: string
  }
}

export default function ApplicantsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [listingTitle, setListingTitle] = useState("")

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      // Fetch listing title
      const { data: listingData } = await supabase.from("listings").select("listing_title").eq("id", id).single()

      if (listingData) {
        setListingTitle(listingData.listing_title)
      }

      // Fetch all applications for this listing
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("applications")
        .select("id, user_id, message")
        .eq("listing_id", id)

      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError)
        setLoading(false)
        return
      }

      // Fetch roommate profiles for the applicants
      const applicantProfiles = await Promise.all(
        applicationsData.map(async (application) => {
          const { data: roommateData, error: roommateError } = await supabase
            .from("roommates")
            .select("*")
            .eq("user_id", application.user_id)
            .single()

          if (roommateError) {
            console.error("Error fetching roommate profile:", roommateError)
            return null
          }

          return {
            ...roommateData,
            application: {
              id: application.id,
              message: application.message,
            },
          }
        }),
      )

      const validApplicants = applicantProfiles.filter((profile): profile is Applicant => profile !== null)
      setApplicants(validApplicants)
      if (validApplicants.length > 0) {
        setSelectedApplicant(validApplicants[0])
      }
      setLoading(false)
    }

    fetchData()
  }, [id, user])

  if (loading) {
    return <div>Loading applicants...</div>
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar isHouseOwner={false} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          Back to Listings
        </Button>
        <h1 className="text-2xl font-bold mb-6">Applicants for {listingTitle}</h1>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-4">
            {applicants.length === 0 ? (
              <p>No applicants yet for this listing.</p>
            ) : (
              applicants.map((applicant) => (
                <Card
                  key={applicant.id}
                  className={`cursor-pointer transition-colors ${
                    selectedApplicant?.id === applicant.id ? "border-blue-500" : ""
                  }`}
                  onClick={() => setSelectedApplicant(applicant)}
                >
                  <CardContent className="flex items-center space-x-4 p-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={applicant.profile_photo || "/placeholder.svg?height=48&width=48"}
                        alt={applicant.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{applicant.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{applicant.study_level}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="col-span-2">
            {selectedApplicant ? (
              <ChatInterface
                applicationId={selectedApplicant.application.id}
                currentUserId={user?.id || ""}
                listingTitle={`Chat with ${selectedApplicant.full_name}`}
                initialMessage={selectedApplicant.application.message}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Select an applicant to view the chat
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

