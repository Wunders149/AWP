import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendInvitationEmail = async (to: string, calendarName: string, inviterName: string) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // If no credentials in dev, create an ethereal account on the fly
  let mailTransporter = transporter;
  if (isDevelopment && (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com')) {
    console.log('Using Ethereal Mail for development...');
    const testAccount = await nodemailer.createTestAccount();
    mailTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const info = await mailTransporter.sendMail({
    from: `"SmileCalendar" <${process.env.SMTP_USER || 'noreply@smilecalendar.com'}>`,
    to,
    subject: `Invitation to join calendar: ${calendarName}`,
    text: `Hello,\n\n${inviterName} has invited you to join their calendar "${calendarName}" on SmileCalendar.\n\nPlease register or login to accept the invitation.\n\nBest regards,\nSmileCalendar Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 20px;">
        <h2 style="color: #4f46e5;">SmileCalendar Invitation</h2>
        <p>Hello,</p>
        <p><strong>${inviterName}</strong> has invited you to join their collaborative calendar <strong>"${calendarName}"</strong>.</p>
        <p>With this access, you can stay synced with events and collaborate in real-time.</p>
        <div style="margin: 30px 0;">
          <a href="http://localhost:5173/register" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 12px;">Join Calendar</a>
        </div>
        <p style="font-size: 0.875rem; color: #64748b;">If you don't have an account yet, please register using this email address to automatically see your new calendar.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 0.75rem; color: #94a3b8;">You received this because someone invited you to SmileCalendar.</p>
      </div>
    `,
  });

  if (isDevelopment && (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com')) {
    console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
  }

  return info;
};
