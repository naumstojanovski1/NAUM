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
    const { guest, roomName, checkInDate, checkOutDate, nights, roomPrice, adults, children } = booking;

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
        <h1>Hello ${guest.firstName} ${guest.lastName},</h1>
        <p>Your booking for ${roomName} has been confirmed!</p>
        <p><strong>Booking Details:</strong></p>
        <ul>
          <li><strong>Room:</strong> ${roomName}</li>
          <li><strong>Check-in:</strong> ${checkInDate}</li>
          <li><strong>Check-out:</strong> ${checkOutDate}</li>
          <li><strong>Nights:</strong> ${nights}</li>
          <li><strong>Adults:</strong> ${adults}</li>
          <li><strong>Children:</strong> ${children}</li>
          <li><strong>Total Price:</strong> $${(roomPrice * nights).toFixed(2)}</li>
        </ul>
        <p>We look forward to welcoming you!</p>
        <p>Best regards,<br/>The Hotel Team</p>
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
