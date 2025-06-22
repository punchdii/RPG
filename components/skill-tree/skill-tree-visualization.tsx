"use client"

import ReactFlow, { 
    Node, 
    Edge, 
    Controls, 
    Background, 
    NodeMouseHandler, 
    ConnectionLineType,
    MarkerType,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useState } from 'react';

import { skillTreeData } from "@/data/skill-tree-data"
import type { Skill, UserSkills } from "@/types/skills"
import { CustomSkillNode } from './custom-skill-node';

const nodeTypes = {
  custom: CustomSkillNode,
};

// Function to convert saved skill tree to the format we need
const convertSavedSkillTree = (userSkills: UserSkills) => {
  if (!userSkills.skillTree?.nodes) {
    return null;
  }

  return userSkills.skillTree.nodes.map(node => ({
    id: node.id,
    name: node.name,
    description: node.description || '',
    category: node.category,
    prerequisites: node.prerequisites || [],
    earned: node.earned,
    mastered: node.mastered === true // Only true if explicitly set to true
  }));
};

// Get skills data - use saved data if available, otherwise use hardcoded data
const getSkillsData = (userSkills: UserSkills) => {
  const savedSkills = convertSavedSkillTree(userSkills);
  if (savedSkills) {
    // Build children relationships for saved skills too
    const skillMap = new Map(savedSkills.map(skill => [skill.id, { ...skill, children: [] as string[] }]));
    
    savedSkills.forEach(skill => {
      if (skill.prerequisites) {
        skill.prerequisites.forEach(prereqId => {
          const prereqSkill = skillMap.get(prereqId);
          if (prereqSkill && !prereqSkill.children.includes(skill.id)) {
            prereqSkill.children.push(skill.id);
          }
        });
      }
    });
    
    return Array.from(skillMap.values());
  }

  // Fallback to hardcoded data - need to build children relationships
  const hardcodedSkills = [
    ...skillTreeData.software,
    ...skillTreeData.hardware,
    ...skillTreeData.categories
  ];
  
  // Build children relationships for hardcoded data
  const skillMap = new Map(hardcodedSkills.map(skill => [skill.id, { ...skill, children: [] as string[] }]));
  
  hardcodedSkills.forEach(skill => {
    if (skill.prerequisites) {
      skill.prerequisites.forEach(prereqId => {
        const prereqSkill = skillMap.get(prereqId);
        if (prereqSkill && !prereqSkill.children.includes(skill.id)) {
          prereqSkill.children.push(skill.id);
        }
      });
    }
  });
  
  console.log('🔧 Built children relationships:', Array.from(skillMap.values()).map(s => ({ 
    id: s.id, 
    children: s.children 
  })));
  
  return Array.from(skillMap.values());
};

const getSkillStatus = (skillId: string, userSkills: UserSkills) => {
    if (userSkills.earnedSkills.includes(skillId)) return "earned"
    if (userSkills.availableSkills.includes(skillId)) return "available"
    return "locked"
}

// Grid layout constants for better spacing
const COL_WIDTH = 275;
const ROW_HEIGHT =250;
const X_OFFSET = 100;
const Y_OFFSET = 150;

// Function to add controlled randomness to positions
const addRandomOffset = (x: number, y: number, seed: number | string) => {
    // For string seeds, convert to a numeric seed
    const numericSeed = typeof seed === 'string' 
        ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        : seed;

    // Generate deterministic but random-looking offsets based on seed
    const offsetX = Math.sin(numericSeed * 137.5) * 50; // Increased from default spread
    const offsetY = Math.cos(numericSeed * 294.7) * 40; // Increased from default spread

    // Add extra spread for web development path nodes
    const webDevNodes = ['typescript', 'reactjs', 'webdev'];
    const isWebDevNode = typeof seed === 'string' && webDevNodes.includes(seed);
    
    if (isWebDevNode) {
        // Add additional spread for web development nodes
        const stringLength = seed.toString().length;
        const extraOffsetX = Math.sin(stringLength * 179.3) * 75; // Extra horizontal spread
        const extraOffsetY = Math.cos(stringLength * 382.5) * 60; // Extra vertical spread
        return {
            x: x + offsetX + extraOffsetX,
            y: y + offsetY + extraOffsetY
        };
    }

    return {
        x: x + offsetX,
        y: y + offsetY
    };
};

