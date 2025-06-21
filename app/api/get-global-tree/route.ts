import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import GlobalTree from '@/models/global-tree'
import type { UserSkills } from '@/types/skills'
import type { ISkillNode, ISkillConnection } from '@/models/global-tree'

export async function GET(req: NextRequest) {
  try {
    console.log('🌍 Fetching global skill tree...')

    // Connect to database
    await connectToDatabase()

    // Find the global tree
    const globalTree = await GlobalTree.findOne()
    
    if (!globalTree || !globalTree.nodes || globalTree.nodes.length === 0) {
      return NextResponse.json({ 
        hasGlobalTree: false,
        message: 'No global tree found'
      })
    }

    console.log('✅ Global tree found with', globalTree.nodes.length, 'nodes')

    // Deduplicate nodes on read (safety measure)
    const nodeIds = new Set<string>()
    const uniqueNodes = globalTree.nodes.filter((node: ISkillNode) => {
      if (nodeIds.has(node.id)) {
        console.log(`⚠️ Filtering duplicate node on read: ${node.id}`)
        return false
      }
      nodeIds.add(node.id)
      return true
    })

    // Deduplicate connections on read (safety measure)
    const connectionKeys = new Set<string>()
    const uniqueConnections = globalTree.connections.filter((conn: ISkillConnection) => {
      const key = `${conn.from}->${conn.to}`
      if (connectionKeys.has(key)) {
        console.log(`⚠️ Filtering duplicate connection on read: ${key}`)
        return false
      }
      connectionKeys.add(key)
      return true
    })

    console.log('📊 Unique nodes after filtering:', uniqueNodes.length)
    console.log('📊 Unique connections after filtering:', uniqueConnections.length)

    // Convert global tree format to UserSkills format for compatibility with existing components
    const userSkillsFormat: UserSkills = {
      earnedSkills: [], // For global tree, we won't mark any as "earned" by default
      availableSkills: [], // We'll mark all as available for interaction
      skillPoints: 0, // Not applicable for global tree
      skillTree: {
        nodes: uniqueNodes.map((node: ISkillNode) => ({
          id: node.id,
          name: node.name,
          category: node.category,
          earned: false, // Global tree doesn't have individual earned status
          prerequisites: node.prerequisites || [],
          description: node.description + ` • ${node.totalUserCount} users • ${node.earnedByCount} earned (${Math.round((node.earnedByCount / node.totalUserCount) * 100)}% mastery rate)`,
          userCount: node.totalUserCount // Add user count for visual styling
        })),
        connections: uniqueConnections.map((conn: ISkillConnection) => ({
          from: conn.from,
          to: conn.to
        }))
      }
    }

    return NextResponse.json({
      hasGlobalTree: true,
      ...userSkillsFormat,
      globalMetadata: {
        totalUsers: globalTree.totalUsers,
        lastUpdated: globalTree.lastUpdated,
        totalNodes: uniqueNodes.length,
        totalConnections: uniqueConnections.length
      }
    })

  } catch (error) {
    console.error('❌ Error fetching global skill tree:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch global skill tree',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 