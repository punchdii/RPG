import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import GlobalTree from '@/models/global-tree'
import type { ISkillNode, ISkillConnection } from '@/models/global-tree'

export async function POST(req: NextRequest) {
  try {
    console.log('🧹 Starting global tree cleanup...')

    // Connect to database
    await connectToDatabase()

    // Get the current global tree
    const globalTree = await GlobalTree.findOne()
    
    if (!globalTree) {
      return NextResponse.json({ 
        message: 'No global tree found to clean up',
        cleaned: false
      })
    }

    console.log('📊 Original nodes count:', globalTree.nodes.length)
    console.log('📊 Original connections count:', globalTree.connections.length)

    // Deduplicate nodes
    const nodeIds = new Set<string>()
    const uniqueNodes: ISkillNode[] = []
    let duplicateNodesCount = 0

    for (const node of globalTree.nodes) {
      if (!nodeIds.has(node.id)) {
        nodeIds.add(node.id)
        uniqueNodes.push({
          id: node.id,
          name: node.name,
          category: node.category,
          description: node.description || '',
          prerequisites: node.prerequisites || [],
          earnedByCount: node.earnedByCount || 0,
          totalUserCount: node.totalUserCount || 0
        })
      } else {
        console.log(`🗑️ Found duplicate node: ${node.id}`)
        duplicateNodesCount++
      }
    }

    // Deduplicate connections
    const connectionKeys = new Set<string>()
    const uniqueConnections: ISkillConnection[] = []
    let duplicateConnectionsCount = 0

    for (const connection of globalTree.connections) {
      const connectionKey = `${connection.from}->${connection.to}`
      if (!connectionKeys.has(connectionKey)) {
        connectionKeys.add(connectionKey)
        uniqueConnections.push({
          from: connection.from,
          to: connection.to,
          count: connection.count || 1
        })
      } else {
        console.log(`🗑️ Found duplicate connection: ${connectionKey}`)
        duplicateConnectionsCount++
      }
    }

    // Update the global tree with cleaned data
    globalTree.nodes = uniqueNodes
    globalTree.connections = uniqueConnections
    globalTree.lastUpdated = new Date()

    await globalTree.save()

    console.log('✅ Global tree cleanup completed')
    console.log('📊 Final nodes count:', uniqueNodes.length)
    console.log('📊 Final connections count:', uniqueConnections.length)

    return NextResponse.json({
      message: 'Global tree cleaned up successfully',
      cleaned: true,
      stats: {
        originalNodes: globalTree.nodes.length + duplicateNodesCount,
        finalNodes: uniqueNodes.length,
        removedNodes: duplicateNodesCount,
        originalConnections: globalTree.connections.length + duplicateConnectionsCount,
        finalConnections: uniqueConnections.length,
        removedConnections: duplicateConnectionsCount
      }
    })

  } catch (error) {
    console.error('❌ Error cleaning up global tree:', error)
    return NextResponse.json({ 
      error: 'Failed to clean up global tree',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 