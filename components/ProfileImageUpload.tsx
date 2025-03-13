"use client"

import { useState, useRef } from "react"
import { User2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

interface ProfileImageUploadProps {
  onImageUpload: (url: string) => void
  currentImage?: string
  userId?: string
}

export function ProfileImageUpload({ onImageUpload, currentImage, userId }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file || !userId) return

      setUploading(true)
      setUploadProgress(0)

      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage.from("profile-photos").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(filePath)

      onImageUpload(publicUrl)
      setUploadProgress(100)
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Error uploading file. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="relative w-32 h-32 rounded-full cursor-pointer group focus:outline-none"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <div className="relative w-full h-full">
          <Image
            src={currentImage || "/placeholder.svg"}
            alt="Profile"
            fill
            className="rounded-full object-cover"
            unoptimized
          />
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
            <span className="text-white text-sm font-medium">
              {uploading ? `${Math.round(uploadProgress)}%` : currentImage ? "Change Picture" : "Add Picture"}
            </span>
          </div>
        </div>
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        This picture will be visible to other users in the app. Choose a clear photo that represents you well.
      </p>
    </div>
  )
}

