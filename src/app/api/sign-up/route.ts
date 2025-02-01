import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import VerificationEmail from '@/emails/VerificationEmail';
import { generateOTP } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    await connectToDatabase();

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Generate verification code
    const verificationCode = generateOTP();
    const verificationCodeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with verification code
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiry,
      isVerified: false,
    });

    // Send verification email
    await resend.emails.send({
      from: 'True Feedback <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your True Feedback account',
      react: VerificationEmail({
        username,
        otp: verificationCode,
      }),
    });

    console.log('User created with verification code:', {
      username,
      verificationCode,
      verificationCodeExpiry
    });

    return NextResponse.json(
      { message: 'Account created successfully. Please check your email for verification.' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in sign-up:', error);
    return NextResponse.json(
      { message: 'Failed to create account' },
      { status: 500 }
    );
  }
}
