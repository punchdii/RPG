"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from '@/contexts/auth-context'

export default function SignInPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Sign in attempt started')
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log('Sign in response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign in')
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)

      console.log('Sign in successful, redirecting...')
      router.push('/upload')
    } catch (err) {
      console.error('Sign in error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-slate-900/30 border border-white/20 backdrop-blur-sm ring-1 ring-white/10 shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <img 
            src="/Logo.png" 
            alt="ResumeTree Logo" 
            className="w-10 h-10"
          />
          <span className="text-2xl font-bold">
            <span className="text-white">Resume</span>
            <span className="text-orange-500">Tree</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-900/30 border-red-500/30 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="bg-slate-800/30 border-slate-700/30 text-white"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="bg-slate-800/30 border-slate-700/30 text-white"
              placeholder="••••••••"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-orange-600 hover:bg-orange-500 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  )
} 