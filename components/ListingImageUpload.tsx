"use client"

import { useState, useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ListingImageUploadProps {
  onImagesUpload: (urls: string[]) => void
  currentImages: string[]
  userId?: string
}

export function ListingImageUpload({ onImagesUpload, currentImages, userId }: ListingImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>(currentImages)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files
      if (!files || !userId) return

      setUploading(true)
      setUploadProgress(0)

      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split(".").pop()
        const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError, data } = await supabase.storage.from("listing-photos").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          throw uploadError
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("listing-photos").getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
        setUploadProgress(((i + 1) / files.length) * 100)
      }

      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      onImagesUpload(newImages)
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("Error uploading files. Please try again.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove)
    setImages(newImages)
    onImagesUpload(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-video group">
            <Image
              src={image || "/placeholder.svg"}
              alt={`Property image ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <ImagePlus className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500">Add Photo</span>
            </div>
          </button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        disabled={uploading}
      />
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Upload at least 3 photos of your property. You can upload up to 5 photos. Each photo should clearly show
        different areas of the property.
      </p>
    </div>
  )
}

