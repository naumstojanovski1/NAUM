import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import NotificationToast from "./NotificationToast";

export default function NewsletterModal({ isOpen, onClose, onNewsletterSent, subscriberCount }) {
  const [newsletterData, setNewsletterData] = useState({
    subject: "",
    content: "",
    preview: "",
    isSubmitting: false
  });
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    title: "",
    message: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletterData.subject.trim() || !newsletterData.content.trim()) {
      setNotification({
        isVisible: true,
        type: "warning",
        title: "Missing Information",
        message: "Please fill in both subject and content"
      });
      return;
    }

    if (subscriberCount === 0) {
      setNotification({
        isVisible: true,
        type: "warning",
        title: "No Subscribers",
        message: "You don't have any active subscribers to send the newsletter to."
      });
      return;
    }

    setNewsletterData(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Store newsletter data in newsletterPosts collection
      const newsletterDataToStore = {
        subject: newsletterData.subject,
        content: newsletterData.content,
        preview: newsletterData.preview || newsletterData.content.substring(0, 150) + "...",
        status: 'pending',
        recipientCount: subscriberCount,
        createdAt: new Date().toISOString()
      };

      console.log("Storing newsletter data:", newsletterDataToStore);
      
      const docRef = await addDoc(collection(db, "newsletterPosts"), newsletterDataToStore);
      console.log("Newsletter stored with ID:", docRef.id);

      // Reset form
      setNewsletterData({
        subject: "",
        content: "",
        preview: "",
        isSubmitting: false
      });
      
      onClose();
      
      // Show success message
      setNotification({
        isVisible: true,
        type: "success",
        title: "Newsletter Queued",
        message: `Newsletter has been queued for sending to ${subscriberCount} subscribers.`
      });

      // Call the callback to refresh the parent component
      if (onNewsletterSent) {
        onNewsletterSent();
      }
      
    } catch (error) {
      console.error("Error storing newsletter:", error);
      setNotification({
        isVisible: true,
        type: "error",
        title: "Newsletter Failed",
        message: "Failed to create newsletter. Please try again."
      });
      setNewsletterData(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleClose = () => {
    setNewsletterData({
      subject: "",
      content: "",
      preview: "",
      isSubmitting: false
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Newsletter</h2>
            <p className="text-sm text-gray-600">Will be sent to {subscriberCount} active subscribers</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Newsletter Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Newsletter Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={newsletterData.subject}
                onChange={handleInputChange}
                placeholder="Enter newsletter subject..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Preview */}
            <div>
              <label htmlFor="preview" className="block text-sm font-medium text-gray-700 mb-2">
                Preview Text
              </label>
              <input
                type="text"
                id="preview"
                name="preview"
                value={newsletterData.preview}
                onChange={handleInputChange}
                placeholder="Brief preview text (optional - will auto-generate from content if empty)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Newsletter Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={newsletterData.content}
                onChange={handleInputChange}
                rows={12}
                placeholder="Write your newsletter content here... You can use HTML tags for formatting."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                You can use HTML tags for formatting (e.g., &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;, &lt;p&gt;)
              </p>
            </div>

            {/* Newsletter Preview */}
            {newsletterData.subject && newsletterData.content && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                <div className="text-sm text-gray-600">
                  <strong>Subject:</strong> {newsletterData.subject}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <strong>Preview:</strong> {newsletterData.preview || newsletterData.content.substring(0, 150) + "..."}
                </div>
                <div className="mt-2 p-3 bg-white rounded border">
                  <div dangerouslySetInnerHTML={{ __html: newsletterData.content.substring(0, 200) + "..." }} />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-300"
              disabled={newsletterData.isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-md text-white font-medium transition duration-300 ${
                newsletterData.isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-secondary'
              }`}
              disabled={newsletterData.isSubmitting}
            >
              {newsletterData.isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                `Send to ${subscriberCount} Subscribers`
              )}
            </button>
          </div>
        </form>

        {/* Notification Toast */}
        <NotificationToast
          isVisible={notification.isVisible}
          onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      </div>
    </div>
  );
}
