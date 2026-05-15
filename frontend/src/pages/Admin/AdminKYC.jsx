import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiCheck, FiX, FiEye, FiClock, FiAlertCircle } from 'react-icons/fi';
import Button from '../../components/Button';
import { useToast } from '../../components/NotificationToast';

export default function AdminKYC() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // provider id
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchPendingKYC = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          // Filter providers with pending KYC
          setProviders(data.filter(p => p.role === 'provider' && p.kyc?.status === 'pending'));
        }
      } catch (err) {
        console.error('Failed to fetch pending KYC', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingKYC();
  }, [user]);

  const handleReview = async (id, status, reason = '') => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/kyc`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status, rejectedReason: reason })
      });

      if (res.ok) {
        setProviders(providers.filter(p => p._id !== id));
        setRejectModal(null);
        setRejectReason('');
        toast(`KYC ${status === 'verified' ? 'approved' : 'rejected'} successfully`, 'success');
      }
    } catch (err) {
      toast('Failed to update KYC status', 'error');
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Loading pending requests...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">KYC Verification</h1>
          <p className="text-slate-500 dark:text-slate-400">Review identity documents submitted by providers.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
          <FiClock className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-indigo-700 dark:text-indigo-300 font-bold">{providers.length} Pending</span>
        </div>
      </div>

      {providers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-700">
          <FiCheck className="mx-auto text-slate-200 dark:text-slate-700 mb-4" size={64} />
          <p className="text-slate-500 dark:text-slate-400 text-lg">No pending KYC requests. Good job!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(provider => (
            <div key={provider._id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group">
              <div className="h-40 bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                <img 
                  src={provider.kyc.documentUrl} 
                  alt="Document" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button 
                  onClick={() => setSelectedDoc(provider.kyc.documentUrl)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2"
                >
                  <FiEye /> View Document
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={provider.image || `https://ui-avatars.com/api/?name=${provider.name}`} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{provider.name}</h3>
                    <p className="text-xs text-indigo-500 font-bold uppercase">{provider.kyc.documentType.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleReview(provider._id, 'verified')}
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1 transition-colors"
                  >
                    <FiCheck /> Approve
                  </button>
                  <button 
                    onClick={() => setRejectModal(provider._id)}
                    className="flex-1 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FiX /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-10" onClick={() => setSelectedDoc(null)}>
          <button className="absolute top-10 right-10 text-white hover:text-red-500 transition-colors">
            <FiX size={40} />
          </button>
          <img src={selectedDoc} className="max-w-full max-h-full rounded-2xl shadow-2xl" />
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <FiAlertCircle size={24} />
              <h3 className="text-xl font-bold">Reject Verification</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Please provide a reason for rejecting this document. This will be shown to the provider.</p>
            
            <textarea 
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Document is blurry, ID expired, mismatching name..."
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm mb-6 transition-all"
            ></textarea>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 py-3" onClick={() => setRejectModal(null)}>Cancel</Button>
              <Button variant="primary" className="flex-1 py-3 bg-red-600 hover:bg-red-700 border-red-600 shadow-lg shadow-red-500/20" onClick={() => handleReview(rejectModal, 'rejected', rejectReason)} disabled={!rejectReason}>
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
