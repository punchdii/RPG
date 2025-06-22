import mongoose, { Schema, model, models } from 'mongoose'

export interface ISkillNode {
  id: string
  name: string
  category: 'software' | 'hardware' | 'soft' | 'soft-skills'
  description?: string
  prerequisites?: string[]
  children?: string[]
  earnedByCount: number // Number of users who have earned this skill
  totalUserCount: number // Total number of users who have this skill in their tree
}

export interface ISkillConnection {
  from: string
  to: string
  count: number // Number of users who have this connection
}

export interface IGlobalTree {
  nodes: ISkillNode[]
  connections: ISkillConnection[]
  lastUpdated: Date
  totalUsers: number // Total number of users who have contributed to this tree
}

const SkillNodeSchema = new Schema<ISkillNode>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['software', 'hardware', 'soft', 'soft-skills'] },
  description: { type: String, default: '' },
  prerequisites: { type: [String], default: [] },
  children: { type: [String], default: [] },
  earnedByCount: { type: Number, default: 0 },
  totalUserCount: { type: Number, default: 0 }
})

const SkillConnectionSchema = new Schema<ISkillConnection>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  count: { type: Number, default: 0 }
})

const GlobalTreeSchema = new Schema<IGlobalTree>({
  nodes: { type: [SkillNodeSchema], default: [] },
  connections: { type: [SkillConnectionSchema], default: [] },
  lastUpdated: { type: Date, default: Date.now },
  totalUsers: { type: Number, default: 0 }
}, { timestamps: true })

// Create compound index for efficient connection lookups
GlobalTreeSchema.index({ 'connections.from': 1, 'connections.to': 1 })

// Export the model
export default mongoose.models.GlobalTree || mongoose.model<IGlobalTree>('GlobalTree', GlobalTreeSchema) 