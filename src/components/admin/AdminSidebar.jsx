import React from "react";

export default function AdminSidebar({ activeTab, setActiveTab, onLogout, isMobile = false, onClose }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "bookings", label: "Bookings", icon: "📅" },
    { id: "rooms", label: "Rooms", icon: "🏠" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "newsletter", label: "Newsletter", icon: "📧" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
            <p className="text-sm text-gray-600">NaumApartments</p>
          </div>
          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <nav className="mt-6 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
              activeTab === item.id
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="mt-auto p-6 border-t border-gray-200">
        <button
          onClick={() => window.location.href = "/"}
          className="w-full flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200 mb-2"
        >
          <span className="mr-3">🏠</span>
          Back to Website
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
        >
          <span className="mr-3">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
}
