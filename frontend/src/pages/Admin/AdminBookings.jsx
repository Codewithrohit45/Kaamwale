import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function AdminBookings() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/bookings', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setBookings(data);
        }
      } catch (error) {
        console.error('Error fetching bookings', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) {
      fetchBookings();
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading bookings...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">All Bookings</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-sm text-slate-600">ID</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-600">User</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-600">Provider</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-600">Date</th>
                <th className="py-3 px-4 font-semibold text-sm text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500 text-xs font-mono">{b._id.substring(b._id.length - 6)}</td>
                  <td className="py-3 px-4 text-slate-800">{b.user?.name || 'Unknown'}</td>
                  <td className="py-3 px-4 text-slate-800">{b.provider?.name || 'Unknown'}</td>
                  <td className="py-3 px-4 text-slate-600">{new Date(b.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bookings.length === 0 && (
          <div className="p-8 text-center text-slate-500">No bookings found.</div>
        )}
      </div>
    </div>
  );
}
