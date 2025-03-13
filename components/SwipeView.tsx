"use client"

import { useState } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { UserIcon as Male, UserIcon as Female, GraduationCap, MapPin, X, Heart } from "lucide-react"

interface SwipeViewProps {
  roommates: Array<{
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
  }>
}

export function SwipeView({ roommates }: SwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const currentRoommate = roommates[currentIndex]
  const isMale =
    currentRoommate?.gender_pronouns.toLowerCase().includes("he") ||
    currentRoommate?.gender_pronouns.toLowerCase().includes("him") ||
    currentRoommate?.gender_pronouns.toLowerCase().includes("male")
  const gradientColor = isMale ? "from-blue-500/50" : "from-pink-500/50"

  const swipe = (dir: "left" | "right") => {
    setDirection(dir)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % roommates.length)
      setDirection(null)
    }, 500)
  }

  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragStart({ x: info.point.x, y: info.point.y })
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100
    const deltaX = info.point.x - dragStart.x

    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        swipe("right")
      } else {
        swipe("left")
      }
    }
  }

  if (!currentRoommate) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] relative">
      <div className="w-full max-w-md aspect-[3/4] relative">
        <AnimatePresence>
          <motion.div
            key={currentRoommate.id}
            initial={{ scale: direction ? 1 : 0.5, opacity: direction ? 1 : 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{
              x: direction === "left" ? -300 : direction === "right" ? 300 : 0,
              opacity: 0,
              rotate: direction === "left" ? -20 : direction === "right" ? 20 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.05 }}
            style={{ touchAction: "none" }}
          >
            <Card className="w-full h-full overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src={currentRoommate.profile_photo || "/placeholder.svg?height=400&width=300"}
                  alt={currentRoommate.full_name}
                  fill
                  className="object-cover"
                  draggable="false"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${gradientColor} to-transparent opacity-30`} />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/80 to-transparent">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold">{currentRoommate.full_name}</h3>
                      {isMale ? (
                        <Badge className="bg-blue-500/20 text-blue-100">
                          <Male className="w-4 h-4 mr-1" />
                          He/Him
                        </Badge>
                      ) : (
                        <Badge className="bg-pink-500/20 text-pink-100">
                          <Female className="w-4 h-4 mr-1" />
                          She/Her
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-200">
                      <span className="flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {currentRoommate.study_level}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {typeof currentRoommate.preferred_locations === "string"
                          ? currentRoommate.preferred_locations.split(",")[0]
                          : currentRoommate.preferred_locations}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200">{currentRoommate.about_me?.slice(0, 150)}...</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => swipe("left")}
          className="p-4 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-8 h-8 text-red-500" />
        </button>
        <button
          onClick={() => swipe("right")}
          className="p-4 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
        >
          <Heart className="w-8 h-8 text-green-500" />
        </button>
      </div>
    </div>
  )
}

