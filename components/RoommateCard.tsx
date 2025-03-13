import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserIcon as Male, UserIcon as Female, GraduationCap, MapPin } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface RoommateCardProps {
  roommate: {
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
    profile_photo: string | null
  }
}

export function RoommateCard({ roommate }: RoommateCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isMale =
    roommate.gender_pronouns.toLowerCase().includes("he") ||
    roommate.gender_pronouns.toLowerCase().includes("him") ||
    roommate.gender_pronouns.toLowerCase().includes("male")
  const gradientColor = isMale ? "from-blue-500/50" : "from-pink-500/50"

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <Link href={`/roommate/${roommate.id}`}>
        <div className="relative aspect-[3/4]">
          <Image
            src={roommate.profile_photo || "/placeholder.svg?height=400&width=300"}
            alt={roommate.full_name}
            fill
            className="object-cover"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${gradientColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
          />
        </div>
        <CardHeader className="relative">
          <div className="absolute -top-8 right-4 z-10">
            {isMale ? (
              <Badge className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30">
                <Male className="w-4 h-4 mr-1" />
                He/Him
              </Badge>
            ) : (
              <Badge className="bg-pink-500/20 text-pink-700 hover:bg-pink-500/30">
                <Female className="w-4 h-4 mr-1" />
                She/Her
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{roommate.full_name}</h3>
            <div className="flex items-center text-sm text-muted-foreground gap-4">
              <span className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-1" />
                {roommate.study_level}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {typeof roommate.preferred_locations === "string"
                  ? roommate.preferred_locations.split(",")[0]
                  : roommate.preferred_locations}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {expanded ? roommate.about_me : `${roommate.about_me?.slice(0, 100)}...`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              setExpanded(!expanded)
            }}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0"
          >
            {expanded ? "Show less" : "Show more"}
          </Button>
        </CardContent>
      </Link>
    </Card>
  )
}