const positionMap: { [key: string]: { x: number, y: number } } = {
    // Software Path - Web Development (adjusted positions and using node IDs as seeds)
    'typescript': addRandomOffset(X_OFFSET + 0 * COL_WIDTH, Y_OFFSET + 0 * ROW_HEIGHT, 'typescript'),
    'reactjs': addRandomOffset(X_OFFSET + 0 * COL_WIDTH, Y_OFFSET + 1 * ROW_HEIGHT, 'reactjs'),
    'webdev': addRandomOffset(X_OFFSET + 0 * COL_WIDTH, Y_OFFSET + 2 * ROW_HEIGHT, 'webdev'),
    
    // Software Path - Game Development
    '3d-animation': addRandomOffset(X_OFFSET + 1 * COL_WIDTH, Y_OFFSET + 0 * ROW_HEIGHT, 4),
    'unity-engine': addRandomOffset(X_OFFSET + 1 * COL_WIDTH, Y_OFFSET + 1 * ROW_HEIGHT, 5),
    'gamedev': addRandomOffset(X_OFFSET + 1 * COL_WIDTH, Y_OFFSET + 2 * ROW_HEIGHT, 6),
    
    // Software Path - C# Development
    'csharp-oop': addRandomOffset(X_OFFSET + 2 * COL_WIDTH, Y_OFFSET + 0 * ROW_HEIGHT, 7),
    'csharp': addRandomOffset(X_OFFSET + 2 * COL_WIDTH, Y_OFFSET + 1 * ROW_HEIGHT, 8),
    
    // Hardware Path
    'follow-schematic': addRandomOffset(X_OFFSET + 3 * COL_WIDTH, Y_OFFSET + 0 * ROW_HEIGHT, 9),
    'kicad': addRandomOffset(X_OFFSET + 3 * COL_WIDTH, Y_OFFSET + 1 * ROW_HEIGHT, 10),
    'pcb-design': addRandomOffset(X_OFFSET + 3 * COL_WIDTH, Y_OFFSET + 2 * ROW_HEIGHT, 11),
    
    // Category Nodes
    'software': addRandomOffset(X_OFFSET + 1 * COL_WIDTH, Y_OFFSET + 4 * ROW_HEIGHT, 12),
    'hardware': addRandomOffset(X_OFFSET + 3 * COL_WIDTH, Y_OFFSET + 4 * ROW_HEIGHT, 13),
};

type SkillNodeData = {
    skill: Skill;
    status?: 'earned' | 'available' | 'locked';
};

type CategoryNodeData = {
    label: string;
};

interface SkillNode extends Node<SkillNodeData> {
    type: 'custom';
}

interface CategoryNode extends Node<CategoryNodeData> {
    type?: undefined;
}

type TreeNode = SkillNode | CategoryNode;

