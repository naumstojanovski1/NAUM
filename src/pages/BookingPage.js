import React, { useEffect, useMemo, useState } from "react";
import Heading from "../components/common/Heading";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export default function Booking() {
  const location = useLocation();
  const searchParams = location.state || {};
  const { checkIn, checkOut, adults = 1, children = 0 } = searchParams;
  const [checkInDate, setCheckInDate] = useState(checkIn || "");
  const [checkOutDate, setCheckOutDate] = useState(checkOut || "");
  const [numAdults, setNumAdults] = useState(adults || 1);
  const [numChildren, setNumChildren] = useState(children || 0);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const [previewRoom, setPreviewRoom] = useState(null);
  const [guest, setGuest] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    const ms = outDate - inDate;
    const d = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return Number.isFinite(d) && d > 0 ? d : 0;
  }, [checkInDate, checkOutDate]);

  const isOverlapping = (start1, end1, start2, end2) => (start1 < end2 && start2 < end1);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const roomsSnapshot = await getDocs(collection(db, "rooms"));
      let allRooms = roomsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

      let filteredRooms = allRooms;

      if (checkInDate && checkOutDate) {
        const requestedCheckIn = new Date(checkInDate);
        const requestedCheckOut = new Date(checkOutDate);

        // Fetch all bookings from the 'bookings' collection
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        const allBookings = bookingsSnapshot.docs.map(docSnap => docSnap.data());

        filteredRooms = allRooms.filter(room => {
          const meetsOccupancy = (!room.maxOccupancy || (room.maxOccupancy.adults >= numAdults && (room.maxOccupancy.children ? room.maxOccupancy.children >= numChildren : true)));
          if (!meetsOccupancy) return false;

          // Check for overlapping bookings for the current room
          const roomBookings = allBookings.filter(booking => booking.roomId === room.id);
          const hasOverlap = roomBookings.some(booking => {
            const existingCheckIn = new Date(booking.checkInDate);
            const existingCheckOut = new Date(booking.checkOutDate);
            return isOverlapping(requestedCheckIn, requestedCheckOut, existingCheckIn, existingCheckOut);
          });
          return !hasOverlap;
        });
      }
      setRooms(filteredRooms);
      setLoading(false);
    };
    fetchRooms();
  }, [checkInDate, checkOutDate, numAdults, numChildren]);

  const canSubmit = guest.firstName && guest.lastName && /.+@.+\..+/.test(guest.email) && guest.phone.length >= 6;

  const reserveRoom = async () => {
    if (!activeRoom || nights <= 0) return;
    setSaving(true);
    
    try {
      const bookingData = {
        checkInDate,
        checkOutDate,
        adults: numAdults,
        children: numChildren,
        guest,
        createdAt: new Date().toISOString(),
        roomId: activeRoom.id, // Add roomId to the booking data
        roomName: activeRoom.name, // Add room name
        roomPrice: activeRoom.price, // Add room price
      };
      
      // Save the booking to the "bookings" collection
      await addDoc(collection(db, "bookings"), bookingData);
      
      setSaving(false);
      setActiveRoom(null);
      setBookingDetails({
        room: activeRoom.name,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: nights,
        total: (activeRoom.price * nights).toFixed(2),
        guest: guest
      });
      setShowSuccess(true);
    } catch (error) {
      console.error("Error saving booking:", error);
      setSaving(false);
      alert("Error saving booking. Please try again.");
    }
  };

  return (
    <div>
      <Heading heading="Book Your Stay" title="NaumApartments" subtitle="Reservation" />
      <div className="container mx-auto py-10 px-4">
        {/* Date & Guests Form (styled like home form) */}
        <div className="bg-white shadow-lg p-8 rounded-lg border-t-4 border-primary max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-primary mb-1">Check-in</label>
              <input type="date" className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary" value={checkInDate} min={todayStr} onChange={(e) => setCheckInDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-primary mb-1">Check-out</label>
              <input type="date" className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary" value={checkOutDate} min={checkInDate || todayStr} onChange={(e) => setCheckOutDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-primary mb-1">Adults</label>
              <select className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary" value={numAdults} onChange={(e) => setNumAdults(parseInt(e.target.value, 10))}>
                <option value={1}>1 Adult</option>
                <option value={2}>2 Adults</option>
                <option value={3}>3 Adults</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-primary mb-1">Children</label>
              <select className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary" value={numChildren} onChange={(e) => setNumChildren(parseInt(e.target.value, 10))}>
                <option value={0}>0 Children</option>
                <option value={1}>1 Child</option>
                <option value={2}>2 Children</option>
                <option value={3}>3 Children</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="w-full p-3 bg-light rounded border border-light text-center font-semibold text-dark">{nights} night(s)</div>
            </div>
          </div>
        </div>

        {(!checkInDate || !checkOutDate || nights <= 0) ? (
          <p className="text-center text-secondary">Please select valid dates to see available rooms.</p>
        ) : (
          <>
            {loading ? (
              <p className="text-center text-dark">Loading available rooms...</p>
            ) : rooms.length === 0 ? (
              <p className="text-center text-dark">No rooms available for your selected dates.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map(room => (
                  <div key={room.id} className="bg-white shadow rounded overflow-hidden border-t-4 border-primary">
                    {room.images && room.images.length > 0 && (
                      <img className="w-full h-56 object-cover" src={room.images[0]} alt={room.name} />
                    )}
                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-primary">{room.name}</h3>
                      <p className="text-gray-700 mb-2">${room.price} / night</p>
                      <div className="mt-3 p-3 bg-light rounded border border-gray-100">
                        <div className="flex justify-between text-gray-700"><span>Nights</span><span>{nights}</span></div>
                        <div className="flex justify-between text-gray-700"><span>Total</span><span className="font-semibold text-primary">${(room.price * nights).toFixed(2)}</span></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                          className="w-full bg-white border text-dark py-2 rounded hover:bg-gray-50"
                          onClick={() => setPreviewRoom(room)}
                        >
                          View details
                        </button>
                        <button
                          className="w-full bg-primary text-white py-2 rounded hover:bg-secondary"
                          onClick={() => setActiveRoom(room)}
                        >
                          Reserve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {activeRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b">
              <h4 className="text-lg font-semibold text-dark">Reservation details for {activeRoom.name}</h4>
              <p className="text-sm text-gray-600">{checkInDate} → {checkOutDate} • {nights} night(s)</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">First name</label>
                  <input className="w-full p-3 border rounded" value={guest.firstName} onChange={(e) => setGuest({ ...guest, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Last name</label>
                  <input className="w-full p-3 border rounded" value={guest.lastName} onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input type="email" className="w-full p-3 border rounded" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input className="w-full p-3 border rounded" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Total</span>
                <span className="font-semibold text-primary">${(activeRoom.price * nights).toFixed(2)}</span>
              </div>
            </div>
            <div className="p-5 border-t flex gap-3 justify-end">
              <button className="px-4 py-2 rounded border" onClick={() => setActiveRoom(null)}>Cancel</button>
              <button
                className="px-4 py-2 rounded bg-primary text-white disabled:opacity-60"
                disabled={!canSubmit || saving}
                onClick={reserveRoom}
              >
                {saving ? "Saving..." : "Confirm Reservation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex justify-between items-center">
              <h4 className="text-lg font-semibold text-dark">{previewRoom.name}</h4>
              <button className="text-gray-500 hover:text-dark" onClick={() => setPreviewRoom(null)}>
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            {previewRoom.images && previewRoom.images.length > 0 && (
              <div className="w-full h-72 overflow-hidden">
                <img className="w-full h-full object-cover" src={previewRoom.images[0]} alt={previewRoom.name} />
              </div>
            )}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewRoom.description && (
                <p className="text-gray-700">{previewRoom.description}</p>
              )}
              <div>
                {previewRoom.maxOccupancy && (
                  <div className="mb-3">
                    <h5 className="font-semibold text-dark mb-1">Max Occupancy</h5>
                    <p className="text-gray-600">Adults: {previewRoom.maxOccupancy.adults}</p>
                    {previewRoom.maxOccupancy.children > 0 && (
                      <p className="text-gray-600">Children: {previewRoom.maxOccupancy.children}</p>
                    )}
                  </div>
                )}
                {previewRoom.amenities && previewRoom.amenities.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-dark mb-1">Amenities</h5>
                    <ul className="list-disc list-inside text-gray-600">
                      {previewRoom.amenities.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 border-t flex gap-3 justify-end">
              <button className="px-4 py-2 rounded border" onClick={() => setPreviewRoom(null)}>Close</button>
              <button className="px-4 py-2 rounded bg-primary text-white" onClick={() => { setActiveRoom(previewRoom); setPreviewRoom(null); }}>Reserve</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Modal */}
      {showSuccess && bookingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Reservation Confirmed!</h3>
              <p className="text-gray-600 mb-6">Your booking has been successfully saved.</p>
              
              <div className="bg-light rounded-lg p-4 mb-6 text-left">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-semibold text-primary">{bookingDetails.room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-semibold">{bookingDetails.checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-semibold">{bookingDetails.checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-semibold">{bookingDetails.nights}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 font-semibold">Total:</span>
                    <span className="font-bold text-primary text-lg">${bookingDetails.total}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mb-6">
                <p>Confirmation sent to: <span className="font-semibold text-primary">{bookingDetails.guest.email}</span></p>
              </div>
              
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setBookingDetails(null);
                  setGuest({ firstName: "", lastName: "", email: "", phone: "" });
                }}
                className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-secondary transition duration-300 transform hover:scale-105"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
