import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const getLocalImagesForRoom = (name) => {
    const map = {
      "Standard Single": [
        "/assets/img/room/photo1.avif",
        "/assets/img/room/photo2.avif",
        "/assets/img/room/photo3.avif",
        "/assets/img/room/photo4.avif",
        "/assets/img/room/photo5.webp",
      ],
      "Deluxe Double": [
        "/assets/img/room (2)/photo1.webp",
        "/assets/img/room (2)/photo2.jpeg",
        "/assets/img/room (2)/photo3.webp",
        "/assets/img/room (2)/photo4.avif",
        "/assets/img/room (2)/photo5.webp",
      ],
      "Family Suite": [
        "/assets/img/room (3)/photo1.avif",
        "/assets/img/room (3)/photo2.avif",
        "/assets/img/room (3)/photo3.webp",
        "/assets/img/room (3)/photo4.avif",
        "/assets/img/room (3)/photo5.avif",
      ],
      "Presidential Penthouse": [
        "/assets/img/room (4)/photo1.avif",
        "/assets/img/room (4)/photo2.avif",
        "/assets/img/room (4)/photo3.avif",
        "/assets/img/room (4)/photo4.avif",
        "/assets/img/room (4)/photo5.avif",
      ],
      "Presidental Penthouse": [
        "/assets/img/room (4)/photo1.avif",
        "/assets/img/room (4)/photo2.avif",
        "/assets/img/room (4)/photo3.avif",
        "/assets/img/room (4)/photo4.avif",
        "/assets/img/room (4)/photo5.avif",
      ],
      "Executive Suite": [
        "/assets/img/room (5)/photo1.avif",
        "/assets/img/room (5)/photo2.avif",
        "/assets/img/room (5)/photo3.avif",
        "/assets/img/room (5)/photo4.avif",
        "/assets/img/room (5)/photo5.avif",
      ],
    };
    return map[name];
  };

  useEffect(() => {
    const fetchRoom = async () => {
      const docRef = doc(db, "rooms", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const roomData = { id: docSnap.id, ...docSnap.data() };
        const local = getLocalImagesForRoom(roomData.name);
        const merged = local && local.length > 0 ? { ...roomData, images: local } : roomData;
        setRoom(merged);
        if (merged.images && merged.images.length > 0) {
          setCurrentImage(merged.images[0]);
        } else {
          setCurrentImage("");
        }
      } else {
        navigate("/404");
      }
    };

    fetchRoom();
  }, [id, navigate]);

  const images = room?.images || [];
  const currentIndex = images.findIndex((img) => img === currentImage);

  const goPrev = useCallback(() => {
    if (!images.length) return;
    const idx = currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
    setCurrentImage(images[idx]);
  }, [images, currentIndex]);

  const goNext = useCallback(() => {
    if (!images.length) return;
    const idx = currentIndex === -1 || currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentImage(images[idx]);
  }, [images, currentIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (lightboxOpen) {
        if (e.key === 'Escape') setLightboxOpen(false);
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
      } else {
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext, lightboxOpen]);

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
        {images.length > 0 && (
          <div className="mb-8">
            {/* Main Image */}
            <div className="relative w-full h-96 mb-6 rounded-xl overflow-hidden shadow-2xl">
              {currentImage && (
                <img
                  src={currentImage}
                  alt={room.name}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onError={(e) => { e.currentTarget.src = "/assets/img/room/photo1.avif"; }}
                  onClick={() => setLightboxOpen(true)}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              {/* Nav arrows */}
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-dark p-2 rounded-full"
                onClick={goPrev}
                aria-label="Previous"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-dark p-2 rounded-full"
                onClick={goNext}
                aria-label="Next"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            
            {/* Thumbnails (minimal) */}
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border ${
                      currentImage === img ? 'border-primary ring-2 ring-primary/40' : 'border-gray-200'
                    }`}
                    onClick={() => { setCurrentImage(img); setLightboxOpen(true); }}
                    aria-label={`View ${room.name} ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${room.name} ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "/assets/img/room/photo1.avif"; }}
                    />
                  </button>
                ))}
              </div>
              {/* Image Counter */}
              <div className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                {(currentIndex >= 0 ? currentIndex + 1 : 0)} / {images.length}
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
            <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                className="absolute -top-10 right-0 text-white/80 hover:text-white text-3xl"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="relative">
                <img src={currentImage} alt={room.name} className="w-full max-h-[80vh] object-contain" />
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full"
                  aria-label="Previous"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full"
                  aria-label="Next"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
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
