import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
      await addDoc(collection(db, "newsletter"), {
        email: email,
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
    <div className="container mx-auto mt-5 px-4 relative z-[10]">
      <div className="flex justify-center">
        <div className="w-full lg:w-10/12 border border-primary rounded p-1 shadow-md">
          <div className="border border-secondary rounded text-center p-1">
            <div className="bg-white rounded text-center p-5">
              <h4 className="mb-4 text-2xl font-bold text-secondary">
                Get the best deals at <span className="text-primary uppercase">NaumApartments</span>
              </h4>
              <form onSubmit={handleSubmit} className="relative mx-auto max-w-md">
                <input
                  className="w-full py-3 ps-4 pe-5 border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-dark"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`py-2 px-3 absolute top-0 right-0 mt-1 mr-2 text-white rounded-md transition duration-300 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary hover:bg-secondary'
                  }`}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
              {message && (
                <div className={`mt-3 text-sm ${message.includes('Thank you') ? 'text-green-600' : 'text-red-600'}`}>
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
