// User Dashboard Page - Original Design

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import assets
import bgTanpaHijau from '../../assets/bgtanpahijauhd.png';
import iconDaftarBuku from '../../assets/icondaftarbuku.png';
import iconPeminjaman from '../../assets/iconpeminjaman.png';
import iconLeaderboard from '../../assets/iconleaderboard.png';
import iconDenda from '../../assets/icondenda.png';

const Dashboard = () => {
  const { user } = useAuth();

  // Menu items with imported icons and colors
  const menuItems = [
    {
      title: 'Daftar Buku',
      path: '/books',
      iconImage: iconDaftarBuku,
      bgColor: 'bg-lime-500 hover:bg-lime-600'
    },
    {
      title: 'Peminjaman',
      path: '/my-loans',
      iconImage: iconPeminjaman,
      bgColor: 'bg-amber-400 hover:bg-amber-500'
    },
    {
      title: 'Leaderboard',
      path: '/leaderboard',
      iconImage: iconLeaderboard,
      bgColor: 'bg-green-700 hover:bg-green-800'
    },
    {
      title: 'Denda',
      path: '/fines',
      iconImage: iconDenda,
      bgColor: 'bg-teal-500 hover:bg-teal-600'
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image - bgtanpahijau only */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgTanpaHijau})`
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content - Centered */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          {/* Welcome Text */}
          <h1 className="text-[22px] sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-5 sm:mb-7 md:mb-14 drop-shadow-lg">
            <span className="text-white">Selamat Datang </span>
            <span className="text-amber-400">{user?.name || 'User'}</span>
          </h1>

          {/* Menu Grid - 2x2 */}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:gap-7 max-w-75 sm:max-w-sm md:max-w-lg mx-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group relative"
              >
                {/* White background layer underneath */}
                <div className="absolute inset-0 bg-white/60 rounded-full translate-y-1.5"></div>
                {/* Main colored button */}
                <div className={`relative ${item.bgColor} rounded-full px-5 py-2 sm:px-7 sm:py-2.5 md:px-10 md:py-3 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center`}>
                  <span className="text-white font-semibold text-[13px] sm:text-sm md:text-lg whitespace-nowrap drop-shadow-md">
                    {item.title}
                  </span>
                </div>
                {/* Floating Icon */}
                <div className="absolute -top-2.5 -right-2.5 sm:-top-4 sm:-right-4 md:-top-5 md:-right-5 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 transform group-hover:scale-110 transition-transform">
                  <img 
                    src={item.iconImage}
                    alt={item.title}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
