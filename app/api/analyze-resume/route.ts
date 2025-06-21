import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface SkillNode {
  id: string
  name: string
  category: 'software' | 'hardware' | 'soft'
  earned: boolean
  prerequisites?: string[]
  description?: string
}

interface SkillTreeResponse {
  nodes: SkillNode[]
  connections: Array<{ from: string; to: string }>
}

export async function POST(req: NextRequest) {
  const { resumeText } = await req.json()
  console.log('🚀 API route called with text length:', resumeText.length)
  
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
      return NextResponse.json(fallbackAnalysis(resumeText))
    }

    console.log('🤖 Calling Gemini AI...')
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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
      "description": "Brief description"
    }
  ],
  "connections": [
    { "from": "prerequisite-id", "to": "dependent-skill-id" }
  ]
}

Rules:
1. Include 3 main category nodes: "software", "hardware", "soft-skills"
2. Mark skills as "earned: true" if they appear in the resume
3. Mark skills as "earned: false" for beneficial skills not yet acquired
4. Be specific on beneficial skill, they should be a level of abstraction lower than the existing it is connected to
5. Include realistic prerequisites and connections
6. Aim for 15-25 total skill nodes
7. Use kebab-case for IDs (e.g., "machine-learning", "project-management")
8. Only return valid JSON, no additional text
9. Aim to have number of beneficial skills not yet acquired to be 2 times than existing skills`


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
      
      // Deduplicate nodes to prevent React key conflicts
      if (skillTreeData.nodes && Array.isArray(skillTreeData.nodes)) {
        const nodeIds = new Set<string>()
        const uniqueNodes: SkillNode[] = []
        let duplicateCount = 0
        
        for (const node of skillTreeData.nodes) {
          if (!nodeIds.has(node.id)) {
            nodeIds.add(node.id)
            uniqueNodes.push(node)
          } else {
            console.log(`🔄 Removing duplicate node from AI response: ${node.id}`)
            duplicateCount++
          }
        }
        
        skillTreeData.nodes = uniqueNodes
        console.log(`✅ Deduplication complete - removed ${duplicateCount} duplicates, ${uniqueNodes.length} unique nodes remain`)
      }
      
      // Deduplicate connections as well
      if (skillTreeData.connections && Array.isArray(skillTreeData.connections)) {
        const connectionKeys = new Set<string>()
        const uniqueConnections: Array<{ from: string; to: string }> = []
        let duplicateConnectionCount = 0
        
        for (const connection of skillTreeData.connections) {
          const connectionKey = `${connection.from}->${connection.to}`
          if (!connectionKeys.has(connectionKey)) {
            connectionKeys.add(connectionKey)
            uniqueConnections.push(connection)
          } else {
            console.log(`🔄 Removing duplicate connection from AI response: ${connectionKey}`)
            duplicateConnectionCount++
          }
        }
        
        skillTreeData.connections = uniqueConnections
        console.log(`✅ Connection deduplication complete - removed ${duplicateConnectionCount} duplicates, ${uniqueConnections.length} unique connections remain`)
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', parseError)
      console.error('Raw response:', text)
      return NextResponse.json(fallbackAnalysis(resumeText))
    }

    // Convert to UserSkills format
    const earnedSkills = skillTreeData.nodes
      .filter(node => node.earned)
      .map(node => node.id)

    const availableSkills = skillTreeData.nodes
      .filter(node => !node.earned)
      .map(node => node.id)

    const skillPoints = earnedSkills.length * 10 + availableSkills.length * 5

    console.log('✅ Analysis complete - Earned:', earnedSkills.length, 'Available:', availableSkills.length)

    return NextResponse.json({
      earnedSkills,
      availableSkills,
      skillPoints,
      skillTree: skillTreeData
    })

  } catch (error) {
    console.error('❌ Gemini API error:', error)
    console.log('🔄 Using fallback analysis')
    return NextResponse.json(fallbackAnalysis(resumeText))
  }
}

// Fallback function if Gemini fails
function fallbackAnalysis(resumeText: string) {
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