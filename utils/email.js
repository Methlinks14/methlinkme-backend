const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send welcome email to new user
exports.sendWelcomeEmail = async (email, name) => {
  await transporter.sendMail({
    from: `"MethLinkMe" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to MethLinkMe!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a1a;color:#ffffff;padding:40px;border-radius:12px;">
        <h1 style="color:#00f5ff;text-align:center;">Welcome to MethLinkMe</h1>
        <p style="font-size:16px;">Hi <strong>${name}</strong>,</p>
        <p>You've successfully joined MethLinkMe — the global platform connecting skilled service providers with people who need them.</p>
        <p>Start exploring services near you today.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background:#00f5ff;color:#000;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;">Explore MethLinkMe</a>
        </div>
        <p style="color:#666;font-size:12px;text-align:center;">MethLinkMe — Skills meet opportunity.</p>
      </div>
    `
  });
};

// Send payment confirmation email to provider
exports.sendPaymentConfirmedEmail = async (email, name) => {
  await transporter.sendMail({
    from: `"MethLinkMe" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Payment Confirmed — Complete Your Profile',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a1a;color:#ffffff;padding:40px;border-radius:12px;">
        <h1 style="color:#00f5ff;text-align:center;">Payment Confirmed!</h1>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your payment of <strong>₦15,000</strong> has been confirmed. You can now complete your provider profile and go live on MethLinkMe.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.FRONTEND_URL}/register-provider" style="background:#00f5ff;color:#000;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;">Complete Your Profile</a>
        </div>
        <p style="color:#666;font-size:12px;text-align:center;">MethLinkMe — Skills meet opportunity.</p>
      </div>
    `
  });
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: `"MethLinkMe" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a1a;color:#ffffff;padding:40px;border-radius:12px;">
        <h1 style="color:#00f5ff;text-align:center;">Reset Your Password</h1>
        <p>You requested a password reset. Click below to set a new password. This link expires in 10 minutes.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}" style="background:#ff0066;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;">Reset Password</a>
        </div>
        <p>If you didn't request this, ignore this email.</p>
        <p style="color:#666;font-size:12px;text-align:center;">MethLinkMe — Skills meet opportunity.</p>
      </div>
    `
  });
};

// Send contact message to admin
exports.sendContactEmail = async (name, email, message) => {
  await transporter.sendMail({
    from: `"MethLinkMe Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact Message from ${name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;">
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      </div>
    `
  });
};