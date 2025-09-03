import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Book() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/booking", {
      state: {
        checkIn,
        checkOut,
        adults: parseInt(adults, 10),
        children: parseInt(children, 10),
      },
    });
  };

  // Check if form is valid
  const isValid = checkIn && checkOut && checkOut > checkIn && adults;

  return (
    <div className="container mx-auto pb-5 px-4">
      <div className="bg-white shadow-lg p-8 rounded-lg border-t-4 border-primary">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <input
                  type="date"
                  className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary placeholder-gray-500"
                  placeholder="Check In Date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary placeholder-gray-500"
                  placeholder="Check Out Date"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div>
                <select
                  className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                >
                  <option value="">Guests</option>
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                </select>
              </div>
              <div>
                <select
                  className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary"
                  value={children}
                  onChange={(e) => setChildren(e.target.value)}
                >
                  <option value="">Children</option>
                  <option value="0">0 Children</option>
                  <option value="1">1 Child</option>
                  <option value="2">2 Children</option>
                  <option value="3">3 Children</option>
                </select>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full py-3 px-5 rounded-md transition duration-300 transform hover:scale-105 ${
                isValid 
                  ? 'bg-primary text-white hover:bg-secondary' 
                  : 'bg-primary/50 text-white cursor-not-allowed'
              }`}
            >
              Find Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
