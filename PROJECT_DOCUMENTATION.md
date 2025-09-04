# NaumApartments - Hotel Booking System Documentation

## Project Overview
NaumApartments is a React-based hotel booking system that allows users to browse rooms, make reservations, and manage bookings. The application uses Firebase as the backend for data storage and authentication, with a modern UI built using Tailwind CSS.

## Technology Stack
- **Frontend**: React 18.2.0, React Router DOM 6.21.2
- **Styling**: Tailwind CSS 3.4.17
- **Backend**: Firebase (Firestore Database, Functions)
- **Email Service**: Nodemailer (Firebase Functions)
- **UI Components**: React Slick (Carousel), Custom Components
- **State Management**: React Hooks (useState, useEffect)

## Project Structure

### 1. Configuration Files

#### `package.json`
- **Purpose**: Defines project dependencies and scripts
- **Key Dependencies**:
  - React and React DOM for UI
  - React Router for navigation
  - Firebase for backend services
  - React Slick for carousels
  - Tailwind CSS for styling
- **Scripts**: Standard React scripts (start, build, test, eject)

#### `src/firebase.js`
- **Purpose**: Firebase configuration and initialization
- **Functionality**: 
  - Initializes Firebase app with project credentials
  - Exports Firestore database instance (`db`)
  - Connects to Firebase project "hotel-react-app"

#### `tailwind.config.js`
- **Purpose**: Tailwind CSS configuration
- **Functionality**: Defines custom colors, fonts, and responsive breakpoints

### 2. Main Application Files

#### `src/App.js`
- **Purpose**: Main application component and routing setup
- **Functionality**:
  - Sets up React Router with BrowserRouter
  - Defines all application routes
  - Includes Header, Footer, and BackToTop components on all pages
  - Routes: Home (/), Rooms (/rooms), Room Detail (/rooms/:id), Booking (/booking), Contact (/contact), Gallery (/gallery), Services (/services), 404 page

#### `src/index.js`
- **Purpose**: Application entry point
- **Functionality**: Renders the main App component to the DOM

### 3. Data Management

#### `src/components/data/Data.jsx`
- **Purpose**: Central data store for static content
- **Contains**:
  - `navList`: Navigation menu items with paths
  - `socialIcons`: Social media icons for footer
  - `about`: Hotel statistics (rooms, staff, clients)
  - `services`: Available hotel services
  - `footerItem`: Footer navigation links
  - `footerContact`: Contact information
  - `contact`: Email contact details

### 4. Common Components

#### `src/components/common/Header.jsx`
- **Purpose**: Main navigation header
- **Functionality**:
  - Responsive navigation with mobile menu
  - Logo linking to home page
  - Navigation links with active states
  - Mobile hamburger menu with dropdown support
  - Sticky positioning with shadow effects

#### `src/components/common/Footer.jsx`
- **Purpose**: Site footer with contact info and newsletter
- **Functionality**:
  - Hotel description and branding
  - Contact information display
  - Social media links
  - Newsletter subscription component
  - Footer navigation links

#### `src/components/common/Heading.jsx`
- **Purpose**: Page header with breadcrumb navigation
- **Functionality**:
  - Displays page title with background image
  - Breadcrumb navigation showing current page
  - Responsive design with overlay effects

#### `src/components/common/CommonHeading.jsx`
- **Purpose**: Reusable section headings
- **Functionality**:
  - Displays section titles with consistent styling
  - Used across multiple components for uniformity

#### `src/components/common/BackToTop.jsx`
- **Purpose**: Scroll-to-top button
- **Functionality**:
  - Appears when user scrolls down 300px
  - Smooth scroll animation to top
  - Fixed positioning with hover effects

#### `src/components/common/ScrollToTop.jsx`
- **Purpose**: Auto-scroll to top on route changes
- **Functionality**:
  - Listens to route changes
  - Automatically scrolls to top when navigating

### 5. Home Page Components

#### `src/components/home/Home.js`
- **Purpose**: Main home page component
- **Functionality**:
  - Combines all home page sections
  - Includes Hero, Book, About, Rooms (limited to 3), and Services

#### `src/components/home/Hero.js`
- **Purpose**: Hero section with call-to-action
- **Functionality**:
  - Background image with overlay
  - Animated text effects
  - Call-to-action button linking to rooms
  - Responsive design with gradient overlays

#### `src/components/home/Book.js`
- **Purpose**: Quick booking form on home page
- **Functionality**:
  - Date selection (check-in/check-out)
  - Guest count selection (adults/children)
  - Form validation
  - Navigation to booking page with form data
  - Date validation (check-out must be after check-in)

#### `src/components/home/About.js`
- **Purpose**: About section with hotel statistics
- **Functionality**:
  - Displays hotel statistics (rooms, staff, clients)
  - Links to rooms page
  - Includes StaticGallery component
  - Responsive grid layout

#### `src/components/home/Rooms.js`
- **Purpose**: Displays available rooms
- **Functionality**:
  - Fetches room data from Firebase Firestore
  - Displays room cards with images, prices, and details
  - Click navigation to room details
  - Loading states
  - Optional limit parameter for home page (shows only 3 rooms)
  - Star rating display
  - Occupancy information

