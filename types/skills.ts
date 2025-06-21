export interface Skill {
  id: string
  name: string
  description: string
  prerequisites: string[]
  category: string
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
      prerequisites?: string[]
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
