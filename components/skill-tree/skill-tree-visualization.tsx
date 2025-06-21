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
    earned: node.earned
  }));
};

// Get skills data - use saved data if available, otherwise use hardcoded data
const getSkillsData = (userSkills: UserSkills) => {
  const savedSkills = convertSavedSkillTree(userSkills);
  if (savedSkills) {
    return savedSkills;
  }

  // Fallback to hardcoded data
  return [
    ...skillTreeData.software,
    ...skillTreeData.hardware,
    ...skillTreeData.categories
  ];
};

const getSkillStatus = (skillId: string, userSkills: UserSkills) => {
    if (userSkills.earnedSkills.includes(skillId)) return "earned"
    if (userSkills.availableSkills.includes(skillId)) return "available"
    return "locked"
}

// Grid layout constants for better spacing
const COL_WIDTH = 280;
const ROW_HEIGHT = 180;
const X_OFFSET = 100;
const Y_OFFSET = 150;

// Function to add controlled randomness to positions
const addRandomOffset = (baseX: number, baseY: number, seed: number): { x: number, y: number } => {
    // Use seed to generate consistent but different offsets for each node
    const randomX = Math.sin(seed) * 20; // Max 20px horizontal offset
    const randomY = Math.cos(seed * 2) * 15; // Max 15px vertical offset
    
    return {
        x: baseX + randomX,
        y: baseY + randomY
    };
};

const positionMap: { [key: string]: { x: number, y: number } } = {
    // Software Path - Web Development
    'typescript': addRandomOffset(X_OFFSET + 0 * COL_WIDTH, Y_OFFSET + 0 * ROW_HEIGHT, 1),
    'reactjs': addRandomOffset(X_OFFSET + 0 * COL_WIDTH, Y_OFFSET + 1 * ROW_HEIGHT, 2),
    'webdev': addRandomOffset(X_OFFSET + 0 * COL_WIDTH, Y_OFFSET + 2 * ROW_HEIGHT, 3),
    
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
    
    // Build dependency graph to determine levels
    const skillMap = new Map(skills.map(skill => [skill.id, skill]));
    const levels: { [key: string]: number } = {};
    const visited = new Set<string>();
    
    // Calculate the level of each skill (how many prerequisites deep)
    const calculateLevel = (skillId: string): number => {
        if (visited.has(skillId)) return levels[skillId] || 0;
        visited.add(skillId);
        
        const skill = skillMap.get(skillId);
        if (!skill || !skill.prerequisites || skill.prerequisites.length === 0) {
            levels[skillId] = 0; // Base level
            return 0;
        }
        
        // Find the maximum level among prerequisites and add 1
        const maxPrereqLevel = Math.max(
            ...skill.prerequisites.map((prereqId: string) => calculateLevel(prereqId))
        );
        levels[skillId] = maxPrereqLevel + 1;
        return levels[skillId];
    };
    
    // Calculate levels for all skills
    skills.forEach(skill => calculateLevel(skill.id));
    
    // Group skills by category and level
    const categories = ['software', 'hardware', 'soft-skills'];
    const categoryColumns: { [key: string]: number } = {
        'software': 0,
        'hardware': 1,
        'soft-skills': 2
    };
    
    // Group skills by level for positioning
    const skillsByLevel: { [level: number]: any[] } = {};
    const maxLevel = Math.max(...Object.values(levels));
    
    skills.forEach(skill => {
        const level = levels[skill.id];
        if (!skillsByLevel[level]) skillsByLevel[level] = [];
        skillsByLevel[level].push(skill);
    });
    
    // Position skills level by level (bottom to top)
    Object.keys(skillsByLevel).forEach(levelStr => {
        const level = parseInt(levelStr);
        const skillsAtLevel = skillsByLevel[level];
        
        // Group by category at this level
        const categorizedSkills: { [cat: string]: any[] } = {
            'software': [],
            'hardware': [],
            'soft-skills': []
        };
        
        skillsAtLevel.forEach(skill => {
            const category = skill.category === 'soft' ? 'soft-skills' : skill.category;
            if (categorizedSkills[category]) {
                categorizedSkills[category].push(skill);
            }
        });
        
        // Position skills within each category
        categories.forEach(category => {
            const categorySkills = categorizedSkills[category];
            const columnIndex = categoryColumns[category];
            
            if (categorySkills.length === 0) return;
            
            categorySkills.forEach((skill, skillIndex) => {
                // Calculate how many skills per row based on category skill count
                const skillsPerRow = categorySkills.length <= 2 ? categorySkills.length : 
                                   categorySkills.length <= 4 ? 2 : 3;
                
                const row = Math.floor(skillIndex / skillsPerRow);
                const col = skillIndex % skillsPerRow;
                
                // Calculate Y position (higher levels go up, so invert)
                const yPosition = Y_OFFSET + (maxLevel - level) * ROW_HEIGHT * 1.5;
                
                // Calculate X position with dynamic spacing based on skills per row
                const baseX = X_OFFSET + columnIndex * (COL_WIDTH * 3);
                
                // Center the skills in their column
                const totalRowWidth = (skillsPerRow - 1) * COL_WIDTH * 0.9;
                const startX = baseX - (totalRowWidth / 2);
                const offsetX = col * (COL_WIDTH * 0.9);
                
                const finalPosition = {
                    x: startX + offsetX,
                    y: yPosition + row * (ROW_HEIGHT * 0.6) // Increased vertical spacing between rows
                };
                
                // Add deterministic offset based on skill ID to prevent overlaps
                const skillSeed = skill.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                finalPosition.x += (skillSeed % 30) - 15; // -15 to +15 offset
                finalPosition.y += ((skillSeed * 2) % 20) - 10; // -10 to +10 offset
                
                positions[skill.id] = finalPosition;
            });
        });
    });
    
    return positions;
};

// Create nodes for all skills
const createNodes = (userSkills: UserSkills) => {
    const allSkills = getSkillsData(userSkills);
    
    // Use dynamic positions for saved skill trees, static for hardcoded data
    const positions = userSkills.skillTree?.nodes ? 
        generateDynamicPositions(allSkills) : 
        positionMap;
    
    const skillNodes = allSkills
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

    // Create edges from connections
    const skillEdges = connections.map(connection => ({
        id: `e-${connection.from}-${connection.to}`,
        source: connection.from,
        target: connection.to,
        type: 'smoothstep',
        style: baseStyle,
        animated: false,
        sourceHandle: 'bottom',
        targetHandle: 'top',
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
}

const SkillTreeVisualization = ({ userSkills, onSkillClick }: SkillTreeVisualizationProps) => {
    // Initialize nodes with status
    const nodes = createNodes(userSkills).map(node => {
        if (node.type === 'custom') {
            return {
                ...node,
                data: {
                    ...node.data,
                    status: getSkillStatus(node.data.skill.id, userSkills),
                }
            };
        }
        return node;
    });

    const edges = createEdges(userSkills);
    
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
        <div className="w-full h-[1200px] relative">
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
                className="bg-transparent [&_.react-flow__attribution]:hidden"
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