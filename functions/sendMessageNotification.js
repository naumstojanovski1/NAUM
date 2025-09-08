const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");

exports.sendMessageNotification = onDocumentCreated(
  "contactMessages/{messageId}",
  async (event) => {
    const messageData = event.data.data();
    const messageId = event.params.messageId;

    console.log("New contact message received:", { messageId, messageData });

    try {
      // Validate required fields
      if (!messageData || !messageData.name || !messageData.email || !messageData.subject || !messageData.message) {
        console.error('Missing message data:', messageData);
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
        to: 'stojanovski.nano@gmail.com',
        subject: `New Contact Message from ${messageData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #570a1f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">NaumApartments</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">New Contact Message Received</p>
            </div>
            
            <div style="background-color: #f9f4f1; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #570a1f; margin-top: 0; border-bottom: 2px solid #9f8266; padding-bottom: 10px;">
                New Contact Message - NaumApartments
              </h2>
              
              <div style="background-color: #efe7e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #570a1f;">
                <h3 style="color: #570a1f; margin-top: 0;">Message Details</h3>
                <p style="color: #4A5568;"><strong>Name:</strong> ${messageData.name}</p>
                <p style="color: #4A5568;"><strong>Email:</strong> ${messageData.email}</p>
                <p style="color: #4A5568;"><strong>Subject:</strong> ${messageData.subject}</p>
                <p style="color: #4A5568;"><strong>Date:</strong> ${new Date(messageData.createdAt).toLocaleString()}</p>
              </div>

              <div style="background-color: white; padding: 20px; border: 1px solid #c3aa9a; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #570a1f; margin-top: 0;">Message Content</h3>
                <p style="line-height: 1.6; color: #2D3748;">${messageData.message}</p>
              </div>

              <div style="background-color: #570a1f; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h3 style="margin-top: 0;">Quick Actions</h3>
                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                  <a href="https://your-domain.com/admin/login" style="color: white; text-decoration: none; background-color: #9f8266; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                    📧 Reply in Admin Panel
                  </a>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px; color: #4A5568; font-size: 12px;">
                <p>This is an automated notification from NaumApartments Contact System</p>
                <p style="color: #9f8266;">Kriva Palanka, Macedonia</p>
              </div>
            </div>
          </div>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);
      console.log('Email notification sent successfully to:', 'stojanovski.nano@gmail.com');

    } catch (error) {
      console.error('Error sending email notification:', error);
    }

    return null;
  }
);
