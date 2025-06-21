import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/user'
import GlobalTree from '@/models/global-tree'
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

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Starting manual global tree rebuild...')

    // Connect to database
    await connectToDatabase()

    // Get all users with skill trees
    const users = await User.find({
      $or: [
        { 'skills.skillTree': { $ne: null } },
        { 'skills.earnedSkills': { $exists: true, $not: { $size: 0 } } }
      ]
    }).select('name email skills.earnedSkills skills.skillTree').lean()

    console.log(`📊 Found ${users.length} users with skill trees`)

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No users with skill trees found'
      })
    }

    // Clear existing global tree and create fresh one
    await GlobalTree.deleteMany({})
    console.log('🗑️ Cleared existing global tree')

    const newGlobalTree = new GlobalTree({
      nodes: [],
      connections: [],
      totalUsers: 0,
      lastUpdated: new Date()
    })

    let processedUsers = 0
    let totalSkillsProcessed = 0
    let errorsEncountered = 0

    // Process each user's skill tree
    for (const user of users) {
      try {
        console.log(`👤 Processing user: ${user.name} (${user.email})`)
        
        let userSkillTree = null
        
        // Parse user's skill tree
        if (user.skills?.skillTree) {
          try {
            userSkillTree = typeof user.skills.skillTree === 'string' 
              ? JSON.parse(user.skills.skillTree)
              : user.skills.skillTree
          } catch (parseError) {
            console.error(`❌ Error parsing skill tree for user ${user.name}:`, parseError)
            errorsEncountered++
            continue
          }
        }

        if (!userSkillTree || !userSkillTree.nodes) {
          console.log(`⏭️ Skipping user ${user.name} - no valid skill tree`)
          continue
        }

        // Process user's earned skills
        const earnedSkills = userSkillTree.nodes.filter((node: any) => node.earned)
        console.log(`📋 Processing ${earnedSkills.length} earned skills for ${user.name}`)

        for (const userNode of earnedSkills) {
          try {
            // Ensure complete prerequisite chain exists
            ensurePrerequisiteChain(userNode.id, userSkillTree, newGlobalTree)
            
            // Find the node (should exist after prerequisite chain creation)
            let globalNode = newGlobalTree.nodes.find((n: ISkillNode) => n.id === userNode.id)
            
            if (!globalNode) {
              console.error(`❌ Node ${userNode.id} still doesn't exist after prerequisite chain creation`)
              continue
            }

            // Update counters (check if this is a new addition or existing)
            const isNewNode = globalNode.earnedByCount === 1 && globalNode.totalUserCount === 1
            if (!isNewNode) {
              // This skill already exists from a previous user, increment counters
              globalNode.totalUserCount += 1
              globalNode.earnedByCount += 1
              
              // Enhance metadata
              if (userNode.description && userNode.description.length > (globalNode.description?.length || 0)) {
                globalNode.description = userNode.description
              }
            }

            totalSkillsProcessed++
          } catch (skillError) {
            console.error(`❌ Error processing skill ${userNode.id} for user ${user.name}:`, skillError)
            errorsEncountered++
          }
        }

        // Process connections
        if (userSkillTree.connections && Array.isArray(userSkillTree.connections)) {
          for (const userConnection of userSkillTree.connections) {
            let globalConnection = newGlobalTree.connections.find(
              (c: ISkillConnection) => c.from === userConnection.from && c.to === userConnection.to
            )
            
            if (!globalConnection) {
              globalConnection = {
                from: userConnection.from,
                to: userConnection.to,
                count: 1
              }
              newGlobalTree.connections.push(globalConnection)
            } else {
              globalConnection.count += 1
            }
          }
        }

        processedUsers++
        console.log(`✅ Processed user ${user.name} successfully`)

      } catch (userError) {
        console.error(`❌ Error processing user ${user.name}:`, userError)
        errorsEncountered++
      }
    }

    // Update global tree metadata
    newGlobalTree.totalUsers = processedUsers
    newGlobalTree.lastUpdated = new Date()

    // Save the rebuilt global tree
    await newGlobalTree.save()

    console.log('✅ Global tree rebuild completed')
    console.log(`📊 Final stats: ${newGlobalTree.nodes.length} nodes, ${newGlobalTree.connections.length} connections`)

    return NextResponse.json({
      success: true,
      message: 'Global tree rebuilt successfully',
      stats: {
        totalUsers: users.length,
        processedUsers,
        totalSkillsProcessed,
        errorsEncountered,
        finalNodes: newGlobalTree.nodes.length,
        finalConnections: newGlobalTree.connections.length
      }
    })

  } catch (error) {
    console.error('❌ Error rebuilding global tree:', error)
    return NextResponse.json({ 
      error: 'Failed to rebuild global tree',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 