import { useState, useEffect, useContext } from 'react';
import { FiSearch, FiCalendar, FiXCircle, FiCheckCircle, FiClock, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';

export default function AdminBookings() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/bookings', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchBookings();
  }, [user]);

  const handleCancel = async (bookingId) => {
    const reason = window.prompt('Enter cancellation reason:');
    if (reason === null) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'cancelled', cancelledBy: 'admin', cancellationReason: reason } : b));
      }
    } catch (err) {
      console.error('Cancel failed', err);
    }
  };

  const handleResolveDispute = async (status) => {
    if (!resolution) return alert('Please enter resolution details');

    try {
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${selectedBooking._id}/resolve-dispute`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status, resolution })
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(bookings.map(b => b._id === selectedBooking._id ? updated.booking : b));
        setShowResolveModal(false);
        setSelectedBooking(null);
        setResolution('');
      }
    } catch (err) {
      console.error('Resolution failed', err);
    }
  };

  const filtered = bookings.filter(b => {
    const matchesSearch = 
      b.user?.name.toLowerCase().includes(search.toLowerCase()) || 
      b.provider?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : 
                         statusFilter === 'disputed' ? b.dispute?.isRaised : 
                         b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-8 text-center text-slate-500">Loading bookings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
          <p className="text-sm text-slate-500 mt-1">{bookings.length} total bookings on the platform</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer or provider name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'disputed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">Customer</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">Provider</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">Schedule</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">Price</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">Status</th>
                <th className="py-3 px-4 font-semibold text-xs text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm">
                    <div className="font-medium text-slate-800">{b.user?.name}</div>
                    <div className="text-[10px] text-slate-400">{b.user?.email}</div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="font-medium text-slate-800">{b.provider?.name}</div>
                    <div className="text-[10px] text-slate-400">{b.provider?.category}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    <div>{new Date(b.date).toLocaleDateString()}</div>
                    <div className="text-xs">{b.time}</div>
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-slate-700">₹{b.totalPrice}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full capitalize w-max ${
                        b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                        b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {b.status}
                      </span>
                      {b.dispute?.isRaised && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                          <FiAlertTriangle /> DISPUTED ({b.dispute.status})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex gap-2">
                      {b.dispute?.isRaised && b.dispute.status === 'pending' && (
                        <button
                          onClick={() => { setSelectedBooking(b); setShowResolveModal(true); }}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                        >
                          Resolve Dispute
                        </button>
                      )}
                      {!['completed', 'cancelled'].includes(b.status) && (
                        <button
                          onClick={() => handleCancel(b._id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Cancel Booking"
                        >
                          <FiXCircle size={18} />
                        </button>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="View Details">
                        <FiInfo size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <FiCalendar className="mx-auto text-slate-200 mb-3" size={48} />
            <p className="text-slate-500">No bookings found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Resolve Dispute</h3>
            <div className="bg-red-50 p-3 rounded-lg mb-4 text-sm text-red-800">
              <p><strong>Reason:</strong> {selectedBooking.dispute.reason}</p>
              <p className="mt-1"><strong>Details:</strong> {selectedBooking.dispute.details}</p>
            </div>
            
            <label className="block text-sm font-medium text-slate-700 mb-1">Resolution Summary</label>
            <textarea
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32"
              placeholder="Explain how the dispute was resolved..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            ></textarea>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleResolveDispute('resolved')}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors"
              >
                Accept Dispute (Refund User)
              </button>
              <button
                onClick={() => handleResolveDispute('dismissed')}
                className="flex-1 bg-slate-800 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-slate-900 transition-colors"
              >
                Dismiss Dispute
              </button>
            </div>
            <button
              onClick={() => { setShowResolveModal(false); setSelectedBooking(null); }}
              className="w-full mt-3 text-slate-500 text-sm font-medium hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}