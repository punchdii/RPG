import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/user'
import GlobalTree from '@/models/global-tree'
import type { UserSkills } from '@/types/skills'
import type { IGlobalTree, ISkillNode, ISkillConnection } from '@/models/global-tree'

// Helper function to recursively ensure prerequisite chain exists
function ensurePrerequisiteChain(skillId: string, userSkillTree: any, globalTree: any, visited = new Set<string>()): void {
  // Prevent infinite loops
  if (visited.has(skillId)) {
    console.log(`⚠️ Circular dependency detected for skill: ${skillId}`)
    return
  }
  visited.add(skillId)

  // Check if skill already exists in global tree
  let existingNode = globalTree.nodes.find((n: any) => n.id === skillId)
  if (existingNode) {
    return // Already exists, no need to create
  }

  // Find the skill in user's skill tree
  const userSkill = userSkillTree.nodes?.find((n: any) => n.id === skillId)
  if (!userSkill) {
    // Skill not found in user tree, check if it's a foundation category
    const foundationCategories = ['software', 'hardware', 'soft-skills']
    if (foundationCategories.includes(skillId)) {
      // Create foundation category node
      const foundationNode = {
        id: skillId,
        name: skillId.charAt(0).toUpperCase() + skillId.slice(1).replace('-', ' '),
        category: 'Category',
        description: `${skillId} foundation category`,
        prerequisites: [],
        children: [],
        earnedByCount: 0,
        totalUserCount: 1
      }
      globalTree.nodes.push(foundationNode)
      console.log(`🏗️ Created foundation category: ${skillId}`)
      return
    } else {
      // ERROR: Skill not found and not a foundation - this shouldn't happen
      console.error(`❌ CRITICAL ERROR: Skill ${skillId} not found in user tree and not a foundation category!`)
      throw new Error(`Prerequisite chain broken: ${skillId} not found and not a foundation category`)
    }
  }

  // Recursively ensure all prerequisites of this skill exist first
  if (userSkill.prerequisites && userSkill.prerequisites.length > 0) {
    for (const prereqId of userSkill.prerequisites) {
      ensurePrerequisiteChain(prereqId, userSkillTree, globalTree, new Set(visited))
    }
  }

  // Now create this skill node (all its prerequisites should exist now)
  const newNode = {
    id: userSkill.id,
    name: userSkill.name,
    category: userSkill.category,
    description: userSkill.description || `${userSkill.name} (prerequisite auto-created)`,
    prerequisites: userSkill.prerequisites || [],
    children: [],
    earnedByCount: userSkill.earned ? 1 : 0,
    totalUserCount: 1
  }
  
  globalTree.nodes.push(newNode)
  console.log(`🔗 Auto-created prerequisite: ${skillId} (earned: ${userSkill.earned})`)
}

