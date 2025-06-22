import mongoose, { Schema, model, models } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  name: string
  email: string
  level: string
  masteredSkills: string[]
  knownSkills: string[]
  skillPoints: number
  password: string
  skills?: {
    earnedSkills: string[]
    availableSkills: string[]
    skillTree?: {
      nodes: Array<{
        id: string
        name: string
        category: 'software' | 'hardware' | 'soft' | 'soft-skills'
        earned: boolean
        mastered?: boolean
        prerequisites?: string[]
        children?: string[]
        description?: string
      }>
      connections: Array<{ from: string; to: string }>
    }
  }
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true },
  level: { type: String, default: 'Beginner' },
  masteredSkills: { type: [String], default: [] },
  knownSkills: { type: [String], default: [] },
  skillPoints: { type: Number, default: 0 },
  password: { type: String, required: true, minlength: 8 },
  skills: {
    earnedSkills: { type: [String], default: [] },
    availableSkills: { type: [String], default: [] },
    skillTree: { type: String, default: null }
  },
}, { timestamps: true })

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (err: any) {
    return next(err)
  }
})

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password)
}

// Export the model
let User: mongoose.Model<IUser>

try {
  // Try to get existing model
  User = mongoose.model<IUser>('User')
} catch (error) {
  // Create new model if it doesn't exist
  User = mongoose.model<IUser>('User', UserSchema)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema) 