import { useState, useEffect, useContext } from 'react';
import { FiDollarSign, FiCalendar, FiStar, FiTrendingUp } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';

export default function ProviderOverview() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/bookings/provider', {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setBookings(data);
        }
      } catch (error) {
        console.error('Failed to fetch provider bookings', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchBookings();
  }, [user]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Update local state
        setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const upcomingJobs = bookings.filter(b => b.status === 'accepted');
  const completedJobsCount = bookings.filter(b => b.status === 'completed').length;

  const stats = [
    { label: 'Total Earnings', value: '₹0', icon: <FiDollarSign size={24} />, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { label: 'Jobs Completed', value: completedJobsCount.toString(), icon: <FiCalendar size={24} />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: 'Rating', value: 'New', icon: <FiStar size={24} />, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' },
    { label: 'Profile Views', value: '0', icon: <FiTrendingUp size={24} />, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  ];

  if (loading) {
    return <div className="text-center py-12"><p className="text-slate-500">Loading your dashboard...</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 dark:bg-slate-900 transition-colors">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-slate-600 dark:text-slate-400">Here's what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Recent Booking Requests</h2>
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 py-4 text-center">No pending requests right now.</p>
            ) : (
              pendingRequests.map(item => (
                <div key={item._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold">
                      {item.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{item.user?.name || 'Customer'}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(item.date).toLocaleDateString()} at {item.time}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[200px]">{item.serviceLocation}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => handleUpdateStatus(item._id, 'accepted')} className="flex-1 sm:flex-none px-4 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors">Accept</button>
                    <button onClick={() => handleUpdateStatus(item._id, 'cancelled')} className="flex-1 sm:flex-none px-4 py-2 text-slate-500 dark:text-slate-400 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Decline</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 transition-colors">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Upcoming Jobs</h2>
          <div className="space-y-6">
            {upcomingJobs.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 py-4 text-center text-sm">No upcoming jobs.</p>
            ) : (
              upcomingJobs.map(job => (
                <div key={job._id} className="relative pl-6 border-l-2 border-teal-500">
                  <span className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-teal-500 border-4 border-white dark:border-slate-800"></span>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{new Date(job.date).toLocaleDateString()}, {job.time}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate" title={job.serviceLocation}>{job.serviceLocation}</p>
                  <button onClick={() => handleUpdateStatus(job._id, 'completed')} className="mt-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Mark as Completed</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
