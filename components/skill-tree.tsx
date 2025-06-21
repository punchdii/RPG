"use client"

import type { Skill, UserSkills } from "@/types/skills"
import SkillTreeVisualization from "./skill-tree/skill-tree-visualization"

interface SkillTreeProps {
  userSkills: UserSkills
  onSkillClick: (skill: Skill) => void
}

export function SkillTree({ userSkills, onSkillClick }: SkillTreeProps) {
  return (
    <div className="bg-slate-800/30 rounded-lg p-6 min-h-[600px] relative overflow-auto">
      <SkillTreeVisualization userSkills={userSkills} onSkillClick={onSkillClick} />
    </div>
  )
}
