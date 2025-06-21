export interface Skill {
  id: string
  name: string
  description: string
  level: number
  category?: string
  prerequisites: string[]
  learningResources?: LearningResource[]
  relatedSkills?: string[]
}

export interface LearningResource {
  title: string
  type: "Course" | "Book" | "Tutorial" | "Documentation" | "Practice"
  duration?: string
  url?: string
}

export interface UserSkills {
  earnedSkills: string[]
  availableSkills: string[]
  skillPoints: number
}
