"use client"

import { useState } from "react"
import { ResumeUpload } from "@/components/resume-upload"
import { SkillTree } from "@/components/skill-tree"
import { SkillDetails } from "@/components/skill-details"
import { UserProfile } from "@/components/user-profile"
import type { Skill, UserSkills } from "@/types/skills"

export default function Home() {
  const [userSkills, setUserSkills] = useState<UserSkills | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleResumeAnalyzed = (skills: UserSkills) => {
    setUserSkills(skills)
  }

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedSkill(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ResumeTree</h1>
          <p className="text-slate-300">Transform your resume into an interactive skill tree</p>
        </header>

        {!userSkills ? (
          <ResumeUpload onResumeAnalyzed={handleResumeAnalyzed} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <UserProfile userSkills={userSkills} />
            </div>
            <div className="lg:col-span-3">
              <SkillTree userSkills={userSkills} onSkillClick={handleSkillClick} />
            </div>
          </div>
        )}

        {showDetails && selectedSkill && (
          <SkillDetails skill={selectedSkill} userSkills={userSkills!} onClose={handleCloseDetails} />
        )}
      </div>
    </div>
  )
}
