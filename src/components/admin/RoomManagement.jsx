import React, { useState } from "react";
import { doc, updateDoc, deleteDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import { useNotification } from "../common/NotificationProvider";

export default function RoomManagement({ rooms, onRefresh }) {
  const { showSuccess, showError, showWarning } = useNotification();
  const [editingRoom, setEditingRoom] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    price: "",
    maxOccupancy: { adults: 2, children: 2 },
    amenities: [],
    images: []
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editingAmenity, setEditingAmenity] = useState("");
  const [editingImageUrl, setEditingImageUrl] = useState("");

  const commonAmenities = [
    "WiFi", "Air Conditioning", "TV", "Private Bathroom", "Kitchen", 
    "Balcony", "Parking", "Pool", "Gym", "Breakfast", "Room Service",
    "Mini Bar", "Safe", "Hair Dryer", "Iron", "Desk", "Wardrobe"
  ];

  const handleEdit = (room) => {
    setEditingRoom({ ...room });
  };

  const handleSave = async () => {
    if (!editingRoom) return;
    
    try {
      await updateDoc(doc(db, "rooms", editingRoom.id), {
        name: editingRoom.name,
        description: editingRoom.description,
        price: parseFloat(editingRoom.price),
        maxOccupancy: editingRoom.maxOccupancy,
        amenities: editingRoom.amenities,
        images: editingRoom.images
      });
      setEditingRoom(null);
      onRefresh();
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  const handleCancel = () => {
    setEditingRoom(null);
  };

  const handleDelete = (room) => {
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const confirmDeleteRoom = async () => {
    try {
      await deleteDoc(doc(db, "rooms", roomToDelete.id));
      onRefresh();
      setShowDeleteModal(false);
      setRoomToDelete(null);
      showSuccess("Room deleted successfully!");
    } catch (error) {
      console.error("Error deleting room:", error);
      showError("Failed to delete room. Please try again.");
    }
  };

  const cancelDeleteRoom = () => {
    setShowDeleteModal(false);
    setRoomToDelete(null);
  };

  const handleAddRoom = async () => {
    if (!newRoom.name || !newRoom.description || !newRoom.price) {
      showWarning("Please fill in all required fields");
      return;
    }

    try {
      await addDoc(collection(db, "rooms"), {
        ...newRoom,
        price: parseFloat(newRoom.price)
      });
      setNewRoom({
        name: "",
        description: "",
        price: "",
        maxOccupancy: { adults: 2, children: 2 },
        amenities: [],
        images: []
      });
      setShowAddForm(false);
      onRefresh();
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  const addAmenity = (room, amenity) => {
    if (!room.amenities.includes(amenity) && amenity.trim()) {
      const updatedRoom = {
        ...room,
        amenities: [...room.amenities, amenity.trim()]
      };
      setEditingRoom(updatedRoom);
    }
  };

  const removeAmenity = (room, amenity) => {
    const updatedRoom = {
      ...room,
      amenities: room.amenities.filter(a => a !== amenity)
    };
    setEditingRoom(updatedRoom);
  };

  const addImage = (room, imageUrl) => {
    if (imageUrl.trim() && !room.images.includes(imageUrl.trim())) {
      const updatedRoom = {
        ...room,
        images: [...room.images, imageUrl.trim()]
      };
      setEditingRoom(updatedRoom);
    }
  };

  const removeImage = (room, imageUrl) => {
    const updatedRoom = {
      ...room,
      images: room.images.filter(img => img !== imageUrl)
    };
    setEditingRoom(updatedRoom);
  };

  const addNewRoomAmenity = () => {
    if (newAmenity.trim() && !newRoom.amenities.includes(newAmenity.trim())) {
      setNewRoom({
        ...newRoom,
        amenities: [...newRoom.amenities, newAmenity.trim()]
      });
      setNewAmenity("");
    }
  };

  const removeNewRoomAmenity = (amenity) => {
    setNewRoom({
      ...newRoom,
      amenities: newRoom.amenities.filter(a => a !== amenity)
    });
  };

  const addNewRoomImage = () => {
    if (newImageUrl.trim() && !newRoom.images.includes(newImageUrl.trim())) {
      setNewRoom({
        ...newRoom,
        images: [...newRoom.images, newImageUrl.trim()]
      });
      setNewImageUrl("");
    }
  };

  const removeNewRoomImage = (imageUrl) => {
    setNewRoom({
      ...newRoom,
      images: newRoom.images.filter(img => img !== imageUrl)
    });
  };

  return (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
         <button
           onClick={() => setShowAddForm(true)}
           className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors shadow-md font-medium"
         >
           ➕ Add New Room
         </button>
       </div>

      {/* Add Room Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Add New Room</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Name *</label>
              <input
                type="text"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Deluxe Suite"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price per Night *</label>
              <input
                type="number"
                value={newRoom.price}
                onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe the room..."
              />
            </div>
            
            {/* Max Occupancy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Adults</label>
              <select
                value={newRoom.maxOccupancy.adults}
                onChange={(e) => setNewRoom({
                  ...newRoom,
                  maxOccupancy: { ...newRoom.maxOccupancy, adults: parseInt(e.target.value) }
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Children</label>
              <select
                value={newRoom.maxOccupancy.children}
                onChange={(e) => setNewRoom({
                  ...newRoom,
                  maxOccupancy: { ...newRoom.maxOccupancy, children: parseInt(e.target.value) }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={0}>0 Children</option>
                <option value={1}>1 Child</option>
                <option value={2}>2 Children</option>
                <option value={3}>3 Children</option>
                <option value={4}>4 Children</option>
              </select>
            </div>

            {/* Amenities */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                             <div className="flex gap-2 mb-2">
                 <input
                   type="text"
                   value={newAmenity}
                   onChange={(e) => setNewAmenity(e.target.value)}
                   className="flex-1 p-2 border border-gray-300 rounded text-sm"
                   placeholder="Type amenity name here..."
                 />
                 <button
                   onClick={addNewRoomAmenity}
                   className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium"
                 >
                   ➕ Add
                 </button>
               </div>
              
              {/* Common Amenities */}
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Quick add common amenities:</p>
                <div className="flex flex-wrap gap-1">
                  {commonAmenities.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => {
                        if (!newRoom.amenities.includes(amenity)) {
                          setNewRoom({
                            ...newRoom,
                            amenities: [...newRoom.amenities, amenity]
                          });
                        }
                      }}
                      disabled={newRoom.amenities.includes(amenity)}
                      className={`px-2 py-1 text-xs rounded ${
                        newRoom.amenities.includes(amenity)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Amenities */}
              {newRoom.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {newRoom.amenities.map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-primary text-white text-xs rounded flex items-center gap-1">
                      {amenity}
                      <button
                        onClick={() => removeNewRoomAmenity(amenity)}
                        className="text-white hover:text-red-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Images */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Images</label>
                             <div className="flex gap-2 mb-2">
                 <input
                   type="url"
                   value={newImageUrl}
                   onChange={(e) => setNewImageUrl(e.target.value)}
                   className="flex-1 p-2 border border-gray-300 rounded text-sm"
                   placeholder="Paste image URL here..."
                 />
                 <button
                   onClick={addNewRoomImage}
                   className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium"
                 >
                   🖼️ Add
                 </button>
               </div>
              
              {/* Image Preview */}
              {newRoom.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {newRoom.images.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Room ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150x100?text=Image+Error";
                        }}
                      />
                      <button
                        onClick={() => removeNewRoomImage(imageUrl)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
                     <div className="flex justify-end space-x-3 mt-6">
             <button
               onClick={() => setShowAddForm(false)}
               className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
             >
               Cancel
             </button>
             <button
               onClick={handleAddRoom}
               className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium shadow-md"
             >
               ✅ Add Room
             </button>
           </div>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {room.images && room.images.length > 0 && (
              <img 
                className="w-full h-48 object-cover" 
                src={room.images[0]} 
                alt={room.name} 
              />
            )}
            <div className="p-6">
                             {editingRoom?.id === room.id ? (
                 <div className="space-y-4">
                   <input
                     type="text"
                     value={editingRoom.name}
                     onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                     className="w-full p-2 border border-gray-300 rounded text-sm font-semibold"
                     placeholder="Room name"
                   />
                   <input
                     type="number"
                     value={editingRoom.price}
                     onChange={(e) => setEditingRoom({ ...editingRoom, price: e.target.value })}
                     className="w-full p-2 border border-gray-300 rounded text-sm"
                     placeholder="Price per night"
                     min="0"
                     step="0.01"
                   />
                   <textarea
                     value={editingRoom.description}
                     onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                     rows={3}
                     className="w-full p-2 border border-gray-300 rounded text-sm"
                     placeholder="Room description"
                   />
                   
                   {/* Max Occupancy */}
                   <div className="grid grid-cols-2 gap-2">
                     <select
                       value={editingRoom.maxOccupancy?.adults || 2}
                       onChange={(e) => setEditingRoom({
                         ...editingRoom,
                         maxOccupancy: { ...editingRoom.maxOccupancy, adults: parseInt(e.target.value) }
                       })}
                       className="w-full p-2 border border-gray-300 rounded text-sm"
                     >
                       <option value={1}>1 Adult</option>
                       <option value={2}>2 Adults</option>
                       <option value={3}>3 Adults</option>
                       <option value={4}>4 Adults</option>
                     </select>
                     <select
                       value={editingRoom.maxOccupancy?.children || 2}
                       onChange={(e) => setEditingRoom({
                         ...editingRoom,
                         maxOccupancy: { ...editingRoom.maxOccupancy, children: parseInt(e.target.value) }
                       })}
                       className="w-full p-2 border border-gray-300 rounded text-sm"
                     >
                       <option value={0}>0 Children</option>
                       <option value={1}>1 Child</option>
                       <option value={2}>2 Children</option>
                       <option value={3}>3 Children</option>
                       <option value={4}>4 Children</option>
                     </select>
                   </div>

                                       {/* Amenities */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Amenities</label>
                      <div className="flex gap-1 mb-2">
                        <input
                          type="text"
                          value={editingAmenity}
                          onChange={(e) => setEditingAmenity(e.target.value)}
                          placeholder="Type amenity name here..."
                          className="flex-1 p-2 border border-gray-300 rounded text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && editingAmenity.trim()) {
                              addAmenity(editingRoom, editingAmenity);
                              setEditingAmenity('');
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (editingAmenity.trim()) {
                              addAmenity(editingRoom, editingAmenity);
                              setEditingAmenity('');
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium"
                        >
                          ➕ Add
                        </button>
                      </div>
                      
                      {/* Common Amenities */}
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Quick add:</p>
                        <div className="flex flex-wrap gap-1">
                          {commonAmenities.slice(0, 8).map((amenity) => (
                            <button
                              key={amenity}
                              onClick={() => addAmenity(editingRoom, amenity)}
                              disabled={editingRoom.amenities?.includes(amenity)}
                              className={`px-1 py-0.5 text-xs rounded ${
                                editingRoom.amenities?.includes(amenity)
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {amenity}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Selected Amenities */}
                      {editingRoom.amenities && editingRoom.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {editingRoom.amenities.map((amenity, index) => (
                            <span key={index} className="px-2 py-1 bg-primary text-white text-xs rounded flex items-center gap-1">
                              {amenity}
                              <button
                                onClick={() => removeAmenity(editingRoom, amenity)}
                                className="text-white hover:text-red-200"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Images</label>
                      <div className="flex gap-1 mb-2">
                        <input
                          type="url"
                          value={editingImageUrl}
                          onChange={(e) => setEditingImageUrl(e.target.value)}
                          placeholder="Paste image URL here..."
                          className="flex-1 p-2 border border-gray-300 rounded text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && editingImageUrl.trim()) {
                              addImage(editingRoom, editingImageUrl);
                              setEditingImageUrl('');
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (editingImageUrl.trim()) {
                              addImage(editingRoom, editingImageUrl);
                              setEditingImageUrl('');
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium"
                        >
                          🖼️ Add
                        </button>
                      </div>
                      
                      {/* Image Preview */}
                      {editingRoom.images && editingRoom.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-1">
                          {editingRoom.images.map((imageUrl, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Room ${index + 1}`}
                                className="w-full h-16 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/100x64?text=Error";
                                }}
                              />
                              <button
                                onClick={() => removeImage(editingRoom, imageUrl)}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                                       <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="flex-1 px-3 py-2 bg-primary text-white rounded text-sm hover:bg-secondary transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                 </div>
              ) : (
                                 <div>
                   <h3 className="text-xl font-semibold text-gray-900 mb-2">{room.name}</h3>
                   <p className="text-lg font-bold text-primary mb-2">${room.price}/night</p>
                   <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                   
                   <div className="mb-4">
                     <p className="text-sm text-gray-500 mb-2">Max Occupancy:</p>
                     <p className="text-sm">{room.maxOccupancy?.adults || 2} Adults, {room.maxOccupancy?.children || 2} Children</p>
                   </div>

                   {room.amenities && room.amenities.length > 0 && (
                     <div className="mb-4">
                       <p className="text-sm text-gray-500 mb-2">Amenities:</p>
                       <div className="flex flex-wrap gap-1">
                         {room.amenities.map((amenity, index) => (
                           <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                             {amenity}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}

                   {room.images && room.images.length > 0 && (
                     <div className="mb-4">
                       <p className="text-sm text-gray-500 mb-2">Images ({room.images.length}):</p>
                       <div className="grid grid-cols-3 gap-1">
                         {room.images.slice(0, 3).map((imageUrl, index) => (
                           <img
                             key={index}
                             src={imageUrl}
                             alt={`Room ${index + 1}`}
                             className="w-full h-16 object-cover rounded"
                             onError={(e) => {
                               e.target.src = "https://via.placeholder.com/100x64?text=No+Image";
                             }}
                           />
                         ))}
                         {room.images.length > 3 && (
                           <div className="w-full h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                             +{room.images.length - 3} more
                           </div>
                         )}
                       </div>
                     </div>
                   )}

                                       <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => handleEdit(room)}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-secondary transition-colors shadow-md"
                      >
                        ✏️ Edit Room
                      </button>
                      <button
                        onClick={() => handleDelete(room)}
                        className="flex-1 px-4 py-3 bg-red-600 text-black rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-md"
                      >
                        🗑️ Delete Room
                      </button>
                    </div>
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No rooms found. Add your first room to get started.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roomToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Delete Room</h3>
                <button
                  onClick={cancelDeleteRoom}
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
                      Are you sure you want to delete this room?
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      This action cannot be undone. All room data will be permanently removed.
                    </p>
                  </div>
                </div>

                {/* Room details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Room to be deleted:</h4>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{roomToDelete.name}</p>
                    <p className="text-sm text-gray-600">{roomToDelete.description}</p>
                    <p className="text-sm text-gray-600">Price: ${roomToDelete.price}/night</p>
                    <p className="text-sm text-gray-600">
                      Max Occupancy: {roomToDelete.maxOccupancy?.adults || 2} Adults, {roomToDelete.maxOccupancy?.children || 2} Children
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={cancelDeleteRoom}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteRoom}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
                >
                  Delete Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