// Helper function to merge user skills into global tree
async function updateGlobalTree(userSkillTree: any, userEmail?: string) {
  console.log('🌍 Updating global tree with user skills...')
  
  // Get or create the global tree
  let globalTree = await GlobalTree.findOne()
  if (!globalTree) {
    console.log('🌱 Creating new global tree')
    globalTree = new GlobalTree({
      nodes: [],
      connections: [],
      totalUsers: 0,
      lastUpdated: new Date()
    })
  }

  // Check for and remove any existing duplicate nodes before processing
  const nodeIds = new Set<string>()
  const uniqueNodes = []
  for (const node of globalTree.nodes) {
    if (!nodeIds.has(node.id)) {
      nodeIds.add(node.id)
      uniqueNodes.push(node)
    } else {
      console.log(`🔄 Removing duplicate node: ${node.id}`)
    }
  }
  globalTree.nodes = uniqueNodes

  // Process user nodes - combine rather than duplicate
  if (userSkillTree.nodes && Array.isArray(userSkillTree.nodes)) {
    console.log(`📊 Processing ${userSkillTree.nodes.length} user nodes for global tree combination...`)
    
    for (const userNode of userSkillTree.nodes) {
      // Only process earned skills for new additions
      if (!userNode.earned) {
        console.log(`⏭️ Skipping unearned skill: ${userNode.id}`)
        continue
      }

      try {
        // Ensure complete prerequisite chain exists before adding this skill
        console.log(`🔍 Ensuring prerequisite chain for: ${userNode.id}`)
        ensurePrerequisiteChain(userNode.id, userSkillTree, globalTree)
        
        // Now find the node (should exist after prerequisite chain creation)
        let globalNode = globalTree.nodes.find((n: ISkillNode) => n.id === userNode.id)
        
        if (!globalNode) {
          // This shouldn't happen after ensurePrerequisiteChain, but safety check
          console.error(`❌ CRITICAL ERROR: Node ${userNode.id} still doesn't exist after prerequisite chain creation`)
          continue
        }

        // Update counters for existing node (the ensurePrerequisiteChain creates with count 1)
        if (globalNode.earnedByCount === 1 && globalNode.totalUserCount === 1) {
          // This was just created by ensurePrerequisiteChain, counts are already correct
          console.log(`✅ New skill added to global tree: ${userNode.id} (${userNode.name})`)
        } else {
          // This is an existing skill, increment counters
          console.log(`🔗 Combining skill in global tree: ${userNode.id} (user count: ${globalNode.totalUserCount + 1})`)
          globalNode.totalUserCount += 1
          globalNode.earnedByCount += 1
          
          // Enhance node metadata from this user's data
          if (userNode.description && userNode.description.length > (globalNode.description?.length || 0)) {
            // Use the more detailed description
            globalNode.description = userNode.description
          }
          
          // Merge prerequisites without duplicates
          if (userNode.prerequisites && userNode.prerequisites.length > 0) {
            const existingPrereqs = globalNode.prerequisites || []
            const newPrereqs = userNode.prerequisites.filter((p: string) => !existingPrereqs.includes(p))
            if (newPrereqs.length > 0) {
              globalNode.prerequisites = [...existingPrereqs, ...newPrereqs]
              console.log(`🔗 Added ${newPrereqs.length} new prerequisites to ${userNode.id}`)
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing skill ${userNode.id}:`, error)
        // Continue processing other skills even if one fails
        continue
      }
    }
  }

  // Process user connections - combine rather than duplicate
  if (userSkillTree.connections && Array.isArray(userSkillTree.connections)) {
    console.log(`📊 Processing ${userSkillTree.connections.length} user connections for global tree combination...`)
    
    for (const userConnection of userSkillTree.connections) {
      // Find existing connection or create new one
      let globalConnection = globalTree.connections.find(
        (c: ISkillConnection) => c.from === userConnection.from && c.to === userConnection.to
      )
      
      if (!globalConnection) {
        // Create new combined connection
        console.log(`➕ Adding new connection to global tree: ${userConnection.from} → ${userConnection.to}`)
        globalConnection = {
          from: userConnection.from,
          to: userConnection.to,
          count: 1
        }
        globalTree.connections.push(globalConnection)
      } else {
        // Combine with existing connection - increment usage count
        globalConnection.count += 1
        console.log(`🔗 Combining connection in global tree: ${userConnection.from} → ${userConnection.to} (count: ${globalConnection.count})`)
      }
    }
  }

  // Update global tree metadata
  globalTree.totalUsers += 1
  globalTree.lastUpdated = new Date()

  // Save the updated global tree
  await globalTree.save()
  console.log('✅ Global tree updated successfully')
}

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

    // Check if this is a new skill tree or significantly different
    const isNewSkillTree = !existingUser.skills?.skillTree
    let shouldUpdateGlobalTree = isNewSkillTree
    
    // For existing users, check if this is a significant update
    if (!isNewSkillTree && existingUser.skills?.skillTree && skills.skillTree) {
      try {
        const oldSkillTree = JSON.parse(existingUser.skills.skillTree)
        const newSkillCount = skills.skillTree.nodes?.length || 0
        const oldSkillCount = oldSkillTree.nodes?.length || 0
        
        // Update global tree if there are significantly more skills (20%+ increase)
        const skillIncrease = newSkillCount > oldSkillCount && 
                             (newSkillCount - oldSkillCount) / oldSkillCount >= 0.2
        
        if (skillIncrease) {
          console.log(`📈 Significant skill tree update detected: ${oldSkillCount} → ${newSkillCount} skills`)
          shouldUpdateGlobalTree = true
        }
      } catch (parseError) {
        console.log('🔄 Could not parse existing skill tree, treating as new')
        shouldUpdateGlobalTree = true
      }
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
    
    // Update global tree for new users or significant updates
    if (skills.skillTree && shouldUpdateGlobalTree) {
      try {
        await updateGlobalTree(skills.skillTree, userEmail)
        if (isNewSkillTree) {
          console.log('✅ Global tree updated with new user skills')
        } else {
          console.log('✅ Global tree updated with significantly expanded user skills')
        }
      } catch (globalTreeError) {
        console.error('❌ Error updating global tree:', globalTreeError)
        // Don't fail the entire request if global tree update fails
      }
    } else if (skills.skillTree) {
      console.log('⏭️ Skipping global tree update - no significant changes detected')
    }
    
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