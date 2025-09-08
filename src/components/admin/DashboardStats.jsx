import React from "react";

export default function DashboardStats({ stats, bookings, rooms }) {
  const recentBookings = bookings.slice(0, 5);
  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.checkInDate) > new Date()
  ).slice(0, 5);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-full">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full">
              <span className="text-2xl">💬</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              {stats.unreadMessages > 0 && (
                <p className="text-xs text-red-600 font-medium">{stats.unreadMessages} unread</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings and Upcoming Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="p-6">
            {recentBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent bookings</p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.guest.firstName} {booking.guest.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{booking.roomName}</p>
                      <p className="text-xs text-primary font-medium">{booking.bookingId || 'N/A'}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.checkOutDate)}`}>
                      {getStatusText(booking.checkOutDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h3>
          </div>
          <div className="p-6">
            {upcomingBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming bookings</p>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.guest.firstName} {booking.guest.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{booking.roomName}</p>
                      <p className="text-xs text-primary font-medium">{booking.bookingId || 'N/A'}</p>
                      <p className="text-xs text-gray-500">
                        Check-in: {formatDate(booking.checkInDate)}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Upcoming
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
