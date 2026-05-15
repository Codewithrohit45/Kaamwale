import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiCalendar, FiLogOut, FiMenu, FiX, FiShield, FiBarChart, FiTag, FiDollarSign } from 'react-icons/fi';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FiHome /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <FiBarChart /> },
    { name: 'Promo Codes', path: '/admin/coupons', icon: <FiTag /> },
    { name: 'Payouts', path: '/admin/payouts', icon: <FiDollarSign /> },
    { name: 'Users', path: '/admin/users', icon: <FiUsers /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <FiCalendar /> },
    { name: 'KYC Review', path: '/admin/kyc', icon: <FiShield /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20">
        <span className="text-xl font-bold bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">Kaamwale Admin</span>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-slate-600">
          {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} transform md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-slate-900 text-white z-10 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-6 hidden md:block">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Kaamwale</Link>
          <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Admin Panel</div>
        </div>
        
        <div className="px-4 py-2 mt-4 md:mt-0">
          <nav className="space-y-1">
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-red-400 hover:bg-red-900/30 transition-colors"
          >
            <FiLogOut />
            Logout Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden flex flex-col">
        {/* Desktop Topbar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 h-16 items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              A
            </div>
            <span className="font-medium text-slate-700">Administrator</span>
          </div>
        </header>

        <div className="p-4 sm:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
