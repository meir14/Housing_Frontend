"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { RoommateProfile } from "@/types/roommate-profile"
import { ProfileImageUpload } from "@/components/ProfileImageUpload"
import Image from "next/image"
import Link from "next/link"

export default function MyProfile() {
  const [profile, setProfile] = useState<RoommateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return

      const { data, error } = await supabase.from("roommates").select("*").eq("user_id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user])

  const handleProfilePhotoUpdate = (url: string) => {
    if (profile) {
      setProfile({ ...profile, profile_photo: url })
      // Update the profile in the database
      supabase
        .from("roommates")
        .update({ profile_photo: url })
        .eq("user_id", user?.id)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating profile photo:", error)
          }
        })
    }
  }

  if (loading) {
    return <div>Loading your profile...</div>
  }

  if (!profile) {
    return (
      <div className="text-center">
        <p className="mb-4">You haven't created a roommate profile yet.</p>
        <Button onClick={() => router.push("/create-profile")}>Create Profile</Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Roommate Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <ProfileImageUpload
              onImageUpload={handleProfilePhotoUpdate}
              currentImage={profile.profile_photo}
              userId={user?.id}
            />
          </div>
          <div className="space-y-4">
            <p>
              <strong>Name:</strong> {profile.full_name}
            </p>
            <p>
              <strong>Age:</strong> {profile.age}
            </p>
            <p>
              <strong>Gender/Pronouns:</strong> {profile.gender_pronouns}
            </p>
            <p>
              <strong>Study Level:</strong> {profile.study_level}
            </p>
            <p>
              <strong>Field of Study:</strong> {profile.field_of_study}
            </p>
            <p>
              <strong>About Me:</strong> {profile.about_me}
            </p>
            <Button asChild>
              <Link href="/dashboard/edit-profile">Edit Profile</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

