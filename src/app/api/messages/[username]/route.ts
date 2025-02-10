import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/model/User';
import { messageSchema } from '@/schemas/messageSchema';

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    await connectToDatabase();

    const { username } = params;
    const body = await request.json();

    // Validate request body
    const result = messageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
          errors: result.error.errors,
        },
        { status: 400 }
      );
    }

    const { content } = result.data;

    // Find the user and check if they're accepting messages
    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessages) {
      return NextResponse.json(
        { success: false, message: 'User is not accepting messages' },
        { status: 403 }
      );
    }

    // Add the message to the user's messages array
    user.messages.push({
      content,
      createdAt: new Date(),
    });

    await user.save();

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send message',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}