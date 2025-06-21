import { GoogleGenerativeAI } from '@google/generative-ai'
import type { UserSkills } from "@/types/skills"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface SkillNode {
  id: string
  name: string
  category: 'software' | 'hardware' | 'soft'
  earned: boolean
  prerequisites?: string[]
  children?: string[]
  description?: string
}

interface SkillTreeResponse {
  nodes: SkillNode[]
  connections: Array<{ from: string; to: string }>
}

export async function analyzeResume(resumeText: string): Promise<UserSkills> {
  console.log('🚀 analyzeResume called with text length:', resumeText.length)
  
  try {
    // Debug API key loading
    console.log('🔍 All env vars starting with GEMINI:', Object.keys(process.env).filter(key => key.includes('GEMINI')))
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV)
    const apiKey = process.env.GEMINI_API_KEY
    console.log('🔑 GEMINI_API_KEY exists:', !!apiKey)
    console.log('🔑 GEMINI_API_KEY length:', apiKey?.length || 0)
    console.log('🔑 GEMINI_API_KEY first 10 chars:', apiKey?.substring(0, 10) || 'undefined')
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is not set, using fallback')
      return fallbackAnalysis(resumeText)
    }

    console.log('🤖 Calling Gemini AI...')
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Create a skill tree of tech (software, hardware, and soft skills should be the first nodes with other nodes following them) for the resume attached to this prompt. The graph should also include a few skills that aren't reached yet by this resume and that would be beneficial for users to have.

Resume:
${resumeText}

Please respond with a JSON object in this exact format:
{
  "nodes": [
    {
      "id": "unique-skill-id",
      "name": "Skill Name",
      "category": "software|hardware|soft",
      "earned": true|false,
      "prerequisites": ["prerequisite-skill-id"],
      "children": ["child-skill-id-1", "child-skill-id-2"],
      "description": "Brief description"
    }
  ],
  "connections": [
    { "from": "prerequisite-id", "to": "dependent-skill-id" }
  ]
}

Rules:
1. Include 3 main category nodes: "software", "hardware", "soft-skills"
2. Mark skills as "earned: true" if they appear in the resume, "earned: false" for beneficial skills not yet acquired
3. Include both "prerequisites" (parent skills needed) AND "children" (skills that depend on this one)
4. Include realistic prerequisites and connections that form a proper tree structure
5. Aim for 15-25 total skill nodes
6. Use kebab-case for IDs (e.g., "machine-learning", "project-management")
7. Make sure prerequisites and children relationships are consistent (if A is prerequisite of B, then B should be in A's children)
8. Only return valid JSON, no additional text`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log('✅ Gemini response received, length:', text.length)
    console.log('📝 Gemini response:', text.substring(0, 500) + '...')

    // Parse the JSON response
    let skillTreeData: SkillTreeResponse
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      skillTreeData = JSON.parse(jsonMatch[0])
      console.log('✅ Successfully parsed JSON with', skillTreeData.nodes?.length, 'nodes')
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', parseError)
      console.error('Raw response:', text)
      // Fallback to basic analysis
      return fallbackAnalysis(resumeText)
    }

    // Build bidirectional relationships if not provided by AI
    const nodeMap = new Map(skillTreeData.nodes.map(node => [node.id, node]))
    
    // Ensure children arrays exist and are consistent with prerequisites
    skillTreeData.nodes.forEach(node => {
      if (!node.children) node.children = []
    })
    
    // Build children from prerequisites
    skillTreeData.nodes.forEach(node => {
      if (node.prerequisites) {
        node.prerequisites.forEach(prereqId => {
          const prereqNode = nodeMap.get(prereqId)
          if (prereqNode) {
            if (!prereqNode.children) prereqNode.children = []
            if (!prereqNode.children.includes(node.id)) {
              prereqNode.children.push(node.id)
            }
          }
        })
      }
    })
    
    console.log('✅ Built bidirectional relationships')

    // Convert to UserSkills format
    const earnedSkills = skillTreeData.nodes
      .filter(node => node.earned)
      .map(node => node.id)

    const availableSkills = skillTreeData.nodes
      .filter(node => !node.earned)
      .map(node => node.id)

    const skillPoints = earnedSkills.length * 10 + availableSkills.length * 5

    console.log('✅ Analysis complete - Earned:', earnedSkills.length, 'Available:', availableSkills.length)

    return {
      earnedSkills,
      availableSkills,
      skillPoints,
      skillTree: skillTreeData // Store the full tree data for visualization
    }

  } catch (error) {
    console.error('❌ Gemini API error:', error)
    // Fallback to basic analysis
    console.log('🔄 Using fallback analysis')
    return fallbackAnalysis(resumeText)
  }
}

// Fallback function if Gemini fails
function fallbackAnalysis(resumeText: string): UserSkills {
  const text = resumeText.toLowerCase()

  const skillMappings = {
    javascript: "javascript",
    python: "python",
    react: "react",
    nodejs: "nodejs",
    git: "git",
    docker: "docker",
    aws: "aws",
    mongodb: "mongodb",
    postgresql: "postgresql",
    figma: "figma",
    "project management": "project-management",
    leadership: "leadership",
    communication: "communication"
  }

  const earnedSkills: string[] = []
  Object.entries(skillMappings).forEach(([keyword, skillId]) => {
    if (text.includes(keyword) && !earnedSkills.includes(skillId)) {
      earnedSkills.push(skillId)
    }
  })

  const availableSkills = ["typescript", "nextjs", "kubernetes", "machine-learning", "ui-design"]
    .filter(skill => !earnedSkills.includes(skill))

  return {
    earnedSkills,
    availableSkills,
    skillPoints: earnedSkills.length * 10 + availableSkills.length * 5
  }
}
