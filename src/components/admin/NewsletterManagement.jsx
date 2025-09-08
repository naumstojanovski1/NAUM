import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import NewsletterModal from "./NewsletterModal";
import ConfirmationModal from "./ConfirmationModal";
import NotificationToast from "./NotificationToast";

export default function NewsletterManagement({ onRefresh }) {
  const [subscribers, setSubscribers] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("subscribers");
  const [newsletterModalOpen, setNewsletterModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState(null);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    title: "",
    message: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch subscribers from the 'newsletter' collection
      const subscribersQuery = query(collection(db, "newsletter"), orderBy("subscribedAt", "desc"));
      const subscribersSnapshot = await getDocs(subscribersQuery);
      const subscribersData = subscribersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch newsletters
      const newslettersQuery = query(collection(db, "newsletterPosts"), orderBy("createdAt", "desc"));
      const newslettersSnapshot = await getDocs(newslettersQuery);
      const newslettersData = newslettersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSubscribers(subscribersData);
      setNewsletters(newslettersData);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("error", "Fetch Failed", "Failed to load newsletter data");
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteSubscriber = (subscriber) => {
    setSubscriberToDelete(subscriber);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subscriberToDelete) return;
    
    try {
      await deleteDoc(doc(db, "newsletter", subscriberToDelete.id));
      await fetchData();
      
      showNotification("success", "Subscriber Removed", "The subscriber has been successfully removed.");
      
      setDeleteModalOpen(false);
      setSubscriberToDelete(null);
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      showNotification("error", "Delete Failed", "Failed to remove subscriber. Please try again.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSubscriberToDelete(null);
  };

  const handleNewsletterSent = () => {
    fetchData(); // Refresh to show the new newsletter
    showNotification("success", "Newsletter Sent", "Newsletter has been sent to all subscribers!");
  };

  const activeSubscribers = subscribers.filter(sub => sub.status === 'active').length;
  const totalNewsletters = newsletters.length;

  // Helper function to format Firestore timestamps
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore timestamp objects
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    
    // Handle regular Date objects or strings
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Newsletter Management</h2>
          <p className="text-sm lg:text-base text-gray-600">Manage subscribers and send newsletters</p>
        </div>
        
        {/* Stats and Action Button */}
        <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center lg:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-4">
          {/* Stats */}
          <div className="flex space-x-6 sm:space-x-4 lg:space-x-4">
            <div className="text-center sm:text-right lg:text-right">
              <div className="text-xs sm:text-sm text-gray-500">Active Subscribers</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{activeSubscribers}</div>
            </div>
            <div className="text-center sm:text-right lg:text-right">
              <div className="text-xs sm:text-sm text-gray-500">Total Newsletters</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{totalNewsletters}</div>
            </div>
          </div>
          
          {/* Create Newsletter Button */}
          <button
            onClick={() => setNewsletterModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition duration-300 text-sm lg:text-base w-full sm:w-auto"
          >
            Create Newsletter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition duration-300 flex-shrink-0 ${
            activeTab === "subscribers"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="hidden sm:inline">Subscribers</span>
          <span className="sm:hidden">Subs</span>
          <span className="ml-1">({subscribers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("newsletters")}
          className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition duration-300 flex-shrink-0 ${
            activeTab === "newsletters"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="hidden sm:inline">Newsletters</span>
          <span className="sm:hidden">News</span>
          <span className="ml-1">({newsletters.length})</span>
        </button>
      </div>

      {/* Subscribers Tab */}
      {activeTab === "subscribers" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter Subscribers</h3>
            {subscribers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No subscribers yet
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subscribed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscribers.map((subscriber) => (
                        <tr key={subscriber.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {subscriber.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {subscriber.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              subscriber.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {subscriber.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(subscriber.subscribedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteSubscriber(subscriber)}
                              className="text-red-600 hover:text-red-900 transition duration-200"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3">
                  {subscribers.map((subscriber) => (
                    <div key={subscriber.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col space-y-3">
                        {/* Email and Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {subscriber.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {subscriber.name || 'No name provided'}
                            </p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                            subscriber.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {subscriber.status}
                          </span>
                        </div>
                        
                        {/* Subscription Date */}
                        <div className="text-xs text-gray-500">
                          Subscribed: {formatDate(subscriber.subscribedAt)}
                        </div>
                        
                        {/* Action Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDeleteSubscriber(subscriber)}
                            className="text-red-600 hover:text-red-900 transition duration-200 text-sm font-medium"
                          >
                            Remove Subscriber
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Newsletters Tab */}
      {activeTab === "newsletters" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter History</h3>
            {newsletters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No newsletters sent yet
              </div>
            ) : (
              <div className="space-y-4">
                {newsletters.map((newsletter) => (
                  <div key={newsletter.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-3 lg:space-y-0">
                      <div className="flex-1">
                        <h4 className="text-base lg:text-lg font-medium text-gray-900">{newsletter.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{newsletter.preview}</p>
                        
                        {/* Desktop: Horizontal info */}
                        <div className="hidden lg:flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Sent: {formatDate(newsletter.createdAt)}</span>
                          <span>Status: {newsletter.status}</span>
                          <span>Recipients: {newsletter.recipientCount || 0}</span>
                        </div>
                        
                        {/* Mobile: Vertical info */}
                        <div className="lg:hidden space-y-1 mt-2 text-xs text-gray-500">
                          <div>Sent: {formatDate(newsletter.createdAt)}</div>
                          <div>Recipients: {newsletter.recipientCount || 0}</div>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex-shrink-0 lg:ml-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          newsletter.status === 'sent' 
                            ? 'bg-green-100 text-green-800' 
                            : newsletter.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {newsletter.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Newsletter Modal */}
      <NewsletterModal
        isOpen={newsletterModalOpen}
        onClose={() => setNewsletterModalOpen(false)}
        onNewsletterSent={handleNewsletterSent}
        subscriberCount={activeSubscribers}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Remove Subscriber"
        message={`Are you sure you want to remove ${subscriberToDelete?.email} from the newsletter list?`}
        confirmText="Remove"
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
