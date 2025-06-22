"use client"

import { Handle, Position } from 'reactflow';
import type { Skill } from "@/types/skills"

// Helper function to calculate border color and style based on user count
function getUserCountStyle(userCount?: number): { borderColor: string; style?: React.CSSProperties } {
  if (!userCount || userCount <= 1) {
    return { borderColor: 'border-white' }; // 1 person = white
  }
  
  // Create gradient from white to orange based on user count (1 to 10+)
  const ratio = Math.min(userCount - 1, 9) / 9; // Normalize to 0-1 range for 1-10 users
  
  // Generate RGB values for gradient from white (255,255,255) to orange (255,165,0)
  const r = 255;
  const g = Math.round(255 - (90 * ratio)); // 255 -> 165
  const b = Math.round(255 - (255 * ratio)); // 255 -> 0
  
  return {
    borderColor: '', // Empty to use inline style
    style: { borderColor: `rgb(${r}, ${g}, ${b})` }
  };
}

interface CustomSkillNodeData {
  skill: Skill;
  status: 'earned' | 'available' | 'locked';
  isHighlighted?: boolean;
  isHovered?: boolean;
  isDimmed?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function CustomSkillNode({ data }: { data: CustomSkillNodeData }) {
  const { skill, status, isHighlighted, isHovered, isDimmed, onMouseEnter, onMouseLeave } = data;

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

  // Determine border color and style based on context
  let borderColor: string;
  let borderStyle: React.CSSProperties | undefined;
  
  if (isCategoryNode) {
    // Category nodes use their specific colors
    const categoryColorMap = {
      'software': 'border-red-500',
      'hardware': 'border-purple-500',
      'soft-skills': 'border-green-500'
    };
    borderColor = categoryColorMap[skill.id as keyof typeof categoryColorMap] || 'border-red-500';
  } else if (skill.userCount) {
    // Global tree nodes use user count gradient
    const userStyle = getUserCountStyle(skill.userCount);
    borderColor = userStyle.borderColor;
    borderStyle = userStyle.style;
  } else {
    // Individual skill tree nodes use status colors
    const statusBorderMap = {
      earned: 'border-red-500',
      available: 'border-yellow-500',
      locked: 'border-gray-500'
    };
    borderColor = statusBorderMap[status];
  }

  // Background colors remain the same
  const nodeStyle = isCategoryNode ? 
    categoryColors[skill.id as keyof typeof categoryColors] || 'bg-red-500/20' :
    statusClasses[status];

  const nodeSize = isCategoryNode ? 'w-40 h-16' : 'w-48 h-24';
  const textSize = isCategoryNode ? 'text-lg font-bold' : 'text-md font-medium';

  // Apply highlighting and dimming effects
  let nodeClasses = `rounded-xl p-4 ${nodeSize} text-center flex flex-col justify-center items-center border-2 ${borderColor} ${nodeStyle} backdrop-blur-sm transition-all duration-200`;
  
  if (isHighlighted) {
    nodeClasses += ' ring-2 ring-yellow-400 ring-opacity-60 scale-105 shadow-lg shadow-yellow-400/20';
  } else if (isDimmed) {
    nodeClasses += ' opacity-40 scale-95';
  }

  // Combine border styles
  const combinedStyle = {
    ...borderStyle,
    transform: isHighlighted ? 'scale(1.05)' : isDimmed ? 'scale(0.95)' : 'scale(1)',
  };

  return (
    <div
      className={nodeClasses}
      style={combinedStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent" />
      <div className="flex items-center gap-1">
      <h3 className={`${textSize} text-white`}>{skill.name}</h3>
        {skill.userCount && skill.userCount > 1 && (
          <span 
            className="text-xs bg-orange-500/30 text-orange-100 px-1.5 py-0.5 rounded-full font-semibold"
            title={`${skill.userCount} users have this skill`}
          >
            {skill.userCount}
          </span>
        )}
      </div>
      {!isCategoryNode && (
        <p className="text-xs text-gray-300 mt-1 line-clamp-2">{skill.description}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-transparent" />
    </div>
  )
} 