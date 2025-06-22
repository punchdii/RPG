"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { UserSkills } from "@/types/skills"
import { 
  User, Star, Zap, Edit, Crown, Swords, Shield, 
  Flame, Sparkles, GalleryThumbnails, Gem, Rocket, Target, Award 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserData {
  email: string
  name?: string
}

interface UserProfileProps {
  userSkills: UserSkills
}

export function UserProfile({ userSkills }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  
  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUserData(JSON.parse(storedUser))
    }
  }, [])

  const totalSkills = userSkills.earnedSkills.length + (userSkills.skillTree?.nodes?.filter(node => node.earned)?.length || 0)
  // Calculate level based on total skills (every 5 skills = 1 level)
  const level = Math.floor(totalSkills / 5) + 1
  const skillPoints = userSkills.skillPoints || (userSkills.earnedSkills.length * 10 + userSkills.availableSkills.length * 5)

  // Get level icon based on level
  const getLevelIcon = () => {
    if (level >= 25) {
      return {
        icon: <Crown className="w-5 h-5" />,
        gradient: 'from-yellow-400 via-amber-500 to-orange-600',
        text: 'text-yellow-100'
      }
    } else if (level >= 20) {
      return {
        icon: <Swords className="w-5 h-5" />,
        gradient: 'from-red-500 via-rose-500 to-pink-600',
        text: 'text-red-100'
      }
    } else if (level >= 18) {
      return {
        icon: <Gem className="w-5 h-5" />,
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
        text: 'text-violet-100'
      }
    } else if (level >= 16) {
      return {
        icon: <Shield className="w-5 h-5" />,
        gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
        text: 'text-emerald-100'
      }
    } else if (level >= 14) {
      return {
        icon: <Flame className="w-5 h-5" />,
        gradient: 'from-orange-400 via-amber-500 to-yellow-600',
        text: 'text-orange-100'
      }
    } else if (level >= 12) {
      return {
        icon: <Target className="w-5 h-5" />,
        gradient: 'from-blue-400 via-indigo-500 to-violet-600',
        text: 'text-blue-100'
      }
    } else if (level >= 10) {
      return {
        icon: <Award className="w-5 h-5" />,
        gradient: 'from-teal-400 via-emerald-500 to-green-600',
        text: 'text-teal-100'
      }
    } else if (level >= 8) {
      return {
        icon: <Rocket className="w-5 h-5" />,
        gradient: 'from-fuchsia-400 via-pink-500 to-rose-600',
        text: 'text-fuchsia-100'
      }
    } else if (level >= 6) {
      return {
        icon: <Sparkles className="w-5 h-5" />,
        gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
        text: 'text-cyan-100'
      }
    } else if (level >= 4) {
      return {
        icon: <Zap className="w-5 h-5" />,
        gradient: 'from-lime-400 via-green-500 to-emerald-600',
        text: 'text-lime-100'
      }
    } else if (level >= 2) {
      return {
        icon: <Star className="w-5 h-5" />,
        gradient: 'from-amber-400 via-orange-500 to-red-600',
        text: 'text-amber-100'
      }
    } else {
      return {
        icon: <GalleryThumbnails className="w-5 h-5" />,
        gradient: 'from-slate-400 via-slate-500 to-slate-600',
        text: 'text-slate-100'
      }
    }
  }

  const levelInfo = getLevelIcon()
  
  // Extract name from email if no name is provided
  const displayName = userData?.name || 
    (userData?.email ? userData.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'User')

  return (
    <Card className="bg-slate-950/30 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <div>
              <div>{displayName}</div>
              {userData?.email && (
                <div className="text-xs text-slate-400 font-normal">{userData.email}</div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <Edit className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Level indicator */}
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            <AvatarFallback className={`bg-gradient-to-br ${levelInfo.gradient} ${levelInfo.text} text-sm font-semibold flex items-center justify-center rounded-full`}>
              {levelInfo.icon}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-slate-300 text-lg mb-1">
            {level <= 2 ? 'Beginner' : level <= 5 ? 'Intermediate' : level <= 10 ? 'Advanced' : 'Expert'} - LVL {level}
          </h3>
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
            <span className="text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Skill Points
            </span>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              {skillPoints}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
