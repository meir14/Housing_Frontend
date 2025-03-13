"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SlidersHorizontal, Grid, Layout } from "lucide-react"
import Link from "next/link"
import { RoommateCard } from "@/components/RoommateCard"
import { SwipeView } from "@/components/SwipeView"
import { RoommateFilters } from "@/components/RoommateFilters"
import { useQuery } from "react-query"
import { supabase } from "@/lib/supabase"

export default function BrowseRoommates() {
  const [view, setView] = useState<"grid" | "swipe">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    school: "",
    location: "",
    degree: "",
  })

  const {
    data: roommates,
    isLoading,
    error,
  } = useQuery(
    ["roommates", filters, searchTerm],
    async () => {
      try {
        let query = supabase
          .from("roommates")
          .select(
            "id, full_name, age, gender_pronouns, study_level, field_of_study, about_me, preferred_locations, budget_range, interests_hobbies, profile_photo",
          )

        if (filters.school) {
          query = query.eq("study_level", filters.school)
        }
        if (filters.location) {
          query = query.ilike("preferred_locations", `%${filters.location}%`)
        }
        if (filters.degree) {
          query = query.eq("study_level", filters.degree)
        }

        const { data, error } = await query

        if (error) {
          console.error("Supabase query error:", error)
          throw new Error(`Failed to fetch roommates: ${error.message}`)
        }

        if (!data) {
          throw new Error("No data returned from Supabase")
        }

        if (searchTerm) {
          return data.filter(
            (roommate) =>
              roommate.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              roommate.field_of_study?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              roommate.preferred_locations?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        }

        return data
      } catch (error) {
        console.error("Error in query function:", error)
        throw error
      }
    },
    {
      refetchOnWindowFocus: false,
      retry: 3,
      onError: (error) => {
        console.error("Query error:", error)
      },
    },
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-red-600">Loading roommates...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-red-600">Error loading roommates: {(error as Error).message}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-4xl font-bold text-red-900 hover:text-red-700 transition-colors">
            Find Your Perfect Roommate
          </h1>
        </Link>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <Tabs defaultValue="grid" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="grid" onClick={() => setView("grid")} className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  Grid View
                </TabsTrigger>
                <TabsTrigger value="swipe" onClick={() => setView("swipe")} className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Swipe View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="Search by name, field of study, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="border-red-200 text-red-700">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Roommates</SheetTitle>
                  <SheetDescription>Find roommates that match your preferences</SheetDescription>
                </SheetHeader>
                <RoommateFilters filters={filters} setFilters={setFilters} />
              </SheetContent>
            </Sheet>
          </div>

          {roommates && roommates.length === 0 ? (
            <div className="text-center text-red-600 py-8">No roommates found matching your criteria.</div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roommates?.map((roommate) => (
                <RoommateCard key={roommate.id} roommate={roommate} />
              ))}
            </div>
          ) : (
            <div>{roommates && <SwipeView roommates={roommates} />}</div>
          )}
        </div>
      </div>
    </div>
  )
}

