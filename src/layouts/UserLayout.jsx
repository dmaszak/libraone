// User Layout Component

import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import BackgroundFitur from '../assets/BackgroundFitur.png';

const UserLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Check if we're on dashboard page (for special full-screen layout)
  const isDashboard = location.pathname === '/dashboard';

  if (isDashboard) {
    // Dashboard without navbar (immersive mode)
    return (
      <div className="min-h-screen">
        <Outlet />
      </div>
    );
  }

  // Other pages use normal layout with hamburger menu + background image
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative overflow-hidden"
      style={{ backgroundImage: `url(${BackgroundFitur})` }}
    >
      {/* White overlay to tint the background (Whitewash effect) - Fixed to viewport */}
      <div className="fixed inset-0 bg-white/90 z-0" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar showHamburger={true} />
        <main className="flex-1 p-6 pt-24 sm:pt-28">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
