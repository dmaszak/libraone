// User Layout Component

import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';

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
    // Dashboard with light glassmorphism navbar
    return (
      <div className="min-h-screen">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar showHamburger={true} hideHamburger={true} />
        </div>
        <Outlet />
      </div>
    );
  }

  // Other pages use normal layout with hamburger menu
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showHamburger={true} />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
