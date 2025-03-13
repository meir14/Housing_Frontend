"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import {
  Home,
  Bed,
  Bath,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Wifi,
  Tv,
  Car,
  CigaretteIcon as Smoking,
  PawPrint,
  ArrowLeft,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useAuth } from "@/hooks/useAuth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface Listing {
  id: string
  user_id: string
  listing_title: string
  property_type: string
  rent_monthly: number
  deposit_amount: number | null
  location: string
  available_date: string
  minimum_stay: string | null
  bills_included: boolean
  num_bedrooms: number
  num_bathrooms: number
  current_occupants: number | null
  occupant_preferences: string | null
  amenities: string[]
  furnished: boolean
  smoking_policy: string | null
  pet_policy: string | null
  property_photos: string[]
  room_size: string | null
  description: string | null
  contact_method: string | null
}

export default function ListingPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasRoommateProfile, setHasRoommateProfile] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showMessageInput, setShowMessageInput] = useState(false)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchListing() {
      const { data, error } = await supabase.from("listings").select("*, user_id").eq("id", id).single()

      if (error) {
        console.error("Error fetching listing:", error)
        toast({
          title: "Error",
          description: "Failed to load listing. Please try again.",
          variant: "destructive",
        })
      } else {
        setListing(data)
      }
      setLoading(false)
    }

    async function checkRoommateProfile() {
      if (user) {
        const { data, error } = await supabase.from("roommates").select("id").eq("user_id", user.id).single()

        if (error) {
          console.error("Error checking roommate profile:", error)
        } else {
          setHasRoommateProfile(!!data)
        }
      }
    }

    fetchListing()
    if (!authLoading) {
      checkRoommateProfile()
    }
  }, [id, user, authLoading])

  const handleApply = async () => {
    console.log("Apply button clicked")
    setIsSubmitting(true)

    try {
      if (authLoading) {
        console.log("Auth is still loading")
        throw new Error("Authentication is still loading")
      }

      if (!user) {
        console.log("User not authenticated, redirecting to auth page")
        router.push("/auth")
        return
      }

      console.log("Current user:", user)

      // Try to create/update user record if it doesn't exist
      const { error: userUpsertError } = await supabase.from("users").upsert(
        [
          {
            id: user.id,
            email: user.email,
            account_creation_date: new Date().toISOString(),
            last_updated: new Date().toISOString(),
          },
        ],
        {
          onConflict: "id",
          ignoreDuplicates: false,
        },
      )

      if (userUpsertError) {
        console.error("Error upserting user:", userUpsertError)
        throw new Error("Failed to verify user account. Please try again.")
      }

      if (!hasRoommateProfile) {
        console.log("User doesn't have a roommate profile, showing dialog")
        setShowDialog(true)
        setIsSubmitting(false)
        return
      }

      if (listing && user.id === listing.user_id) {
        console.log("User is the owner of the listing")
        throw new Error("You cannot apply to your own listing.")
      }

      if (!showMessageInput) {
        console.log("Showing message input")
        setShowMessageInput(true)
        setIsSubmitting(false)
        return
      }

      if (!message.trim()) {
        throw new Error("Please enter a message for the property owner.")
      }

      console.log("Verifying user in the database")
      const { data: userData, error: userError } = await supabase.from("users").select("id, email").eq("id", user.id)

      console.log("User verification result:", { userData, userError })

      if (userError) {
        console.error("Error verifying user:", userError)
        throw new Error(`Error verifying user: ${userError.message}`)
      }

      if (!userData || userData.length === 0) {
        console.error("User not found in the database")
        throw new Error("Your account details are not properly set up. Please contact support.")
      }

      // Check for existing application
      console.log("Checking for existing application")
      const { data: existingApplication, error: checkError } = await supabase
        .from("applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", id)
        .maybeSingle()

      console.log("Existing application check result:", { existingApplication, checkError })

      if (checkError) {
        console.error("Error checking existing application:", checkError)
        throw new Error("Unable to verify application status. Please try again.")
      }

      if (existingApplication) {
        throw new Error("You have already applied to this listing.")
      }

      // Submit new application
      console.log("Submitting new application")
      const { data: newApplication, error: insertError } = await supabase
        .from("applications")
        .insert([
          {
            user_id: user.id,
            listing_id: id,
            message: message,
            status: "pending",
          },
        ])
        .select()
        .single()

      console.log("Application submission result:", { newApplication, insertError })

      if (insertError) {
        console.error("Error submitting application:", insertError)
        throw new Error(`Failed to submit application: ${insertError.message}`)
      }

      if (!newApplication) {
        throw new Error("Application was submitted but no data was returned. Please check your applications.")
      }

      console.log("Application submitted successfully:", newApplication)
      toast({
        title: "Success",
        description: "Your application has been submitted successfully.",
      })
      setShowMessageInput(false)
      setMessage("")
    } catch (error: any) {
      console.error("Detailed error in handleApply:", {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })

      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || authLoading) {
    return <div>Loading...</div>
  }

  if (!listing) {
    return <div>Listing not found</div>
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar isHouseOwner={false} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Button>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{listing.listing_title}</CardTitle>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{listing.location}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Carousel className="w-full max-w-xl mx-auto">
                <CarouselContent>
                  {listing.property_photos.map((photo, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video relative overflow-hidden rounded-lg">
                        <Image
                          src={photo || "/placeholder.svg"}
                          alt={`Property photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
              </Carousel>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  <span>{listing.property_type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span>£{listing.rent_monthly} / month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Available from {new Date(listing.available_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bed className="w-5 h-5 text-blue-600" />
                  <span>
                    {listing.num_bedrooms} Bedroom{listing.num_bedrooms > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bath className="w-5 h-5 text-blue-600" />
                  <span>
                    {listing.num_bathrooms} Bathroom{listing.num_bathrooms > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Current Occupants: {listing.current_occupants || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Smoking className="w-5 h-5 text-blue-600" />
                  <span>Smoking Policy: {listing.smoking_policy || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PawPrint className="w-5 h-5 text-blue-600" />
                  <span>Pet Policy: {listing.pet_policy || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {listing.furnished ? <Badge>Furnished</Badge> : <Badge variant="outline">Unfurnished</Badge>}
                  {listing.bills_included && <Badge>Bills Included</Badge>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary">
                    {amenity === "Wifi" && <Wifi className="w-4 h-4 mr-1" />}
                    {amenity === "TV" && <Tv className="w-4 h-4 mr-1" />}
                    {amenity === "Parking" && <Car className="w-4 h-4 mr-1" />}
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Description</h3>
              <p>{listing.description}</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              {showMessageInput && (
                <Textarea
                  placeholder="Enter a message for the property owner..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full max-w-md"
                />
              )}
              <Button
                onClick={handleApply}
                className="w-full max-w-md"
                disabled={(user && listing && user.id === listing.user_id) || isSubmitting}
              >
                {user && listing && user.id === listing.user_id
                  ? "You own this listing"
                  : isSubmitting
                    ? "Submitting..."
                    : showMessageInput
                      ? "Submit Application"
                      : "Apply"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Roommate Profile Required</DialogTitle>
            <DialogDescription>
              You need to create a roommate profile before applying for this listing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => router.push("/create-profile")}>
              Create Roommate Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

