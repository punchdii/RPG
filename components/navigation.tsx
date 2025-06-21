"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Resume</span>
              <span className="text-orange-500">Tree</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              global tree
            </Link>
            <Link href="/local" className="text-slate-300 hover:text-white transition-colors">
              local tree
            </Link>
            <Link href="/contact" className="text-slate-300 hover:text-white transition-colors">
              contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
              Sign In
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
} 