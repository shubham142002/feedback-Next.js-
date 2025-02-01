import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { username, verificationCode } = body;

    if (!username || !verificationCode) {
      console.log('Missing fields:', { username, verificationCode });
      return NextResponse.json(
        { message: 'Username and verification code are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the user with verification fields explicitly included
    const user = await User.findOne({ username })
      .select('+verificationCode +verificationCodeExpiry');

    console.log('Found user:', {
      exists: !!user,
      verificationCode: user?.verificationCode,
      verificationCodeExpiry: user?.verificationCodeExpiry,
      isVerified: user?.isVerified
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.verificationCode) {
      return NextResponse.json(
        { message: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if verification code matches and hasn't expired
    if (user.verificationCode !== verificationCode) {
      console.log('Code mismatch:', {
        provided: verificationCode,
        stored: user.verificationCode
      });
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    if (user.verificationCodeExpiry && user.verificationCodeExpiry < new Date()) {
      return NextResponse.json(
        { message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();
    console.log('User verified successfully');

    return NextResponse.json({
      message: 'Account verified successfully',
      success: true
    });

  } catch (error) {
    console.error('Error in verify:', error);
    return NextResponse.json(
      { message: 'Failed to verify account' },
      { status: 500 }
    );
  }
} 