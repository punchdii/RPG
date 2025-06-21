"use client"

import type { Skill, UserSkills } from "@/types/skills"
import SkillTreeVisualization from "./skill-tree/skill-tree-visualization"

interface SkillTreeProps {
  userSkills: UserSkills
  onSkillClick: (skill: Skill) => void
}

export function SkillTree({ userSkills, onSkillClick }: SkillTreeProps) {
  return (
    <div className="bg-transparent rounded-lg relative">
      <SkillTreeVisualization userSkills={userSkills} onSkillClick={onSkillClick} />
    </div>
  )
}