// Dynamic positioning for saved skill trees - hierarchical layout
const generateDynamicPositions = (skills: any[]) => {
    const positions: { [key: string]: { x: number, y: number } } = {};
    const skillMap = new Map(skills.map(skill => [skill.id, skill]));
    
    // Define main category positions (these are the anchor points)
    const categoryPositions = {
        'software': { x: X_OFFSET + 300, y: Y_OFFSET + 800 },
        'hardware': { x: X_OFFSET + 800, y: Y_OFFSET + 800 },
        'soft-skills': { x: X_OFFSET + 1300, y: Y_OFFSET + 800 }
    };
    
    // First, position the main category nodes
    positions['software'] = categoryPositions['software'];
    positions['hardware'] = categoryPositions['hardware'];
    positions['soft-skills'] = categoryPositions['soft-skills'];
    
    console.log('🏗️ Positioned main categories:', categoryPositions);
    
    // Function to determine which main category a skill belongs to
    const getMainCategory = (skill: any): string => {
        if (skill.id === 'software' || skill.id === 'hardware' || skill.id === 'soft-skills') {
            return skill.id;
        }
        
        // For other skills, determine by category or prerequisites
        if (skill.category === 'software' || skill.category === 'Software') return 'software';
        if (skill.category === 'hardware' || skill.category === 'Hardware') return 'hardware';
        if (skill.category === 'soft' || skill.category === 'Soft' || skill.category === 'soft-skills') return 'soft-skills';
        
        // If category is unclear, trace prerequisites to find main category
        const traceToMainCategory = (skillId: string, visited = new Set<string>()): string => {
            if (visited.has(skillId)) return 'software'; // Default fallback
            visited.add(skillId);
            
            const currentSkill = skillMap.get(skillId);
            if (!currentSkill) return 'software';
            
            if (['software', 'hardware', 'soft-skills'].includes(currentSkill.id)) {
                return currentSkill.id;
            }
            
            if (currentSkill.prerequisites && currentSkill.prerequisites.length > 0) {
                for (const prereqId of currentSkill.prerequisites) {
                    const result = traceToMainCategory(prereqId, new Set(visited));
                    if (result) return result;
                }
            }
            
            return 'software'; // Default fallback
        };
        
        return traceToMainCategory(skill.id);
    };
    
    // Group skills by their main category
    const skillsByCategory: { [category: string]: any[] } = {
        'software': [],
        'hardware': [],
        'soft-skills': []
    };
    
    skills.forEach(skill => {
        if (!['software', 'hardware', 'soft-skills'].includes(skill.id)) {
            const mainCategory = getMainCategory(skill);
            skillsByCategory[mainCategory].push(skill);
        }
    });
    
    console.log('📊 Skills grouped by category:', Object.keys(skillsByCategory).map(cat => ({
        category: cat,
        count: skillsByCategory[cat].length
    })));
    
    // Position skills in each category with curved layout
    Object.keys(skillsByCategory).forEach(category => {
        const categorySkills = skillsByCategory[category];
        const mainCategoryPos = categoryPositions[category as keyof typeof categoryPositions];
        
        if (categorySkills.length === 0) return;
        
        console.log(`🎯 Positioning ${categorySkills.length} skills for ${category}`);
        
        // Calculate spread width for this category
        const totalWidth = Math.max(600, categorySkills.length * 120); // Minimum 600px spread
        const startX = mainCategoryPos.x - totalWidth / 2;
        
        // Sort skills by some criteria (name for consistency)
        categorySkills.sort((a, b) => a.name.localeCompare(b.name));
        
        categorySkills.forEach((skill, index) => {
            // Calculate horizontal position
            const xProgress = categorySkills.length > 1 ? index / (categorySkills.length - 1) : 0.5;
            const skillX = startX + (xProgress * totalWidth);
            
            // Calculate horizontal distance from main category center
            const horizontalDistance = Math.abs(skillX - mainCategoryPos.x);
            
            // Create curved effect: the further horizontally, the higher vertically (lower Y value)
            // Use a quadratic curve for smooth effect
            const maxCurveHeight = 400; // Maximum vertical displacement
            const normalizedDistance = Math.min(horizontalDistance / (totalWidth / 2), 1);
            const curveOffset = Math.pow(normalizedDistance, 1.5) * maxCurveHeight;
            
            // Position the skill
            const skillY = mainCategoryPos.y - curveOffset - 100; // Base offset from category
            
            // Add some randomization to avoid perfectly straight lines
            const skillSeed = skill.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const randomOffsetX = (Math.sin(skillSeed * 1.337) * 30) - 15; // ±15px horizontal
            const randomOffsetY = (Math.cos(skillSeed * 2.718) * 20) - 10; // ±10px vertical
            
            positions[skill.id] = {
                x: skillX + randomOffsetX,
                y: skillY + randomOffsetY
            };
            
            console.log(`📍 ${skill.id}: x=${Math.round(skillX)}, y=${Math.round(skillY)}, distance=${Math.round(horizontalDistance)}, curve=${Math.round(curveOffset)}`);
        });
    });
    
    return positions;
};

