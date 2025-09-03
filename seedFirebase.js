const admin = require('firebase-admin');
const serviceAccount = require('/home/viktorija/Downloads/hotel-react-app-firebase-adminsdk-fbsvc-192e5f50dc.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const roomsData = [
  {
    name: "Standard Single",
    price: 90,
    description: "A cozy and comfortable single room, perfect for solo travelers. Equipped with modern amenities for a relaxing stay, including a plush single bed, a compact workspace, and a refreshing en-suite bathroom. Enjoy complimentary high-speed Wi-Fi and a flat-screen TV for your entertainment.",
    maxOccupancy: { adults: 1, children: 0 },
    amenities: ["Free Wi-Fi", "En-suite Bathroom", "Flat-screen TV", "Coffee/Tea Maker", "Mini Fridge", "Work Desk"],
    images: ["/assets/img/room-1.jpg", "/assets/img/room-1.jpg"],
    available: true
  },
  {
    name: "Deluxe Double",
    price: 130,
    description: "Spacious and elegantly designed double room, ideal for couples seeking comfort and style. Features a luxurious king-size bed, a private balcony offering scenic views, and a well-stocked mini-bar. Guests can enjoy premium amenities like smart TV and high-speed internet access.",
    maxOccupancy: { adults: 2, children: 0 },
    amenities: ["Free Wi-Fi", "King Size Bed", "Private Balcony", "Mini-bar", "Smart TV", "Complimentary Breakfast"],
    images: ["/assets/img/room-2.jpg", "/assets/img/room-2.jpg"],
    available: true
  },
  {
    name: "Family Suite",
    price: 200,
    description: "Our expansive family suite offers two separate sleeping areas, perfect for families with children. Includes a spacious living area, a convenient kitchenette for light meals, and a game console for entertainment. Designed for comfort and convenience, ensuring a memorable stay for the whole family.",
    maxOccupancy: { adults: 2, children: 2 },
    amenities: ["Free Wi-Fi", "Two Bedrooms", "Separate Living Area", "Kitchenette", "Game Console", "Children's Amenities", "Dining Area"],
    images: ["/assets/img/room-3.jpg", "/assets/img/room-3.jpg"],
    available: true
  },
  {
    name: "Executive Suite",
    price: 300,
    description: "Experience luxury in our executive suite, featuring premium amenities, private lounge access, and breathtaking city views. This suite includes a king-size bed, a large work desk, and a spacious living area. Enjoy complimentary breakfast and personalized concierge services for an unparalleled stay.",
    maxOccupancy: { adults: 2, children: 0 },
    amenities: ["Premium Wi-Fi", "Spa Access", "Private Lounge", "Complimentary Breakfast", "Personal Concierge", "King Size Bed", "City View"],
    images: ["/assets/img/room-4.jpg", "/assets/img/room-4.jpg"],
    available: true
  },
  {
    name: "Presidential Penthouse",
    price: 500,
    description: "The ultimate in luxury, our presidential penthouse boasts panoramic views, a private jacuzzi, and exclusive services. This sprawling suite includes a gourmet kitchen, a home theater, and a dedicated butler service. Perfect for an unforgettable and indulgent experience.",
    maxOccupancy: { adults: 2, children: 1 },
    amenities: ["Private Jacuzzi", "Panoramic Views", "Butler Service", "Gourmet Kitchen", "Home Theater", "Spa Access", "Private Dining", "Exclusive Access"],
    images: ["/assets/img/room-5.jpg", "/assets/img/room-5.jpg"],
    available: true
  }
];

async function seedRooms() {
  console.log("Starting Firebase data seeding...");
  for (const room of roomsData) {
    try {
      const docRef = await db.collection("rooms").add(room);
      console.log(`Added room: ${room.name} with ID: ${docRef.id}`);
    } catch (error) {
      console.error(`Error adding room ${room.name}:`, error);
    }
  }
  console.log("Firebase seeding complete!");
}

seedRooms().catch(console.error);
