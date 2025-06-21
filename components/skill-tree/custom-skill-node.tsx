"use client"

import { Handle, Position } from 'reactflow';
import type { Skill } from "@/types/skills"

export function CustomSkillNode({ data }: { data: { skill: Skill, status: 'earned' | 'available' | 'locked' } }) {
  const { skill, status } = data;

  const statusClasses = {
    earned: "border-red-500",
    available: "border-red-500",
    locked: "border-purple-500",
  }

  return (
    <div
      className={`rounded-xl p-4 w-48 h-24 text-center flex flex-col justify-center items-center border ${statusClasses[status]} bg-black/20 backdrop-blur-sm`}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent" />
      <h3 className="text-md font-medium text-white">{skill.name}</h3>
      <p className="text-xs text-gray-300 mt-1 line-clamp-2">{skill.description}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent" />
    </div>
  )
} 