// Create nodes for all skills
const createNodes = (userSkills: UserSkills) => {
    const allSkills = getSkillsData(userSkills);
    
    // Deduplicate skills to prevent React key conflicts
    const skillIds = new Set<string>();
    const uniqueSkills: any[] = [];
    let duplicateSkillCount = 0;
    
    for (const skill of allSkills) {
        if (!skillIds.has(skill.id)) {
            skillIds.add(skill.id);
            uniqueSkills.push(skill);
        } else {
            console.log(`🔄 Removing duplicate skill in createNodes: ${skill.id}`);
            duplicateSkillCount++;
        }
    }
    
    if (duplicateSkillCount > 0) {
        console.log(`✅ Node deduplication: removed ${duplicateSkillCount} duplicates, ${uniqueSkills.length} unique skills remain`);
    }
    
    // Use dynamic positions for saved skill trees, static for hardcoded data
    const positions = userSkills.skillTree?.nodes ? 
        generateDynamicPositions(uniqueSkills) : 
        positionMap;
    
    const skillNodes = uniqueSkills
        .filter((skill: any) => skill.category !== 'Category')
        .map((skill: any): SkillNode | null => {
            const position = positions[skill.id];
            if (!position) {
                // Fallback position if not found
                console.warn(`No position found for skill: ${skill.id}`);
                return {
                    id: skill.id,
                    position: { x: Math.random() * 800, y: Math.random() * 600 },
                    data: { skill },
                    type: 'custom',
                    targetPosition: Position.Top,
                    sourcePosition: Position.Bottom,
                    zIndex: 10,
                };
            }

            return {
                id: skill.id,
                position,
                data: { skill },
                type: 'custom',
                targetPosition: Position.Top,
                sourcePosition: Position.Bottom,
                zIndex: 10,
            };
        });

    // For saved skill trees, category nodes are included in the skill data
    // For hardcoded data, we still need to create separate category nodes
    const categoryNodes = userSkills.skillTree?.nodes ? [] : 
        skillTreeData.categories.map((category: any): CategoryNode => ({
            id: category.id,
            position: positionMap[category.id] || { x: 0, y: 0 },
            data: { label: category.name || category.id },
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
            style: {
                width: 150,
                height: 60,
                fontSize: '24px',
                fontWeight: 'bold',
                background: 'transparent',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: category.id === 'software' ? '2px solid #ef4444' : 
                       category.id === 'hardware' ? '2px solid #a855f7' : '2px solid #10b981',
                borderRadius: '12px',
                padding: '10px',
            },
            zIndex: 5,
        }));

    return [...skillNodes, ...categoryNodes].filter((node): node is TreeNode => node !== null);
};

