export interface Skill {
  id: string
  name: string
  description: string
  prerequisites: string[]
  category: string
  mastered?: boolean // Whether the user has mastered this skill
  userCount?: number // Number of users who have this skill (for global tree styling)
  children?: string[] // Children skills that depend on this skill
  level?: number;
  learningResources?: LearningResource[];
  relatedSkills?: string[];
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
  skillTree?: {
    nodes: Array<{
      id: string
      name: string
      category: 'software' | 'hardware' | 'soft'
      earned: boolean
      mastered?: boolean
      prerequisites?: string[]
      children?: string[]
      description?: string
    }>
    connections: Array<{ from: string; to: string }>
  }
  globalMetadata?: {
    totalUsers: number
    lastUpdated: Date
    totalNodes: number
    totalConnections: number
  }
}
