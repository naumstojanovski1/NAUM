import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import Heading from "../components/common/Heading";
import CommonHeading from "../components/common/CommonHeading";
import { contact } from "../components/data/Data";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const validateForm = () => {
    const { name, email, subject, message } = formData;
    
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return "All fields are required";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    
    if (message.length < 10) {
      return "Message must be at least 10 characters long";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setSubmitStatus('error');
      setErrorMessage(validationError);
      setTimeout(() => {
        setSubmitStatus(null);
        setErrorMessage("");
      }, 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      // Check if Firebase is properly initialized
      if (!db) {
        throw new Error("Firebase database not initialized");
      }

      const contactData = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'new'
      };

      console.log("Attempting to save contact message:", contactData);
      
      const docRef = await addDoc(collection(db, "contactMessages"), contactData);
      console.log("Contact message saved with ID:", docRef.id);
      
      setSubmitStatus('success');
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
      
    } catch (error) {
      console.error("Error sending contact message:", error);
      setSubmitStatus('error');
      setErrorMessage(error.message || "Failed to send message. Please check your internet connection and try again.");
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setErrorMessage("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Heading heading="Get in Touch" title="NaumApartments" subtitle="Contact Us" />

      <div className="container mx-auto py-12 px-4 bg-light">
        <CommonHeading
          heading="Connect with NaumApartments"
          subtitle="Have a Question?"
          title="Reach Out to Us"
        />
        
        {/* Status Messages */}
        {submitStatus && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            submitStatus === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {submitStatus === 'success' 
              ? 'Thank you! Your message has been sent successfully. We will get back to you soon.' 
              : errorMessage || 'There was an error sending your message. Please try again.'
            }
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {contact.map((item, index) => (
                <div key={index} className="p-4 bg-white shadow-sm rounded-lg border-l-4 border-primary">
                  <h6 className="text-primary text-lg font-bold uppercase mb-2">
                    {item.title === "Reception" ? "General Inquiries" : item.title === "Restaurant" ? "Dining Reservations" : item.title === "Spa" ? "Spa & Wellness" : item.title}
                  </h6>
                  <p className="flex items-center text-gray-600">
                    <span className="mr-2 text-primary text-xl">
                      {item.icon}
                    </span>
                    {item.email}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-[350px] w-full rounded-lg overflow-hidden shadow-lg border-t-4 border-primary">
              <iframe
                  className="w-full h-full border-none"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d23642.848762736878!2d22.313656003738362!3d42.20683334598112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135575c524350591%3A0x931e713363909884!2sOp%C4%87ina%20Kriva%20Palanka!5e0!3m2!1shr!2smk!4v1756312469213!5m2!1shr!2smk"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
             
            </div>
          </div>
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="p-8 rounded-lg shadow-lg bg-white border-t-4 border-primary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="sr-only">Your Name</label>
                  <input
                      type="text"
                      className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-dark placeholder-gray-500"
                      id="name"
                      placeholder="Your Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Your Email</label>
                  <input
                    type="email"
                    className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-dark placeholder-gray-500"
                    id="email"
                    placeholder="Your Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="subject" className="sr-only">Subject</label>
                <input
                  type="text"
                  className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-dark placeholder-gray-500"
                  id="subject"
                  placeholder="Subject of Inquiry"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea
                  className="w-full p-3 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-dark placeholder-gray-500"
                  placeholder="Your Message Here"
                  id="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <div>
                <button
                  className={`w-full py-3 px-6 rounded-md transition duration-300 transform hover:scale-105 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary text-white hover:bg-secondary'
                  }`}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending Message...' : 'Send Your Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
