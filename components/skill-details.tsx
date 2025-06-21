"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Skill, UserSkills } from "@/types/skills"
import { X, Star, Zap, Lock, BookOpen, Users, Clock } from "lucide-react"

interface SkillDetailsProps {
  skill: Skill
  userSkills: UserSkills
  onClose: () => void
}

export function SkillDetails({ skill, userSkills, onClose }: SkillDetailsProps) {
  const isEarned = userSkills.earnedSkills.includes(skill.id)
  const isAvailable = userSkills.availableSkills.includes(skill.id)
  const isLocked = !isEarned && !isAvailable

  const getStatusInfo = () => {
    if (isEarned) {
      return {
        icon: <Star className="w-5 h-5 text-green-400" />,
        status: "Mastered",
        color: "text-green-400",
        bgColor: "bg-green-500/10 border-green-400/30",
      }
    } else if (isAvailable) {
      return {
        icon: <Zap className="w-5 h-5 text-blue-400" />,
        status: "Ready to Learn",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10 border-blue-400/30",
      }
    } else {
      return {
        icon: <Lock className="w-5 h-5 text-slate-400" />,
        status: "Locked",
        color: "text-slate-400",
        bgColor: "bg-slate-600/10 border-slate-500/30",
      }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="bg-slate-800 border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex-1">
            <CardTitle className="text-2xl text-white mb-2">{skill.name}</CardTitle>
            <div className="flex items-center gap-2 mb-3">
              {statusInfo.icon}
              <span className={`font-medium ${statusInfo.color}`}>{statusInfo.status}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={statusInfo.bgColor}>
                Level {skill.level}
              </Badge>
              {skill.category && (
                <Badge variant="outline" className="bg-slate-600/20 text-slate-300 border-slate-500/30">
                  {skill.category}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-slate-300 leading-relaxed">{skill.description}</p>
          </div>

          {skill.prerequisites.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Prerequisites
              </h3>
              <div className="flex flex-wrap gap-2">
                {skill.prerequisites.map((prereq) => (
                  <Badge
                    key={prereq}
                    variant="outline"
                    className={`${
                      userSkills.earnedSkills.includes(prereq.toLowerCase().replace(/\s+/g, "-"))
                        ? "bg-green-500/20 text-green-300 border-green-400/30"
                        : "bg-slate-600/20 text-slate-400 border-slate-500/30"
                    }`}
                  >
                    {prereq}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {skill.learningResources && skill.learningResources.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Learning Resources
              </h3>
              <div className="space-y-2">
                {skill.learningResources.map((resource, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                    <div className="font-medium text-white">{resource.title}</div>
                    <div className="text-sm text-slate-400">{resource.type}</div>
                    {resource.duration && (
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {resource.duration}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {skill.relatedSkills && skill.relatedSkills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Related Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skill.relatedSkills.map((related) => (
                  <Badge
                    key={related}
                    variant="outline"
                    className="bg-purple-500/20 text-purple-300 border-purple-400/30"
                  >
                    {related}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {isAvailable && (
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">Ready to Learn!</h4>
              <p className="text-sm text-slate-300 mb-3">
                You've met all the prerequisites for this skill. Start learning to unlock it!
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Start Learning</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
