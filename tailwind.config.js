/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      black: "#1c1c1c",
      white: "#FFFFFF",
      primary: "#570a1f", // Primary brand
      secondary: "#9f8266", // Secondary brand
      background: "#f9f4f1", // Page background
      sbackground: "#efe7e2", // Subtle section background (slightly darker than background)
      bordercolor: "#c3aa9a", // Softer border that contrasts on light bg
      luxury: "#d4af37",
      dark: "#1f2937", // Text on light backgrounds
      light: "#faf6f3", // Light panels/cards
      gray: {
        600: "#4A5568", // General text color
        700: "#2D3748", // Darker grey for some elements
        800: "#1A202C", // Even darker grey
        900: "#171923", // Near black
      },
      "dark-opacity-50": "rgba(87, 10, 31, 0.5)", // Overlay using primary at 50%
      
      // Button colors for admin panel
      success: "#10b981", // Green for success actions
      warning: "#f59e0b", // Yellow/amber for warnings
      danger: "#ef4444", // Red for delete/danger actions
      info: "#3b82f6", // Blue for info actions
      
      // Status colors for messages/bookings
      "status-new": "#ef4444", // Red for new items
      "status-read": "#f59e0b", // Yellow for read items
      "status-replied": "#10b981", // Green for replied items
      "status-completed": "#10b981", // Green for completed items
      "status-pending": "#3b82f6", // Blue for pending items
    },
    screens: {
      smallest: "320px",
      small: "330px",
      phoneSmall: "340px",
      xxs: "356px",
      phone: "370px",
      xs: "400px",
      phoneLarge: "450px",
      phoneS: "505px",
      heroBreakOne: "560px",
      sm: "640px",
      heroBreakTwo: "690px",
      md: "768px",
      heroBreakThree: "934px",
      lg: "1024px",
      registerPopup: "1149px",
      heroBreakFour: "1250px",
      xl: "1280px",
      xlSpecial: "1430px",
      xl1: "1530px",
      xl12: "1630px",
      xl123: "1730px",
      xl2: "1920px",
    },
    extend: {
      backgroundImage: {
        "carousel-1": "url('/assets/img/carousel-1.jpg')",
        "carousel-2": "url('/assets/img/carousel-2.jpg')",
        "room-1": "url('/assets/img/room-1.jpg')",
        "room-2": "url('/assets/img/room-2.jpg')",
        "room-3": "url('/assets/img/room-3.jpg')",
      },
      keyframes: {
        slideInDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        slideInDown: 'slideInDown 2s ease-out forwards',
        slideInLeft: 'slideInLeft 2s ease-out forwards',
        slideInRight: 'slideInRight 2s ease-out forwards',
        slideInUp: 'slideInUp 2s ease-out forwards',
        fadeIn: 'fadeIn 2s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
