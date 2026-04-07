const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    // Only configure if credentials are provided
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT) || 587,
        secure: parseInt(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
      this.isConfigured = true;
      console.log('✅ Email Service Configured via SMTP');
    } else {
      console.log('⚠️ Email Service Running in Mock Mode (SMTP credentials not found in .env)');
    }
  }

  async sendEmail(to, subject, htmlContent) {
    if (!this.isConfigured) {
      // Graceful fallback for development
      console.log(`\n📧 [MOCK EMAIL] To: ${to}\nSubject: ${subject}\nBody: [HTML omitted, check terminal output for length: ${htmlContent.length} chars]\n`);
      return { success: true, mocked: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"SymbioTech Platform" <noreply@symbiotech.local>',
        to,
        subject,
        html: htmlContent,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // ─── High-Level Notification Methods ──────────────────────────────────────

  async sendTradeRequestEmail(receiverEmail, senderCompanyName, resourceDetails, requestId) {
    const subject = `New Trade Request from ${senderCompanyName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #58e077; padding: 20px; text-align: center; color: #121416;">
          <h2 style="margin: 0;">SymbioTech</h2>
        </div>
        <div style="padding: 30px;">
          <h3 style="color: #333;">You have a new trade request!</h3>
          <p style="color: #555; line-height: 1.6;">
            <strong>${senderCompanyName}</strong> wants to trade with you for your listing of 
            <strong>${resourceDetails.quantity} units of ${resourceDetails.materialType}</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/trade-requests" 
                style="background-color: #282a2c; color: #58e077; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #58e077;">
               View Request Dashboard
             </a>
          </div>
          <p style="color: #777; font-size: 0.9em;">
            Log in to your SymbioTech account to accept or decline this request to continue building a circular economy.
          </p>
        </div>
      </div>
    `;
    return this.sendEmail(receiverEmail, subject, html);
  }

  async sendTradeAcceptedEmail(senderEmail, receiverCompanyName, resourceDetails) {
    const subject = `Trade Request Accepted by ${receiverCompanyName} 🎉`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #58e077; padding: 20px; text-align: center; color: #121416;">
          <h2 style="margin: 0;">Trade Accepted!</h2>
        </div>
        <div style="padding: 30px;">
          <h3 style="color: #333;">Great news!</h3>
          <p style="color: #555; line-height: 1.6;">
            <strong>${receiverCompanyName}</strong> has officially accepted your request for 
            <strong>${resourceDetails.quantity} units of ${resourceDetails.materialType}</strong>.
          </p>
          <p style="color: #555; line-height: 1.6;">
            A formal transaction record has been created in your dashboard, along with the environmental impact metrics for this trade.
          </p>
          <div style="text-align: center; margin: 30px 0;">
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/transactions" 
                style="background-color: #282a2c; color: #58e077; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #58e077;">
               View Transaction
             </a>
          </div>
        </div>
      </div>
    `;
    return this.sendEmail(senderEmail, subject, html);
  }

  async sendTradeRejectedEmail(senderEmail, receiverCompanyName, resourceDetails) {
    const subject = `Update on your Trade Request`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="padding: 20px; text-align: center; border-bottom: 3px solid #f59e0b;">
          <h2 style="margin: 0; color: #333;">SymbioTech Update</h2>
        </div>
        <div style="padding: 30px;">
          <p style="color: #555; line-height: 1.6;">
            Your recent request to <strong>${receiverCompanyName}</strong> for 
            <strong>${resourceDetails.materialType}</strong> was declined at this time.
          </p>
          <p style="color: #777; font-size: 0.9em; margin-top: 30px;">
            Don't give up! Use our AI Matching Engine to find alternative suppliers for the materials you need.
          </p>
          <div style="text-align: center; margin: 30px 0;">
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/ai-insights" 
                style="background-color: #f4f4f4; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 4px; border: 1px solid #ccc;">
               Find Alternatives
             </a>
          </div>
        </div>
      </div>
    `;
    return this.sendEmail(senderEmail, subject, html);
  }
}

module.exports = new EmailService();
