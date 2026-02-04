const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate HTML email template
 * @param {Object} data - Contact form data
 * @returns {String} HTML email content
 */
const generateEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #a67c52 0%, #8b6239 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border: 1px solid #e0e0e0;
          border-top: none;
        }
        .field {
          margin-bottom: 20px;
          background: white;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #a67c52;
        }
        .field-label {
          font-weight: 600;
          color: #a67c52;
          margin-bottom: 5px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .field-value {
          color: #333;
          font-size: 16px;
        }
        .message-box {
          background: white;
          padding: 20px;
          border-radius: 5px;
          border-left: 4px solid #a67c52;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          color: #666;
          font-size: 14px;
          border-top: 1px solid #e0e0e0;
        }
        .timestamp {
          color: #999;
          font-size: 12px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📬 New Contact Form Submission</h1>
      </div>
      
      <div class="content">
        <div class="field">
          <div class="field-label">From</div>
          <div class="field-value">${data.name}</div>
        </div>
        
        <div class="field">
          <div class="field-label">Email</div>
          <div class="field-value">
            <a href="mailto:${data.email}" style="color: #a67c52; text-decoration: none;">${data.email}</a>
          </div>
        </div>
        
        ${data.organization ? `
        <div class="field">
          <div class="field-label">Organization</div>
          <div class="field-value">${data.organization}</div>
        </div>
        ` : ''}
        
        <div class="message-box">
          <div class="field-label">Message</div>
          <div class="field-value">${data.message.replace(/\n/g, '<br>')}</div>
        </div>
        
        <div class="timestamp">
          Received: ${new Date().toLocaleString('en-US', { 
            dateStyle: 'full', 
            timeStyle: 'long' 
          })}
        </div>
      </div>
      
      <div class="footer">
        <p>This message was sent from your portfolio contact form.</p>
        <p>You can reply directly to <a href="mailto:${data.email}" style="color: #a67c52;">${data.email}</a></p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send contact form email using Resend
 * @param {Object} formData - Contact form data
 * @returns {Promise} Send result
 */
const sendContactEmail = async (formData) => {
  const emailData = {
    from: process.env.RESEND_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
    to: process.env.EMAIL_TO,
    reply_to: formData.email, // Visitor's email - so you can reply directly
    subject: `New Contact: ${formData.name}${formData.organization ? ` (${formData.organization})` : ''}`,
    html: generateEmailTemplate(formData),
    text: `
New Contact Form Submission

From: ${formData.name}
Email: ${formData.email}
${formData.organization ? `Organization: ${formData.organization}` : ''}

Message:
${formData.message}

---
Received: ${new Date().toLocaleString()}
    `.trim(),
  };

  return await resend.emails.send(emailData);
};

/**
 * Verify Resend configuration
 */
const verifyEmailConfig = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }
    console.log('✅ Resend configuration verified');
    return true;
  } catch (error) {
    console.error('❌ Resend configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendContactEmail,
  verifyEmailConfig,
};