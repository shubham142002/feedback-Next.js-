import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/model/User';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import VerificationEmail from '@/emails/VerificationEmail';
import { generateOTP } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      const field = existingUser.username === username ? 'Username' : 'Email';
      return NextResponse.json(
        { message: `${field} already exists` },
        { status: 400 }
      );
    }

    // Generate verification code
    const verifyCode = generateOTP();
    const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Send verification email first
    try {
      await resend.emails.send({
        from: 'True Feedback <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your True Feedback account',
        react: VerificationEmail({
          username,
          otp: verifyCode,
        }),
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      throw new Error('Failed to send verification email');
    }

    // Create user after email is sent successfully
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiry,
      isVerified: false,
      isAcceptingMessages: true
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Account created successfully. Please check your email for verification.' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in sign-up:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create account'
      },
      { status: 500 }
    );
  }
}