// Navbar Component

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MobileSidebar from './MobileSidebar';
import NotificationDropdown from './NotificationDropdown';
import logoLibraOne from '../../assets/LogoLibraOne.png';

const Navbar = ({ showHamburger = false, hideHamburger = false, transparent = false }) => {
  const { user } = useAuth();

  return (
    <nav className={`sticky top-0 z-40 ${transparent ? 'bg-white/10 backdrop-blur-md border-b border-white/20' : 'bg-white shadow-sm border-b border-gray-100'}`}>
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
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${transparent ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
              >
                <span className={`text-sm font-medium hidden sm:block ${transparent ? 'text-white' : 'text-gray-700'}`}>Profil</span>
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className={`w-9 h-9 rounded-full border-2 object-cover ${transparent ? 'border-white/30' : 'border-gray-200'}`}
                />
              </Link>
              
              {/* Notification Icon - Only for users */}
              {user.role === 'user' && (
                <NotificationDropdown transparent={transparent} />
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
