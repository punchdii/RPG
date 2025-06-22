import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/user'

export async function GET(request: NextRequest) {
  try {
    const skillId = request.nextUrl.searchParams.get('skillId')
    
    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 })
    }

    console.log('🔍 Fetching users who have mastered skill:', skillId)
    
    await connectToDatabase()
    
    // Find users who have this skill either in earnedSkills array or in their skill tree nodes
    const users = await User.find({
      $or: [
        { 'skills.earnedSkills': skillId },
        { 'skills.skillTree.nodes': { 
          $elemMatch: { 
            id: skillId, 
            earned: true 
          } 
        }}
      ]
    }).select('name email').lean()
    
    console.log(`📊 Found ${users.length} users with skill: ${skillId}`)
    
    // Transform the data to include only necessary information
    const usersWithSkill = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email
    }))
    
    return NextResponse.json({
      success: true,
      users: usersWithSkill
    })
    
  } catch (error) {
    console.error('❌ Error fetching users with skill:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users with skill',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 