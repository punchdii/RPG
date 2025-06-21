"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function Navigation() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="border-b border-[0.5px] border-white/30 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/Logo.png" 
              alt="ResumeTree Logo" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold">
              <span className="text-white">Resume</span>
              <span className="text-orange-500">Tree</span>
            </span>
          </Link>

          {/* Navigation Links - Centered with equal spacing */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-24">
            <Link href="/global-tree" className="text-slate-300 hover:text-white hover:underline underline-offset-4 transition-colors capitalize">
              Global Tree
            </Link>
            <button
              onClick={() => user ? router.push('/skill-tree') : router.push('/signin')}
              className="text-slate-300 hover:text-white hover:underline underline-offset-4 transition-colors capitalize"
            >
              Local Tree
            </button>
            <Link href="/contact" className="text-slate-300 hover:text-white hover:underline underline-offset-4 transition-colors capitalize">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Log Out
              </Button>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 