// Create edges for all connections
const createEdges = (userSkills: UserSkills): Edge[] => {
    const baseStyle = {
        stroke: '#ffffff',
        strokeWidth: 1.2,
        opacity: 0.7,
    };

    // Use saved connections if available, but also add missing prerequisite connections
    let connections: Array<{ from: string; to: string }> = [];
    
    if (userSkills.skillTree?.connections) {
        connections = [...userSkills.skillTree.connections];
        console.log('🔗 Using saved connections:', connections);
        
        // Also add connections from prerequisites that might be missing
        const allSkills = getSkillsData(userSkills);
        const prerequisiteConnections = allSkills.flatMap((skill: any) => {
            if (!skill.prerequisites?.length) return [];
            return skill.prerequisites.map((prereqId: any) => ({
                from: prereqId,
                to: skill.id
            }));
        });
        
        // Add missing connections
        prerequisiteConnections.forEach(prereqConn => {
            const exists = connections.some(conn => 
                conn.from === prereqConn.from && conn.to === prereqConn.to
            );
            if (!exists) {
                connections.push(prereqConn);
                console.log('➕ Added missing connection:', prereqConn);
            }
        });
    } else {
        // Fallback: build from prerequisites
        const allSkills = getSkillsData(userSkills);
        connections = allSkills.flatMap((skill: any) => {
            if (!skill.prerequisites?.length) return [];
            return skill.prerequisites.map((prereqId: any) => ({
                from: prereqId,
                to: skill.id
            }));
        });
        console.log('🔗 Built connections from prerequisites:', connections);
    }

    // Deduplicate connections to prevent duplicate edge IDs
    const connectionKeys = new Set<string>();
    const uniqueConnections: Array<{ from: string; to: string }> = [];
    let duplicateConnectionCount = 0;
    
    for (const connection of connections) {
        const connectionKey = `${connection.from}->${connection.to}`;
        if (!connectionKeys.has(connectionKey)) {
            connectionKeys.add(connectionKey);
            uniqueConnections.push(connection);
        } else {
            console.log(`🔄 Removing duplicate connection in createEdges: ${connectionKey}`);
            duplicateConnectionCount++;
        }
    }
    
    if (duplicateConnectionCount > 0) {
        console.log(`✅ Edge deduplication: removed ${duplicateConnectionCount} duplicates, ${uniqueConnections.length} unique connections remain`);
    }

    // Create edges from unique connections
    const skillEdges = uniqueConnections.map(connection => ({
        id: `e-${connection.from}-${connection.to}`,
        source: connection.from,
        target: connection.to,
        type: 'smoothstep',
        style: baseStyle,
        animated: false,
        sourceHandle: null, // Let ReactFlow auto-select the bottom handle
        targetHandle: null, // Let ReactFlow auto-select the top handle
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: '#ffffff',
        },
    }));

    return skillEdges;
};

interface SkillTreeVisualizationProps {
    userSkills: UserSkills
    onSkillClick: (skill: Skill) => void
    highlightedSkills?: string[] | null
}

