import React, { useState, useEffect } from 'react';
import BookingPage from './components/BookingPage';
import AdminPage from './components/AdminPage';

export default function App() {
  const getInitialRoute = () => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (pathname.includes('/admin') || search.includes('admin=true') || hash.includes('admin')) {
        return 'admin';
      }
    }
    return 'booking';
  };

  const [route, setRoute] = useState(getInitialRoute);

  const navigateTo = (newRoute) => {
    setRoute(newRoute);
    if (typeof window !== 'undefined') {
      const path = newRoute === 'admin' ? '/admin' : '/';
      window.history.pushState({ route: newRoute }, '', path);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getInitialRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (route === 'admin') {
    return <AdminPage onNavigateToBooking={() => navigateTo('booking')} />;
  }

  return <BookingPage onNavigateToAdmin={() => navigateTo('admin')} />;
}
