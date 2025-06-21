import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    try {
      await connectDB();
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return NextResponse.json(
        { message: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check if user already exists
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'User already exists' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
      return NextResponse.json(
        { message: 'Error checking user existence' },
        { status: 500 }
      );
    }

    // Create new user
    try {
      const user = await User.create({
        name,
        email,
        password,
        skills: {
          earnedSkills: [],
          availableSkills: []
        }
      });

      // Remove password from response
      const userWithoutPassword = {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills
      };

      return NextResponse.json(
        { message: 'User created successfully', user: userWithoutPassword },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { message: 'Failed to create user' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 