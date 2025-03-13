import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Calendar, Home } from "lucide-react"
import type { Listing } from "@/types/listing"

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="overflow-hidden">
      <Link href={`/listing/${listing.id}`}>
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={listing.property_photos[0] || "/placeholder.svg?height=400&width=600"}
            alt={listing.listing_title}
            className="object-cover transition-transform hover:scale-105"
            fill
          />
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="line-clamp-2">{listing.listing_title}</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-900">
              £{listing.rent_monthly}/mo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">{listing.location}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1 border-blue-200 text-blue-700">
              <Bed className="h-3 w-3" />
              {listing.num_bedrooms} {listing.num_bedrooms === 1 ? "Bedroom" : "Bedrooms"}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 border-blue-200 text-blue-700">
              <Bath className="h-3 w-3" />
              {listing.num_bathrooms} {listing.num_bathrooms === 1 ? "Bathroom" : "Bathrooms"}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 border-blue-200 text-blue-700">
              <Home className="h-3 w-3" />
              {listing.property_type}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Available from {new Date(listing.available_date).toLocaleDateString()}
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}