#### `src/components/home/Service.js`
- **Purpose**: Displays hotel services
- **Functionality**:
  - Grid layout of service cards
  - Icons and descriptions for each service
  - Hover effects and animations
  - Responsive design

#### `src/components/home/StaticGallery.js`
- **Purpose**: Image gallery with auto-sliding
- **Functionality**:
  - Auto-sliding carousel (4-second intervals)
  - Manual navigation with arrows and dots
  - Thumbnail navigation
  - Image categories and titles
  - Responsive design with hover effects

#### `src/components/home/Newsletter.js`
- **Purpose**: Newsletter subscription component
- **Functionality**:
  - Email input with validation
  - Checks for existing subscriptions
  - Saves to Firebase "newsletter" collection
  - Success/error message display
  - Form submission states

### 6. Page Components

#### `src/pages/BookingPage.js`
- **Purpose**: Main booking page with room selection and reservation
- **Functionality**:
  - Date and guest selection form
  - Fetches available rooms from Firebase
  - Checks room availability against existing bookings
  - Room preview modal with details
  - Reservation modal with guest information form
  - Saves bookings to Firebase "bookings" collection
  - Success confirmation modal
  - Real-time availability checking
  - Price calculation based on nights

#### `src/pages/RoomPage.js`
- **Purpose**: All rooms listing page
- **Functionality**:
  - Uses the same Rooms component as home page
  - Shows all available rooms without limit
  - Includes page header with breadcrumbs

#### `src/pages/RoomDetail.js`
- **Purpose**: Individual room detail page
- **Functionality**:
  - Fetches specific room data by ID from Firebase
  - Image gallery with thumbnail navigation
  - Room information display (description, amenities, occupancy)
  - Price and availability status
  - Back navigation button
  - Responsive image gallery

#### `src/pages/ServicesPage.js`
- **Purpose**: Services page
- **Functionality**:
  - Uses the same Service component as home page
  - Includes page header with breadcrumbs

#### `src/pages/GalleryPage.js`
- **Purpose**: Gallery page
- **Functionality**:
  - Uses StaticGallery component
  - Includes page header with breadcrumbs

#### `src/pages/ContactPage.js`
- **Purpose**: Contact form page
- **Functionality**:
  - Contact form with validation
  - Saves messages to Firebase "contactMessages" collection
  - Google Maps integration
  - Contact information display
  - Success/error message handling
  - Form validation (email format, required fields)

#### `src/pages/PageNotFound.js`
- **Purpose**: 404 error page
- **Functionality**:
  - Simple 404 page with navigation header

### 7. Firebase Backend

#### `functions/index.js`
- **Purpose**: Firebase Functions entry point
- **Functionality**:
  - Exports email confirmation function
  - Sets global options for function instances

#### `functions/sendConfirmationEmail.js`
- **Purpose**: Automatic email confirmation for bookings
- **Functionality**:
  - Triggers when new booking is created in Firestore
  - Sends HTML email with booking details
  - Uses Nodemailer with Gmail SMTP
  - Includes booking confirmation template
  - Calculates total price and nights

#### `seedFirebase.js`
- **Purpose**: Database seeding script
- **Functionality**:
  - Populates Firestore with initial room data
  - Creates 5 different room types with details
  - Includes pricing, amenities, and occupancy limits

## Main Application Logic

### 1. Booking System Flow
1. **Home Page**: Users can quickly search for rooms using the Book component
2. **Room Browsing**: Users can view all rooms on the Rooms page
3. **Room Details**: Clicking a room shows detailed information and images
4. **Booking Process**: 
   - Select dates and guest count
   - View available rooms based on criteria
   - Preview room details
   - Fill guest information
   - Confirm reservation
5. **Confirmation**: Booking saved to Firebase, email sent automatically

### 2. Data Flow
- **Rooms**: Stored in Firestore "rooms" collection
- **Bookings**: Stored in Firestore "bookings" collection
- **Contact Messages**: Stored in Firestore "contactMessages" collection
- **Newsletter Subscriptions**: Stored in Firestore "newsletter" collection

### 3. Key Features
- **Real-time Availability**: Checks existing bookings to show available rooms
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Email Notifications**: Automatic booking confirmations
- **Form Validation**: Client-side validation for all forms
- **Loading States**: User feedback during data fetching
- **Error Handling**: Graceful error handling with user messages

### 4. Security Considerations
- Firebase security rules should be configured
- Email credentials stored in Firebase Functions config
- Input validation on both client and server side
- Rate limiting for form submissions

## Deployment
- **Frontend**: Can be deployed to Firebase Hosting, Netlify, or Vercel
- **Backend**: Firebase Functions for serverless backend
- **Database**: Firebase Firestore for data storage
- **Email**: Firebase Functions with Nodemailer for email service

## Future Enhancements
- User authentication and profiles
- Payment integration (Stripe)
- Admin dashboard for managing bookings
- Room reviews and ratings
- Multi-language support
- Advanced search filters
- Booking modification/cancellation
- Real-time chat support
