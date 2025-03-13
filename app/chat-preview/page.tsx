"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function ChatPreview() {
  const [selectedApplicant, setSelectedApplicant] = useState("1")
  const [selectedApplication, setSelectedApplication] = useState("1")

  // Mock data
  const mockApplicants = [
    {
      id: "1",
      name: "Sarah Johnson",
      photo: "/placeholder.svg?height=48&width=48",
      study: "PhD Student",
      applicationId: "app1",
      message: "Hi, I'm very interested in your property! Is it still available?",
    },
    {
      id: "2",
      name: "Michael Chen",
      photo: "/placeholder.svg?height=48&width=48",
      study: "Master's Student",
      applicationId: "app2",
      message: "Hello! I would love to schedule a viewing of the apartment.",
    },
  ]

  const mockApplications = [
    {
      id: "1",
      title: "Sunny 2-Bed Apartment",
      location: "City Center",
      status: "pending",
      applicationId: "app1",
      message: "Hi, I'm very interested in your property! Is it still available?",
    },
    {
      id: "2",
      title: "Modern Studio",
      location: "University Area",
      status: "accepted",
      applicationId: "app2",
      message: "Hello! I would love to schedule a viewing of the apartment.",
    },
  ]

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Chat Preview</h1>
        <Tabs defaultValue="owner" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="owner">Property Owner View</TabsTrigger>
            <TabsTrigger value="applicant">Applicant View</TabsTrigger>
          </TabsList>

          <TabsContent value="owner">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 space-y-4">
                <h2 className="font-semibold mb-4">Applicants for "Sunny 2-Bed Apartment"</h2>
                {mockApplicants.map((applicant) => (
                  <Card
                    key={applicant.id}
                    className={`cursor-pointer transition-colors ${
                      selectedApplicant === applicant.id ? "border-blue-500" : ""
                    }`}
                    onClick={() => setSelectedApplicant(applicant.id)}
                  >
                    <CardContent className="flex items-center space-x-4 p-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={applicant.photo || "/placeholder.svg"}
                          alt={applicant.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{applicant.name}</h3>
                        <p className="text-sm text-muted-foreground">{applicant.study}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="col-span-2">
                {selectedApplicant && (
                  <ChatInterface
                    applicationId={mockApplicants.find((a) => a.id === selectedApplicant)?.applicationId || ""}
                    currentUserId="owner123"
                    listingTitle={`Chat with ${
                      mockApplicants.find((a) => a.id === selectedApplicant)?.name || "Applicant"
                    }`}
                    initialMessage={mockApplicants.find((a) => a.id === selectedApplicant)?.message}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applicant">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 space-y-4">
                <h2 className="font-semibold mb-4">My Applications</h2>
                {mockApplications.map((application) => (
                  <Card
                    key={application.id}
                    className={`cursor-pointer transition-colors ${
                      selectedApplication === application.id ? "border-blue-500" : ""
                    }`}
                    onClick={() => setSelectedApplication(application.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{application.title}</h3>
                      <p className="text-sm text-muted-foreground">{application.location}</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                          application.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="col-span-2">
                {selectedApplication && (
                  <ChatInterface
                    applicationId={mockApplications.find((a) => a.id === selectedApplication)?.applicationId || ""}
                    currentUserId="applicant123"
                    listingTitle={mockApplications.find((a) => a.id === selectedApplication)?.title || ""}
                    initialMessage={mockApplications.find((a) => a.id === selectedApplication)?.message}
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

