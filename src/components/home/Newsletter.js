import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc } from "firebase/firestore";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      // Check if email already exists in newsletter collection
      const emailQuery = query(
        collection(db, "newsletter"), 
        where("email", "==", email.toLowerCase())
      );
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        const existingSubscriber = emailSnapshot.docs[0].data();
        
        // If subscriber exists and is active, show already subscribed message
        if (existingSubscriber.status === 'active') {
          setMessage("You are already subscribed to our newsletter!");
          return;
        }
        
        // If subscriber exists but is unsubscribed, reactivate them
        if (existingSubscriber.status === 'unsubscribed') {
          const subscriberRef = emailSnapshot.docs[0].ref;
          await updateDoc(subscriberRef, {
            status: 'active',
            resubscribedAt: serverTimestamp()
          });
          setEmail("");
          setMessage("Welcome back! You have been resubscribed to our newsletter!");
          return;
        }
      }

      // Add new subscription
      await addDoc(collection(db, "newsletter"), {
        email: email.toLowerCase(),
        subscribedAt: serverTimestamp(),
        status: "active"
      });
      
      setEmail("");
      setMessage("Thank you for subscribing!");
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      setMessage("Error subscribing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="container mx-auto mt-5 px-3 sm:px-4 relative z-[10]">
      <div className="flex justify-center">
        <div className="w-full max-w-md sm:max-w-lg lg:w-10/12 border border-primary rounded p-1 shadow-md">
          <div className="border border-secondary rounded text-center p-1">
            <div className="bg-white rounded text-center p-3 sm:p-5">
              <h4 className="mb-4 text-base sm:text-lg lg:text-2xl font-bold text-secondary">
                Get the best deals at <span className="text-primary uppercase">NaumApartments</span>
              </h4>
              <form onSubmit={handleSubmit} className="w-full">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <input
                    className="flex-1 py-3 px-3 sm:px-4 border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-dark text-sm sm:text-base"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`py-3 px-4 sm:px-6 text-white rounded-md transition duration-300 font-medium text-sm sm:text-base whitespace-nowrap ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-primary hover:bg-secondary'
                    }`}
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
              </form>
              {message && (
                <div className={`mt-3 text-sm ${
                  message.includes('Thank you') 
                    ? 'text-green-600' 
                    : message.includes('already subscribed')
                    ? 'text-blue-600'
                    : 'text-red-600'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
