import { Resend } from 'resend';
import { ApiResponse } from '@/types/ApiResponse';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: 'True Feedback <onboarding@resend.dev>', // or your verified domain
      to,
      subject,
      html,
    });

    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'Failed to send email',
    };
  }
} 