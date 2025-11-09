import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  name: string
): Promise<void> => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/chairman/reset-password?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@bhavki.com',
    to: email,
    subject: 'Password Reset Request - Bhavki Membership Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>You have requested to reset your password. Click the link below to reset your password:</p>
        <p>
          <a href="${resetLink}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Bhavki Membership Manager</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error('Failed to send password reset email')
  }
}
