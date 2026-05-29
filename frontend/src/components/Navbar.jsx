import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiUser, FiMoon, FiSun, FiBell, FiLogOut, FiLayout } from 'react-icons/fi';
import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { AuthContext } from '../context/AuthContext';

const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.05);
    osc.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.12); // E5
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);
    osc.start();
    osc.stop(audioContext.currentTime + 0.4);
  } catch (err) {
    console.warn('Audio chime failed to initialize:', err);
  }
};

const formatTime = (dateStr) => {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return past.toLocaleDateString();
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Keep a ref to track the last loaded unread count to trigger chimes
  const lastUnreadCountRef = useRef(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      lastUnreadCountRef.current = 0;
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/notifications', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          const currentCount = data.unreadCount || 0;
          // Play sound if new unread count has increased
          if (currentCount > lastUnreadCountRef.current && lastUnreadCountRef.current > 0) {
            playNotificationSound();
          }
          lastUnreadCountRef.current = currentCount;
          setNotifications(data.notifications || []);
          setUnreadCount(currentCount);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000); // Poll every 8 seconds for responsiveness!
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id, link) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => {
          const next = Math.max(0, prev - 1);
          lastUnreadCountRef.current = next;
          return next;
        });
        setShowNotifications(false);
        if (link) {
          navigate(link);
        }
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        lastUnreadCountRef.current = 0;
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <nav className="fixed w-full z-50 glass dark:glass-dark top-0 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">
              Kaamwale
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">Find Services</Link>
            <Link to="/signup?role=provider" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">Become a Provider</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* Notifications Bell & Drawer */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }} 
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors relative outline-none"
                >
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-black px-1 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-800 dark:text-white flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <span className="flex items-center gap-1.5">
                          Notifications
                          {unreadCount > 0 && (
                            <span className="text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-350 px-2 py-0.5 rounded-full font-black">
                              {unreadCount} New
                            </span>
                          )}
                        </span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllAsRead} 
                            className="text-xs text-teal-650 dark:text-teal-400 hover:underline font-bold"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                            <FiBell className="mx-auto mb-2 text-slate-300 dark:text-slate-650" size={32} />
                            <p className="text-sm font-semibold">All caught up!</p>
                            <p className="text-xs mt-0.5">No new alerts.</p>
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n._id} 
                              onClick={() => handleMarkAsRead(n._id, n.link)}
                              className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer text-left ${!n.isRead ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''}`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h4 className={`text-sm text-slate-800 dark:text-white ${!n.isRead ? 'font-bold' : 'font-semibold'}`}>
                                  {n.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5">
                                  {formatTime(n.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-555 dark:text-slate-400 line-clamp-2">
                                {n.message}
                              </p>
                              {!n.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block mt-1"></span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile Avatar Capsule */}
            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md hover:scale-105 transition-transform outline-none"
                >
                  {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 py-1"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 text-left">
                        <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize mt-0.5 font-bold tracking-wide">{user.role || 'User'}</p>
                      </div>
                      <Link 
                        to={user.role === 'provider' ? '/provider/dashboard' : '/user/profile'}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                      >
                        <FiLayout size={14} className="text-slate-400" />
                        My Dashboard
                      </Link>
                      <Link 
                        to={user.role === 'provider' ? '/provider/profile' : '/user/profile?tab=settings'}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                      >
                        <FiUser size={14} className="text-slate-400" />
                        My Profile
                      </Link>
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left border-t border-slate-100 dark:border-slate-700 mt-1"
                      >
                        <FiLogOut size={14} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleDarkMode} className="text-slate-600 dark:text-slate-300">
              {isDark ? <FiSun size={24} /> : <FiMoon size={24} />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-300">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass dark:glass-dark absolute top-16 left-0 w-full border-t border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-left">
              <Link to="/search" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-slate-750 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Find Services</Link>
              
              {!user ? (
                <>
                  <Link to="/signup?role=provider" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-slate-750 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Become a Provider</Link>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-slate-750 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Login</Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-teal-600 dark:text-teal-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link to={user.role === 'provider' ? '/provider/dashboard' : '/user/profile'} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-slate-750 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">My Dashboard</Link>
                  <Link to={user.role === 'provider' ? '/provider/messages' : '/user/profile?tab=messages'} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-slate-750 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">My Messages</Link>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left block px-3 py-2 text-red-650 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
