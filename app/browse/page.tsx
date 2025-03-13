"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ListingCard } from "@/components/ListingCard"
import type { FilterOptions, Listing } from "@/types/listing"
import { ChevronDown, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { useQuery } from "react-query"
import { supabase } from "@/lib/supabase"

export default function BrowseListings() {
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [filters, setFilters] = useState<FilterOptions>({
    location: "",
    minPrice: 0,
    maxPrice: 2000,
    propertyType: "",
    furnished: null,
    numBedrooms: null,
    petsAllowed: null,
    billsIncluded: null,
  })

  const {
    data: listings,
    isLoading,
    error,
  } = useQuery<Listing[]>(
    ["listings", filters, searchTerm],
    async () => {
      let query = supabase
        .from("listings")
        .select("*")
        .gte("rent_monthly", filters.minPrice)
        .lte("rent_monthly", filters.maxPrice)

      if (filters.location) {
        query = query.ilike("location", `%${filters.location}%`)
      }
      if (filters.propertyType) {
        query = query.eq("property_type", filters.propertyType)
      }
      if (filters.furnished !== null) {
        query = query.eq("furnished", filters.furnished)
      }
      if (filters.numBedrooms !== null) {
        query = query.eq("num_bedrooms", filters.numBedrooms)
      }
      if (filters.petsAllowed !== null) {
        query = query.eq("pet_policy", filters.petsAllowed ? "Pets allowed" : "No pets")
      }
      if (filters.billsIncluded !== null) {
        query = query.eq("bills_included", filters.billsIncluded)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    },
    {
      refetchOnWindowFocus: false,
    },
  )

  const filteredListings = listings?.filter((listing) =>
    listing.listing_title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {(error as Error).message}</div>

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 hover:text-blue-700 transition-colors">
            Student Housing App
          </h1>
        </Link>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Listings</SheetTitle>
                  <SheetDescription>Adjust the filters to find your perfect accommodation</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Price Range (£)</Label>
                    <Slider
                      min={0}
                      max={2000}
                      step={50}
                      value={[filters.minPrice, filters.maxPrice]}
                      onValueChange={(value) => {
                        setFilters({ ...filters, minPrice: value[0], maxPrice: value[1] })
                      }}
                    />
                    <div className="flex justify-between text-sm">
                      <span>£{filters.minPrice}</span>
                      <span>£{filters.maxPrice}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select
                      onValueChange={(value) => setFilters({ ...filters, propertyType: value })}
                      value={filters.propertyType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Studio">Studio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Bedrooms</Label>
                    <Select
                      onValueChange={(value) => setFilters({ ...filters, numBedrooms: Number(value) })}
                      value={filters.numBedrooms?.toString() || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of bedrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Furnished</Label>
                    <Switch
                      checked={filters.furnished || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, furnished: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Pets Allowed</Label>
                    <Switch
                      checked={filters.petsAllowed || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, petsAllowed: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Bills Included</Label>
                    <Switch
                      checked={filters.billsIncluded || false}
                      onCheckedChange={(checked) => setFilters({ ...filters, billsIncluded: checked })}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

