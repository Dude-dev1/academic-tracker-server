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
      from: `"LMS Platform" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`, // sender address
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

const sendWelcomeEmail = async (user) => {
  const subject = "Welcome to the LMS Platform!";
  const html = `
    <h1>Welcome, ${user.name}!</h1>
    <p>Thank you for signing up to our learning management system.</p>
    <p>We're excited to have you on board. You can now log in and access your courses and assignments.</p>
    <br/>
    <p>Best regards,<br/>The LMS Team</p>
  `;
  return sendEmail({ to: user.email, subject, html });
};

const sendAnnouncementEmail = async (users, announcement) => {
  if (!users || users.length === 0) return;
  
  const emails = users.map(u => u.email).join(', ');
  const subject = \`New Announcement: \${announcement.title}\`;
  const html = \`
    <h2>New Announcement</h2>
    <h3>\${announcement.title}</h3>
    <p>\${announcement.content}</p>
    <br/>
    <p>Please check your dashboard for more details.</p>
  \`;
  
  return sendEmail({ bcc: emails, subject, html });
};

const sendAssignmentEmail = async (users, assignment) => {
  if (!users || users.length === 0) return;
  
  const emails = users.map(u => u.email).join(', ');
  const subject = \`New Assignment: \${assignment.title}\`;
  const html = \`
    <h2>New Assignment Added</h2>
    <h3>\${assignment.title}</h3>
    <p><strong>Description:</strong> \${assignment.description || 'No description provided.'}</p>
    <p><strong>Due Date:</strong> \${new Date(assignment.dueDate).toLocaleDateString()}</p>
    <br/>
    <p>Please log in to submit your work before the deadline.</p>
  \`;
  
  return sendEmail({ bcc: emails, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendAnnouncementEmail,
  sendAssignmentEmail
};