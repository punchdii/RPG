import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/user'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching users with skill trees...')
    
    await connectToDatabase()
    
    // Find all users who have skill trees (either skillTree data or earnedSkills)
    const users = await User.find({
      $or: [
        { 'skills.skillTree': { $ne: null } },
        { 'skills.earnedSkills': { $exists: true, $not: { $size: 0 } } }
      ]
    }).select('name email skills.earnedSkills skills.skillTree').lean()
    
    console.log(`📊 Found ${users.length} users with skill trees`)
    
    // Transform the data to include parsed skill trees
    const usersWithSkills = users.map(user => {
      let skillTree = null
      
      if (user.skills?.skillTree) {
        try {
          skillTree = typeof user.skills.skillTree === 'string' 
            ? JSON.parse(user.skills.skillTree)
            : user.skills.skillTree
        } catch (error) {
          console.error(`❌ Error parsing skill tree for user ${user.name}:`, error)
        }
      }
      
      return {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        earnedSkills: user.skills?.earnedSkills || [],
        skillTreeNodes: skillTree?.nodes || [],
        totalSkills: (user.skills?.earnedSkills || []).length + (skillTree?.nodes?.filter((n: any) => n.earned) || []).length
      }
    })
    
    // Sort by total skills (most skilled users first)
    usersWithSkills.sort((a, b) => b.totalSkills - a.totalSkills)
    
    console.log('✅ Users with skills data prepared:', usersWithSkills.map(u => ({
      name: u.name,
      totalSkills: u.totalSkills
    })))
    
    return NextResponse.json({
      success: true,
      users: usersWithSkills
    })
    
  } catch (error) {
    console.error('❌ Error fetching users with skills:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users with skills',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 