import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import CommonHeading from "../common/CommonHeading";

export default function Rooms({ limit }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "rooms"));
      let allRooms = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      
      if (limit && allRooms.length > limit) {
        setRooms(allRooms.slice(-limit)); // Get the last 'limit' rooms
      } else {
        setRooms(allRooms);
      }
      setLoading(false);
    };
    fetchRooms();
  }, [limit]);

  if (loading) {
    return <p className="text-center text-lg py-10 text-luxury">Loading our cozy rooms...</p>;
  }

  return (
    <div className="container mx-auto py-12 px-4 bg-light">
      <div className="container">
        <CommonHeading
          heading="Our Cozy Rooms"
          title="Comfort Awaits"
          subtitle="Explore Our"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((item) => (
            <div 
              key={item.id} 
              className="shadow-lg rounded-lg overflow-hidden bg-white transform animate-fadeIn hover:scale-105 transition duration-300 cursor-pointer"
              onClick={() => navigate(`/rooms/${item.id}`)}
            >
              <div className="relative h-60 w-full">
                {item.images && item.images.length > 0 && (
                  <img className="w-full h-full object-cover" src={item.images[0]} alt={`CozyStay Room: ${item.name}`} />
                )}
                <small className="absolute bottom-0 left-0 transform translate-y-1/2 bg-primary text-white rounded py-1 px-3 ml-4 text-lg font-bold">
                  ${item.price}/night
                </small>
              </div>
              <div className="p-4 mt-2">
                <div className="flex justify-between mb-3">
                  <h5 className="text-xl font-semibold text-primary mb-0">{item.name}</h5>
                  {/* Displaying stars, assuming item.star is an array of star icons */}
                  <div className="pl-2 text-secondary text-lg flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className={`fa fa-star ${i < 5 ? 'text-secondary' : 'text-gray-300'}`}></i>
                    ))}
                  </div>
                </div>
                <div className="flex mb-3 space-x-3 text-gray-600">
                  {/* Displaying max occupancy instead of facility */}
                  {item.maxOccupancy && (
                    <>
                      <small className="pr-3 border-r border-light last:border-r-0">
                        <i className="fa fa-user text-primary me-2"></i>
                        {item.maxOccupancy.adults} Adult{item.maxOccupancy.adults > 1 ? 's' : ''}
                      </small>
                      {item.maxOccupancy.children > 0 && (
                        <small className="pr-3 border-r border-light last:border-r-0">
                          <i className="fa fa-child text-primary me-2"></i>
                          {item.maxOccupancy.children} Child{item.maxOccupancy.children > 1 ? 'ren' : ''}
                        </small>
                      )}
                    </>
                  )}
                </div>
                <p className="text-gray-600 mb-3 text-base leading-relaxed">{item.description}</p>
                <div className="flex justify-left ">
                  <span className="inline-block bg-primary text-white py-2 px-4 rounded-md  text-sm transform hover:bg-secondary transition duration-200">
                    View Details
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
