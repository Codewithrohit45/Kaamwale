import { useState, useEffect, useContext } from 'react';
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, completed, cancelled

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/bookings/mybookings', {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });
        const data = await res.json();
        if (res.ok) setBookings(data);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchBookings();
    }
  }, [user]);

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'accepted': return 'bg-teal-100 text-teal-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FiClock />;
      case 'accepted': return <FiCheckCircle />;
      case 'completed': return <FiCheckCircle />;
      case 'cancelled': return <FiXCircle />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-slate-500">Loading bookings...</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 dark:bg-slate-900 transition-colors">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">My Bookings</h1>
        <p className="text-slate-600 dark:text-slate-400">Track and manage your upcoming and past service requests.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {['all', 'pending', 'accepted', 'completed', 'cancelled'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-6 py-4 text-sm font-medium capitalize whitespace-nowrap transition-colors ${filter === f ? 'text-teal-600 border-b-2 border-teal-600 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No bookings found for this category.</p>
              <Link to="/search" className="text-teal-600 font-medium hover:underline mt-2 inline-block">Find a Service Provider</Link>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking._id} className={`flex flex-col md:flex-row items-start md:items-center gap-6 p-6 border rounded-2xl relative overflow-hidden transition-colors ${booking.status === 'accepted' ? 'border-teal-100 bg-white dark:bg-slate-800 dark:border-teal-900/50' : 'border-slate-100 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700'}`}>
                {booking.status === 'accepted' && <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>}
                
                <div className="flex items-center gap-4 flex-1">
                  <img 
                    src={booking.provider?.image || `https://ui-avatars.com/api/?name=${booking.provider?.name?.replace(' ', '+')}&background=random`} 
                    alt="Provider" 
                    className="w-16 h-16 rounded-xl object-cover bg-white" 
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 capitalize ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)} {booking.status}
                      </span>
                    </div>
                    <Link to={`/provider/${booking.provider?._id}`} className="font-bold text-lg text-slate-800 dark:text-white hover:underline">
                      {booking.provider?.name || 'Unknown Provider'}
                    </Link>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{booking.provider?.category || 'Service'}</p>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date & Time</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1">
                      <FiClock className="text-teal-600 dark:text-teal-400" /> 
                      {new Date(booking.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-5">{booking.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Location</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate" title={booking.serviceLocation}>
                      {booking.serviceLocation}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 justify-end">
                  <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    Message
                  </button>
                  {booking.status === 'pending' && (
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
