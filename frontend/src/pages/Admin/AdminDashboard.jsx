import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiUsers, FiCalendar, FiDollarSign, FiCheckCircle, FiClock, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (error) {
        console.error('Error fetching admin stats', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchStats();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load stats.</div>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <FiUsers />, color: 'bg-teal-100 text-teal-600', link: '/admin/users' },
    { label: 'Total Providers', value: stats.totalProviders, icon: <FiUsers />, color: 'bg-indigo-100 text-indigo-600', link: '/admin/users' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: <FiCalendar />, color: 'bg-blue-100 text-blue-600', link: '/admin/bookings' },
    { label: 'Pending', value: stats.pendingBookings, icon: <FiClock />, color: 'bg-amber-100 text-amber-600', link: '/admin/bookings' },
    { label: 'Completed', value: stats.completedBookings, icon: <FiCheckCircle />, color: 'bg-emerald-100 text-emerald-600', link: '/admin/bookings' },
    { label: 'Cancelled', value: stats.cancelledBookings, icon: <FiXCircle />, color: 'bg-red-100 text-red-600', link: '/admin/bookings' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your platform activity.</p>
      </div>

      {/* Revenue Highlight */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-indigo-100 text-sm font-medium">Total Platform Revenue</p>
            <h2 className="text-4xl font-bold">₹{stats.totalRevenue?.toLocaleString() || 0}</h2>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-indigo-200 text-sm">
            <FiTrendingUp /> From {stats.completedBookings} completed bookings
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <Link to={card.link} key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/users" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl"><FiUsers /></div>
          <div>
            <h3 className="font-bold text-slate-800">Manage Users</h3>
            <p className="text-sm text-slate-500">Search, filter, and delete user accounts</p>
          </div>
        </Link>
        <Link to="/admin/bookings" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl"><FiCalendar /></div>
          <div>
            <h3 className="font-bold text-slate-800">Manage Bookings</h3>
            <p className="text-sm text-slate-500">View, filter, and cancel bookings</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Recent Activity</h3>
          <Link to="/admin/bookings" className="text-teal-600 text-sm font-medium hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentActivity?.map((act, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold">
                  {act.user?.name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {act.user?.name} <span className="font-normal text-slate-500">booked</span> {act.provider?.name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">{act.provider?.category} • {new Date(act.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                act.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                act.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                'bg-slate-100 text-slate-600'
              }`}>
                {act.status}
              </span>
            </div>
          ))}
          {(!stats.recentActivity || stats.recentActivity.length === 0) && (
            <p className="p-8 text-center text-slate-400 text-sm">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
