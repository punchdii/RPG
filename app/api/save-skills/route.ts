import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/user'
import type { UserSkills } from '@/types/skills'

export async function POST(req: NextRequest) {
  try {
    const { userEmail, skills }: { userEmail: string; skills: UserSkills } = await req.json()
    
    console.log('💾 Saving skills for user:', userEmail)

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // First get the current user to preserve existing data
    const existingUser = await User.findOne({ email: userEmail })
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Try direct MongoDB update to bypass any schema issues
    const skillTreeString = skills.skillTree ? JSON.stringify(skills.skillTree) : null
    
    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          'skills.earnedSkills': skills.earnedSkills || existingUser.skills?.earnedSkills || [],
          'skills.availableSkills': skills.availableSkills || existingUser.skills?.availableSkills || [],
          'skills.skillTree': skillTreeString,
          skillPoints: skills.skillPoints || 0
        }
      },
      { new: true, upsert: false, strict: false }
    )

    console.log('✅ Skills saved successfully for user:', userEmail)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Skills saved successfully',
      skillsCount: {
        earned: skills.earnedSkills?.length || 0,
        available: skills.availableSkills?.length || 0,
        points: skills.skillPoints || 0
      },
      skillTreeSaved: !!updatedUser.skills?.skillTree
    })

  } catch (error) {
    console.error('❌ Error saving skills:', error)
    return NextResponse.json({ 
      error: 'Failed to save skills',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 