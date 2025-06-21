import type { UserSkills } from "@/types/skills"

export function analyzeResume(resumeText: string): UserSkills {
  const text = resumeText.toLowerCase()

  // Define skill mappings
  const skillMappings = {
    // Programming
    javascript: "javascript",
    js: "javascript",
    typescript: "typescript",
    ts: "typescript",
    python: "python",
    "node.js": "nodejs",
    nodejs: "nodejs",
    node: "nodejs",
    git: "git",
    github: "git",

    // Web Development
    react: "react",
    reactjs: "react",
    "next.js": "nextjs",
    nextjs: "nextjs",
    html: "html-css",
    css: "html-css",
    tailwind: "tailwind",
    tailwindcss: "tailwind",
    rest: "rest-apis",
    api: "rest-apis",

    // DevOps
    docker: "docker",
    aws: "aws",
    "amazon web services": "aws",
    "ci/cd": "cicd",
    "github actions": "cicd",
    postgresql: "postgresql",
    postgres: "postgresql",
    mongodb: "mongodb",
    mongo: "mongodb",

    // Design
    figma: "figma",
    ui: "ui-design",
    ux: "ux-design",
    design: "ui-design",

    // Management
    "project management": "project-management",
    "team lead": "team-leadership",
    leadership: "team-leadership",
    agile: "agile-scrum",
    scrum: "agile-scrum",
  }

  // Find earned skills
  const earnedSkills: string[] = []
  Object.entries(skillMappings).forEach(([keyword, skillId]) => {
    if (text.includes(keyword) && !earnedSkills.includes(skillId)) {
      earnedSkills.push(skillId)
    }
  })

  // Determine available skills based on prerequisites
  const availableSkills: string[] = []

  // Programming prerequisites
  if (earnedSkills.includes("javascript") && !earnedSkills.includes("typescript")) {
    availableSkills.push("typescript")
  }
  if (earnedSkills.includes("javascript") && !earnedSkills.includes("nodejs")) {
    availableSkills.push("nodejs")
  }
  if (earnedSkills.includes("javascript") && !earnedSkills.includes("react")) {
    availableSkills.push("react")
  }

  // Web Development prerequisites
  if (earnedSkills.includes("react") && !earnedSkills.includes("nextjs")) {
    availableSkills.push("nextjs")
  }
  if (earnedSkills.includes("html-css") && !earnedSkills.includes("tailwind")) {
    availableSkills.push("tailwind")
  }
  if (earnedSkills.includes("javascript") && !earnedSkills.includes("rest-apis")) {
    availableSkills.push("rest-apis")
  }

  // DevOps prerequisites
  if (earnedSkills.includes("git") && !earnedSkills.includes("docker")) {
    availableSkills.push("docker")
  }
  if (earnedSkills.includes("docker") && !earnedSkills.includes("aws")) {
    availableSkills.push("aws")
  }
  if (earnedSkills.includes("git") && !earnedSkills.includes("cicd")) {
    availableSkills.push("cicd")
  }

  // Design prerequisites
  if (earnedSkills.includes("figma") && !earnedSkills.includes("ui-design")) {
    availableSkills.push("ui-design")
  }
  if (earnedSkills.includes("ui-design") && !earnedSkills.includes("ux-design")) {
    availableSkills.push("ux-design")
  }

  // Management prerequisites
  if (earnedSkills.includes("project-management") && !earnedSkills.includes("team-leadership")) {
    availableSkills.push("team-leadership")
  }

  // Add some basic skills if none found
  if (earnedSkills.length === 0) {
    availableSkills.push("javascript", "html-css", "git", "figma", "project-management")
  }

  // Add foundational skills that are always available
  if (!earnedSkills.includes("html-css") && !availableSkills.includes("html-css")) {
    availableSkills.push("html-css")
  }
  if (!earnedSkills.includes("git") && !availableSkills.includes("git")) {
    availableSkills.push("git")
  }
  if (!earnedSkills.includes("agile-scrum") && !availableSkills.includes("agile-scrum")) {
    availableSkills.push("agile-scrum")
  }

  return {
    earnedSkills,
    availableSkills,
    skillPoints: earnedSkills.length * 10 + availableSkills.length * 5,
  }
}
