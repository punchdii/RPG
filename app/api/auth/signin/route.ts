import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
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

    // Find user and verify password
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const isValidPassword = await user.comparePassword(password);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Remove password from response
      const userWithoutPassword = {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills
      };

      return NextResponse.json(
        { message: 'Signed in successfully', user: userWithoutPassword },
        { status: 200 }
      );

    } catch (error) {
      console.error('Error verifying credentials:', error);
      return NextResponse.json(
        { message: 'Error verifying credentials' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 