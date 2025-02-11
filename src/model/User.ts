import mongoose, { Document } from 'mongoose';

export interface Message {
  _id?: string;
  content: string;
  createdAt: Date;
}

const MessageSchema = new mongoose.Schema<Message>({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode?: string;
  verifyCodeExpiry?: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
}

const UserSchema = new mongoose.Schema<User>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  verifyCode: {
    type: String,
    required: function(this: User) {
      return !this.isVerified;
    },
    select: false, // Hide by default
  },
  verifyCodeExpiry: {
    type: Date,
    required: function(this: User) {
      return !this.isVerified;
    },
    select: false, // Hide by default
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
});

const UserModel = mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;
