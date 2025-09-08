import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import ReplyModal from "./ReplyModal";
import ConfirmationModal from "./ConfirmationModal";
import NotificationToast from "./NotificationToast";

export default function MessageManagement({ onRefresh }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState("all"); // all, new, read, replied
  const [searchEmail, setSearchEmail] = useState(""); // Search by email
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    title: "",
    message: ""
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const messagesQuery = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesData = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (messageId, newStatus) => {
    try {
      await updateDoc(doc(db, "contactMessages", messageId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      await fetchMessages();
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;
    
    try {
      await deleteDoc(doc(db, "contactMessages", messageToDelete.id));
      await fetchMessages();
      
      showNotification("success", "Message Deleted", "The message has been successfully deleted.");
      
      setDeleteModalOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      showNotification("error", "Delete Failed", "Failed to delete message. Please try again.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setMessageToDelete(null);
  };

  const handleReplyClick = (message) => {
    setReplyMessage(message);
    setReplyModalOpen(true);
  };

  const handleSendReply = async (replyData) => {
    // This function is no longer needed since ReplyModal handles storage directly
    // Just refresh messages to show updated status
    await fetchMessages();
    return { success: true };
  };

  const handleCloseReplyModal = () => {
    setReplyModalOpen(false);
    setReplyMessage(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-status-new/10 text-status-new";
      case "read":
        return "bg-status-read/10 text-status-read";
      case "replied":
        return "bg-status-replied/10 text-status-replied";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredMessages = messages.filter(message => {
    // Filter by status
    const statusMatch = filter === "all" || message.status === filter;
    
    // Filter by email search
    const emailMatch = !searchEmail || 
      message.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
      message.name.toLowerCase().includes(searchEmail.toLowerCase());
    
    return statusMatch && emailMatch;
  });

  const unreadCount = messages.filter(message => message.status === "new").length;

  const showNotification = (type, title, message) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
          <p className="text-gray-600">Manage customer inquiries and feedback</p>
        </div>
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {unreadCount} New
            </span>
          )}
          <button
            onClick={fetchMessages}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition duration-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="email-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Messages
            </label>
            <div className="relative">
              <input
                type="text"
                id="email-search"
                placeholder="Search by email or name..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          {searchEmail && (
            <button
              onClick={() => setSearchEmail("")}
              className="mt-6 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition duration-200"
            >
              Clear
            </button>
          )}
        </div>
        {searchEmail && (
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} matching "{searchEmail}"
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: "all", label: "All Messages", count: messages.length },
          { key: "new", label: "New", count: messages.filter(m => m.status === "new").length },
          { key: "read", label: "Read", count: messages.filter(m => m.status === "read").length },
          { key: "replied", label: "Replied", count: messages.filter(m => m.status === "replied").length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 flex-shrink-0 ${
              filter === tab.key
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.key}</span>
            <span className="ml-1">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No messages found</p>
            <p className="text-sm">Customer messages will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div key={message.id} className="p-4 lg:p-6 hover:bg-gray-50 transition duration-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {message.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                        {message.status === "new" && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <p className="text-sm text-gray-600 break-all">
                        <span className="font-medium">Email:</span> {message.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Subject:</span> {message.subject}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {formatDate(message.createdAt)}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <p className="text-gray-800">{message.message}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {message.status === "new" && (
                        <button
                          onClick={() => handleStatusUpdate(message.id, "read")}
                          className="bg-warning text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-warning/80 transition duration-300 shadow-sm"
                        >
                          <span className="hidden sm:inline">Mark as Read</span>
                          <span className="sm:hidden">Read</span>
                        </button>
                      )}
                      {message.status === "read" && (
                        <button
                          onClick={() => handleStatusUpdate(message.id, "replied")}
                          className="bg-success text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-success/80 transition duration-300 shadow-sm"
                        >
                          <span className="hidden sm:inline">Mark as Replied</span>
                          <span className="sm:hidden">Replied</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleReplyClick(message)}
                        className="bg-info text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-info/80 transition duration-300 shadow-sm"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => handleDeleteClick(message)}
                        className="bg-danger text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-danger/80 transition duration-300 shadow-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <ReplyModal
        isOpen={replyModalOpen}
        onClose={handleCloseReplyModal}
        message={replyMessage}
        onSendReply={handleSendReply}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Message"
        message={`Are you sure you want to delete this message from ${messageToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />

      {/* Notification Toast */}
      <NotificationToast
        isVisible={notification.isVisible}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}
