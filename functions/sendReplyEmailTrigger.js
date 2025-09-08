const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.sendReplyEmailTrigger = onDocumentCreated(
  "replyMessages/{replyId}",
  async (event) => {
    const replyData = event.data.data();
    const replyId = event.params.replyId;

    try {
      // Validate required fields
      if (!replyData || !replyData.to || !replyData.replySubject || !replyData.replyMessage) {
        console.error('Missing reply data:', replyData);
        return null;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(replyData.to)) {
        console.error("Invalid email format:", replyData.to);
        return null;
      }

      // Create transporter inside function (like working function)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'naumonvd@gmail.com',
          pass: 'bnhu zxyf jnjw zsiy',
        },
      });

      // Email content
      const mailOptions = {
        from: 'NaumApartments <naumonvd@gmail.com>',
        to: replyData.to,
        subject: replyData.replySubject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #570a1f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">NaumApartments</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Reply to Your Message</p>
            </div>
            
            <div style="background-color: #f9f4f1; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #570a1f; margin-top: 0; border-bottom: 2px solid #9f8266; padding-bottom: 10px;">
                Reply to Your Message
              </h2>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #570a1f;">
                <h3 style="color: #570a1f; margin-top: 0;">Our Response</h3>
                <p style="line-height: 1.6; color: #2D3748; white-space: pre-wrap;">${replyData.replyMessage}</p>
              </div>

              <div style="background-color: #efe7e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #570a1f; margin-top: 0;">Your Original Message</h3>
                <div style="margin-bottom: 10px; color: #4A5568;">
                  <strong>Subject:</strong> ${replyData.originalSubject}
                </div>
                <div style="margin-bottom: 10px; color: #4A5568;">
                  <strong>From:</strong> ${replyData.fromName}
                </div>
                <div style="color: #4A5568;">
                  <strong>Message:</strong>
                  <p style="margin-top: 5px; line-height: 1.6; color: #2D3748; white-space: pre-wrap;">${replyData.originalMessage}</p>
                </div>
              </div>

              <div style="background-color: #570a1f; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h3 style="margin-top: 0;">Need Further Assistance?</h3>
                <p style="margin-bottom: 15px;">If you have any additional questions or concerns, please don't hesitate to contact us.</p>
                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                  <a href="mailto:info@naumapartments.com" style="color: white; text-decoration: none; background-color: #9f8266; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                    📧 Email Us
                  </a>
                  <a href="tel:+389-123-456-789" style="color: white; text-decoration: none; background-color: #9f8266; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                    📞 Call Us
                  </a>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px; color: #4A5568; font-size: 12px;">
                <p>This is an automated response from NaumApartments</p>
                <p style="color: #9f8266;">Kriva Palanka, Macedonia</p>
              </div>
            </div>
          </div>
        `,
      };

      // Send email
      const result = await transporter.sendMail(mailOptions);
      console.log('Reply email sent successfully to:', replyData.to, 'Message ID:', result.messageId);

      // Update reply status to 'sent'
      await db.collection('replyMessages').doc(replyId).update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        emailMessageId: result.messageId
      });

      // Update original message with reply details (status already updated by modal)
      if (replyData.originalMessageId) {
        await db.collection('contactMessages').doc(replyData.originalMessageId).update({
          replyMessageId: result.messageId,
          emailSentAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log("Original message updated with reply details");
      }

    } catch (error) {
      console.error('Error sending reply email:', error);
      
      // Update reply status to 'failed'
      try {
        await db.collection('replyMessages').doc(replyId).update({
          status: 'failed',
          error: error.message,
          failedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (updateError) {
        console.error('Error updating reply status:', updateError);
      }
    }

    return null;
  }
);