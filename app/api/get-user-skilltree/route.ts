import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/user'

export async function POST(req: NextRequest) {
  try {
    const { userEmail } = await req.json()
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Find the user and get their skill tree
    const user = await User.findOne({ email: userEmail })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has a skill tree
    if (!user.skills?.skillTree) {
      return NextResponse.json({ 
        hasSkillTree: false,
        message: 'No skill tree found for user'
      })
    }

    // Parse the skill tree from JSON string
    let skillTreeData
    try {
      skillTreeData = JSON.parse(user.skills.skillTree)
    } catch (error) {
      console.error('Error parsing skill tree:', error)
      return NextResponse.json({ error: 'Invalid skill tree data' }, { status: 500 })
    }

    // Return the user skills data
    return NextResponse.json({
      hasSkillTree: true,
      earnedSkills: user.skills.earnedSkills || [],
      availableSkills: user.skills.availableSkills || [],
      skillPoints: user.skillPoints || 0,
      skillTree: skillTreeData
    })

  } catch (error) {
    console.error('❌ Error fetching user skill tree:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch skill tree',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 