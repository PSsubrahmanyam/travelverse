const nodemailer = require('nodemailer');

/**
 * Send real email to recipient
 */
const sendRealEmail = async ({ to, subject, html }) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'shanmukhparimi82@gmail.com';
  const targetRecipient = to || adminEmail;

  let mailSent = false;
  let previewUrl = null;
  let mailError = null;

  try {
    let transporter;

    // Check if live Gmail App Password is available in process.env
    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your_gmail_app_password_here') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Dev Ethereal test transporter
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: `"AntiTravel App" <${process.env.SMTP_USER || 'no-reply@antitravel.com'}>`,
      to: targetRecipient,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    mailSent = true;
    previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`[Real Mailer] Email sent to ${targetRecipient}! Message ID: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[Real Mailer Test Preview] ${previewUrl}`);
    }
  } catch (err) {
    console.error('[Real Mailer Error]', err.message);
    mailError = err.message;
  }

  return { mailSent, previewUrl, mailError };
};

module.exports = { sendRealEmail };
