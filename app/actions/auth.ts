"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function createUserProfile(userId: string, email: string, schoolName: string) {
  try {
    const { error } = await supabaseAdmin.from("users").upsert(
      {
        id: userId,
        email: email,
        school_name: schoolName,
        account_creation_date: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error creating user profile:", error)
    return { success: false, error }
  }
}

