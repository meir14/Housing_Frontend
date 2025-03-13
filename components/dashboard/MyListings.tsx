"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { Listing } from "@/types/listing"
import Image from "next/image"

export default function MyListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchListings() {
      if (!user) return

      const { data, error } = await supabase.from("listings").select("*").eq("user_id", user.id)

      if (error) {
        console.error("Error fetching listings:", error)
      } else {
        setListings(data || [])
      }
      setLoading(false)
    }

    fetchListings()
  }, [user])

  const handleCreateListing = () => {
    // Only navigate if user is authenticated
    if (user) {
      router.push("/post-listing")
    }
  }

  if (loading) {
    return <div>Loading your listings...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Listings</h2>
      </div>
      {listings.length === 0 ? (
        <p>You haven't created any listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={listing.property_photos[0] || "/placeholder.svg?height=200&width=300"}
                  alt={listing.listing_title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{listing.listing_title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {listing.property_type} - {listing.location}
                </p>
                <p className="font-semibold">£{listing.rent_monthly} / month</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push(`/listing/${listing.id}`)}>
                  View
                </Button>
                <Button variant="outline" onClick={() => router.push(`/listing/${listing.id}/applicants`)}>
                  View Applicants
                </Button>
                <Button onClick={() => router.push(`/edit-listing/${listing.id}`)}>Edit</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

