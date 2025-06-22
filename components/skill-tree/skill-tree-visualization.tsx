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
    ...skillTreeData.softSkills,
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

// Dynamic positioning for saved skill trees - hierarchical layout with parent-centered positioning
const generateDynamicPositions = (skills: any[]) => {
    const positions: { [key: string]: { x: number, y: number } } = {};
    
    // Build dependency graph to determine levels
    const skillMap = new Map(skills.map(skill => [skill.id, skill]));
    const levels: { [key: string]: number } = {};
    const visited = new Set<string>();
    
    // Calculate the initial level of each skill (how many prerequisites deep)
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
    
    // Calculate initial levels for all skills
    skills.forEach(skill => calculateLevel(skill.id));
    
    // LEVEL BALANCING ALGORITHM
    // Define maximum nodes per level for each category to create a more tree-like structure
    const MAX_NODES_PER_LEVEL = {
        'Software': 6,    // Increased from typical 3-4 to allow more nodes per level
        'Hardware': 4,    // Hardware typically has fewer nodes
        'soft': 4,        // Soft skills
        'Category': 2     // Category nodes are fewer
    };
    
    // ROBUST CATEGORIZATION WITH ERROR HANDLING
    // Group skills by category first with explicit validation
    const skillsByCategory: { [category: string]: any[] } = {
        'Software': [],
        'Hardware': [],
        'soft': [],
        'Category': []
    };
    
    console.log('🚀 Starting skill categorization with robust error handling...');
    
    skills.forEach((skill, index) => {
        console.log(`\n🔍 [${index}] Processing skill:`, {
            id: skill.id,
            name: skill.name,
            category: skill.category,
            type: typeof skill.category
        });
        
        // EXPLICIT CATEGORY VALIDATION AND ASSIGNMENT
        let assignedCategory = 'UNKNOWN';
        
        // Handle Category nodes (main category nodes like 'software', 'hardware', 'soft-skills')
        if (skill.category === 'Category') {
            assignedCategory = 'Category';
            console.log(`  ✅ CATEGORY NODE: "${skill.id}" → Category array`);
            skillsByCategory['Category'].push(skill);
            return;
        }
        
        // Handle Software skills - EXPLICIT string matching
        if (skill.category === 'Software' || skill.category === 'software') {
            assignedCategory = 'Software';
            console.log(`  ✅ SOFTWARE SKILL: "${skill.id}" → Software array`);
            skillsByCategory['Software'].push(skill);
            return;
        }
        
        // Handle Hardware skills - EXPLICIT string matching
        if (skill.category === 'Hardware' || skill.category === 'hardware') {
            assignedCategory = 'Hardware';
            console.log(`  ✅ HARDWARE SKILL: "${skill.id}" → Hardware array`);
            skillsByCategory['Hardware'].push(skill);
            return;
        }
        
        // Handle Soft skills - EXPLICIT string matching
        if (skill.category === 'soft' || skill.category === 'Soft' || skill.category === 'soft-skills') {
            assignedCategory = 'soft';
            console.log(`  ✅ SOFT SKILL: "${skill.id}" → Soft Skills array`);
            skillsByCategory['soft'].push(skill);
            return;
        }
        
        // ERROR HANDLING: Unknown category
        console.error(`  ❌ UNKNOWN CATEGORY: "${skill.category}" for skill "${skill.id}"`);
        console.error(`  🔧 Defaulting to Software category`);
        assignedCategory = 'Software';
        skillsByCategory['Software'].push(skill);
    });
    
    // VALIDATION: Check categorization results
    console.log('\n📊 CATEGORIZATION RESULTS:');
    Object.keys(skillsByCategory).forEach(cat => {
        const skills = skillsByCategory[cat];
        console.log(`  ${cat}: ${skills.length} skills`);
        if (skills.length > 0) {
            console.log(`    └─ [${skills.map(s => s.id).join(', ')}]`);
        }
    });
    
    // ERROR CHECKING: Ensure we have the expected categories
    const expectedCounts = {
        'Software': 16, // Expected software skills
        'Hardware': 9,  // Expected hardware skills  
        'soft': 8,      // Expected soft skills
        'Category': 3   // Expected category nodes
    };
    
    console.log('\n🔍 VALIDATION CHECKS:');
    Object.keys(expectedCounts).forEach(cat => {
        const actual = skillsByCategory[cat].length;
        const expected = expectedCounts[cat as keyof typeof expectedCounts];
        if (actual === expected) {
            console.log(`  ✅ ${cat}: ${actual}/${expected} skills (CORRECT)`);
        } else {
            console.warn(`  ⚠️ ${cat}: ${actual}/${expected} skills (MISMATCH)`);
        }
    });
    
    // FORCE CORRECT CATEGORIZATION if something went wrong
    if (skillsByCategory['Software'].length === 0 || skillsByCategory['Hardware'].length === 0) {
        console.error('🚨 CATEGORIZATION FAILED! Attempting manual fix...');
        
        // Clear arrays
        skillsByCategory['Software'] = [];
        skillsByCategory['Hardware'] = [];
        skillsByCategory['soft'] = [];
        skillsByCategory['Category'] = [];
        
        // Manual categorization based on skill IDs
        skills.forEach(skill => {
            const softwareIds = ['typescript', 'javascript', 'html-css', 'reactjs', 'nextjs', 'nodejs', 'webdev', 'fullstack-dev', '3d-animation', 'unity-engine', 'gamedev', 'csharp-oop', 'csharp', 'python', 'data-analysis', 'machine-learning'];
            const hardwareIds = ['electronics-basics', 'follow-schematic', 'kicad', 'altium', 'pcb-design', 'soldering', 'pcb-assembly', 'embedded-programming', 'iot-development'];
            const softSkillIds = ['communication', 'teamwork', 'leadership', 'problem-solving', 'project-management', 'time-management', 'adaptability', 'mentoring'];
            const categoryIds = ['software', 'hardware', 'soft-skills'];
            
            if (categoryIds.includes(skill.id)) {
                skillsByCategory['Category'].push(skill);
                console.log(`  🔧 MANUAL FIX: "${skill.id}" → Category`);
            } else if (softwareIds.includes(skill.id)) {
                skillsByCategory['Software'].push(skill);
                console.log(`  🔧 MANUAL FIX: "${skill.id}" → Software`);
            } else if (hardwareIds.includes(skill.id)) {
                skillsByCategory['Hardware'].push(skill);
                console.log(`  🔧 MANUAL FIX: "${skill.id}" → Hardware`);
            } else if (softSkillIds.includes(skill.id)) {
                skillsByCategory['soft'].push(skill);
                console.log(`  🔧 MANUAL FIX: "${skill.id}" → Soft Skills`);
            } else {
                console.error(`  ❌ UNKNOWN SKILL ID: "${skill.id}"`);
            }
        });
        
        console.log('\n📊 MANUAL FIX RESULTS:');
        Object.keys(skillsByCategory).forEach(cat => {
            const skills = skillsByCategory[cat];
            console.log(`  ${cat}: ${skills.length} skills`);
            if (skills.length > 0) {
                console.log(`    └─ [${skills.map(s => s.id).join(', ')}]`);
            }
        });
    }
    
    // LEVEL BALANCING ALGORITHM (after successful categorization)
    console.log('\n⚖️ Starting level balancing...');
    
    Object.keys(skillsByCategory).forEach(category => {
        if (category === 'Category') {
            console.log(`  ⏭️ Skipping level balancing for Category nodes`);
            return; // Skip category nodes for rebalancing
        }
        
        const categorySkills = skillsByCategory[category];
        if (categorySkills.length === 0) {
            console.log(`  ⏭️ Skipping empty category: ${category}`);
            return;
        }
        
        const maxNodesPerLevel = MAX_NODES_PER_LEVEL[category as keyof typeof MAX_NODES_PER_LEVEL] || 4;
        console.log(`  🎯 Balancing ${category} (max ${maxNodesPerLevel} per level, ${categorySkills.length} total skills)`);
        
        // Group by current levels
        const skillsByLevel: { [level: number]: any[] } = {};
        categorySkills.forEach(skill => {
            const level = levels[skill.id];
            if (!skillsByLevel[level]) skillsByLevel[level] = [];
            skillsByLevel[level].push(skill);
        });
        
        // Redistribute nodes that exceed the maximum per level
        const levelKeys = Object.keys(skillsByLevel).map(Number).sort((a, b) => a - b);
        
        levelKeys.forEach(currentLevel => {
            const nodesAtLevel = skillsByLevel[currentLevel];
            
            if (nodesAtLevel.length > maxNodesPerLevel) {
                console.log(`    ⚖️ Rebalancing ${category} level ${currentLevel}: ${nodesAtLevel.length} nodes > ${maxNodesPerLevel} max`);
                
                // Keep the first maxNodesPerLevel nodes at current level
                const nodesToKeep = nodesAtLevel.slice(0, maxNodesPerLevel);
                const nodesToMove = nodesAtLevel.slice(maxNodesPerLevel);
                
                // Move excess nodes to the next level
                const nextLevel = currentLevel + 1;
                if (!skillsByLevel[nextLevel]) skillsByLevel[nextLevel] = [];
                
                nodesToMove.forEach(skill => {
                    // Update the skill's level
                    levels[skill.id] = nextLevel;
                    skillsByLevel[nextLevel].push(skill);
                    console.log(`      📍 Moved ${skill.id} from level ${currentLevel} to ${nextLevel}`);
                });
                
                // Update the current level array
                skillsByLevel[currentLevel] = nodesToKeep;
            } else {
                console.log(`    ✅ ${category} level ${currentLevel}: ${nodesAtLevel.length} nodes (within limit)`);
            }
        });
    });
    
    // FINAL VALIDATION after level balancing
    console.log('\n✅ FINAL CATEGORIZATION VALIDATION:');
    Object.keys(skillsByCategory).forEach(cat => {
        const skills = skillsByCategory[cat];
        console.log(`  ${cat}: ${skills.length} skills`);
        if (skills.length > 0) {
            console.log(`    └─ [${skills.map(s => s.id).join(', ')}]`);
        }
    });
    
    // ERROR CHECK: Ensure no category is empty (except possibly Category)
    if (skillsByCategory['Software'].length === 0) {
        console.error('🚨 CRITICAL ERROR: Software category is empty!');
    }
    if (skillsByCategory['Hardware'].length === 0) {
        console.error('🚨 CRITICAL ERROR: Hardware category is empty!');
    }
    if (skillsByCategory['soft'].length === 0) {
        console.error('🚨 CRITICAL ERROR: Soft skills category is empty!');
    }
    
    // PARENT-CENTERED POSITIONING ALGORITHM WITH DYNAMIC WIDTH CALCULATION
    // ORDER: Software → Hardware → Soft Skills (left to right)
    
    // Constants for layout
    const NODE_WIDTH = 240;  // Width of each skill node
    const NODE_SPACING = 50; // Spacing between nodes within same category
    const TREE_SPACING = 300; // INCREASED spacing between different category trees to prevent overlap
    const VIEWPORT_PADDING = 100; // Padding from viewport edges
    
    // Calculate max width needed for each category by finding the widest level
    const calculateTreeWidth = (categorySkills: any[]) => {
        if (categorySkills.length === 0) return NODE_WIDTH; // Minimum width
        
    const skillsByLevel: { [level: number]: any[] } = {};
        
        // Group category skills by level
        categorySkills.forEach(skill => {
            const level = levels[skill.id];
            if (!skillsByLevel[level]) skillsByLevel[level] = [];
            skillsByLevel[level].push(skill);
        });
        
        // Find the level with the most nodes (widest level)
        let maxWidth = 0;
        Object.values(skillsByLevel).forEach(levelSkills => {
            const levelWidth = (levelSkills.length * NODE_WIDTH) + ((levelSkills.length - 1) * NODE_SPACING);
            maxWidth = Math.max(maxWidth, levelWidth);
        });
        
        return Math.max(maxWidth, NODE_WIDTH); // Minimum width of one node
    };
    
    // Calculate widths for each category tree IN ORDER
    const softwareWidth = calculateTreeWidth(skillsByCategory['Software']);
    const hardwareWidth = calculateTreeWidth(skillsByCategory['Hardware']);
    const softSkillsWidth = calculateTreeWidth(skillsByCategory['soft']);
    
    const treeWidths = {
        'Software': softwareWidth,
        'Hardware': hardwareWidth,
        'soft': softSkillsWidth
    };
    
    console.log('🌳 Tree widths calculated IN ORDER:', treeWidths);
    console.log('🔍 Software skills count:', skillsByCategory['Software'].length);
    console.log('🔍 Hardware skills count:', skillsByCategory['Hardware'].length);
    console.log('🔍 Soft skills count:', skillsByCategory['soft'].length);
    
    // Calculate positions step by step to avoid overlap
    // Start from left edge with padding
    let currentX = VIEWPORT_PADDING;
    
    // SOFTWARE TREE (First - leftmost)
    const softwareCenterX = currentX + (softwareWidth / 2);
    currentX += softwareWidth + TREE_SPACING; // Move to next tree position
    
    // HARDWARE TREE (Second - middle)
    const hardwareCenterX = currentX + (hardwareWidth / 2);
    currentX += hardwareWidth + TREE_SPACING; // Move to next tree position
    
    // SOFT SKILLS TREE (Third - rightmost)
    const softSkillsCenterX = currentX + (softSkillsWidth / 2);
    currentX += softSkillsWidth + VIEWPORT_PADDING; // Final position
    
    // Total viewport width needed
    const totalViewportWidth = currentX;
    
    // Calculate dynamic positions for main category nodes IN ORDER
    const MAIN_CATEGORY_POSITIONS = {
        'Software': { 
            x: softwareCenterX, 
            y: 800 
        },
        'Hardware': { 
            x: hardwareCenterX, 
            y: 800 
        },
        'soft': { 
            x: softSkillsCenterX, 
            y: 800 
        }
    };
    
    console.log('📍 ORDERED main category positions:');
    console.log('  Software (1st):', MAIN_CATEGORY_POSITIONS['Software']);
    console.log('  Hardware (2nd):', MAIN_CATEGORY_POSITIONS['Hardware']);
    console.log('  Soft Skills (3rd):', MAIN_CATEGORY_POSITIONS['soft']);
    console.log('🌐 Total viewport width needed:', totalViewportWidth);
    
    // Verify no overlap
    const softwareRange = [VIEWPORT_PADDING, VIEWPORT_PADDING + softwareWidth];
    const hardwareRange = [VIEWPORT_PADDING + softwareWidth + TREE_SPACING, VIEWPORT_PADDING + softwareWidth + TREE_SPACING + hardwareWidth];
    const softSkillsRange = [VIEWPORT_PADDING + softwareWidth + TREE_SPACING + hardwareWidth + TREE_SPACING, totalViewportWidth - VIEWPORT_PADDING];
    
    console.log('📏 Tree ranges (to verify no overlap):');
    console.log('  Software range:', softwareRange);
    console.log('  Hardware range:', hardwareRange);
    console.log('  Soft Skills range:', softSkillsRange);
    
    // Position category nodes first (if they exist)
    const categoryNodes = skillsByCategory['Category'] || [];
    categoryNodes.forEach(categoryNode => {
        if (categoryNode.id === 'software') {
            positions[categoryNode.id] = MAIN_CATEGORY_POSITIONS['Software'];
            console.log('✅ Positioned SOFTWARE category node at:', MAIN_CATEGORY_POSITIONS['Software']);
        } else if (categoryNode.id === 'hardware') {
            positions[categoryNode.id] = MAIN_CATEGORY_POSITIONS['Hardware'];
            console.log('✅ Positioned HARDWARE category node at:', MAIN_CATEGORY_POSITIONS['Hardware']);
        } else if (categoryNode.id === 'soft-skills') {
            positions[categoryNode.id] = MAIN_CATEGORY_POSITIONS['soft'];
            console.log('✅ Positioned SOFT SKILLS category node at:', MAIN_CATEGORY_POSITIONS['soft']);
        }
    });
    
    // Group all skills by their final levels for positioning
    const finalSkillsByLevel: { [level: number]: any[] } = {};
    const maxLevel = Math.max(...Object.values(levels));
    
    skills.forEach(skill => {
        if (skill.category !== 'Category') { // Skip category nodes
        const level = levels[skill.id];
            if (!finalSkillsByLevel[level]) finalSkillsByLevel[level] = [];
            finalSkillsByLevel[level].push(skill);
        }
    });
    
    console.log('🎯 Final level distribution:', Object.keys(finalSkillsByLevel).map(level => 
        `Level ${level}: ${finalSkillsByLevel[parseInt(level)].length} nodes`
    ));
    
    // Position nodes level by level, centering each category's nodes under their main category
    for (let level = 0; level <= maxLevel; level++) {
        const skillsAtLevel = finalSkillsByLevel[level] || [];
        
        if (skillsAtLevel.length === 0) continue;
        
        // Group by category at this level
        const categorizedSkills: { [cat: string]: any[] } = {
            'Software': [],
            'Hardware': [],
            'soft': []
        };
        
        skillsAtLevel.forEach(skill => {
            // Debug: Log each skill's category during positioning
            console.log(`🎯 Positioning skill "${skill.id}" with category "${skill.category}"`);
            
            // SKIP CATEGORY NODES during positioning - they have their own positioning logic
            if (skill.category === 'Category') {
                console.log(`  ⏭️ Skipping category node during positioning: "${skill.id}"`);
                return;
            }
            
            const category = skill.category === 'Software' ? 'Software' : 
                            skill.category === 'Hardware' ? 'Hardware' :
                            skill.category === 'soft' ? 'soft' : 'Software';
            
            console.log(`  ➜ Assigned to positioning category: "${category}"`);
            categorizedSkills[category].push(skill);
        });
        
        // Debug: Show categorized skills at this level
        console.log(`📋 Level ${level} categorized skills:`, Object.keys(categorizedSkills).map(cat => 
            `${cat}: [${categorizedSkills[cat].map(s => s.id).join(', ')}]`
        ));
        
        // Position each category's skills centered under their parent
        // PROCESS IN ORDER: Software → Hardware → Soft Skills
        const categoryOrder = ['Software', 'Hardware', 'soft'];
        
        categoryOrder.forEach(category => {
            const categorySkills = categorizedSkills[category];
            if (categorySkills.length === 0) return;
            
            const parentCenter = MAIN_CATEGORY_POSITIONS[category as keyof typeof MAIN_CATEGORY_POSITIONS];
            
            console.log(`🎯 Processing ${category} skills at level ${level}:`, categorySkills.map(s => s.id));
            console.log(`📍 Parent center for ${category}:`, parentCenter);
            
            // Calculate the total width needed for this category's skills at this level
            const totalWidth = (categorySkills.length * NODE_WIDTH) + ((categorySkills.length - 1) * NODE_SPACING);
            
            // Calculate starting X position to center all nodes under the parent
            const startX = parentCenter.x - (totalWidth / 2);
            
            // Calculate Y position for this level (higher levels are positioned above lower levels)
            const LEVEL_HEIGHT = 200; // Vertical spacing between levels
            const yPosition = parentCenter.y - ((maxLevel - level + 1) * LEVEL_HEIGHT);
            
            console.log(`📏 ${category} level ${level}: totalWidth=${totalWidth}, startX=${startX}, yPosition=${yPosition}`);
            
            // Position each skill in this category
            categorySkills.forEach((skill, index) => {
                const skillX = startX + (index * (NODE_WIDTH + NODE_SPACING)) + (NODE_WIDTH / 2);
                
                // Add slight randomization for organic look (reduced for better centering)
                const skillSeed = skill.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                const randomOffsetX = (Math.sin(skillSeed * 1.337) * 15) - 7.5; // ±7.5px horizontal
                const randomOffsetY = (Math.cos(skillSeed * 2.718) * 10) - 5;   // ±5px vertical
                
                positions[skill.id] = {
                    x: skillX - (NODE_WIDTH / 2) + randomOffsetX, // Center the node
                    y: yPosition + randomOffsetY
                };
                
                console.log(`✅ Positioned ${skill.id} (${category}) at level ${level}: x=${Math.round(skillX)}, y=${yPosition}`);
            });
        });
    }
    
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
            position: positions[category.id] || { x: 0, y: 0 }, // Use dynamic positions instead of positionMap
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
                       category.id === 'hardware' ? '2px solid #a855f7' : 
                       category.id === 'soft-skills' ? '2px solid #10b981' : '2px solid #10b981',
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