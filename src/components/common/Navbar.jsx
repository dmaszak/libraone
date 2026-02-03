// Navbar Component

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MobileSidebar from './MobileSidebar';
import NotificationDropdown from './NotificationDropdown';
import logoLibraOne from '../../assets/LogoLibraOne.png';

const Navbar = ({ showHamburger = false, hideHamburger = false, transparent = false }) => {
  const { user } = useAuth();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${transparent ? 'bg-white/10 backdrop-blur-md border-b border-white/20' : 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100'}`}>
      <div className="w-full px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Hamburger and Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu for User Pages (hidden on dashboard) */}
            {showHamburger && !hideHamburger && user?.role === 'user' && (
              <MobileSidebar />
            )}

            {/* Logo */}
            <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2.5">
              <img
                src={logoLibraOne}
                alt="LibraOne"
                className="h-9 w-auto"
              />
              <span className={`text-xl font-bold tracking-tight ${transparent ? 'text-emerald-400' : 'text-emerald-600'}`}>
                LibraOne
              </span>
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
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=10B981&color=fff`;
                  }}
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
