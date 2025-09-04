import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      const docRef = doc(db, "rooms", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const roomData = { id: docSnap.id, ...docSnap.data() };
        setRoom(roomData);
        if (roomData.images && roomData.images.length > 0) {
          setCurrentImage(roomData.images[0]);
        }
      } else {
        navigate("/404");
      }
    };

    fetchRoom();
  }, [id, navigate]);

  if (!room) return <p className="text-center text-lg py-10 text-dark">Loading room details...</p>;

  return (
    <div className="container mx-auto py-12 px-4 bg-light">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto border-t-4 border-primary relative">
                 {/* Close Button */}
         <button 
           onClick={() => navigate(-1)}
           className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center transition-all duration-300 z-10 transform hover:scale-110 hover:rotate-90 group"
         >
           <svg className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-all duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
           </svg>
         </button>
        
        <h1 className="text-4xl font-bold text-primary mb-6 text-center">{room.name}</h1>

        {/* Image Gallery */}
        {room.images && room.images.length > 0 && (
          <div className="mb-8">
            {/* Main Image */}
            <div className="relative w-full h-96 mb-6 rounded-xl overflow-hidden shadow-2xl">
              <img src={currentImage} alt={room.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {room.images.map((img, index) => (
                  <div
                    key={index}
                    className={`relative flex-shrink-0 cursor-pointer group transition-all duration-300 ${
                      currentImage === img 
                        ? 'transform scale-105' 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => setCurrentImage(img)}
                  >
                    <div className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      currentImage === img 
                        ? 'border-primary shadow-lg shadow-primary/30' 
                        : 'border-gray-200 hover:border-primary/50'
                    }`}>
                      <img
                        src={img}
                        alt={`${room.name} ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                                             {currentImage === img && (
                         <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Image Counter */}
              <div className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                {room.images.findIndex(img => img === currentImage) + 1} / {room.images.length}
              </div>
            </div>
          </div>
        )}

        <p className="text-lg text-gray-700 mb-4 leading-relaxed">{room.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Occupancy */}
          {room.maxOccupancy && (
            <div>
              <h3 className="text-xl font-semibold text-dark mb-2">Max Occupancy</h3>
              <p className="text-gray-600 mb-1">
                <i className="fa fa-user text-primary mr-2"></i>
                Adults: <span className="font-bold">{room.maxOccupancy.adults}</span>
              </p>
              {room.maxOccupancy.children > 0 && (
                <p className="text-gray-600">
                  <i className="fa fa-child text-primary mr-2"></i>
                  Children: <span className="font-bold">{room.maxOccupancy.children}</span>
                </p>
              )}
            </div>
          )}

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-dark mb-2">Amenities</h3>
              <ul className="list-disc list-inside text-gray-600">
                {room.amenities.map((amenity, index) => (
                  <li key={index} className="flex items-center mb-1">
                    <i className="fa fa-check-circle text-primary mr-2"></i>
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="text-2xl text-gray-700 mb-6 font-bold">
          Nightly Rate: <span className="font-semibold text-primary">${room.price}</span>
        </p>

        <p className="text-lg text-gray-600 mb-8">
          Availability:{" "}
          <span
            className={`font-semibold ${
              room.available ? "text-green-600" : "text-secondary"
            }`}
          >
            {room.available ? "Available for Booking" : "Currently Reserved"}
          </span>
        </p>

        <p className="text-md text-gray-600 mb-8 border-l-4 border-primary pl-4">
          <i className="fa fa-info-circle text-primary mr-2"></i>
          Payment is due upon arrival at the hotel.
        </p>
      </div>
    </div>
  );
}
