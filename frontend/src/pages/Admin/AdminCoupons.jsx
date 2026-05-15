import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiTag, FiCalendar } from 'react-icons/fi';
import Button from '../../components/Button';
import { useToast } from '../../components/NotificationToast';

export default function AdminCoupons() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercentage: '', maxDiscount: '', expiryDate: '' });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/coupons', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        toast('Coupon created successfully!', 'success');
        setShowModal(false);
        fetchCoupons();
      }
    } catch (err) {
      toast('Failed to create coupon', 'error');
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) fetchCoupons();
    } catch (err) {
      toast('Failed to update coupon', 'error');
    }
  };

  if (loading) return <div>Loading coupons...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Promo Codes</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage discounts and promotional offers.</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <FiPlus /> New Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(coupon => (
          <div key={coupon._id} className={`bg-white dark:bg-slate-800 p-6 rounded-3xl border ${coupon.isActive ? 'border-slate-100 dark:border-slate-700' : 'border-red-100 opacity-60'} shadow-sm relative transition-all hover:shadow-md`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg font-bold text-sm">
                <FiTag /> {coupon.code}
              </div>
              <button onClick={() => handleToggle(coupon._id, coupon.isActive)}>
                {coupon.isActive ? <FiToggleRight size={28} className="text-teal-500" /> : <FiToggleLeft size={28} className="text-slate-400" />}
              </button>
            </div>
            
            <div className="space-y-2 mb-6">
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{coupon.discountPercentage}% OFF</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Max Discount: ₹{coupon.maxDiscount}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-4">
              <div className="flex items-center gap-1"><FiCalendar /> {new Date(coupon.expiryDate).toLocaleDateString()}</div>
              <div className="font-bold">{coupon.usageCount} Used</div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Create Coupon</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                  placeholder="e.g. WELCOME50"
                  required
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Discount %</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                    required
                    value={newCoupon.discountPercentage}
                    onChange={e => setNewCoupon({...newCoupon, discountPercentage: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Max Discount</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                    required
                    value={newCoupon.maxDiscount}
                    onChange={e => setNewCoupon({...newCoupon, maxDiscount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                  required
                  value={newCoupon.expiryDate}
                  onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" className="flex-1">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
