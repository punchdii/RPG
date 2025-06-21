import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User, { IUser } from '@/models/user'

export async function GET(req: NextRequest) {
  try {
    // Connect to DB
    await connectDB()

    const userId = req.nextUrl.searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
    }

    // Fetch user document
    const userDoc = (await User.findById(userId).lean()) as IUser | null

    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = {
      name: userDoc.name,
      level: userDoc.level,
      masteredSkills: userDoc.masteredSkills?.length || 0,
      knownSkills: userDoc.knownSkills?.length || 0,
      skillPoints: userDoc.skillPoints || 0,
    }

    return NextResponse.json(profile)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
