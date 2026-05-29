import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiCalendar, FiStar, FiTrendingUp, FiMapPin, FiMessageCircle } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function ProviderOverview() {
  const { user } = useContext(AuthContext);
  const { socket } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/bookings/provider', {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        const data = await res.json();
        if (res.ok) setBookings(data);
      } catch (error) {
        console.error('Failed to fetch provider bookings', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchBookings();
  }, [user]);

  // Real-time location broadcasting for "In-Progress" jobs
  useEffect(() => {
    const activeJobs = bookings.filter(b => b.status === 'in-progress');
    if (activeJobs.length === 0 || !socket) return;

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          activeJobs.forEach(job => {
            socket.emit('updateWorkerLocation', {
              receiverId: job.user._id,
              bookingId: job._id,
              coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }
            });
          });
        },
        (err) => console.warn('Location tracking failed', err),
        { enableHighAccuracy: true }
      );
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [bookings, socket]);

  const handleUpdateStatus = async (id, newStatus) => {
    let workerCoords = null;

    if (newStatus === 'in-progress') {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
        });
        workerCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (err) {
        alert('Location access is required to start work. Please enable GPS.');
        return;
      }
    }

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus, workerCoords })
      });
      if (res.ok) {
        const booking = bookings.find(b => b._id === id);
        if (booking && socket) {
          socket.emit('bookingUpdate', { receiverId: booking.user._id, bookingId: id, status: newStatus });
        }
        setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleRequestCompletion = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/request-completion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Completion OTP sent to customer! (${data.phone})`);
        setBookings(bookings.map(b => b._id === id ? { ...b, otpRequested: true } : b));
      }
    } catch (error) {
      console.error('Failed to request completion', error);
    }
  };

  const handleVerifyOTP = async (id, otp) => {
    let workerCoords = null;

    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });
      workerCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (err) {
      alert('Location access is required to verify completion and check-out. Please enable GPS.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/verify-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ otp, workerCoords })
      });
      const data = await res.json();
      if (res.ok) {
        const booking = bookings.find(b => b._id === id);
        if (booking && socket) {
          socket.emit('bookingUpdate', { receiverId: booking.user._id, bookingId: id, status: 'completed' });
        }
        setBookings(bookings.map(b => b._id === id ? { ...b, status: 'completed' } : b));
        alert('Work completed and verified!');
      } else {
        alert(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Failed to verify OTP', error);
    }
  };

  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const upcomingJobs = bookings.filter(b => b.status === 'accepted' || b.status === 'in-progress');
  const completedJobs = bookings.filter(b => b.status === 'completed');
  
  // Real earnings from backend user object if available, otherwise calculate
  const totalEarningsVal = user?.totalEarnings || completedJobs.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const withdrawableVal = user?.withdrawableBalance || 0;

  const stats = [
    { label: 'Total Earnings', value: `₹${totalEarningsVal.toLocaleString()}`, icon: <FiDollarSign size={24} />, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { label: 'Withdrawable', value: `₹${withdrawableVal.toLocaleString()}`, icon: <FiDollarSign size={24} />, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
    { label: 'Rating', value: user?.rating?.toString() || 'New', icon: <FiStar size={24} />, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' },
    { label: 'Jobs Completed', value: user?.completedBookings?.toString() || completedJobs.length.toString(), icon: <FiCalendar size={24} />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
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
                  <p className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-tight">{job.status}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate" title={job.serviceLocation}>{job.serviceLocation}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to="/provider/messages"
                      state={{ startChatWith: job.user }}
                      className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-md font-bold flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <FiMessageCircle size={12} /> Chat
                    </Link>
                    {job.status === 'accepted' && (
                      <button onClick={() => handleUpdateStatus(job._id, 'in-progress')} className="text-xs px-3 py-1.5 bg-teal-500 text-white rounded-md font-bold">Start Work</button>
                    )}
                    {job.status === 'in-progress' && !job.otpRequested && (
                      <button onClick={() => handleRequestCompletion(job._id)} className="text-xs px-3 py-1.5 bg-indigo-500 text-white rounded-md font-bold">Request OTP</button>
                    )}
                    {job.status === 'in-progress' && job.otpRequested && (
                      <div className="flex gap-2 w-full">
                        <input
                          type="text"
                          id={`otp-${job._id}`}
                          placeholder="Enter 4-digit OTP"
                          className="text-xs border rounded px-2 py-1 w-24 dark:bg-slate-700 dark:text-white"
                        />
                        <button
                          onClick={() => handleVerifyOTP(job._id, document.getElementById(`otp-${job._id}`).value)}
                          className="text-xs px-3 py-1 bg-green-500 text-white rounded font-bold"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleRequestCompletion(job._id)}
                          className="text-[10px] text-slate-500 hover:text-indigo-600 underline font-medium"
                        >
                          Resend OTP
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Business Intelligence Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <FiTrendingUp size={28} />
          <h2 className="text-2xl font-bold">Business Intelligence</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p className="text-indigo-100 text-sm font-medium mb-1">Completion Rate</p>
            <p className="text-4xl font-bold">
              {bookings.length > 0 ? Math.round((completedJobs.length / bookings.length) * 100) : 0}%
            </p>
            <p className="text-indigo-200 text-xs mt-2">Percentage of jobs finished successfully</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p className="text-indigo-100 text-sm font-medium mb-1">Reliability Score</p>
            <p className="text-4xl font-bold">{user?.reliabilityScore || 0}%</p>
            <p className="text-indigo-200 text-xs mt-2">Based on your response and completion time</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p className="text-indigo-100 text-sm font-medium mb-1">Repeat Customers</p>
            <p className="text-4xl font-bold">{user?.repeatCustomerRate || 0}%</p>
            <p className="text-indigo-200 text-xs mt-2">Clients who booked you more than once</p>
          </div>
        </div>
      </div>
    </div>
  );
}
