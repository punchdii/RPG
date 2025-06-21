"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Skill } from "@/types/skills"
import { Lock, Star, Zap } from "lucide-react"

interface SkillNodeProps {
  skill: Skill
  status: "earned" | "available" | "locked"
  onClick: () => void
}

export function SkillNode({ skill, status, onClick }: SkillNodeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "earned":
        return {
          card: "bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-400/50 hover:border-green-400 cursor-pointer transform hover:scale-105",
          icon: <Star className="w-4 h-4 text-green-400" />,
          badge: "bg-green-500/20 text-green-300 border-green-400/30",
        }
      case "available":
        return {
          card: "bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-400/50 hover:border-blue-400 cursor-pointer transform hover:scale-105",
          icon: <Zap className="w-4 h-4 text-blue-400" />,
          badge: "bg-blue-500/20 text-blue-300 border-blue-400/30",
        }
      case "locked":
        return {
          card: "bg-slate-700/30 border-slate-600/50 opacity-60",
          icon: <Lock className="w-4 h-4 text-slate-400" />,
          badge: "bg-slate-600/20 text-slate-400 border-slate-500/30",
        }
    }
  }

  const styles = getStatusStyles()

  return (
    <Card
      className={`p-4 transition-all duration-200 ${styles.card}`}
      onClick={status !== "locked" ? onClick : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-white text-sm leading-tight">{skill.name}</h4>
        </div>
        {styles.icon}
      </div>

      <div className="space-y-2">
        <Badge variant="outline" className={`text-xs ${styles.badge}`}>
          Level {skill.level}
        </Badge>

        {skill.category && (
          <Badge variant="outline" className="text-xs bg-slate-600/20 text-slate-300 border-slate-500/30">
            {skill.category}
          </Badge>
        )}
      </div>

      {status === "earned" && <div className="mt-2 text-xs text-green-300">✓ Mastered</div>}

      {status === "available" && <div className="mt-2 text-xs text-blue-300">Ready to learn</div>}

      {status === "locked" && skill.prerequisites.length > 0 && (
        <div className="mt-2 text-xs text-slate-400">
          Requires: {skill.prerequisites.slice(0, 2).join(", ")}
          {skill.prerequisites.length > 2 && "..."}
        </div>
      )}
    </Card>
  )
}
