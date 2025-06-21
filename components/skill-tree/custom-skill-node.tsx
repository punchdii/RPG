"use client"

import { Handle, Position } from 'reactflow';
import type { Skill } from "@/types/skills"

export function CustomSkillNode({ data }: { data: { skill: Skill, status: 'earned' | 'available' | 'locked' } }) {
  const { skill, status } = data;

  // Check if this is a category node
  const isCategoryNode = ['software', 'hardware', 'soft-skills'].includes(skill.id);

  const statusClasses = {
    earned: "border-red-500 bg-red-500/10",
    available: "border-yellow-500 bg-yellow-500/10", 
    locked: "border-gray-500 bg-gray-500/10",
  }

  // Category-specific styling
  const categoryColors = {
    'software': 'border-red-500 bg-red-500/20',
    'hardware': 'border-purple-500 bg-purple-500/20',
    'soft-skills': 'border-green-500 bg-green-500/20'
  };

  const nodeStyle = isCategoryNode ? 
    categoryColors[skill.id as keyof typeof categoryColors] || 'border-red-500 bg-red-500/20' :
    statusClasses[status];

  const nodeSize = isCategoryNode ? 'w-40 h-16' : 'w-48 h-24';
  const textSize = isCategoryNode ? 'text-lg font-bold' : 'text-md font-medium';

  return (
    <div
      className={`rounded-xl p-4 ${nodeSize} text-center flex flex-col justify-center items-center border-2 ${nodeStyle} backdrop-blur-sm`}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent" />
      <h3 className={`${textSize} text-white`}>{skill.name}</h3>
      {!isCategoryNode && (
        <p className="text-xs text-gray-300 mt-1 line-clamp-2">{skill.description}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-transparent" />
    </div>
  )
} 