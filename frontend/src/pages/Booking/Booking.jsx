import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import Button from '../../components/Button';
import { AuthContext } from '../../context/AuthContext';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProvider = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/providers/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProvider(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch provider');
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [id, user, navigate]);

  const handleNext = () => setStep(step + 1);

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          providerId: id,
          serviceLocation: address,
          date,
          time,
          notes: ''
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setStep(3); // Success step
    } catch (err) {
      setError(err.message || 'Booking failed');
      setStep(2); // Stay on address step
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center dark:bg-slate-900"><p className="text-teal-600">Loading booking details...</p></div>;
  if (error && !provider) return <div className="min-h-[70vh] flex items-center justify-center dark:bg-slate-900"><p className="text-red-500">{error}</p></div>;

  if (step === 3) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 dark:bg-slate-900 transition-colors">
        <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mb-6">
          <FiCheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Booking Confirmed!</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">Your request has been sent to {provider.name}. They will review it shortly.</p>
        <Button variant="primary" onClick={() => navigate('/user/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  const defaultImage = `https://ui-avatars.com/api/?name=${provider.name.replace(' ', '+')}&background=14b8a6&color=fff&size=200`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 dark:bg-slate-900 transition-colors min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">Complete Your Booking</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Form */}
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            {step === 1 ? (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><FiCalendar /> Date & Time</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Date</label>
                  <input type="date" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Time</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTime(t)}
                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${time === t ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-700 dark:text-teal-300' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-500'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <Button variant="primary" className="w-full py-3 mt-4" onClick={handleNext} disabled={!date || !time}>Continue to Address</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><FiMapPin /> Location</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Address</label>
                  <textarea 
                    rows="3" 
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white" 
                    placeholder="Enter your exact location..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 py-3" onClick={() => setStep(1)} disabled={submitting}>Back</Button>
                  <Button variant="primary" className="flex-1 py-3" onClick={handleConfirmBooking} disabled={!address || submitting}>
                    {submitting ? 'Confirming...' : 'Confirm Booking'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Summary */}
        <div className="w-full lg:w-80">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 sticky top-24 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Summary</h3>
            <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
              <img src={provider.image || defaultImage} className="w-16 h-16 rounded-xl object-cover" alt="" />
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{provider.name}</p>
                <p className="text-teal-600 dark:text-teal-400 text-sm font-medium">{provider.category}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Hourly Rate</span>
                <span className="font-medium text-slate-800 dark:text-white">₹{provider.hourlyRate || 300}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Hours</span>
                <span className="font-medium text-slate-800 dark:text-white">2 hrs</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Platform Fee</span>
                <span className="font-medium text-slate-800 dark:text-white">₹50</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center mb-6">
              <span className="font-bold text-slate-800 dark:text-white">Total Est.</span>
              <span className="font-bold text-xl text-teal-600 dark:text-teal-400">₹{((provider.hourlyRate || 300) * 2) + 50}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
              <FiCreditCard size={24} className="text-slate-400" />
              <p>Payment is collected after the job is completed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
