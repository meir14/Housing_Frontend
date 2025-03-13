import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { UserCircle, LayoutDashboard } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface NavbarProps {
  isHouseOwner: boolean
  hideProfileButton?: boolean
}

export default function Navbar({ isHouseOwner, hideProfileButton }: NavbarProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav
      className={`shadow-md border-b transition-colors duration-300 ${
        isHouseOwner ? "bg-white border-red-100" : "bg-white border-blue-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span
                className={`text-xl font-bold transition-colors duration-300 ${
                  isHouseOwner ? "text-red-900" : "text-blue-900"
                }`}
              >
                Housing App
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-300 ${
                  isHouseOwner ? "text-red-900" : "text-blue-900"
                }`}
              >
                Home
              </Link>
              <Link
                href="/browse"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-300 ${
                  isHouseOwner ? "text-red-600 hover:text-red-900" : "text-blue-600 hover:text-blue-900"
                }`}
              >
                Browse
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!hideProfileButton &&
              (loading ? (
                <div>Loading...</div>
              ) : user ? (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    className={`transition-colors duration-300 ${
                      isHouseOwner
                        ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                        : "text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                    }`}
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-6 w-6 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className={`transition-colors duration-300 ${
                      isHouseOwner
                        ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                        : "text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                    }`}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  className={`transition-colors duration-300 ${
                    isHouseOwner
                      ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                      : "text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                  }`}
                >
                  <Link href="/auth">Login / Signup</Link>
                </Button>
              ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

