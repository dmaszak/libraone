// Navbar Component

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MobileSidebar from './MobileSidebar';
import NotificationDropdown from './NotificationDropdown';
import logoLibraOne from '../../assets/LogoLibraOne.png';

const Navbar = ({ showHamburger = false, hideHamburger = false }) => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Hamburger and Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu for User Pages (hidden on dashboard) */}
            {showHamburger && !hideHamburger && user?.role === 'user' && (
              <MobileSidebar />
            )}
            
            {/* Logo */}
            <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center">
              <img 
                src={logoLibraOne} 
                alt="LibraOne" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Right Side - User Menu */}
          {user && (
            <div className="flex items-center gap-2">
              {/* Profile Link */}
              <Link 
                to={user.role === 'admin' ? '/admin' : '/profile'}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Profil</span>
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-9 h-9 rounded-full border-2 border-gray-200"
                />
              </Link>
              
              {/* Notification Icon - Only for users */}
              {user.role === 'user' && (
                <NotificationDropdown />
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
