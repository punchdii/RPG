"use client"

import type { Skill, UserSkills } from "@/types/skills"
import SkillTreeVisualization from "./skill-tree/skill-tree-visualization"

interface SkillTreeProps {
  userSkills: UserSkills
  onSkillClick: (skill: Skill) => void
  highlightedSkills?: string[] | null
}

export function SkillTree({ userSkills, onSkillClick, highlightedSkills }: SkillTreeProps) {
  return (
    <div className="bg-transparent rounded-lg relative">
      <SkillTreeVisualization 
        userSkills={userSkills} 
        onSkillClick={onSkillClick}
        highlightedSkills={highlightedSkills}
      />
    </div>
  )
}
