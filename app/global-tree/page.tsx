"use client"

import { useState, useEffect } from "react"
import { SkillTree } from "@/components/skill-tree"
import { SkillDetails } from "@/components/skill-details"
import type { Skill, UserSkills } from "@/types/skills"

export default function GlobalTreePage() {
  const [userSkills, setUserSkills] = useState<UserSkills | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const loadGlobalTree = async () => {
      try {
        console.log('🌍 Loading global skill tree...')
        const response = await fetch('/api/get-global-tree')

        if (response.ok) {
          const data = await response.json()
          if (data.hasGlobalTree) {
            console.log('✅ Loaded global skill tree with', data.globalMetadata?.totalNodes, 'nodes')
            setUserSkills(data)
            return
          }
        }
        
        // If no global tree found, show empty state
        console.log('❌ No global tree found')
        setUserSkills({
          earnedSkills: [],
          availableSkills: [],
          skillPoints: 0,
          skillTree: {
            nodes: [],
            connections: []
          }
        })
      } catch (error) {
        console.error('❌ Error loading global tree:', error)
        // Show error state but don't redirect
        setUserSkills({
          earnedSkills: [],
          availableSkills: [],
          skillPoints: 0,
          skillTree: {
            nodes: [],
            connections: []
          }
        })
      }
    }

    loadGlobalTree()
  }, [])

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
          <p className="text-slate-300">Loading the global skill tree...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Global Skill Tree</h1>
          <p className="text-slate-300">A collaborative skill network built from all user resumes</p>
          {userSkills?.globalMetadata && (
            <div className="mt-4 text-sm text-slate-400">
              <p>🌍 {userSkills.globalMetadata.totalUsers} contributors • {userSkills.globalMetadata.totalNodes} skills • {userSkills.globalMetadata.totalConnections} connections</p>
              <p>Last updated: {new Date(userSkills.globalMetadata.lastUpdated).toLocaleDateString()}</p>
            </div>
          )}
        </div>
        
        {/* Skill Tree - Full Width */}
        <div className="w-full">
          <SkillTree userSkills={userSkills} onSkillClick={handleSkillClick} />
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