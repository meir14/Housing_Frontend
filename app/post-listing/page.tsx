"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { Listing } from "@/types/listing"
import Navbar from "@/components/Navbar"
import { ListingImageUpload } from "@/components/ListingImageUpload"
import { toast } from "@/components/ui/use-toast"

const listingSchema = z.object({
  listing_title: z.string().min(5, "Title must be at least 5 characters long"),
  property_type: z.string().min(1, "Property type is required"),
  rent_monthly: z.number().min(1, "Rent must be greater than 0"),
  deposit_amount: z.number().min(0, "Deposit amount must be 0 or greater"),
  location: z.string().min(1, "Location is required"),
  available_date: z.string().min(1, "Available date is required"),
  minimum_stay: z.string().optional(),
  bills_included: z.boolean(),
  num_bedrooms: z.number().min(1, "Number of bedrooms must be at least 1"),
  num_bathrooms: z.number().min(1, "Number of bathrooms must be at least 1"),
  current_occupants: z.number().min(0, "Current occupants must be 0 or greater"),
  occupant_preferences: z.string().optional(),
  amenities: z.array(z.string()),
  furnished: z.boolean(),
  smoking_policy: z.string().optional(),
  pet_policy: z.string().optional(),
  room_size: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  contact_method: z.string().min(1, "Contact method is required"),
  property_photos: z.array(z.string()).min(3, "Please upload at least 3 photos"),
})

type ListingFormData = z.infer<typeof listingSchema>

