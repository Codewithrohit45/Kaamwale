import { useState, useEffect, useContext } from 'react';
import { FiCheck, FiX, FiClock, FiUser, FiCreditCard } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import { useToast } from '../../components/NotificationToast';

export default function AdminPayouts() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/payouts/admin/requests', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) setRequests(data);
      } catch (err) {
        console.error('Failed to fetch payout requests', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchRequests();
  }, [user]);

  const handleAction = async (id, action) => {
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/payouts/admin/${id}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ action, comments: action === 'complete' ? 'Processed by admin' : 'Rejected by admin' })
      });
      if (res.ok) {
        setRequests(requests.filter(r => r._id !== id));
        toast(`Payout request ${action === 'complete' ? 'approved' : 'rejected'}`, 'success');
      }
    } catch (err) {
      toast('Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Payout Approvals</h1>
        <p className="text-slate-500 text-sm">Review and process withdrawal requests from service providers.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-12 text-center text-slate-500">Loading requests...</p>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FiClock className="mx-auto mb-3 opacity-20" size={48} />
              <p>No pending payout requests.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {requests.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                          {req.provider?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{req.provider?.name}</p>
                          <p className="text-[10px] text-slate-500">{req.provider?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <FiCreditCard /> {req.method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800 dark:text-white">₹{req.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5">
                        <p><span className="font-bold uppercase opacity-50">Holder:</span> {req.payoutDetails?.accountHolder}</p>
                        <p><span className="font-bold uppercase opacity-50">Account:</span> {req.payoutDetails?.accountNumber}</p>
                        <p><span className="font-bold uppercase opacity-50">IFSC:</span> {req.payoutDetails?.ifscCode}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleAction(req._id, 'complete')}
                        disabled={submitting}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                        title="Approve & Release Funds"
                      >
                        <FiCheck />
                      </button>
                      <button 
                        onClick={() => handleAction(req._id, 'fail')}
                        disabled={submitting}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                        title="Reject Request"
                      >
                        <FiX />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
