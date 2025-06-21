"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { UserSkills } from "@/types/skills"
import { User, Star, Zap, Trophy } from "lucide-react"

interface UserProfileProps {
  userSkills: UserSkills
}

export function UserProfile({ userSkills }: UserProfileProps) {
  const totalSkills = userSkills.earnedSkills.length + userSkills.availableSkills.length
  const skillPoints = userSkills.earnedSkills.length * 10 + userSkills.availableSkills.length * 5

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-white">Skill Explorer</h3>
          <p className="text-sm text-slate-400">Level {Math.floor(skillPoints / 50) + 1}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-2">
              <Star className="w-4 h-4 text-green-400" />
              Mastered Skills
            </span>
            <Badge className="bg-green-500/20 text-green-300">{userSkills.earnedSkills.length}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              Available Skills
            </span>
            <Badge className="bg-blue-500/20 text-blue-300">{userSkills.availableSkills.length}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Total Skill Points</span>
            <Badge className="bg-purple-500/20 text-purple-300">{skillPoints}</Badge>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <h4 className="font-medium text-white mb-2">Recent Skills</h4>
          <div className="space-y-1">
            {userSkills.earnedSkills.slice(0, 3).map((skillId) => (
              <div key={skillId} className="text-sm text-slate-300 flex items-center gap-2">
                <Star className="w-3 h-3 text-green-400" />
                {skillId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
