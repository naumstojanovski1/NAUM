import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, getDoc, doc, query, where, getDocs } from "firebase/firestore";

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guest, setGuest] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [roomBookings, setRoomBookings] = useState([]);

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

    const fetchRoomBookings = async () => {
      if (id) {
        const q = query(collection(db, "bookings"), where("roomId", "==", id));
        const querySnapshot = await getDocs(q);
        setRoomBookings(querySnapshot.docs.map(docSnap => docSnap.data()));
      }
    };

    fetchRoom();
    fetchRoomBookings();
  }, [id, navigate]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const ms = outDate - inDate;
    const d = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return Number.isFinite(d) && d > 0 ? d : 0;
  }, [checkIn, checkOut]);

  const isOverlapping = (start1, end1, start2, end2) => (start1 < end2 && start2 < end1);

  const isSelectedDatesAvailable = useMemo(() => {
    if (nights <= 0) return false;

    const requestedCheckIn = new Date(checkIn);
    const requestedCheckOut = new Date(checkOut);

    const hasOverlap = roomBookings.some(booking => {
      const existingCheckIn = new Date(booking.checkInDate);
      const existingCheckOut = new Date(booking.checkOutDate);
      return isOverlapping(requestedCheckIn, requestedCheckOut, existingCheckIn, existingCheckOut);
    });

    return !hasOverlap;
  }, [checkIn, checkOut, nights, roomBookings]);

  const handleBooking = () => {
    if (!isSelectedDatesAvailable) {
      alert("These dates are not available for booking. Please choose different dates.");
      return;
    }
    setShowBookingModal(true);
  };

  const handleModalConfirmBooking = async () => {
    if (!room || nights <= 0 || !isSelectedDatesAvailable) return;
    setSaving(true);

    try {
      console.log("Attempting to confirm booking...");
      const bookingData = {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guest,
        createdAt: new Date().toISOString(),
        roomId: room.id,
        roomName: room.name,
        roomPrice: room.price,
      };
      console.log("Booking data prepared:", bookingData);

      await addDoc(collection(db, "bookings"), bookingData);
      console.log("Booking successfully added to Firestore.");
      setSaving(false);
      setShowBookingModal(false);
      setShowBookingConfirmation(true);
    } catch (error) {
      console.error("Error adding booking to Firestore:", error);
      console.error("Error saving booking:", error);
      setSaving(false);
      alert("Error saving booking. Please try again.");
    }
  };

  if (!room) return <p className="text-center text-lg py-10 text-dark">Loading room details...</p>;

  return (
    <div className="container mx-auto py-12 px-4 bg-light">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto border-t-4 border-primary">
        <h1 className="text-4xl font-bold text-primary mb-6 text-center">{room.name}</h1>

        {/* Image Gallery */}
        {room.images && room.images.length > 0 && (
          <div className="mb-8">
            <div className="relative w-full h-96 mb-4 rounded-lg overflow-hidden shadow-md">
              <img src={currentImage} alt={room.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {room.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${room.name} ${index + 1}`}
                  className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 ${
                    currentImage === img ? 'border-primary' : 'border-transparent'
                  } hover:border-primary transition duration-200`}
                  onClick={() => setCurrentImage(img)}
                />
              ))}
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

        {/* Booking dates and guests */}
        <div className="bg-light p-4 rounded border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Check-in</label>
              <input type="date" className="w-full p-3 border rounded" value={checkIn} min={new Date().toISOString().split('T')[0]} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Check-out</label>
              <input type="date" className="w-full p-3 border rounded" value={checkOut} min={checkIn || new Date().toISOString().split('T')[0]} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <div className="flex items-end">
              <div className="w-full p-3 bg-white rounded border text-center font-semibold text-dark">{nights} night(s)</div>
            </div>
            <div className="flex items-end">
              <button
                className="w-full bg-primary text-white py-3 px-5 rounded-md hover:bg-secondary transition duration-300 disabled:opacity-60"
                disabled={nights <= 0 || !isSelectedDatesAvailable}
                onClick={handleBooking}
              >
                Continue
              </button>
            </div>
          </div>
          {nights > 0 && (
            <p className="mt-3 text-gray-700">
              Estimated total: <span className="font-semibold text-primary">${(room.price * nights).toFixed(2)}</span>
              {!isSelectedDatesAvailable && (
                <span className="text-secondary ml-3"> (Dates are not available)</span>
              )}
            </p>
          )}
        </div>

        {/* Guest Details Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-dark bg-opacity-75 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
              <h2 className="text-3xl font-bold text-dark mb-6 text-center">Guest Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">First name</label>
                  <input className="w-full p-3 border rounded" value={guest.firstName} onChange={(e) => setGuest({ ...guest, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Last name</label>
                  <input className="w-full p-3 border rounded" value={guest.lastName} onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input type="email" className="w-full p-3 border rounded" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                  <input className="w-full p-3 border rounded" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="bg-gray-300 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalConfirmBooking}
                  className="bg-primary text-white py-2 px-6 rounded-md hover:bg-secondary transition duration-300 disabled:opacity-60"
                  disabled={nights <= 0 || !(guest.firstName && guest.lastName && /.+@.+\..+/.test(guest.email) && guest.phone.length >= 6) || saving || !isSelectedDatesAvailable}
                >
                  {saving ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Confirmation Message */}
        {showBookingConfirmation && (
          <div className="fixed inset-0 bg-dark bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
              <i className="fa fa-check-circle text-green-500 text-6xl mb-4"></i>
              <h2 className="text-3xl font-bold text-dark mb-4">Booking Confirmed!</h2>
              <p className="text-lg text-gray-700 mb-4">
                Thank you for booking! We will contact <span className="font-bold">{guest.email}</span>.
              </p>
              <p className="text-md text-gray-600 mb-6 font-semibold">
                Payment is due upon arrival at the hotel.
              </p>
              <button
                onClick={() => {
                  setShowBookingConfirmation(false);
                  navigate("/rooms");
                }}
                className="bg-primary text-white py-2 px-6 rounded-md hover:bg-secondary transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
