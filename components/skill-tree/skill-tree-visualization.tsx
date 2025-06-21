"use client"

import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

import { skillTreeData } from "@/data/skill-tree-data"
import type { Skill, UserSkills } from "@/types/skills"
import { CustomSkillNode } from './custom-skill-node';

const nodeTypes = {
  custom: CustomSkillNode,
};

const allSkills = [...skillTreeData.software, ...skillTreeData.hardware, ...skillTreeData.categories];

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

const positionMap: { [key: string]: { x: number, y: number } } = {
    // Software Path - Web Development
    'typescript': { x: X_OFFSET + 0 * COL_WIDTH, y: Y_OFFSET + 0 * ROW_HEIGHT },
    'reactjs': { x: X_OFFSET + 0 * COL_WIDTH, y: Y_OFFSET + 1 * ROW_HEIGHT },
    'webdev': { x: X_OFFSET + 0 * COL_WIDTH, y: Y_OFFSET + 2 * ROW_HEIGHT },
    
    // Software Path - Game Development
    '3d-animation': { x: X_OFFSET + 1 * COL_WIDTH, y: Y_OFFSET + 0 * ROW_HEIGHT },
    'unity-engine': { x: X_OFFSET + 1 * COL_WIDTH, y: Y_OFFSET + 1 * ROW_HEIGHT },
    'gamedev': { x: X_OFFSET + 1 * COL_WIDTH, y: Y_OFFSET + 2 * ROW_HEIGHT },
    
    // Software Path - C# Development
    'csharp-oop': { x: X_OFFSET + 2 * COL_WIDTH, y: Y_OFFSET + 0 * ROW_HEIGHT },
    'csharp': { x: X_OFFSET + 2 * COL_WIDTH, y: Y_OFFSET + 1 * ROW_HEIGHT },
    
    // Hardware Path
    'follow-schematic': { x: X_OFFSET + 3 * COL_WIDTH, y: Y_OFFSET + 0 * ROW_HEIGHT },
    'kicad': { x: X_OFFSET + 3 * COL_WIDTH, y: Y_OFFSET + 1 * ROW_HEIGHT },
    'pcb-design': { x: X_OFFSET + 3 * COL_WIDTH, y: Y_OFFSET + 2 * ROW_HEIGHT },
    
    // Category Nodes
    'software': { x: X_OFFSET + 1 * COL_WIDTH, y: Y_OFFSET + 3.5 * ROW_HEIGHT },
    'hardware': { x: X_OFFSET + 3 * COL_WIDTH, y: Y_OFFSET + 3.5 * ROW_HEIGHT },
};

const initialNodes = allSkills
    .filter(skill => positionMap[skill.id])
    .map((skill) => ({
        id: skill.id,
        position: positionMap[skill.id],
        data: { skill },
        type: skill.category === 'Category' ? 'default' : 'custom',
        style: skill.category === 'Category' ? {
            width: 120,
            height: 50,
            fontSize: '20px',
            fontWeight: 'bold',
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        } : {},
        zIndex: 10,
    }));

const edgeStyle = {
    stroke: '#ffffff',
    strokeWidth: 1,
};

// Create edges based on prerequisites
const initialEdges = allSkills.flatMap((skill) => {
    if (!skill.prerequisites) return [];
    return skill.prerequisites.map((prereqId) => ({
        id: `e-${prereqId}-${skill.id}`,
        source: prereqId,
        target: skill.id,
        style: edgeStyle,
        animated: false,
    }));
}).filter(edge => edge !== null);

interface SkillTreeVisualizationProps {
    userSkills: UserSkills
    onSkillClick: (skill: Skill) => void
}

const SkillTreeVisualization = ({ userSkills, onSkillClick }: SkillTreeVisualizationProps) => {
    const nodes = initialNodes.map(node => {
        if (node.type === 'custom') {
            return {
                ...node,
                data: {
                    ...node.data,
                    status: getSkillStatus(node.data.skill.id, userSkills),
                }
            }
        }
        return node;
    });

    const onNodeClick = (_event: React.MouseEvent, node: { data: { skill?: Skill }}) => {
        if (node.data.skill) {
            onSkillClick(node.data.skill);
        }
    }

    return (
        <div className="w-full h-[800px] bg-[#0f172a]">
            <h1 className="text-3xl font-bold text-white text-center py-6">Your Skill Tree</h1>
            <ReactFlow
                nodes={nodes}
                edges={initialEdges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
                className="bg-[#0f172a]"
            >
                <Background color="#334155" gap={20} size={1} />
                <Controls className="!bg-slate-800 !text-slate-200" />
            </ReactFlow>
        </div>
    );
};

export default SkillTreeVisualization; 