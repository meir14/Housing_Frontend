"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { Switch } from "@/components/ui/switch"
import { Home, Users } from "lucide-react"

export default function HomePage() {
  const [isHouseOwner, setIsHouseOwner] = useState(false)

  useEffect(() => {
    document.body.style.transition = "background-color 0.3s ease"
  }, [])

  const toggleMode = () => {
    setIsHouseOwner(!isHouseOwner)
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isHouseOwner ? "bg-red-50" : "bg-blue-50"
      }`}
    >
      <Navbar isHouseOwner={isHouseOwner} />
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-8">
            <h1
              className={`text-4xl md:text-5xl font-bold transition-colors duration-300 ${
                isHouseOwner ? "text-red-900" : "text-blue-900"
              }`}
            >
              Welcome to Housing App
            </h1>
            <p
              className={`text-xl transition-colors duration-300 ${
                isHouseOwner ? "text-red-700" : "text-blue-700"
              } max-w-2xl mx-auto`}
            >
              {isHouseOwner ? "Find your perfect roommate" : "Find your perfect student accommodation"}
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Home className={`w-6 h-6 ${isHouseOwner ? "text-red-600" : "text-gray-400"}`} />
              <Switch
                checked={isHouseOwner}
                onCheckedChange={toggleMode}
                className={`${isHouseOwner ? "bg-red-600" : "bg-blue-600"}`}
              />
              <Users className={`w-6 h-6 ${!isHouseOwner ? "text-blue-600" : "text-gray-400"}`} />
            </div>
            <div className="space-x-4">
              <Button
                className={`transition-colors duration-300 ${
                  isHouseOwner ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
                asChild
              >
                <Link href={isHouseOwner ? "/browse-roommates" : "/browse"}>
                  {isHouseOwner ? "Browse Roommates" : "Browse Listings"}
                </Link>
              </Button>
              <Button
                variant="outline"
                className={`transition-colors duration-300 ${
                  isHouseOwner
                    ? "border-red-200 text-red-700 hover:bg-red-100"
                    : "border-blue-200 text-blue-700 hover:bg-blue-100"
                }`}
                asChild
              >
                <Link href={isHouseOwner ? "/post-listing" : "/create-profile"}>
                  {isHouseOwner ? "Post a Listing" : "Create a Roommate Profile"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <footer
        className={`py-4 text-center transition-colors duration-300 ${
          isHouseOwner ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
        }`}
      >
        © 2024 Housing App. All rights reserved.
      </footer>
    </div>
  )
}

