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

// Combine all skills into a single array
const allSkills = [
  ...skillTreeData.software,
  ...skillTreeData.hardware,
  ...skillTreeData.categories
];

const getSkillStatus = (skillId: string, userSkills: UserSkills) => {
    if (userSkills.earnedSkills.includes(skillId)) return "earned"
    if (userSkills.availableSkills.includes(skillId)) return "available"
    return "locked"
}

// Grid layout constants for better spacing
const COL_WIDTH = 250;
const ROW_HEIGHT = 150;
const X_OFFSET = 50;
const Y_OFFSET = 100;

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

// Create nodes for all skills
const createNodes = () => {
    const skillNodes = allSkills
        .filter(skill => skill.category !== 'Category')
        .map((skill): SkillNode | null => {
            const position = positionMap[skill.id];
            if (!position) return null;

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

    const categoryNodes = skillTreeData.categories.map((category): CategoryNode => ({
        id: category.id,
        position: positionMap[category.id],
        data: { label: category.name },
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
            border: category.id === 'software' ? '2px solid #ef4444' : '2px solid #a855f7',
            borderRadius: '12px',
            padding: '10px',
        },
        zIndex: 5,
    }));

    return [...skillNodes, ...categoryNodes].filter((node): node is TreeNode => node !== null);
};

// Create edges for all connections
const createEdges = (): Edge[] => {
    const baseStyle = {
        stroke: '#ffffff',
        strokeWidth: 0.8,
        opacity: 0.8,
    };

    // Direct skill prerequisite connections (vertical lines)
    const skillEdges = allSkills.flatMap((skill) => {
        if (!skill.prerequisites?.length) return [];
        
        return skill.prerequisites.map((prereqId) => ({
            id: `e-${prereqId}-${skill.id}`,
            source: prereqId,
            target: skill.id,
            type: 'default',
            style: baseStyle,
            animated: false,
            sourceHandle: 'bottom',
            targetHandle: 'top',
        }));
    });

    // Function to create a curly bracket connection with custom offset
    const createCurlyConnection = (
        sourceId: string, 
        targetId: string,
        offsetMultiplier: number = 0,
        curvature: number = 0.5 // Control the curve intensity
    ): Edge => {
        const xOffset = 100 * offsetMultiplier; // Increased base offset for better spacing
        
        return {
            id: `e-${sourceId}-${targetId}-curve`,
            source: sourceId,
            target: targetId,
            type: 'default',
            sourceHandle: 'bottom',
            targetHandle: 'top',
            style: {
                ...baseStyle,
                strokeWidth: 0.8,
            },
            data: {
                pathOptions: {
                    offset: xOffset,
                    curvature: curvature,
                },
            },
        };
    };

    // Special handling for merged paths with curly brackets and custom offsets
    const mergedEdges: Edge[] = [
        // GameDev merged connections
        createCurlyConnection('unity-engine', 'gamedev', 0, 0.4), // Center connection with less curve
        createCurlyConnection('csharp', 'gamedev', 2.5, 0.7), // Larger offset with more curve
        
        // Software category merged connections
        createCurlyConnection('webdev', 'software', -2.5, 0.7), // Larger offset with more curve
        createCurlyConnection('gamedev', 'software', 2.5, 0.7), // Larger offset with more curve
        
        // PCB Design merged connection
        createCurlyConnection('kicad', 'pcb-design', 0, 0.4),
        
        // Hardware category connection
        createCurlyConnection('pcb-design', 'hardware', 0, 0.4),
    ];

    return [...skillEdges, ...mergedEdges];
};

interface SkillTreeVisualizationProps {
    userSkills: UserSkills
    onSkillClick: (skill: Skill) => void
}

const SkillTreeVisualization = ({ userSkills, onSkillClick }: SkillTreeVisualizationProps) => {
    // Initialize nodes with status
    const nodes = createNodes().map(node => {
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

    const edges = createEdges();

    const onNodeClick: NodeMouseHandler = (_event, node) => {
        const typedNode = node as TreeNode;
        if (typedNode.type === 'custom') {
            onSkillClick(typedNode.data.skill);
        }
    };

    return (
        <div className="w-full h-[800px] relative">
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