import React, { useState } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import NotificationToast from "./NotificationToast";

export default function ReplyModal({ isOpen, onClose, message, onSendReply }) {
  const [replyData, setReplyData] = useState({
    subject: "",
    message: "",
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
    setReplyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!replyData.subject.trim() || !replyData.message.trim()) {
      setNotification({
        isVisible: true,
        type: "warning",
        title: "Missing Information",
        message: "Please fill in both subject and message"
      });
      return;
    }

    setReplyData(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Store reply data in replyMessages collection
      const replyDataToStore = {
        originalMessageId: message.id,
        to: message.email,
        fromName: message.name,
        originalSubject: message.subject,
        originalMessage: message.message,
        replySubject: replyData.subject,
        replyMessage: replyData.message,
        createdAt: new Date().toISOString(),
        status: 'pending' // Will be updated by the function
      };

      console.log("Storing reply data:", replyDataToStore);
      
      const docRef = await addDoc(collection(db, "replyMessages"), replyDataToStore);
      console.log("Reply stored with ID:", docRef.id);
      
      // Immediately update the original message status to "replied"
      try {
        await updateDoc(doc(db, "contactMessages", message.id), {
          status: "replied",
          repliedAt: new Date().toISOString()
        });
        console.log("Message status updated to 'replied'");
      } catch (updateError) {
        console.error("Error updating message status:", updateError);
      }
      
      // Add a small delay to ensure the document is created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Reply document should have been created, checking if function triggers...");

      // Reset form
      setReplyData({
        subject: "",
        message: "",
        isSubmitting: false
      });
      
      onClose();
      
      // Show success message
      setNotification({
        isVisible: true,
        type: "success",
        title: "Reply Sent Successfully",
        message: "Message status updated to 'replied' and email will be sent automatically."
      });
      
    } catch (error) {
      console.error("Error storing reply:", error);
      setNotification({
        isVisible: true,
        type: "error",
        title: "Reply Failed",
        message: "Failed to submit reply. Please try again."
      });
      setReplyData(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleClose = () => {
    setReplyData({
      subject: "",
      message: "",
      isSubmitting: false
    });
    onClose();
  };

  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reply to Message</h2>
            <p className="text-sm text-gray-600">From: {message.name} ({message.email})</p>
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

        {/* Original Message */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Message</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-2">
              <span className="font-medium text-gray-700">Subject:</span>
              <span className="ml-2 text-gray-900">{message.subject}</span>
            </div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Date:</span>
              <span className="ml-2 text-gray-900">
                {new Date(message.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Message:</span>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Reply Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={replyData.subject}
                onChange={handleInputChange}
                placeholder={`Re: ${message.subject}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Your Reply Message
              </label>
              <textarea
                id="message"
                name="message"
                value={replyData.message}
                onChange={handleInputChange}
                rows={8}
                placeholder="Type your reply message here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-300"
              disabled={replyData.isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-md text-white font-medium transition duration-300 ${
                replyData.isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-secondary'
              }`}
              disabled={replyData.isSubmitting}
            >
              {replyData.isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Reply'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Toast */}
      <NotificationToast
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}