// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/db';
// import User from '@/model/User';

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     console.log('Request body:', body);

//     // Changed to match the incoming parameter name from your form
//     const { username, code } = body;
//     const decodedUsername = decodeURIComponent(username);

//     if (!decodedUsername || !code) {
//       console.log('Missing fields:', { username: decodedUsername, code });
//       return NextResponse.json(
//         { success: false, message: 'Username and verification code are required' },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     // Updated select to match schema field names
//     const user = await User.findOne({ username: decodedUsername })
//       .select('+verifyCode +verifyCodeExpiry');

//     console.log('Found user:', {
//       exists: !!user,
//       verifyCode: user?.verifyCode,
//       verifyCodeExpiry: user?.verifyCodeExpiry,
//       isVerified: user?.isVerified
//     });

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: 'User not found' },
//         { status: 404 }
//       );
//     }

//     // Check if verification code exists
//     if (!user.verifyCode) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: 'No verification code found. Please request a new one.' 
//         },
//         { status: 400 }
//       );
//     }

//     // Check if code matches
//     if (user.verifyCode !== code) {
//       console.log('Code mismatch:', {
//         provided: code,
//         stored: user.verifyCode
//       });
//       return NextResponse.json(
//         { success: false, message: 'Invalid verification code' },
//         { status: 400 }
//       );
//     }

//     // Check if code has expired
//     if (user.verifyCodeExpiry && user.verifyCodeExpiry < new Date()) {
//       return NextResponse.json(
//         { 
//           success: false,
//           message: 'Verification code has expired. Please request a new one.' 
//         },
//         { status: 400 }
//       );
//     }

//     // Update user verification status
//     user.isVerified = true;
//     await user.save();
//     console.log('User verified successfully');

//     return NextResponse.json({
//       success: true,
//       message: 'Account verified successfully'
//     });

//   } catch (error) {
//     console.error('Error in verify:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Failed to verify account',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/model/User';
import { verifySchema } from '@/schemas/verifySchema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = verifySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input',
          errors: result.error.errors 
        },
        { status: 400 }
      );
    }

    const { username, verificationCode } = result.data;
    
    await connectToDatabase();

    // Important: explicitly select verifyCode and verifyCodeExpiry fields
    const user = await User.findOne({ username })
      .select('+verifyCode +verifyCodeExpiry');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: 'User is already verified' },
        { status: 400 }
      );
    }

    // Check if verification code exists
    if (!user.verifyCode) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No verification code found. Please request a new one.' 
        },
        { status: 400 }
      );
    }

    // Check if code matches
    if (user.verifyCode !== verificationCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (!user.verifyCodeExpiry || new Date() > user.verifyCodeExpiry) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Verification code has expired. Please request a new one.' 
        },
        { status: 400 }
      );
    }

    // Update user verification status using findOneAndUpdate
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { 
        $set: { 
          isVerified: true 
        },
        $unset: { 
          verifyCode: "", 
          verifyCodeExpiry: "" 
        }
      },
      { new: true, runValidators: false }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user verification status');
    }

    return NextResponse.json({
      success: true,
      message: 'Account verified successfully'
    });

  } catch (error) {
    console.error('Error in verify:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to verify account',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}