const SkillTreeVisualization = ({ userSkills, onSkillClick, highlightedSkills }: SkillTreeVisualizationProps) => {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());

    // Function to get all children (descendants) of a node recursively
    const getAllChildren = (nodeId: string, allSkills: any[]): string[] => {
        const skillMap = new Map(allSkills.map(skill => [skill.id, skill]));
        const children: string[] = [];
        const visited = new Set<string>();
        
        // Build children relationships from prerequisites if not already set
        const childrenMap = new Map<string, string[]>();
        allSkills.forEach(skill => {
            if (skill.prerequisites) {
                skill.prerequisites.forEach((prereqId: string) => {
                    if (!childrenMap.has(prereqId)) {
                        childrenMap.set(prereqId, []);
                    }
                    childrenMap.get(prereqId)!.push(skill.id);
                });
            }
        });
        
        const findChildren = (skillId: string) => {
            if (visited.has(skillId)) return;
            visited.add(skillId);
            
            // Try to get children from the skill object first
            const skill = skillMap.get(skillId);
            let skillChildren: string[] = [];
            
            if (skill && skill.children) {
                skillChildren = skill.children;
            } else {
                // Fallback: use children built from prerequisites
                skillChildren = childrenMap.get(skillId) || [];
            }
            
            skillChildren.forEach((childId: string) => {
                if (!children.includes(childId)) {
                    children.push(childId);
                    findChildren(childId); // Recursively find grandchildren
                }
            });
        };
        
        findChildren(nodeId);
        return children;
    };

    // Handle node hover
    const handleNodeMouseEnter = (nodeId: string) => {
        console.log('🎯 Hovering over node:', nodeId);
        setHoveredNode(nodeId);
        const allSkills = getSkillsData(userSkills);
        
        // Debug: Log the skill data structure
        const hoveredSkill = allSkills.find(skill => skill.id === nodeId);
        console.log('📊 Hovered skill data:', hoveredSkill);
        console.log('📊 All skills with children:', allSkills.map(s => ({ id: s.id, children: (s as any).children })));
        
        const childrenIds = getAllChildren(nodeId, allSkills);
        console.log('👶 Found children for', nodeId, ':', childrenIds);
        
        const highlightSet = new Set([nodeId, ...childrenIds]);
        console.log('✨ Highlighting nodes:', Array.from(highlightSet));
        setHighlightedNodes(highlightSet);
    };

    const handleNodeMouseLeave = () => {
        console.log('🚪 Mouse left node');
        setHoveredNode(null);
        setHighlightedNodes(new Set());
    };

    // Initialize nodes with status and hover handlers
    const nodes = createNodes(userSkills).map(node => {
        if (node.type === 'custom') {
            const skillId = node.data.skill.id;
            const isUserSkillHighlighted = highlightedSkills?.includes(skillId) || false;
            const isHoverHighlighted = highlightedNodes.has(skillId);
            const isHovered = hoveredNode === skillId;
            
            // Determine highlighting state: user skill highlighting takes precedence over hover
            let isHighlighted = false;
            let isDimmed = false;
            
            if (highlightedSkills) {
                // User skill highlighting mode
                isHighlighted = isUserSkillHighlighted;
                isDimmed = !isUserSkillHighlighted;
            } else if (hoveredNode !== null) {
                // Hover highlighting mode (only when no user is selected)
                isHighlighted = isHoverHighlighted;
                isDimmed = !isHoverHighlighted;
            }
            
            return {
                ...node,
                data: {
                    ...node.data,
                    status: getSkillStatus(skillId, userSkills),
                    isHighlighted,
                    isHovered,
                    isDimmed,
                    onMouseEnter: () => handleNodeMouseEnter(skillId),
                    onMouseLeave: handleNodeMouseLeave,
                }
            };
        }
        return node;
    });

    // Create edges with highlighting for hover state and user skills
    const edges = createEdges(userSkills).map(edge => {
        let isHighlighted = false;
        
        if (highlightedSkills) {
            // User skill highlighting mode - highlight edges between user's skills
            isHighlighted = highlightedSkills.includes(edge.source) && highlightedSkills.includes(edge.target);
        } else {
            // Hover highlighting mode
            isHighlighted = highlightedNodes.has(edge.source) && highlightedNodes.has(edge.target);
        }
        
        if (isHighlighted) {
            console.log('🔗 Highlighting edge:', edge.source, '→', edge.target);
        }
        
        return {
            ...edge,
            style: {
                ...edge.style,
                stroke: isHighlighted ? '#fbbf24' : '#ffffff', // Yellow when highlighted
                strokeWidth: isHighlighted ? 3 : 1.2,
                opacity: isHighlighted ? 1 : (highlightedSkills || hoveredNode ? 0.3 : 0.7),
            },
            animated: isHighlighted,
        };
    });
    
    // Debug logs (can be removed in production)
    // console.log('🎯 Nodes created:', nodes.map(n => ({ id: n.id, type: n.type })));
    // console.log('🔗 Edges created:', edges.map(e => ({ from: e.source, to: e.target })));

    const onNodeClick: NodeMouseHandler = (_event, node) => {
        const typedNode = node as TreeNode;
        if (typedNode.type === 'custom') {
            onSkillClick(typedNode.data.skill);
        }
    };

    return (
        <div className="w-full h-[1200px] relative overflow-x-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/30 via-slate-950/30 to-slate-900/30 rounded-lg" />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                connectionLineType={ConnectionLineType.Bezier}
                defaultEdgeOptions={{
                    type: 'default',
                    style: { 
                        stroke: '#ffffff', 
                        strokeWidth: 0.8, 
                        opacity: 0.2,
                    },
                    data: {
                        pathOptions: {
                            curvature: 0.4,
                        },
                    },
                }}
                fitView
                minZoom={0.01}
                maxZoom={10}
                className="bg-transparent [&_.react-flow__attribution]:hidden"
                style={{ minWidth: '1200px' }}
            >
                <Background 
                    color="#334155" 
                    gap={20} 
                    size={1} 
                    className="opacity-4"
                />
                <Controls className="!bg-slate-800 !text-slate-200" />
            </ReactFlow>
        </div>
    );
};

export default SkillTreeVisualization; 