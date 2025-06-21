import { Skill } from "@/types/skills"

export const nodes: Skill[] = [
  {
    name: "HTML & CSS",
    description: "Fundamentals of web structure and styling",
    prerequisites: [],
    category: "Frontend",
    progressLevel: "Beginner",
    isAccomplished: false
  },
  {
    name: "JavaScript",
    description: "Core programming concepts and DOM manipulation",
    prerequisites: ["HTML & CSS"],
    category: "Frontend",
    progressLevel: "Intermediate",
    isAccomplished: false
  },
  {
    name: "React",
    description: "Building user interfaces with React",
    prerequisites: ["JavaScript"],
    category: "Frontend",
    progressLevel: "Advanced",
    isAccomplished: false
  },
  {
    name: "Node.js",
    description: "Server-side JavaScript runtime",
    prerequisites: ["JavaScript"],
    category: "Backend",
    progressLevel: "Intermediate",
    isAccomplished: false
  },
  {
    name: "Database Design",
    description: "Fundamentals of database architecture",
    prerequisites: [],
    category: "Backend",
    progressLevel: "Beginner",
    isAccomplished: false
  },
  {
    name: "MongoDB",
    description: "NoSQL database management",
    prerequisites: ["Database Design"],
    category: "Backend",
    progressLevel: "Intermediate",
    isAccomplished: false
  },
  {
    name: "System Architecture",
    description: "Designing scalable system architectures",
    prerequisites: ["Node.js", "MongoDB"],
    category: "Backend",
    progressLevel: "Expert",
    isAccomplished: false
  }
]

// Helper function to find a node by name
export function findNodeByName(name: string): Skill | undefined {
  return nodes.find(node => node.name === name)
}

// Helper function to get all nodes of a specific category
export function getNodesByCategory(category: string): Skill[] {
  return nodes.filter(node => node.category === category)
}

// Helper function to get all available nodes (nodes whose prerequisites are accomplished)
export function getAvailableNodes(accomplishedNodes: string[]): Skill[] {
  return nodes.filter(node => {
    if (node.isAccomplished) return false
    return node.prerequisites.every(prereq => accomplishedNodes.includes(prereq))
  })
} 