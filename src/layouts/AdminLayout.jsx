// Admin Layout Component

import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/common/AdminSidebar';
import AdminMobileSidebar from '../components/common/AdminMobileSidebar';
import logoLibraOne from '../assets/LogoLibraOne.png';
import { Link } from 'react-router-dom';

const AdminLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Hamburger (mobile) and Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Menu */}
              <AdminMobileSidebar />
              
              {/* Logo */}
              <Link to="/admin" className="flex items-center">
                <img 
                  src={logoLibraOne} 
                  alt="LibraOne" 
                  className="h-10 w-auto"
                />
              </Link>
            </div>

            {/* Right Side - Admin Profile */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-9 h-9 rounded-full border-2 border-gray-200 object-cover"
              />
            </div>
          </div>
        </div>
      </nav>
      
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
