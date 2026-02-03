// User Dashboard Page - Glassmorphism Design (Restored)

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../../components/common/NotificationDropdown';

// Import assets
import bgTanpaHijau from '../../assets/bgtanpahijauhd.png';
import iconDaftarBuku from '../../assets/icondaftarbuku.png';
import iconPeminjaman from '../../assets/iconpeminjaman.png';
import iconLeaderboard from '../../assets/iconleaderboard.png';
import iconDenda from '../../assets/icondenda.png';
import logoLibraOne from '../../assets/LogoLibraOne.png';

const Dashboard = () => {
  const { user, logout, getProfile, getMyRanking, getActiveLoans, getLoanHistory } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };


  const [stats, setStats] = useState({
    currentlyBorrowed: 0,
    totalLoans: 0,
    xp: 0,
    rank: '-'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profile, ranking, activeLoans, history] = await Promise.all([
          getProfile(),
          getMyRanking(),
          getActiveLoans(),
          getLoanHistory()
        ]);

        setStats({
          currentlyBorrowed: activeLoans?.length || 0,
          totalLoans: (activeLoans?.length || 0) + (history?.length || 0),
          xp: profile?.xp || ranking?.xp || 0,
          rank: ranking?.rank || ranking?.ranking || '-'
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Menu items with blur/glassmorphism aesthetics
  const menuItems = [
    {
      title: 'Daftar Buku',
      description: 'Jelajahi koleksi buku',
      path: '/books',
      iconImage: iconDaftarBuku,
      gradient: 'from-lime-400 to-green-500'
    },
    {
      title: 'Peminjaman',
      description: 'Kelola pinjaman Anda',
      path: '/my-loans',
      iconImage: iconPeminjaman,
      gradient: 'from-amber-400 to-orange-500'
    },
    {
      title: 'Leaderboard',
      description: 'Lihat peringkat XP',
      path: '/leaderboard',
      iconImage: iconLeaderboard,
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Denda',
      description: 'Cek status denda',
      path: '/fines',
      iconImage: iconDenda,
      gradient: 'from-cyan-400 to-blue-500'
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url(${bgTanpaHijau})`
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center py-6 px-4">

        <div className="absolute top-0 left-0 right-0 py-4 px-8 flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
              <img src={logoLibraOne} alt="LibraOne" className="h-9 w-auto" />
            </div>
            <span className="font-bold text-xl text-emerald-400 tracking-tight drop-shadow-md ml-2">
              LibraOne
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Profile Button */}
            {/* Profile Button */}
            <Link
              to="/profile"
              className="flex items-center gap-2 px-1 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-all duration-300"
            >
              <span className="text-sm font-medium text-white pl-2 hidden sm:block">Profil</span>
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10B981&color=fff`}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-white/50"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10B981&color=fff`;
                }}
              />
            </Link>

            <div className="backdrop-blur-md bg-white/10 rounded-full p-0.5 border border-white/10">
              <NotificationDropdown transparent={true} />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full mt-12 sm:mt-0">

          {/* Profile Section - Centered */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="relative inline-block mb-4">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10B981&color=fff&size=80`}
                alt={user?.name}
                className="w-20 h-20 rounded-full border-4 border-white/20 shadow-xl object-cover mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10B981&color=fff`;
                }}
              />
              {stats.rank !== '-' && parseInt(stats.rank) <= 10 && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-black/20">
                  {stats.rank}
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-1">
              Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{user?.name || 'User'}!</span>
            </h1>
            <p className="text-white/80 text-sm font-medium">
              Selamat datang kembali di LibraOne
            </p>
          </div>

          {/* Menu Grid - Compact */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {menuItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className="group block"
                style={{
                  animation: `slideUp 0.5s ease-out ${index * 0.1}s forwards`,
                  opacity: 0
                }}
              >
                {/* Card - Compact Rectangular */}
                <div className={`
                  relative overflow-hidden
                  bg-gradient-to-br ${item.gradient}
                  rounded-2xl
                  p-5
                  shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                  transform transition-all duration-300 
                  hover:scale-[1.02] hover:-translate-y-1
                  border border-white/40
                  h-28 sm:h-32
                  flex items-center
                `}>
                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 rounded-2xl" />

                  {/* Animated Glow on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />

                  {/* Icon - Absolute Right Bottom */}
                  <div className="absolute -right-2 -bottom-2 w-20 h-20 sm:w-24 sm:h-24 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 opacity-90">
                    <img
                      src={item.iconImage}
                      alt={item.title}
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>

                  {/* Text - Left Aligned */}
                  <div className="relative z-10 pr-12 sm:pr-16">
                    <h3 className="text-white font-bold text-lg sm:text-xl drop-shadow-md mb-1">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm font-medium leading-tight line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Subtle Arrow */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Tips - Compact */}
          <div className="mt-6 backdrop-blur-md bg-white/5 rounded-xl p-3 border border-white/10 mx-auto max-w-lg">
            <p className="text-white/50 text-[10px] sm:text-xs text-center">
              💡 <span className="text-white/70">Tips:</span> Baca buku tiap hari untuk nambah XP!
            </p>
          </div>

        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
