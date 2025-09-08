import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Book() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/booking", {
      state: {
        checkIn,
        checkOut,
        adults: adults,
        children: children,
      },
    });
  };

  // Counter functions
  const incrementAdults = () => {
    if (adults < 6) setAdults(adults + 1);
  };

  const decrementAdults = () => {
    if (adults > 1) setAdults(adults - 1);
  };

  const incrementChildren = () => {
    if (children < 5) setChildren(children + 1);
  };

  const decrementChildren = () => {
    if (children > 0) setChildren(children - 1);
  };

  // Check if form is valid
  const isValid = checkIn && checkOut && checkOut > checkIn && adults;

  return (
    <div className="container mx-auto pb-5 px-4">
      <div className="bg-white shadow-lg p-8 rounded-lg border-t-4 border-primary">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="relative">
                <label className="block text-sm text-gray-600 mb-2">Check-In</label>
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
                <label className="block text-sm text-gray-600 mb-2">Check-Out</label>
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
                <label className="block text-sm text-gray-600 mb-2">Adults</label>
                <div className="flex items-center border border-light rounded-md h-[48px]">
                  <button
                    type="button"
                    onClick={decrementAdults}
                    disabled={adults <= 1}
                    className={`px-3 py-3 text-lg font-bold transition-colors h-full ${
                      adults <= 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-primary hover:bg-gray-100'
                    }`}
                  >
                    −
                  </button>
                  <div className="flex-1 text-center py-3 text-primary font-medium">
                    {adults} {adults === 1 ? 'Adult' : 'Adults'}
                  </div>
                  <button
                    type="button"
                    onClick={incrementAdults}
                    disabled={adults >= 6}
                    className={`px-3 py-3 text-lg font-bold transition-colors h-full ${
                      adults >= 6 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-primary hover:bg-gray-100'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Children</label>
                <div className="flex items-center border border-light rounded-md h-[48px]">
                  <button
                    type="button"
                    onClick={decrementChildren}
                    disabled={children <= 0}
                    className={`px-3 py-3 text-lg font-bold transition-colors h-full ${
                      children <= 0 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-primary hover:bg-gray-100'
                    }`}
                  >
                    −
                  </button>
                  <div className="flex-1 text-center py-3 text-primary font-medium">
                    {children} {children === 1 ? 'Child' : 'Children'}
                  </div>
                  <button
                    type="button"
                    onClick={incrementChildren}
                    disabled={children >= 5}
                    className={`px-3 py-3 text-lg font-bold transition-colors h-full ${
                      children >= 5 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-primary hover:bg-gray-100'
                    }`}
                  >
                    +
                  </button>
                </div>
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
