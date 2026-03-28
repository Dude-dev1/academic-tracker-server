const nodemailer = require('nodemailer');

// Create a reusable transporter object using the default SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    // Using Gmail as a default basic example, user should configure with their own SMTP in prod
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

const sendEmail = async ({ to, bcc, subject, html }) => {
  try {
    const transporter = createTransporter();
    
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"Agenda" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`, // sender address
      to, // list of receivers
      bcc, // hidden list of receivers
      subject, // Subject line
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw to prevent app crashing when email fails, 
    // just log the error and return false
    return false;
  }
};

const emailStyles = `
  <style>
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f4f7f6;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .header {
      background-color: #357abd;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-family: 'Fraunces', serif;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .content h2 {
      color: #173249;
      margin-top: 0;
    }
    .footer {
      background-color: #f4f7f6;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #eaeaea;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #357abd;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin-top: 20px;
    }
    .card {
      background-color: #ebf5ff;
      border-left: 4px solid #357abd;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
  </style>
`;

const sendWelcomeEmail = async (user) => {
  const subject = "Welcome to Agenda!";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Agenda</h1>
        </div>
        <div class="content">
          <h2>Welcome, ${user.name}!</h2>
          <p>Thank you for signing up for Agenda, your new learning management experience.</p>
          <p>We're excited to have you on board. You can now log in to view your classes, check your schedule, and stay on top of your assignments.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Get Started</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Agenda. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: user.email, subject, html });
};

const sendAnnouncementEmail = async (users, announcement) => {
  if (!users || users.length === 0) return;
  
  const emails = users.map(u => u.email).join(', ');
  const subject = `Agenda: New Announcement - ${announcement.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Agenda</h1>
        </div>
        <div class="content">
          <h2>New Announcement</h2>
          <div class="card">
            <h3 style="margin-top: 0; color: #2b6296;">${announcement.title}</h3>
            <p style="margin-bottom: 0;">${announcement.content}</p>
          </div>
          <p>Please check your dashboard for more details.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Agenda. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({ bcc: emails, subject, html });
};

const sendAssignmentEmail = async (users, assignment) => {
  if (!users || users.length === 0) return;
  
  const emails = users.map(u => u.email).join(', ');
  const subject = `Agenda: New Assignment - ${assignment.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Agenda</h1>
        </div>
        <div class="content">
          <h2>New Assignment Added</h2>
          <div class="card">
            <h3 style="margin-top: 0; color: #2b6296;">${assignment.title}</h3>
            <p><strong>Description:</strong> ${assignment.description || 'No description provided.'}</p>
            <p style="margin-bottom: 0;"><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
          </div>
          <p>Please log in to submit your work before the deadline.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Agenda. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({ bcc: emails, subject, html });
};

const sendNewsletterConfirmationEmail = async (email) => {
  const subject = "Subscribed to Agenda Newsletter!";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Agenda</h1>
        </div>
        <div class="content">
          <h2>You're Subscribed!</h2>
          <p>Thank you for subscribing to the Agenda newsletter.</p>
          <p>We will keep you updated with the latest news, features, and educational insights.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Agenda. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendAnnouncementEmail,
  sendAssignmentEmail,
  sendNewsletterConfirmationEmail
};