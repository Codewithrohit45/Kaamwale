import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiCalendar, FiDollarSign, FiUser, FiSettings, FiLogOut, FiMenu, FiX, FiMessageSquare, FiStar, FiShield, FiPackage } from 'react-icons/fi';
import { useState } from 'react';

export default function DashboardLayout({ children, role = 'provider' }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const providerLinks = [
    { name: 'Overview', path: '/provider/dashboard', icon: <FiHome /> },
    { name: 'Availability', path: '/provider/availability', icon: <FiCalendar /> },
    { name: 'Messages', path: '/provider/messages', icon: <FiMessageSquare /> },
    { name: 'Verification', path: '/provider/kyc', icon: <FiShield /> },
    { name: 'Packages', path: '/provider/packages', icon: <FiPackage /> },
    { name: 'Payouts', path: '/provider/payouts', icon: <FiDollarSign /> },
    { name: 'Reviews', path: '/provider/reviews', icon: <FiStar /> },
    { name: 'Profile', path: '/provider/profile', icon: <FiUser /> },
  ];

  const userLinks = [
    { name: 'My Bookings', path: '/user/dashboard', icon: <FiCalendar /> },
    { name: 'Messages', path: '/user/messages', icon: <FiMessageSquare /> },
    { name: 'Profile', path: '/user/profile', icon: <FiUser /> },
  ];

  const links = role === 'provider' ? providerLinks : userLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20">
        <span className="text-xl font-bold bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">Kaamwale</span>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-slate-600">
          {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} transform md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-10 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-6 hidden md:block">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">Kaamwale</Link>
        </div>
        
        <div className="px-4 py-2 mt-4 md:mt-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</p>
          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-200">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors">
            <FiLogOut />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden flex flex-col">
        {/* Desktop Topbar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 h-16 items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
              {role === 'provider' ? 'P' : 'U'}
            </div>
            <span className="font-medium text-slate-700">{role === 'provider' ? 'Provider Portal' : 'User Portal'}</span>
          </div>
        </header>

        <div className="p-4 sm:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