export default function PostListing() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      listing_title: "",
      property_type: "",
      rent_monthly: 0,
      deposit_amount: 0,
      location: "",
      available_date: "",
      minimum_stay: "",
      bills_included: false,
      num_bedrooms: 1,
      num_bathrooms: 1,
      current_occupants: 0,
      occupant_preferences: "",
      amenities: [],
      furnished: false,
      smoking_policy: "",
      pet_policy: "",
      room_size: "",
      description: "",
      contact_method: "",
      property_photos: [],
    },
  })

  useEffect(() => {
    if (!user) {
      router.push("/auth")
    }
  }, [user, router])

  const validateStep = async () => {
    let isValid = false
    switch (step) {
      case 1:
        isValid = await form.trigger(["listing_title", "property_type", "location"])
        break
      case 2:
        isValid = await form.trigger(["rent_monthly", "deposit_amount", "available_date", "minimum_stay"])
        break
      case 3:
        isValid = await form.trigger(["num_bedrooms", "num_bathrooms", "current_occupants", "occupant_preferences"])
        break
      case 4:
        isValid = await form.trigger(["amenities", "furnished", "bills_included", "smoking_policy", "pet_policy"])
        break
      case 5:
        isValid = await form.trigger(["property_photos"])
        break
      case 6:
        isValid = await form.trigger(["room_size", "description", "contact_method"])
        break
    }
    return isValid
  }

  const onSubmit = async (data: ListingFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to post a listing.",
        variant: "destructive",
      })
      router.push("/auth")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      console.log("Submitting listing data:", data)

      const newListing: Partial<Listing> = {
        ...data,
        user_id: user.id,
        property_photos: data.property_photos,
        listing_creation_date: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      }

      console.log("Prepared listing data:", newListing)

      const { data: insertedData, error: insertError } = await supabase.from("listings").insert([newListing]).select()

      if (insertError) {
        console.error("Error inserting listing:", insertError)
        throw insertError
      }

      console.log("Inserted listing data:", insertedData)

      toast({
        title: "Listing created",
        description: "Your listing has been successfully created.",
      })

      router.push("/browse")
    } catch (error: any) {
      console.error("Error creating listing:", error)
      setError(error.message || "Failed to create listing. Please try again.")
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    const isValid = await validateStep()
    if (isValid) {
      setStep(step + 1)
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly before proceeding.",
        variant: "destructive",
      })
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="listing_title">Listing Title</Label>
              <Input
                {...form.register("listing_title")}
                id="listing_title"
                placeholder="Enter a title for your listing"
              />
              {form.formState.errors.listing_title && (
                <p className="text-red-500 text-sm">{form.formState.errors.listing_title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type</Label>
              <Select onValueChange={(value) => form.setValue("property_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Studio">Studio</SelectItem>
                  <SelectItem value="Shared Room">Shared Room</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.property_type && (
                <p className="text-red-500 text-sm">{form.formState.errors.property_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input {...form.register("location")} id="location" placeholder="Enter the property location" />
              {form.formState.errors.location && (
                <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
              )}
            </div>
          </>
        )
      case 2:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="rent_monthly">Monthly Rent (£)</Label>
              <Input
                {...form.register("rent_monthly", { valueAsNumber: true })}
                id="rent_monthly"
                type="number"
                placeholder="Enter monthly rent"
              />
              {form.formState.errors.rent_monthly && (
                <p className="text-red-500 text-sm">{form.formState.errors.rent_monthly.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit_amount">Deposit Amount (£)</Label>
              <Input
                {...form.register("deposit_amount", { valueAsNumber: true })}
                id="deposit_amount"
                type="number"
                placeholder="Enter deposit amount"
              />
              {form.formState.errors.deposit_amount && (
                <p className="text-red-500 text-sm">{form.formState.errors.deposit_amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_date">Available From</Label>
              <Input {...form.register("available_date")} id="available_date" type="date" />
              {form.formState.errors.available_date && (
                <p className="text-red-500 text-sm">{form.formState.errors.available_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stay">Minimum Stay</Label>
              <Input {...form.register("minimum_stay")} id="minimum_stay" placeholder="e.g., 6 months, 1 year" />
            </div>
          </>
        )
      case 3:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="num_bedrooms">Number of Bedrooms</Label>
              <Input
                {...form.register("num_bedrooms", { valueAsNumber: true })}
                id="num_bedrooms"
                type="number"
                min="1"
              />
              {form.formState.errors.num_bedrooms && (
                <p className="text-red-500 text-sm">{form.formState.errors.num_bedrooms.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="num_bathrooms">Number of Bathrooms</Label>
              <Input
                {...form.register("num_bathrooms", { valueAsNumber: true })}
                id="num_bathrooms"
                type="number"
                min="1"
              />
              {form.formState.errors.num_bathrooms && (
                <p className="text-red-500 text-sm">{form.formState.errors.num_bathrooms.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_occupants">Current Occupants</Label>
              <Input
                {...form.register("current_occupants", { valueAsNumber: true })}
                id="current_occupants"
                type="number"
                min="0"
              />
              {form.formState.errors.current_occupants && (
                <p className="text-red-500 text-sm">{form.formState.errors.current_occupants.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupant_preferences">Occupant Preferences</Label>
              <Input
                {...form.register("occupant_preferences")}
                id="occupant_preferences"
                placeholder="e.g., Students only, Professionals"
              />
            </div>
          </>
        )
      case 4:
        return (
          <>
            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 gap-2">
                {["WiFi", "Washing Machine", "Dishwasher", "TV", "Parking", "Garden"].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity}`}
                      checked={form.watch("amenities").includes(amenity)}
                      onCheckedChange={(checked) => {
                        const currentAmenities = form.watch("amenities")
                        if (checked) {
                          form.setValue("amenities", [...currentAmenities, amenity])
                        } else {
                          form.setValue(
                            "amenities",
                            currentAmenities.filter((a) => a !== amenity),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={`amenity-${amenity}`}>{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="furnished"
                checked={form.watch("furnished")}
                onCheckedChange={(checked) => form.setValue("furnished", checked as boolean)}
              />
              <Label htmlFor="furnished">Furnished</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bills_included"
                checked={form.watch("bills_included")}
                onCheckedChange={(checked) => form.setValue("bills_included", checked as boolean)}
              />
              <Label htmlFor="bills_included">Bills Included</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smoking_policy">Smoking Policy</Label>
              <Select onValueChange={(value) => form.setValue("smoking_policy", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select smoking policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No smoking">No smoking</SelectItem>
                  <SelectItem value="Smoking allowed">Smoking allowed</SelectItem>
                  <SelectItem value="Smoking outside only">Smoking outside only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet_policy">Pet Policy</Label>
              <Select onValueChange={(value) => form.setValue("pet_policy", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pet policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No pets">No pets</SelectItem>
                  <SelectItem value="Pets allowed">Pets allowed</SelectItem>
                  <SelectItem value="Small pets only">Small pets only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )
      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Property Photos</Label>
              <ListingImageUpload
                onImagesUpload={(urls) => {
                  form.setValue("property_photos", urls)
                  form.trigger("property_photos") // Trigger validation after updating
                }}
                currentImages={form.watch("property_photos")}
                userId={user?.id}
              />
              {form.formState.errors.property_photos && (
                <p className="text-red-500 text-sm">{form.formState.errors.property_photos.message}</p>
              )}
            </div>
          </div>
        )
      case 6:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="room_size">Room Size</Label>
              <Input {...form.register("room_size")} id="room_size" placeholder="e.g., 12 sqm, 15x20 feet" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                {...form.register("description")}
                id="description"
                placeholder="Provide a detailed description of the property"
                rows={5}
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_method">Preferred Contact Method</Label>
              <Input {...form.register("contact_method")} id="contact_method" placeholder="e.g., Email, Phone" />
              {form.formState.errors.contact_method && (
                <p className="text-red-500 text-sm">{form.formState.errors.contact_method.message}</p>
              )}
            </div>
          </>
        )
      default:
        return null
    }
  }

  if (!user) {
    return null // or a loading state if you prefer
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar isHouseOwner={false} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Post a New Listing</CardTitle>
            <CardDescription>Step {step} of 6</CardDescription>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {renderStep()}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 1 && (
              <Button type="button" onClick={prevStep} variant="outline">
                Previous
              </Button>
            )}
            {step < 6 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} onClick={form.handleSubmit(onSubmit)}>
                {isSubmitting ? "Submitting..." : "Post Listing"}
              </Button>
            )}
          </CardFooter>
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </Card>
      </div>
    </div>
  )
}

