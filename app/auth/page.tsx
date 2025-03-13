"use client"

import React from "react"
import LoginSignupForms from "@/components/LoginSignupForms"
import Link from "next/link"

export default function AuthPage() {
  const [message, setMessage] = React.useState("")

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-md border-b border-blue-100 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex h-16 items-center">
            <span className="text-xl font-bold text-blue-900">Housing App</span>
          </Link>
        </div>
      </header>
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <h1 className="text-center text-3xl font-bold text-blue-900">Welcome Back</h1>
          <LoginSignupForms />
        </div>
      </div>
    </div>
  )
}

