"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SkillTree } from "@/components/skill-tree"
import { SkillDetails } from "@/components/skill-details"
import { UserProfile } from "@/components/user-profile"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import type { Skill, UserSkills } from "@/types/skills"

export default function SkillTreePage() {
  const [userSkills, setUserSkills] = useState<UserSkills | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadUserSkills = async () => {
      // First, try to get skills from sessionStorage (recent upload)
    const storedSkills = sessionStorage.getItem('userSkills')
    if (storedSkills) {
      setUserSkills(JSON.parse(storedSkills))
        return
      }

      // If no session data, check if user is logged in and has saved skill tree
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        
        try {
          const response = await fetch('/api/get-user-skilltree', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userEmail: user.email })
          })

          if (response.ok) {
            const data = await response.json()
            if (data.hasSkillTree) {
              console.log('✅ Loaded saved skill tree from database')
              setUserSkills(data)
              return
            }
          }
        } catch (error) {
          console.error('❌ Error loading saved skill tree:', error)
        }
      }

      // If no saved data found, redirect to upload
      router.push('/upload')
    }

    loadUserSkills()
  }, [router])

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedSkill(null)
  }

  const handleAddResume = () => {
    router.push('/upload?from=skill-tree')
  }

  if (!userSkills) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your skill tree...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left sidebar - User Profile */}
          <div className="lg:col-span-1 sticky top-8 space-y-4">
            <UserProfile userSkills={userSkills} />
            <Button 
              onClick={handleAddResume}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Add Resume
            </Button>
          </div>
          
          {/* Right side - Skill Tree */}
          <div className="lg:col-span-3">
            <SkillTree userSkills={userSkills} onSkillClick={handleSkillClick} />
          </div>
        </div>

        {/* Skill Details Modal */}
        {showDetails && selectedSkill && (
          <SkillDetails 
            skill={selectedSkill} 
            userSkills={userSkills} 
            onClose={handleCloseDetails} 
          />
        )}
      </div>
    </div>
  )
} 