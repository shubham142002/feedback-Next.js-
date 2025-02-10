import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/model/User';
import { generateOTP } from '@/lib/utils';
import { Resend } from 'resend';
import VerificationEmail from '@/emails/VerificationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { message: 'Username is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the user
    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new OTP
    const newOTP = generateOTP();
    
    // Update user with new OTP and reset verification status
    user.verifyCode = newOTP;
    user.verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    user.isVerified = false;
    await user.save();

    // Send new verification email
    await resend.emails.send({
      from: 'True Feedback <onboarding@resend.dev>',
      to: user.email,
      subject: 'New Verification Code - True Feedback',
      react: VerificationEmail({ 
        username: user.username,
        otp: newOTP
      })
    });

    return NextResponse.json({
      message: 'New verification code sent successfully',
      success: true
    });

  } catch (error) {
    console.error('Error in resend-code:', error);
    return NextResponse.json(
      { message: 'Failed to resend verification code' },
      { status: 500 }
    );
  }
} 