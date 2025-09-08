import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSearchParams } from 'react-router-dom';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error, notfound
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid unsubscribe link');
      return;
    }

    handleUnsubscribe(token);
  }, [searchParams]);

  const handleUnsubscribe = async (subscriberId) => {
    try {
      // Get subscriber data
      const subscriberRef = doc(db, 'newsletter', subscriberId);
      const subscriberSnap = await getDoc(subscriberRef);
      
      if (!subscriberSnap.exists()) {
        setStatus('notfound');
        setMessage('Subscriber not found');
        return;
      }
      
      const subscriberData = subscriberSnap.data();
      setSubscriberEmail(subscriberData.email);
      
      // Update subscriber status to unsubscribed
      await updateDoc(subscriberRef, {
        status: 'unsubscribed',
        unsubscribedAt: new Date().toISOString()
      });
      
      setStatus('success');
      setMessage('You have been successfully unsubscribed from our newsletter.');
      
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setStatus('error');
      setMessage('An error occurred while unsubscribing. Please try again later.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'notfound':
        return '❓';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'notfound':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            <span className="text-4xl">{getStatusIcon()}</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Newsletter Unsubscribe
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            NaumApartments Newsletter Management
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="text-center">
            <div className={`text-lg font-medium ${getStatusColor()}`}>
              {status === 'loading' && 'Processing your request...'}
              {status === 'success' && 'Unsubscribed Successfully'}
              {status === 'error' && 'Error Occurred'}
              {status === 'notfound' && 'Subscriber Not Found'}
            </div>
            
            <p className="mt-4 text-gray-600">
              {message}
            </p>
            
            {subscriberEmail && status === 'success' && (
              <p className="mt-2 text-sm text-gray-500">
                Email: {subscriberEmail}
              </p>
            )}
            
            {status === 'success' && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-4">
                  We're sorry to see you go! If you change your mind, you can always subscribe again through our website.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary transition duration-300"
                >
                  Visit Our Website
                </a>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-4">
                  If you continue to experience issues, please contact us directly.
                </p>
                <a
                  href="mailto:info@naumapartments.com"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary transition duration-300"
                >
                  Contact Support
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 NaumApartments. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
