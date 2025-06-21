"use client"

import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Database } from 'lucide-react'

interface UserWithSkills {
  id: string
  name: string
  email: string
  earnedSkills: string[]
  skillTreeNodes: Array<{
    id: string
    name: string
    earned: boolean
  }>
  totalSkills: number
}

interface UserListSidebarProps {
  onUserHover: (userSkills: string[] | null) => void
  onGlobalTreeRebuilt?: () => Promise<void>
  className?: string
}

export function UserListSidebar({ onUserHover, onGlobalTreeRebuilt, className = "" }: UserListSidebarProps) {
  const [users, setUsers] = useState<UserWithSkills[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredUser, setHoveredUser] = useState<string | null>(null)
  const [rebuilding, setRebuilding] = useState(false)
  const [rebuildStatus, setRebuildStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchUsersWithSkills()
  }, [])

  const fetchUsersWithSkills = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/get-users-with-skills')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
        console.log('👥 Loaded users with skills:', data.users)
      } else {
        setError(data.error || 'Failed to load users')
      }
    } catch (err) {
      console.error('❌ Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleUserMouseEnter = (user: UserWithSkills) => {
    setHoveredUser(user.id)
    
    // Combine earned skills and earned nodes from skill tree
    const allUserSkills = [
      ...user.earnedSkills,
      ...user.skillTreeNodes.filter(node => node.earned).map(node => node.id)
    ]
    
    // Remove duplicates
    const uniqueSkills = [...new Set(allUserSkills)]
    
    console.log(`🎯 Hovering over user ${user.name}, highlighting skills:`, uniqueSkills)
    onUserHover(uniqueSkills)
  }

  const handleUserMouseLeave = () => {
    setHoveredUser(null)
    onUserHover(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleRebuildGlobalTree = async () => {
    try {
      setRebuilding(true)
      setRebuildStatus('Starting global tree rebuild...')
      
      const response = await fetch('/api/rebuild-global-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (data.success) {
        setRebuildStatus(`✅ Success! Processed ${data.stats.processedUsers}/${data.stats.totalUsers} users, ${data.stats.finalNodes} nodes, ${data.stats.finalConnections} connections`)
        // Refresh both the user list and the global tree after rebuild
        setTimeout(async () => {
          fetchUsersWithSkills()
          if (onGlobalTreeRebuilt) {
            await onGlobalTreeRebuilt()
            console.log('🔄 Global tree data refreshed after rebuild')
          }
          setRebuildStatus(null)
        }, 3000)
      } else {
        setRebuildStatus(`❌ Failed: ${data.message || data.error}`)
        setTimeout(() => setRebuildStatus(null), 5000)
      }
    } catch (err) {
      console.error('❌ Error rebuilding global tree:', err)
      setRebuildStatus('❌ Error rebuilding global tree')
      setTimeout(() => setRebuildStatus(null), 5000)
    } finally {
      setRebuilding(false)
    }
  }

  if (loading) {
    return (
      <div className={`w-80 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700 ${className}`}>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Users</h2>
          <div className="mb-4">
            <Button
              disabled
              className="w-full bg-slate-600 text-slate-400 text-sm"
              size="sm"
            >
              <Database className="w-4 h-4 mr-2" />
              Rebuild Global Tree
            </Button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50">
                  <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`w-80 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700 ${className}`}>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Users</h2>
          <div className="mb-4">
            <Button
              onClick={handleRebuildGlobalTree}
              disabled={rebuilding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
              size="sm"
            >
              {rebuilding ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Rebuilding...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Rebuild Global Tree
                </>
              )}
            </Button>
            
            {rebuildStatus && (
              <div className="mt-2 p-2 rounded text-xs bg-slate-800/50 text-slate-300 border border-slate-600">
                {rebuildStatus}
              </div>
            )}
          </div>
          <div className="text-red-400 text-sm">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-80 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Users ({users.length})
          </h2>
        </div>
        
        {/* Rebuild Global Tree Button */}
        <div className="mb-4">
          <Button
            onClick={handleRebuildGlobalTree}
            disabled={rebuilding}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
            size="sm"
          >
            {rebuilding ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Rebuilding...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Rebuild Global Tree
              </>
            )}
          </Button>
          
          {rebuildStatus && (
            <div className="mt-2 p-2 rounded text-xs bg-slate-800/50 text-slate-300 border border-slate-600">
              {rebuildStatus}
            </div>
          )}
        </div>
        
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {users.map(user => (
              <Card
                key={user.id}
                className={`cursor-pointer transition-all duration-200 border-slate-600 ${
                  hoveredUser === user.id
                    ? 'bg-slate-700/80 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/50 hover:bg-slate-700/60'
                }`}
                onMouseEnter={() => handleUserMouseEnter(user)}
                onMouseLeave={handleUserMouseLeave}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white truncate">
                          {user.name}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30"
                        >
                          {user.totalSkills}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-slate-400 truncate mt-1">
                        {user.email}
                      </p>
                      
                      {user.earnedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.earnedSkills.slice(0, 3).map(skill => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-300 border-green-500/30"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {user.earnedSkills.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0.5 bg-slate-600/50 text-slate-300 border-slate-500/30"
                            >
                              +{user.earnedSkills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
} 