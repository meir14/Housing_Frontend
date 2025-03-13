"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { ProfileImageUpload } from "@/components/ProfileImageUpload"
import { toast } from "@/components/ui/use-toast"
import type { RoommateProfile } from "@/types/roommate-profile"

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  age: z.number().min(18, "You must be at least 18 years old"),
  gender_pronouns: z.string().min(1, "Gender/Pronouns are required"),
  study_level: z.string().min(1, "Study level is required"),
  field_of_study: z.string().min(1, "Field of study is required"),
  about_me: z.string().min(10, "Please write at least 10 characters about yourself"),
  preferred_locations: z.string().min(1, "Preferred locations are required"),
  budget_range: z.string().min(1, "Budget range is required"),
  smoking_pref: z.string(),
  pets_pref: z.string(),
  social_habits: z.string(),
  interests_hobbies: z.string(),
  profile_photo: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<RoommateProfile | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      age: 18,
      gender_pronouns: "",
      study_level: "",
      field_of_study: "",
      about_me: "",
      preferred_locations: "",
      budget_range: "",
      smoking_pref: "",
      pets_pref: "",
      social_habits: "",
      interests_hobbies: "",
      profile_photo: "",
    },
  })

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return

      const { data, error } = await supabase.from("roommates").select("*").eq("user_id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        })
      } else {
        setProfile(data)
        form.reset(data)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user, form])

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    try {
      const { error } = await supabase.from("roommates").update(data).eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleProfilePhotoUpdate = (url: string) => {
    form.setValue("profile_photo", url)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile_photo">Profile Photo</Label>
            <ProfileImageUpload
              onImageUpload={handleProfilePhotoUpdate}
              currentImage={profile?.profile_photo}
              userId={user?.id}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input {...form.register("full_name")} id="full_name" />
            {form.formState.errors.full_name && (
              <p className="text-red-500 text-sm">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input {...form.register("age", { valueAsNumber: true })} id="age" type="number" />
            {form.formState.errors.age && <p className="text-red-500 text-sm">{form.formState.errors.age.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender_pronouns">Gender/Pronouns</Label>
            <Input {...form.register("gender_pronouns")} id="gender_pronouns" />
            {form.formState.errors.gender_pronouns && (
              <p className="text-red-500 text-sm">{form.formState.errors.gender_pronouns.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="study_level">Study Level</Label>
            <Select
              onValueChange={(value) => form.setValue("study_level", value)}
              defaultValue={form.watch("study_level")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your study level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="postgraduate">Postgraduate</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.study_level && (
              <p className="text-red-500 text-sm">{form.formState.errors.study_level.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_of_study">Field of Study</Label>
            <Input {...form.register("field_of_study")} id="field_of_study" />
            {form.formState.errors.field_of_study && (
              <p className="text-red-500 text-sm">{form.formState.errors.field_of_study.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="about_me">About Me</Label>
            <Textarea {...form.register("about_me")} id="about_me" />
            {form.formState.errors.about_me && (
              <p className="text-red-500 text-sm">{form.formState.errors.about_me.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_locations">Preferred Locations</Label>
            <Input {...form.register("preferred_locations")} id="preferred_locations" />
            {form.formState.errors.preferred_locations && (
              <p className="text-red-500 text-sm">{form.formState.errors.preferred_locations.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget_range">Budget Range</Label>
            <Select
              onValueChange={(value) => form.setValue("budget_range", value)}
              defaultValue={form.watch("budget_range")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-500">£0 - £500</SelectItem>
                <SelectItem value="501-750">£501 - £750</SelectItem>
                <SelectItem value="751-1000">£751 - £1000</SelectItem>
                <SelectItem value="1000+">£1000+</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.budget_range && (
              <p className="text-red-500 text-sm">{form.formState.errors.budget_range.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="smoking_pref">Smoking Preference</Label>
            <Select
              onValueChange={(value) => form.setValue("smoking_pref", value)}
              defaultValue={form.watch("smoking_pref")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your smoking preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="non_smoking">Non-smoking</SelectItem>
                <SelectItem value="smoking_friendly">Smoking Friendly</SelectItem>
                <SelectItem value="outdoor_only">Outdoor Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pets_pref">Pet Preference</Label>
            <Select onValueChange={(value) => form.setValue("pets_pref", value)} defaultValue={form.watch("pets_pref")}>
              <SelectTrigger>
                <SelectValue placeholder="Select your pet preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_pets">No Pets</SelectItem>
                <SelectItem value="pet_friendly">Pet Friendly</SelectItem>
                <SelectItem value="small_pets_only">Small Pets Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_habits">Social Habits</Label>
            <Input {...form.register("social_habits")} id="social_habits" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests_hobbies">Interests & Hobbies</Label>
            <Textarea {...form.register("interests_hobbies")} id="interests_hobbies" />
          </div>

          <Button type="submit" className="w-full">
            Update Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

