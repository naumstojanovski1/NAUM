const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
// Import v2 firestore functions
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

admin.initializeApp(); 

const db = admin.firestore();

// Configure the email transport using the default SMTP transport and a Gmail account.
// For security reasons, configure your email account credentials in Firebase environment config.
// firebase functions:config:set gmail.email="your_email@gmail.com" gmail.password="your_app_password"
// Moved inside the function to ensure config is loaded
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: functions.config().gmail.email,
//     pass: functions.config().gmail.password,
//   },
// });

exports.sendBookingConfirmationEmail = onDocumentCreated(
  'bookings/{bookingId}',
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log("No data associated with the event");
      return null;
    }
    const booking = snap.data();
    console.log("Booking object from Firestore:", booking); // Add this line to log the booking object
    const { guest, roomName, checkInDate, checkOutDate, roomPrice, adults, children } = booking;

    // Calculate nights from check-in and check-out dates
    let nights = 0;
    if (checkInDate && checkOutDate) {
      const inDate = new Date(checkInDate);
      const outDate = new Date(checkOutDate);
      const ms = outDate - inDate;
      const d = Math.ceil(ms / (1000 * 60 * 60 * 24));
      nights = Number.isFinite(d) && d > 0 ? d : 0;
    }

    // Validate required fields
    if (!guest || !guest.email || !guest.firstName || !guest.lastName) {
      console.error('Missing guest information in booking:', booking);
      return null;
    }

    if (!roomName || !checkInDate || !checkOutDate || !roomPrice) {
      console.error('Missing booking details:', { roomName, checkInDate, checkOutDate, roomPrice });
      return null;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'naumonvd@gmail.com',
        pass: 'bnhu zxyf jnjw zsiy',
      },
    });

    const mailOptions = {
      from: 'Your Hotel <naumonvd@gmail.com>',
      to: guest.email,
      subject: `Booking Confirmation for ${roomName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f9f4f1;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #570a1f 0%, #9f8266 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              font-size: 28px;
              font-weight: 300;
              margin-bottom: 10px;
            }
            .header p {
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 20px;
              color: #2c3e50;
              margin-bottom: 30px;
              font-weight: 500;
            }
            .booking-details {
              background-color: #efe7e2;
              border-radius: 10px;
              padding: 30px;
              margin: 30px 0;
              border-left: 4px solid #570a1f;
            }
            .booking-details h2 {
              color: #570a1f;
              font-size: 20px;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid #c3aa9a;
            }
            .detail-row:last-child {
              border-bottom: none;
              font-weight: 600;
              font-size: 18px;
              color: #667eea;
            }
            .detail-label {
              font-weight: 500;
              color: #6c757d;
            }
            .detail-value {
              font-weight: 500;
              color: #2c3e50;
            }
            .total-price {
      background: linear-gradient(135deg, #570a1f 0%, #9f8266 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .total-price .amount {
              font-size: 24px;
              font-weight: 600;
            }
            .footer {
              background-color: #570a1f;
              color: white;
              padding: 30px;
              text-align: center;
            }
            .footer p {
              margin-bottom: 10px;
            }
            .contact-info {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
            }
            .contact-info p {
              color: #6c757d;
              font-size: 14px;
              margin-bottom: 5px;
            }
            @media only screen and (max-width: 600px) {
              .email-container {
                margin: 0;
              }
              .header, .content, .footer {
                padding: 20px;
              }
              .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Your reservation has been successfully confirmed</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hello ${guest.firstName} ${guest.lastName},
              </div>
              
              <p style="font-size: 16px; color: #6c757d; margin-bottom: 30px;">
                Thank you for choosing our hotel! Your booking has been confirmed and we're excited to welcome you.
              </p>
              
              <div class="booking-details">
                <h2>📋 Booking Details</h2>
                <div class="detail-row">
                  <span class="detail-label">Room Type:</span>
                  <span class="detail-value">${roomName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in Date:</span>
                  <span class="detail-value">${checkInDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out Date:</span>
                  <span class="detail-value">${checkOutDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Number of Nights:</span>
                  <span class="detail-value">${nights}</span>
                </div>
             
              </div>
              
              <div class="total-price">
                <div style="font-size: 16px; margin-bottom: 5px;">Total Amount</div>
                <div class="amount">$${(roomPrice * nights).toFixed(2)}</div>
              </div>
              
              <div style="background-color: #efe7e2; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #570a1f; margin-bottom: 10px;">✨ What to Expect</h3>
                <ul style="color: #4A5568; padding-left: 20px;">
                  <li>Comfortable and clean accommodations</li>
                  <li>Friendly and professional service</li>
                  <li>Convenient check-in process</li>
                  <li>All amenities included</li>
                </ul>
              </div>
              
              <div class="contact-info">
                <p><strong>Need to make changes?</strong></p>
                <p>Please contact us at least 24 hours before your arrival</p>
                <p>📧 Email: info@hotel.com</p>
                <p>📞 Phone: +1 (555) 123-4567</p>
              </div>
            </div>
            
            <div class="footer">
              <p style="font-size: 18px; margin-bottom: 15px;">We look forward to welcoming you!</p>
              <p style="font-size: 14px; opacity: 0.8;">Best regards,</p>
              <p style="font-size: 16px; font-weight: 600;">The Hotel Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent to:', guest.email);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }

    return null;
  }
);
