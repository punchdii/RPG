"use client"

import { SkillNode } from "@/components/skill-node"
import type { Skill, UserSkills } from "@/types/skills"
import { skillTreeData } from "@/data/skill-tree-data"

interface SkillTreeProps {
  userSkills: UserSkills
  onSkillClick: (skill: Skill) => void
}

export function SkillTree({ userSkills, onSkillClick }: SkillTreeProps) {
  const getSkillStatus = (skillId: string) => {
    if (userSkills.earnedSkills.includes(skillId)) return "earned"
    if (userSkills.availableSkills.includes(skillId)) return "available"
    return "locked"
  }

  return (
    <div className="bg-slate-800/30 rounded-lg p-6 min-h-[600px] relative overflow-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Skill Tree</h2>

      {/* Programming Branch */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Programming</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {skillTreeData.programming.map((skill) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              status={getSkillStatus(skill.id)}
              onClick={() => onSkillClick(skill)}
            />
          ))}
        </div>
      </div>

      {/* Web Development Branch */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-blue-300 mb-4">Web Development</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {skillTreeData.webDevelopment.map((skill) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              status={getSkillStatus(skill.id)}
              onClick={() => onSkillClick(skill)}
            />
          ))}
        </div>
      </div>

      {/* DevOps Branch */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-green-300 mb-4">DevOps & Infrastructure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {skillTreeData.devops.map((skill) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              status={getSkillStatus(skill.id)}
              onClick={() => onSkillClick(skill)}
            />
          ))}
        </div>
      </div>

      {/* Design Branch */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-pink-300 mb-4">Design & UX</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {skillTreeData.design.map((skill) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              status={getSkillStatus(skill.id)}
              onClick={() => onSkillClick(skill)}
            />
          ))}
        </div>
      </div>

      {/* Management Branch */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-yellow-300 mb-4">Leadership & Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {skillTreeData.management.map((skill) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              status={getSkillStatus(skill.id)}
              onClick={() => onSkillClick(skill)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
