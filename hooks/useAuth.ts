import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Check current user on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkRoommateProfile = async () => {
    if (!user) return false

    const { data, error } = await supabase.from("roommates").select("id").eq("user_id", user.id).single()

    if (error) {
      console.error("Error checking roommate profile:", error)
      return false
    }

    return !!data
  }

  return { user, loading, checkRoommateProfile }
}

