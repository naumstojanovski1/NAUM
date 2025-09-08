import React, { useState } from "react";
import { doc, updateDoc, addDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNotification } from "../common/NotificationProvider";

export default function BookingManagement({ bookings, rooms, onUpdate, onDelete, onRefresh }) {
  const { showSuccess, showError, showWarning } = useNotification();
  const [editingBooking, setEditingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingsToDelete, setBookingsToDelete] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    guest: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    roomId: '',
    roomName: '',
    roomPrice: 0,
    totalCost: 0,
    specialRequests: '',
    bookingId: ''
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Phone number validation - only allow digits
  const handlePhoneChange = (value, isNewBooking = true) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (isNewBooking) {
      setNewBooking(prev => ({
        ...prev,
        guest: { ...prev.guest, phone: digitsOnly }
      }));
    } else {
      setEditingBooking(prev => ({
        ...prev,
        guest: { ...prev.guest, phone: digitsOnly }
      }));
    }
  };

  const getStatusColor = (checkOutDate) => {
    const today = new Date();
    const checkout = new Date(checkOutDate);
    if (checkout < today) return "bg-green-100 text-green-800";
    if (checkout > today) return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (checkOutDate) => {
    const today = new Date();
    const checkout = new Date(checkOutDate);
    if (checkout < today) return "Completed";
    if (checkout > today) return "Active";
    return "Checking Out";
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.bookingId && booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && new Date(booking.checkOutDate) > new Date()) ||
      (statusFilter === "completed" && new Date(booking.checkOutDate) <= new Date());
    
    return matchesSearch && matchesStatus;
  });

  // Reset selections when filters change
  React.useEffect(() => {
    setSelectedBookings([]);
    setSelectAll(false);
  }, [searchTerm, statusFilter]);

  const handleEdit = (booking) => {
    setEditingBooking({ ...booking });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingBooking) return;
    
    try {
      await onUpdate(editingBooking.id, {
        checkInDate: editingBooking.checkInDate,
        checkOutDate: editingBooking.checkOutDate,
        adults: editingBooking.adults,
        children: editingBooking.children,
        guest: editingBooking.guest
      });
      setEditingBooking(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating booking:", error);
      showError("Failed to update booking. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditingBooking(null);
    setShowEditModal(false);
  };

  const handleSingleDelete = (booking) => {
    setBookingsToDelete([booking]);
    setShowDeleteModal(true);
  };

  // Multiple selection functions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBookings([]);
      setSelectAll(false);
    } else {
      setSelectedBookings(filteredBookings.map(booking => booking.id));
      setSelectAll(true);
    }
  };

  const handleSelectBooking = (bookingId) => {
    if (selectedBookings.includes(bookingId)) {
      setSelectedBookings(selectedBookings.filter(id => id !== bookingId));
    } else {
      setSelectedBookings([...selectedBookings, bookingId]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedBookings.length === 0) return;
    
    // Get the booking details for the modal
    const bookingsDetails = filteredBookings.filter(booking => 
      selectedBookings.includes(booking.id)
    );
    
    setBookingsToDelete(bookingsDetails);
    setShowDeleteModal(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      // Delete all bookings in bookingsToDelete array
      for (const booking of bookingsToDelete) {
        await onDelete(booking.id);
      }
      setSelectedBookings([]);
      setSelectAll(false);
      setShowDeleteModal(false);
      setBookingsToDelete([]);
    } catch (error) {
      console.error("Error deleting bookings:", error);
      showError("Failed to delete bookings. Please try again.");
    }
  };

  const cancelDeleteSelected = () => {
    setShowDeleteModal(false);
    setBookingsToDelete([]);
  };

  // Generate booking ID function
  const generateBookingId = async () => {
    try {
      const bookingsQuery = query(
        collection(db, "bookings"), 
        orderBy("bookingId", "desc"), 
        limit(1)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      if (bookingsSnapshot.empty) {
        return "NA-000001";
      } else {
        const latestBooking = bookingsSnapshot.docs[0].data();
        const latestId = latestBooking.bookingId || "NA-000000";
        const numberPart = parseInt(latestId.split("-")[1]);
        const nextNumber = numberPart + 1;
        return `NA-${nextNumber.toString().padStart(6, '0')}`;
      }
    } catch (error) {
      console.error("Error generating booking ID:", error);
      return `NA-${Date.now().toString().slice(-6)}`;
    }
  };

  // Add new booking functions
  const handleAddBooking = () => {
    setShowAddModal(true);
    // Reset form
    setNewBooking({
      guest: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      checkInDate: '',
      checkOutDate: '',
      adults: 1,
      children: 0,
      roomId: '',
      roomName: '',
      roomPrice: 0,
      totalCost: 0,
      specialRequests: '',
      bookingId: ''
    });
  };

  const handleRoomChange = (roomId) => {
    const selectedRoom = rooms.find(room => room.id === roomId);
    if (selectedRoom) {
      setNewBooking(prev => ({
        ...prev,
        roomId: roomId,
        roomName: selectedRoom.name,
        roomPrice: selectedRoom.price
      }));
    }
  };

  const calculateTotalCost = () => {
    if (newBooking.checkInDate && newBooking.checkOutDate && newBooking.roomPrice) {
      const checkIn = new Date(newBooking.checkInDate);
      const checkOut = new Date(newBooking.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      return nights * newBooking.roomPrice;
    }
    return 0;
  };

  const handleSaveNewBooking = async () => {
    try {
      // Validation
      if (!newBooking.guest.firstName || !newBooking.guest.lastName || !newBooking.guest.email) {
        showWarning("Please fill in all required guest information");
        return;
      }
      if (!newBooking.checkInDate || !newBooking.checkOutDate) {
        showWarning("Please select check-in and check-out dates");
        return;
      }
      if (!newBooking.roomId) {
        showWarning("Please select a room");
        return;
      }

      // Generate booking ID
      const bookingId = await generateBookingId();
      
      // Calculate total cost
      const totalCost = calculateTotalCost();

      // Prepare booking data
      const bookingData = {
        ...newBooking,
        bookingId: bookingId,
        totalCost: totalCost,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      };

      // Add to Firebase
      await addDoc(collection(db, "bookings"), bookingData);
      
      // Refresh data
      onRefresh();
      
      // Close modal
      setShowAddModal(false);
      
      showSuccess("Booking added successfully!");
    } catch (error) {
      console.error("Error adding booking:", error);
      showError("Error adding booking. Please try again.");
    }
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setNewBooking({
      guest: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      checkInDate: '',
      checkOutDate: '',
      adults: 1,
      children: 0,
      roomId: '',
      roomName: '',
      roomPrice: 0,
      totalCost: 0,
      specialRequests: '',
      bookingId: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
          <p className="text-gray-600">Manage hotel bookings and reservations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddBooking}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium shadow-md"
          >
            ➕ Add New Booking
          </button>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedBookings.length > 0 && (
        <div className="bg-primary bg-opacity-10 border border-primary border-opacity-30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-primary font-medium">
                {selectedBookings.length} booking(s) selected
              </span>
              <button
                onClick={() => {
                  setSelectedBookings([]);
                  setSelectAll(false);
                }}
                className="text-primary hover:text-secondary text-sm font-medium"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium"
              >
                🗑️ Delete Selected ({selectedBookings.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Bookings
            </label>
            <input
              type="text"
              placeholder="Search by booking ID, guest name, email, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Bookings</option>
              <option value="active">Active Bookings</option>
              <option value="completed">Completed Bookings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 lg:px-6 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Select bookings using checkboxes to perform bulk actions. Use the checkbox in the header to select all visible bookings.
          </p>
        </div>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectAll && filteredBookings.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr 
                  key={booking.id} 
                  className={`hover:bg-gray-50 ${
                    selectedBookings.includes(booking.id) 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.id)}
                      onChange={() => handleSelectBooking(booking.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary">
                      {booking.bookingId || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.guest.firstName} {booking.guest.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{booking.guest.email}</div>
                      <div className="text-sm text-gray-500">{booking.guest.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.roomName}</div>
                    <div className="text-sm text-gray-500">${booking.roomPrice}/night</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24))} nights
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.adults} Adults, {booking.children} Children
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.checkOutDate)}`}>
                      {getStatusText(booking.checkOutDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="space-x-2">
                      <button
                        onClick={() => handleEdit(booking)}
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-secondary transition-colors font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleSingleDelete(booking)}
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-secondary transition-colors font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          <div className="p-4">
            {/* Select All for Mobile */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={selectAll && filteredBookings.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
            
            {/* Mobile Cards */}
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className={`border rounded-lg p-4 ${
                    selectedBookings.includes(booking.id) 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedBookings.includes(booking.id)}
                        onChange={() => handleSelectBooking(booking.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-primary">
                          {booking.bookingId || 'N/A'}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.checkOutDate)}`}>
                          {getStatusText(booking.checkOutDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Guest:</span>
                      <div className="text-sm text-gray-600">
                        {booking.guest.firstName} {booking.guest.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{booking.guest.email}</div>
                      <div className="text-sm text-gray-500">{booking.guest.phone}</div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Room:</span>
                      <div className="text-sm text-gray-600">{booking.roomName}</div>
                      <div className="text-sm text-gray-500">${booking.roomPrice}/night</div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Dates:</span>
                      <div className="text-sm text-gray-600">
                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24))} nights
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Guests:</span>
                      <div className="text-sm text-gray-600">
                        {booking.adults} Adults, {booking.children} Children
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(booking)}
                      className="px-3 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleSingleDelete(booking)}
                      className="px-3 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {filteredBookings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookings found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Edit Booking Modal */}
      {showEditModal && editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Booking</h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Booking ID (Read-only) */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Booking Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Booking ID:</strong> {editingBooking.bookingId || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Created:</strong> {formatDate(editingBooking.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Guest Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={editingBooking.guest.firstName}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          guest: { ...editingBooking.guest, firstName: e.target.value }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={editingBooking.guest.lastName}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          guest: { ...editingBooking.guest, lastName: e.target.value }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editingBooking.guest.email}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          guest: { ...editingBooking.guest, email: e.target.value }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={editingBooking.guest.phone}
                        onChange={(e) => handlePhoneChange(e.target.value, false)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter phone number (digits only)"
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                      <input
                        type="date"
                        value={editingBooking.checkInDate}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          checkInDate: e.target.value
                        })}
                        min={getTodayDate()}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                      <input
                        type="date"
                        value={editingBooking.checkOutDate}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          checkOutDate: e.target.value
                        })}
                        min={editingBooking.checkInDate || getTodayDate()}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
                      <select
                        value={editingBooking.adults}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          adults: parseInt(e.target.value)
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value={1}>1 Adult</option>
                        <option value={2}>2 Adults</option>
                        <option value={3}>3 Adults</option>
                        <option value={4}>4 Adults</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                      <select
                        value={editingBooking.children}
                        onChange={(e) => setEditingBooking({
                          ...editingBooking,
                          children: parseInt(e.target.value)
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value={0}>0 Children</option>
                        <option value={1}>1 Child</option>
                        <option value={2}>2 Children</option>
                        <option value={3}>3 Children</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Room Information (Read-only) */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Room Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Room:</strong> {editingBooking.roomName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Price:</strong> ${editingBooking.roomPrice}/night
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Total Nights:</strong> {Math.ceil((new Date(editingBooking.checkOutDate) - new Date(editingBooking.checkInDate)) / (1000 * 60 * 60 * 24))} nights
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Total Cost:</strong> ${(editingBooking.roomPrice * Math.ceil((new Date(editingBooking.checkOutDate) - new Date(editingBooking.checkInDate)) / (1000 * 60 * 60 * 24))).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookingsToDelete.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {bookingsToDelete.length === 1 ? 'Delete Booking' : `Delete ${bookingsToDelete.length} Bookings`}
                </h3>
                <button
                  onClick={cancelDeleteSelected}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {bookingsToDelete.length === 1 
                        ? 'Are you sure you want to delete this booking?' 
                        : `Are you sure you want to delete these ${bookingsToDelete.length} bookings?`
                      }
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      This action cannot be undone. All booking data will be permanently removed.
                    </p>
                  </div>
                </div>

                {/* List of bookings to be deleted */}
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {bookingsToDelete.length === 1 ? 'Booking to be deleted:' : 'Bookings to be deleted:'}
                  </h4>
                  <div className="space-y-2">
                    {bookingsToDelete.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.bookingId || 'N/A'} - {booking.guest.firstName} {booking.guest.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.roomName} • {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.checkOutDate)}`}>
                          {getStatusText(booking.checkOutDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={cancelDeleteSelected}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteSelected}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium shadow-md"
                >
                  {bookingsToDelete.length === 1 ? 'Delete Booking' : `Delete ${bookingsToDelete.length} Bookings`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Add New Booking</h3>
                <button
                  onClick={handleCancelAdd}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Guest Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={newBooking.guest.firstName}
                        onChange={(e) => setNewBooking(prev => ({
                          ...prev,
                          guest: { ...prev.guest, firstName: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={newBooking.guest.lastName}
                        onChange={(e) => setNewBooking(prev => ({
                          ...prev,
                          guest: { ...prev.guest, lastName: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newBooking.guest.email}
                      onChange={(e) => setNewBooking(prev => ({
                        ...prev,
                        guest: { ...prev.guest, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newBooking.guest.phone}
                      onChange={(e) => handlePhoneChange(e.target.value, true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number (digits only)"
                    />
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Booking Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-in Date *
                      </label>
                      <input
                        type="date"
                        value={newBooking.checkInDate}
                        onChange={(e) => setNewBooking(prev => ({
                          ...prev,
                          checkInDate: e.target.value
                        }))}
                        min={getTodayDate()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-out Date *
                      </label>
                      <input
                        type="date"
                        value={newBooking.checkOutDate}
                        onChange={(e) => setNewBooking(prev => ({
                          ...prev,
                          checkOutDate: e.target.value
                        }))}
                        min={newBooking.checkInDate || getTodayDate()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adults *
                      </label>
                      <select
                        value={newBooking.adults}
                        onChange={(e) => setNewBooking(prev => ({
                          ...prev,
                          adults: parseInt(e.target.value)
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1,2,3,4,5,6].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Children
                      </label>
                      <select
                        value={newBooking.children}
                        onChange={(e) => setNewBooking(prev => ({
                          ...prev,
                          children: parseInt(e.target.value)
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[0,1,2,3,4,5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room *
                    </label>
                    <select
                      value={newBooking.roomId}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a room</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name} - ${room.price}/night
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests
                    </label>
                    <textarea
                      value={newBooking.specialRequests}
                      onChange={(e) => setNewBooking(prev => ({
                        ...prev,
                        specialRequests: e.target.value
                      }))}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any special requests or notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              {newBooking.checkInDate && newBooking.checkOutDate && newBooking.roomId && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Booking Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Room:</span>
                      <p className="font-medium">{newBooking.roomName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Nights:</span>
                      <p className="font-medium">
                        {newBooking.checkInDate && newBooking.checkOutDate 
                          ? Math.ceil((new Date(newBooking.checkOutDate) - new Date(newBooking.checkInDate)) / (1000 * 60 * 60 * 24))
                          : 0
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Price per night:</span>
                      <p className="font-medium">${newBooking.roomPrice}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total cost:</span>
                      <p className="font-medium text-lg text-green-600">${calculateTotalCost()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={handleCancelAdd}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewBooking}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium shadow-md"
                >
                  ✅ Add Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
