const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.sendNewsletterTrigger = onDocumentCreated(
  'newsletterPosts/{newsletterId}',
  async (event) => {
    const newsletterData = event.data.data();
    const newsletterId = event.params.newsletterId;
    
    if (!newsletterData) {
      console.error('No newsletter data found');
      return null;
    }
    
    try {
      // Get all active subscribers
      const subscribersSnapshot = await db.collection('newsletter')
        .where('status', '==', 'active')
        .get();
      
      console.log(`Found ${subscribersSnapshot.size} active subscribers`);
      
      if (subscribersSnapshot.empty) {
        // Update newsletter status to 'completed' with 0 recipients
        await db.collection('newsletterPosts').doc(newsletterId).update({
          status: 'completed',
          recipientCount: 0,
          completedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return null;
      }
      
      // Create email transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'naumonvd@gmail.com',
          pass: 'bnhu zxyf jnjw zsiy' // Replace with your actual app password
        }
      });
      
      // Verify transporter configuration
      try {
        await transporter.verify();
      } catch (verifyError) {
        console.error('Email transporter verification failed:', verifyError);
        throw verifyError;
      }
      
      let successCount = 0;
      let failureCount = 0;
      const errors = [];
      
      // Send email to each subscriber
      for (const subscriberDoc of subscribersSnapshot.docs) {
        const subscriber = subscriberDoc.data();
        const subscriberId = subscriberDoc.id;
        
        try {
          // Generate unsubscribe URL
          const unsubscribeUrl = `https://naum.netlify.app/unsubscribe?token=${subscriberId}`;
          
          // Email content
          const mailOptions = {
            from: 'NaumApartments <naumonvd@gmail.com>',
            to: subscriber.email,
            subject: newsletterData.subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #570a1f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">NaumApartments</h1>
                  <p style="margin: 5px 0 0 0; opacity: 0.9;">Newsletter</p>
                </div>
                
                <div style="background-color: #f9f4f1; padding: 30px; border-radius: 0 0 8px 8px;">
                  <h2 style="color: #570a1f; margin-top: 0; border-bottom: 2px solid #9f8266; padding-bottom: 10px;">
                    ${newsletterData.subject}
                  </h2>
                  
                  <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #570a1f;">
                    <div style="line-height: 1.6; color: #2D3748;">
                      ${newsletterData.content}
                    </div>
                  </div>

                  <div style="background-color: #efe7e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #570a1f; margin-top: 0;">Stay Connected</h3>
                    <p style="color: #4A5568; margin-bottom: 15px;">Thank you for subscribing to our newsletter!</p>
                    <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                                             <a href="https://naum.netlify.app" style="color: white; text-decoration: none; background-color: #9f8266; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                         🌐 Visit Our Website
                       </a>
                      <a href="mailto:info@naumapartments.com" style="color: white; text-decoration: none; background-color: #9f8266; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                        📧 Contact Us
                      </a>
                    </div>
                  </div>

                  <div style="text-align: center; margin-top: 30px; color: #4A5568; font-size: 12px;">
                    <p>This newsletter was sent to ${subscriber.email}</p>
                    <p style="margin-top: 10px;">
                      <a href="${unsubscribeUrl}" style="color: #9f8266; text-decoration: underline;">
                        Unsubscribe from this newsletter
                      </a>
                    </p>
                    <p style="color: #9f8266; margin-top: 10px;">Kriva Palanka, Macedonia</p>
                  </div>
                </div>
              </div>
            `,
          };
          
          // Send email
          const result = await transporter.sendMail(mailOptions);
          console.log(`Newsletter sent successfully to ${subscriber.email}, Message ID: ${result.messageId}`);
          successCount++;
          
        } catch (emailError) {
          console.error(`Failed to send newsletter to ${subscriber.email}:`, emailError);
          failureCount++;
          errors.push({
            email: subscriber.email,
            error: emailError.message
          });
        }
      }
      
      // Update newsletter status
      const finalStatus = failureCount === 0 ? 'completed' : (successCount > 0 ? 'partial' : 'failed');
      
      await db.collection('newsletterPosts').doc(newsletterId).update({
        status: finalStatus,
        recipientCount: successCount,
        failureCount: failureCount,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        errors: errors.length > 0 ? errors : null
      });
      
      console.log(`Newsletter sending completed. Success: ${successCount}, Failures: ${failureCount}`);
      
    } catch (error) {
      console.error('Error sending newsletter:', error);
      
      // Update newsletter status to 'failed'
      try {
        await db.collection('newsletterPosts').doc(newsletterId).update({
          status: 'failed',
          error: error.message,
          failedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (updateError) {
        console.error('Error updating newsletter status:', updateError);
      }
    }
    
    return null;
  }
);
