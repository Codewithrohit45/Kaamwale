import { useState, useEffect, useContext } from 'react';
import { FiDollarSign, FiPlus, FiCheckCircle, FiClock, FiAlertCircle, FiCreditCard } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import { useToast } from '../../components/NotificationToast';

export default function ProviderPayouts() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  
  const [bankDetails, setBankDetails] = useState({
    accountHolder: user?.payoutDetails?.accountHolder || '',
    accountNumber: user?.payoutDetails?.accountNumber || '',
    ifscCode: user?.payoutDetails?.ifscCode || '',
    vpa: user?.payoutDetails?.vpa || ''
  });
  
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/payouts/my-payouts', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) setPayouts(data);
      } catch (err) {
        console.error('Failed to fetch payouts', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchPayouts();
  }, [user]);

  const handleUpdateBank = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/payouts/details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(bankDetails)
      });
      if (res.ok) {
        toast('Payout details updated successfully', 'success');
        setShowBankModal(false);
      }
    } catch (err) {
      toast('Failed to update details', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (parseFloat(withdrawAmount) < 500) {
      return toast('Minimum withdrawal is ₹500', 'error');
    }
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/payouts/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount), method: 'bank_transfer' })
      });
      const data = await res.json();
      if (res.ok) {
        setPayouts([data.payout, ...payouts]);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        toast('Withdrawal request submitted! 🚀', 'success');
      } else {
        toast(data.message, 'error');
      }
    } catch (err) {
      toast('Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 dark:bg-slate-900 transition-colors pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Earnings & Payouts</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your financial details and withdraw your earnings.</p>
        </div>
        <button 
          onClick={() => setShowBankModal(true)}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
        >
          <FiCreditCard /> Bank Details
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-6 rounded-3xl text-white shadow-xl shadow-teal-500/20">
          <p className="text-teal-100 text-sm font-medium mb-1">Total Earnings</p>
          <p className="text-4xl font-black">₹{user?.totalEarnings?.toLocaleString() || 0}</p>
          <p className="text-teal-200 text-xs mt-3 flex items-center gap-1"><FiCheckCircle /> Lifetime revenue</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Withdrawable Balance</p>
          <p className="text-4xl font-black text-slate-800 dark:text-white">₹{user?.withdrawableBalance?.toLocaleString() || 0}</p>
          <button 
            disabled={user?.withdrawableBalance < 500}
            onClick={() => setShowWithdrawModal(true)}
            className="mt-4 w-full bg-slate-900 dark:bg-slate-700 text-white py-2.5 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Withdraw Now
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-amber-500 font-bold mb-1">
            <FiClock /> Payout Policy
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            Requests are processed within 24-48 hours. Min withdrawal ₹500. A small transaction fee may apply.
          </p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-50 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Payout History</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-12 text-center text-slate-500">Loading history...</p>
          ) : payouts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FiDollarSign className="mx-auto mb-3" size={32} />
              <p>No payout history found yet.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID & Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {payouts.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-white text-sm">#{p._id.toString().slice(-6)}</p>
                      <p className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white text-sm">₹{p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusStyle(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">{p.referenceId || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Financial Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Account Holder Name</label>
                <input 
                  type="text" 
                  value={bankDetails.accountHolder}
                  onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white text-sm"
                  placeholder="As per bank records"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Account Number</label>
                  <input 
                    type="password" 
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white text-sm"
                    placeholder="••••••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">IFSC Code</label>
                  <input 
                    type="text" 
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white text-sm"
                    placeholder="SBIN0001234"
                  />
                </div>
              </div>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-700"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-800 px-2 text-slate-400">Or UPI ID</span></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">VPA / UPI ID</label>
                <input 
                  type="text" 
                  value={bankDetails.vpa}
                  onChange={(e) => setBankDetails({...bankDetails, vpa: e.target.value})}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white text-sm"
                  placeholder="username@okaxis"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 py-3" onClick={() => setShowBankModal(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1 py-3" onClick={handleUpdateBank} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Details'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Withdraw Funds</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Enter the amount you wish to withdraw to your configured bank account.</p>
            
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
              <input 
                type="number" 
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none text-3xl font-black text-center py-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="0.00"
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 py-3" onClick={() => setShowWithdrawModal(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1 py-3" onClick={handleWithdraw} disabled={submitting || !withdrawAmount}>
                {submitting ? 'Processing...' : 'Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
