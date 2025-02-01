import { sendEmail } from '@/lib/emailService';
import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p>Hello ${username},</p>
        <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
        <div style="background-color: #f4f4f4; padding: 12px 24px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px;">
          ${verifyCode}
        </div>
        <p>This code will expire in 1 hour. If you did not request this code, please ignore this email.</p>
        <div style="margin-top: 20px; text-align: center;">
          <a href="http://localhost:3000/verify/${username}" 
             style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Account
          </a>
        </div>
      </div>
    `;

    return await sendEmail(
      email,
      'Verify Your True Feedback Account',
      htmlContent
    );
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    return { success: false, message: 'Failed to send verification email' };
  }
}