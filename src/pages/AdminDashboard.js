import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from "firebase/firestore";
import Heading from "../components/common/Heading";
import AdminSidebar from "../components/admin/AdminSidebar";
import BookingManagement from "../components/admin/BookingManagement";
import RoomManagement from "../components/admin/RoomManagement";
import DashboardStats from "../components/admin/DashboardStats";
import MessageManagement from "../components/admin/MessageManagement";
import NewsletterManagement from "../components/admin/NewsletterManagement";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    totalRooms: 0,
    totalMessages: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch bookings
      const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);

      // Fetch rooms
      const roomsSnapshot = await getDocs(collection(db, "rooms"));
      const roomsData = roomsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRooms(roomsData);

      // Fetch messages
      const messagesSnapshot = await getDocs(collection(db, "contactMessages"));
      const messagesData = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate stats
      const totalBookings = bookingsData.length;
      const pendingBookings = bookingsData.filter(booking => 
        new Date(booking.checkOutDate) > new Date()
      ).length;
      const completedBookings = totalBookings - pendingBookings;
      const totalRevenue = bookingsData.reduce((sum, booking) => {
        const nights = Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24));
        return sum + (booking.roomPrice * nights);
      }, 0);

      setStats({
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue: totalRevenue.toFixed(2),
        totalRooms: roomsData.length,
        totalMessages: messagesData.length,
        unreadMessages: messagesData.filter(message => message.status === 'new').length
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingUpdate = async (bookingId, updates) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), updates);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const handleBookingDelete = async (bookingId) => {
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      await fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    navigate("/admin/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardStats stats={stats} bookings={bookings} rooms={rooms} />;
      case "bookings":
        return (
          <BookingManagement 
            bookings={bookings}
            rooms={rooms}
            onUpdate={handleBookingUpdate}
            onDelete={handleBookingDelete}
            onRefresh={fetchData}
          />
        );
      case "rooms":
        return <RoomManagement rooms={rooms} onRefresh={fetchData} />;
      case "messages":
        return <MessageManagement onRefresh={fetchData} />;
      case "newsletter":
        return <NewsletterManagement onRefresh={fetchData} />;
      default:
        return <DashboardStats stats={stats} bookings={bookings} rooms={rooms} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header with menu button */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-primary">Admin Panel</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Desktop heading - hidden on mobile */}
      <div className="hidden lg:block">
        <Heading heading="Admin Dashboard" title="NaumApartments" subtitle="Management" />
      </div>

      <div className="flex relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
              <AdminSidebar 
                activeTab={activeTab} 
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setSidebarOpen(false); // Close sidebar on mobile when tab is selected
                }} 
                onLogout={handleLogout}
                isMobile={true}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 lg:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
