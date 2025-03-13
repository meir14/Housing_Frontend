"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { ProfileImageUpload } from "@/components/ProfileImageUpload"

const formSchema = z.object({
  study_level: z.string().min(1, "Study level is required"),
  field_of_study: z.string().min(1, "Field of study is required"),
  estimated_graduation_year: z.number().min(2024).max(2030),
  full_name: z.string().min(2, "Full name is required"),
  age: z.number().min(18).max(100),
  gender_pronouns: z.string(),
  phone_number: z.string().min(10, "Valid phone number is required"),
  preferred_locations: z.string().min(1, "Preferred locations are required"),
  budget_range: z.string().min(1, "Budget range is required"),
  smoking_pref: z.string(),
  pets_pref: z.string(),
  social_habits: z.string(),
  about_me: z.string().min(10, "Please write at least 10 characters about yourself"),
  interests_hobbies: z.string(),
  roommate_preferences: z.string(),
  profile_photo: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function CreateProfile() {
  const [step, setStep] = useState(1)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      study_level: "",
      field_of_study: "",
      estimated_graduation_year: 2024,
      full_name: "",
      age: 18,
      gender_pronouns: "",
      phone_number: "",
      preferred_locations: "",
      budget_range: "",
      smoking_pref: "",
      pets_pref: "",
      social_habits: "",
      about_me: "",
      interests_hobbies: "",
      roommate_preferences: "",
      profile_photo: "",
    },
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  const onSubmit = async (data: FormData) => {
    if (!user) {
      setError("You must be logged in to create a profile")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Create the roommate profile
      const { error: profileError } = await supabase.from("roommates").insert([
        {
          user_id: user.id,
          study_level: data.study_level,
          field_of_study: data.field_of_study,
          estimated_graduation_year: data.estimated_graduation_year,
          full_name: data.full_name,
          age: data.age,
          gender_pronouns: data.gender_pronouns,
          phone_number: data.phone_number,
          preferred_locations: data.preferred_locations,
          budget_range: data.budget_range,
          smoking_pref: data.smoking_pref,
          pets_pref: data.pets_pref,
          social_habits: data.social_habits,
          about_me: data.about_me,
          interests_hobbies: data.interests_hobbies,
          roommate_preferences: data.roommate_preferences,
          profile_photo: data.profile_photo,
          profile_status: "active",
          last_updated: new Date().toISOString(),
        },
      ])

      if (profileError) throw profileError

      // Update the user's document to indicate they have a roommate profile
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          has_roommate_profile: true,
          last_updated: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (userUpdateError) throw userUpdateError

      console.log("Profile created successfully")
      router.push("/")
    } catch (error: any) {
      console.error("Error creating profile:", error)
      setError(error.message || "Failed to create profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    const fieldsToValidate = {
      1: ["study_level", "field_of_study", "estimated_graduation_year"],
      2: ["full_name", "age", "gender_pronouns"],
      3: ["phone_number", "preferred_locations", "budget_range", "smoking_pref", "pets_pref"],
      4: ["about_me", "interests_hobbies", "roommate_preferences"],
    }[step]

    const isStepValid = await form.trigger(fieldsToValidate as any)
    if (isStepValid) {
      setStep((prevStep) => prevStep + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleImageUpload = (url: string) => {
    form.setValue("profile_photo", url)
    setProfilePhotoUrl(url)
  }

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">Create Your Roommate Profile</CardTitle>
            <CardDescription>Step {step} of 4</CardDescription>
            <div className="w-full bg-blue-100 h-2 rounded-full mt-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-900">Academic Information</h2>
                  <div className="space-y-2">
                    <Label htmlFor="study_level">Study Level</Label>
                    <Select
                      onValueChange={(value) => form.setValue("study_level", value)}
                      defaultValue={form.getValues("study_level")}
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
                    <Input {...form.register("field_of_study")} />
                    {form.formState.errors.field_of_study && (
                      <p className="text-red-500 text-sm">{form.formState.errors.field_of_study.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_graduation_year">Expected Graduation Year</Label>
                    <Input
                      type="number"
                      min="2024"
                      max="2030"
                      {...form.register("estimated_graduation_year", { valueAsNumber: true })}
                    />
                    {form.formState.errors.estimated_graduation_year && (
                      <p className="text-red-500 text-sm">{form.formState.errors.estimated_graduation_year.message}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-900">Personal Information</h2>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input {...form.register("full_name")} />
                    {form.formState.errors.full_name && (
                      <p className="text-red-500 text-sm">{form.formState.errors.full_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input type="number" {...form.register("age", { valueAsNumber: true })} />
                    {form.formState.errors.age && (
                      <p className="text-red-500 text-sm">{form.formState.errors.age.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender_pronouns">Gender & Pronouns</Label>
                    <Input {...form.register("gender_pronouns")} />
                    {form.formState.errors.gender_pronouns && (
                      <p className="text-red-500 text-sm">{form.formState.errors.gender_pronouns.message}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-900">Contact & Preferences</h2>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input {...form.register("phone_number")} />
                    {form.formState.errors.phone_number && (
                      <p className="text-red-500 text-sm">{form.formState.errors.phone_number.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_locations">Preferred Locations</Label>
                    <Input {...form.register("preferred_locations")} placeholder="e.g., North Campus, City Center" />
                    {form.formState.errors.preferred_locations && (
                      <p className="text-red-500 text-sm">{form.formState.errors.preferred_locations.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_range">Budget Range</Label>
                    <Select
                      onValueChange={(value) => form.setValue("budget_range", value)}
                      defaultValue={form.getValues("budget_range")}
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
                      defaultValue={form.getValues("smoking_pref")}
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
                    <Select
                      onValueChange={(value) => form.setValue("pets_pref", value)}
                      defaultValue={form.getValues("pets_pref")}
                    >
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
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-900">About You</h2>
                  <div className="space-y-2">
                    <Label htmlFor="about_me">About Me</Label>
                    <Textarea
                      {...form.register("about_me")}
                      placeholder="Tell potential roommates about yourself..."
                      className="h-32"
                    />
                    {form.formState.errors.about_me && (
                      <p className="text-red-500 text-sm">{form.formState.errors.about_me.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interests_hobbies">Interests & Hobbies</Label>
                    <Textarea
                      {...form.register("interests_hobbies")}
                      placeholder="What do you like to do in your free time?"
                      className="h-24"
                    />
                    {form.formState.errors.interests_hobbies && (
                      <p className="text-red-500 text-sm">{form.formState.errors.interests_hobbies.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roommate_preferences">Roommate Preferences</Label>
                    <Textarea
                      {...form.register("roommate_preferences")}
                      placeholder="What are you looking for in a roommate?"
                      className="h-24"
                    />
                    {form.formState.errors.roommate_preferences && (
                      <p className="text-red-500 text-sm">{form.formState.errors.roommate_preferences.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <ProfileImageUpload
                      onImageUpload={handleImageUpload}
                      currentImage={profilePhotoUrl}
                      userId={user.id}
                    />
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {error && <p className="text-red-500 text-sm w-full text-center">{error}</p>}
            <div className="flex justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1 || isSubmitting}
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={step === 4 ? form.handleSubmit(onSubmit) : nextStep}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Saving..." : step === 4 ? "Submit" : "Next"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

