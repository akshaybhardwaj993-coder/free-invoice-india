'use client';
import { useEffect, useState } from 'react';

export default function AdScripts() {
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  useEffect(() => {
    // 1. POPUNDER: Load only after first user click to avoid browser blockers
    let popunderLoaded = false;
    const handleFirstInteraction = () => {
      if (popunderLoaded) return;
      const script = document.createElement('script');
      // TODO: Replace with your actual Monetag Popunder script URL later
      script.src = 'https://example.com/popunder.js'; 
      script.async = true;
      document.body.appendChild(script);
      popunderLoaded = true;
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction, { once: true });

    // 2. PUSH NOTIFICATION: Show prompt after 8 seconds
    const hasSubscribed = localStorage.getItem('push_subscribed');
    if (!hasSubscribed) {
      const timer = setTimeout(() => setShowPushPrompt(true), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handlePushSubscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // TODO: Replace with your actual Monetag Push script URL later
        const script = document.createElement('script');
        script.src = 'https://example.com/push.js';
        script.async = true;
        document.head.appendChild(script);
        localStorage.setItem('push_subscribed', 'true');
        setShowPushPrompt(false);
      }
    } catch (error) {
      console.error('Push failed:', error);
    }
  };

  return (
    <>
      {showPushPrompt && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white border border-gray-200 rounded-lg shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Get Free GST Updates</h3>
              <p className="text-xs text-gray-600 mb-3">Receive occasional tax tips. No spam, unsubscribe anytime.</p>
              <div className="flex gap-2">
                <button onClick={handlePushSubscribe} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded">Enable</button>
                <button onClick={() => setShowPushPrompt(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2">Not now</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
