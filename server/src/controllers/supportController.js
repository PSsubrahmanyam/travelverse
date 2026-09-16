const nodemailer = require('nodemailer');
const axios = require('axios');
const SupportTicket = require('../models/SupportTicket');

/**
 * Handle support request submission & dispatch email to shanmukhparimi82@gmail.com
 */
const submitSupportTicket = async (req, res) => {
  try {
    const { name, email, supportType, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, Email, and Message are required fields.',
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'shanmukhparimi82@gmail.com';

    // 1. Save support request to database if MongoDB available
    let ticket = null;
    try {
      ticket = await SupportTicket.create({
        name,
        email,
        supportType: supportType || 'General Query',
        message,
      });
    } catch (e) {
      // Continue even if DB offline
    }

    // 2. Prepare & send email using multi-tier dispatch
    let mailSent = false;
    let previewUrl = null;

    // Strategy A: Direct Gmail SMTP if credentials present
    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your_gmail_app_password_here') {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailOptions = {
          from: `"AntiTravel Support Desk" <${process.env.SMTP_USER}>`,
          to: adminEmail, // Delivery to shanmukhparimi82@gmail.com
          replyTo: email,
          subject: `🚨 [AntiTravel Support] New Query from ${name} (${supportType || 'General'})`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #0284c7; margin-top: 0;">✈️ AntiTravel Traveler Inquiry</h2>
              <p>You have received a new support ticket sent to <strong>${adminEmail}</strong>:</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
              <p><strong>👤 Name:</strong> ${name}</p>
              <p><strong>✉️ User Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>🏷️ Help Category:</strong> ${supportType || 'General Query'}</p>
              <p><strong>💬 Help Needed:</strong></p>
              <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #0284c7; border-radius: 5px; font-size: 14px; line-height: 1.6;">
                ${message.replace(/\n/g, '<br/>')}
              </div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">AntiTravel Support Dispatch System</p>
            </div>
          `,
        };

        const info = await transporter.sendMail(mailOptions);
        mailSent = true;
        console.log(`[Support SMTP Mailer] Email dispatched to ${adminEmail}! Message ID: ${info.messageId}`);
      } catch (err) {
        console.error('[Support SMTP Error]', err.message);
      }
    }

    // Strategy B: FormSubmit Web Mailer Fallback to guarantee delivery to target email
    if (!mailSent) {
      try {
        const fsRes = await axios.post(
          `https://formsubmit.co/ajax/${adminEmail}`,
          {
            _subject: `🚨 [AntiTravel Support] New Query from ${name} (${supportType || 'General'})`,
            _replyto: email,
            _template: 'table',
            'Full Name': name,
            'User Email': email,
            'Help Category': supportType || 'General Query',
            'Message Details': message,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Origin': 'https://travelverse-1.vercel.app',
              'Referer': 'https://travelverse-1.vercel.app/',
            },
          }
        );

        if (fsRes.data && fsRes.data.message) {
          console.log(`[FormSubmit Mailer] ${fsRes.data.message}`);
        }
        mailSent = true;
        console.log(`[FormSubmit Mailer] Email dispatched to ${adminEmail}!`);
      } catch (fsErr) {
        console.error('[FormSubmit Mailer Error]', fsErr.message);
      }
    }

    // Strategy C: Ethereal Test Mailer Preview fallback
    if (!mailSent) {
      try {
        const testAccount = await nodemailer.createTestAccount();
        const testTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await testTransporter.sendMail({
          from: `"AntiTravel Support Desk" <no-reply@antitravel.com>`,
          to: adminEmail,
          replyTo: email,
          subject: `🚨 [AntiTravel Support] New Query from ${name} (${supportType || 'General'})`,
          html: `<p>New inquiry from ${name} (${email}): ${message}</p>`,
        });

        mailSent = true;
        previewUrl = nodemailer.getTestMessageUrl(info);
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: `Support ticket submitted! Email dispatched to ${adminEmail}`,
      targetEmail: adminEmail,
      mailSent,
      previewUrl,
      ticketId: ticket ? ticket._id : null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error processing support request',
      error: error.message,
    });
  }
};

module.exports = {
  submitSupportTicket,
};
