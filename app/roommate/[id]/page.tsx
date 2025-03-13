"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  MapPin,
  Calendar,
  DollarSign,
  CigaretteIcon as Smoking,
  PawPrint,
  Users,
  Coffee,
  MessageCircle,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react"
import Navbar from "@/components/Navbar"

interface RoommateProfile {
  id: string
  full_name: string
  age: number
  gender_pronouns: string
  study_level: string
  field_of_study: string
  about_me: string
  preferred_locations: string
  budget_range: string
  interests_hobbies: string
  profile_photo: string
  smoking_pref: string
  pets_pref: string
  social_habits: string
  estimated_graduation_year: number
  phone_number: string
}

export default function RoommatePage() {
  const { id } = useParams()
  const router = useRouter()
  const [roommate, setRoommate] = useState<RoommateProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRoommate() {
      const { data, error } = await supabase.from("roommates").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching roommate:", error)
      } else {
        setRoommate(data)
      }
      setLoading(false)
    }

    fetchRoommate()
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!roommate) {
    return <div>Roommate not found</div>
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <Navbar isHouseOwner={false} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={roommate.profile_photo || "/placeholder.svg"} alt={roommate.full_name} />
                <AvatarFallback>{roommate.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl font-bold">{roommate.full_name}</CardTitle>
                <p className="text-xl text-muted-foreground">
                  {roommate.age} years old • {roommate.gender_pronouns}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>
                    {roommate.study_level} in {roommate.field_of_study}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>{roommate.preferred_locations}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Graduating in {roommate.estimated_graduation_year}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span>Budget: {roommate.budget_range}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Smoking className="w-5 h-5 text-blue-600" />
                  <span>Smoking: {roommate.smoking_pref}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PawPrint className="w-5 h-5 text-blue-600" />
                  <span>Pets: {roommate.pets_pref}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Social habits: {roommate.social_habits}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coffee className="w-5 h-5 text-blue-600" />
                  <span>Interests: {roommate.interests_hobbies}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">About Me</h3>
              <p>{roommate.about_me}</p>
            </div>
            <div className="flex justify-center space-x-4">
              <Button className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

