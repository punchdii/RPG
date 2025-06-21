"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SkillTree } from "@/components/skill-tree"
import { SkillDetails } from "@/components/skill-details"
import { UserProfile } from "@/components/user-profile"
import type { Skill, UserSkills } from "@/types/skills"

export default function SkillTreePage() {
  const [userSkills, setUserSkills] = useState<UserSkills | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get skills from sessionStorage
    const storedSkills = sessionStorage.getItem('userSkills')
    if (storedSkills) {
      setUserSkills(JSON.parse(storedSkills))
    } else {
      // Redirect to upload if no skills found
      router.push('/upload')
    }
  }, [router])

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedSkill(null)
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
          <div className="lg:col-span-1 sticky top-8">
            <UserProfile userSkills={userSkills} />
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