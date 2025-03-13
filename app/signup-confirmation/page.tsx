"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignupConfirmationPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Confirm Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">
            A confirmation email has been sent to your email address. Please check your inbox and click on the
            confirmation link to complete your registration.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            If you don't see the email, please check your spam folder.
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

