"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { UserSkills } from "@/types/skills"
import { User, Star, Zap, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserProfileProps {
  userSkills: UserSkills
}

export function UserProfile({ userSkills }: UserProfileProps) {
  const totalSkills = userSkills.earnedSkills.length + userSkills.availableSkills.length
  const skillPoints = userSkills.earnedSkills.length * 10 + userSkills.availableSkills.length * 5
  const level = Math.floor(skillPoints / 50) + 1

  return (
    <Card className="bg-slate-950/30 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Your Name
          </div>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <Edit className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Level indicator */}
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-700/50 border-2 border-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-slate-300 text-lg mb-1">Beginner - LVL {level}</h3>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-2">
              <Star className="w-4 h-4 text-green-400" />
              Mastered Skills
            </span>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {userSkills.earnedSkills.length}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-400" />
              Known Skills
            </span>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {userSkills.availableSkills.length}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Skill Points</span>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              {skillPoints}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
