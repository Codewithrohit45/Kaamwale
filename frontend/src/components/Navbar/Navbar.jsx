import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { FiBell, FiMessageSquare, FiInfo, FiAlertCircle, FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount, notificationCount, clearNotifications } = useSocket();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (showNotifications && user?.token) {
      const fetchNotifications = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/notifications', {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          const data = await res.json();
          if (res.ok) setNotifications(data.notifications);
        } catch (err) {
          console.error('Failed to fetch notifications', err);
        }
      };
      fetchNotifications();
    }
  }, [showNotifications, user]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        clearNotifications();
      }
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="bg-[#06141B] text-white px-8 py-5 border-b border-cyan-950 relative z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/">
          <h1 className="text-4xl font-extrabold text-cyan-400 tracking-wide">
            KaamWale
          </h1>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-sm font-bold bg-cyan-900/30 px-3 py-1.5 rounded-full hover:bg-cyan-900/50 transition-colors border border-cyan-800"
          >
            <FiGlobe className="text-cyan-400" />
            {i18n.language === 'en' ? 'HI' : 'EN'}
          </button>

          <Link
            to="/"
            className="hover:text-cyan-400 transition duration-300 text-lg"
          >
            {t('nav.home')}
          </Link>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="hover:text-cyan-400 transition duration-300 text-lg">{t('nav.dashboard')}</Link>
              )}
              {user.role === 'provider' && (
                <Link to="/provider/dashboard" className="hover:text-cyan-400 transition duration-300 text-lg">{t('nav.dashboard')}</Link>
              )}
              {user.role === 'user' && (
                <Link to="/user/dashboard" className="hover:text-cyan-400 transition duration-300 text-lg">{t('nav.dashboard')}</Link>
              )}

              {/* Notifications Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="hover:text-cyan-400 transition duration-300 flex items-center relative"
                >
                  <FiBell size={24} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-slate-800 dark:text-white">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="font-bold">Notifications</h3>
                      <button onClick={handleMarkAllRead} className="text-xs text-indigo-500 font-bold hover:underline">Mark all as read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-8 text-center text-slate-500 text-sm">No notifications yet</p>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif._id} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${!notif.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'booking' ? 'bg-teal-100 text-teal-600' : 'bg-amber-100 text-amber-600'}`}>
                                {notif.type === 'booking' ? <FiInfo size={14} /> : <FiAlertCircle size={14} />}
                              </div>
                              <div>
                                <p className="text-sm font-bold leading-tight">{notif.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <Link to={user.role === 'provider' ? '/provider/dashboard' : '/user/dashboard'} onClick={() => setShowNotifications(false)} className="block p-3 text-center text-xs font-bold bg-slate-50 dark:bg-slate-900 hover:text-indigo-500 transition-colors">
                      View All
                    </Link>
                  </div>
                )}
              </div>

              <Link to={user.role === 'provider' ? '/provider/messages' : '/user/messages'} className="relative hover:text-cyan-400 transition duration-300 text-lg">
                <FiMessageSquare size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-cyan-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-400 transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                state={{ from: location }}
                className="hover:text-cyan-400 transition duration-300 text-lg"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/signup"
                state={{ from: location }}
                className="bg-cyan-400 text-black px-6 py-2 rounded-xl font-bold hover:bg-cyan-300 transition duration-300"
              >
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;