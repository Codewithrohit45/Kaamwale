/**
 * Reusable service for sending transactional emails via Brevo (Sendinblue) API
 */
const sendEmail = async ({ to, subject, htmlContent, senderName = 'Kaamwale Notifications' }) => {
  try {
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
      console.warn('⚠️ Brevo API Key or Sender Email missing. Skipping email send.');
      return false;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: process.env.BREVO_SENDER_EMAIL
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Brevo Email Error:', data);
      return false;
    }

    console.log(`📧 Email sent successfully to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('❌ Email Service Error:', error.message);
    return false;
  }
};

module.exports = { sendEmail };
