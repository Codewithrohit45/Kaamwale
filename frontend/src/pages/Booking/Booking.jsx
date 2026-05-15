import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import Button from '../../components/Button';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../components/NotificationToast';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const toast = useToast();
  
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [workerCount, setWorkerCount] = useState(1);
  const [isEmergency, setIsEmergency] = useState(false);
  const [customerCoords, setCustomerCoords] = useState(null);
  
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

    // Capture location for geofencing
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCustomerCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Location access denied'),
        { enableHighAccuracy: true }
      );
    }

    const fetchProvider = async () => {
      if (!id || id === 'undefined') {
        setError('Invalid provider selection');
        setLoading(false);
        return;
      }
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
          estimatedHours,
          workerCount,
          isEmergency,
          customerCoords,
          notes: ''
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast('Booking confirmed successfully! 🎉', 'success');
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
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">Your request has been sent to {provider.name}. You can track the status and make payments from your dashboard.</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>Back Home</Button>
          <Button variant="primary" onClick={() => navigate('/user/dashboard')}>Go to Dashboard</Button>
        </div>
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
            {step === 1 ? (() => {
              const isDateBlocked = date && provider.unavailableDates && provider.unavailableDates.includes(date);
              const availableSlots = provider.workingHours && provider.workingHours.length > 0
                ? provider.workingHours
                : ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
              const isSlotBlocked = (t) => date && provider.blockedSlots && provider.blockedSlots.some(s => s.date === date && s.time === t);

              return (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><FiCalendar /> Date & Time</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Date</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white" 
                    value={date} 
                    onChange={(e) => { setDate(e.target.value); setTime(''); }} 
                  />
                  {customerCoords ? (
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-1 flex items-center gap-1">
                      <FiMapPin size={10} /> GPS LOCATION CAPTURED
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-600 font-bold mt-1">
                      ⚠️ Enable GPS for better verification
                    </p>
                  )}
                  {isDateBlocked && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      ⚠️ This provider is unavailable on the selected date.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Time Slot</label>
                  {isDateBlocked ? (
                    <p className="text-slate-400 dark:text-slate-500 text-sm py-4 text-center">Pick a different date to see available slots.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.map(t => {
                        const blocked = isSlotBlocked(t);
                        return (
                          <button 
                            key={t}
                            onClick={() => !blocked && setTime(t)}
                            disabled={blocked}
                            className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                              blocked
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-300 dark:text-red-700 cursor-not-allowed line-through'
                                : time === t
                                  ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-700 dark:text-teal-300 shadow-sm'
                                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-500'
                            }`}
                          >
                            {t}
                            {blocked && <span className="block text-[10px] mt-0.5">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <Button 
                  variant="primary" 
                  className="w-full py-3 mt-4" 
                  onClick={handleNext} 
                  disabled={!date || !time || isDateBlocked || isSlotBlocked(time)}
                >
                  Continue to Address
                </Button>
              </div>
              );
            })() : (
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
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Service Fee ({estimatedHours} hrs × {workerCount} {workerCount > 1 ? 'workers' : 'worker'})</span>
                    <span className="font-bold text-slate-800 dark:text-white">₹{(provider.hourlyRate * estimatedHours * workerCount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Platform Fee</span>
                    <span className="font-bold text-slate-800 dark:text-white">₹50</span>
                  </div>
                  {isEmergency && (
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>Emergency Priority</span>
                      <span>+ ₹100</span>
                    </div>
                  )}
                  <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <Button variant="outline" className="flex-1 py-3" onClick={() => setStep(1)} disabled={submitting}>Back</Button>
                    <div className="flex-[2] text-right">
                      <p className="text-sm font-medium text-slate-500">Total Amount</p>
                      <p className="text-3xl font-black text-teal-600">₹{(provider.hourlyRate * estimatedHours * workerCount + 50 + (isEmergency ? 100 : 0)).toLocaleString()}</p>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full py-4 mt-2" onClick={handleConfirmBooking} disabled={submitting || !address}>
                    {submitting ? 'Processing...' : 'Confirm & Book Now'}
                  </Button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    * Final platform fee may vary based on service category and location.
                  </p>
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
              
              {/* Bulk Hiring - Show for Labour/Mason */}
              {['Labour', 'Mason'].includes(provider.category) && (
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <div className="flex flex-col">
                    <span>Number of Workers</span>
                    <span className="text-[10px] text-teal-600 font-bold">BULK HIRING</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setWorkerCount(Math.max(1, workerCount - 1))} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">-</button>
                    <span className="font-bold text-slate-800 dark:text-white w-8 text-center">{workerCount}</span>
                    <button onClick={() => setWorkerCount(Math.min(20, workerCount + 1))} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">+</button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Estimated Hours</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEstimatedHours(Math.max(1, estimatedHours - 1))} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">-</button>
                  <span className="font-bold text-slate-800 dark:text-white w-8 text-center">{estimatedHours}</span>
                  <button onClick={() => setEstimatedHours(Math.min(8, estimatedHours + 1))} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">+</button>
                </div>
              </div>

              {/* Emergency Service */}
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <div className="flex flex-col">
                  <span>Emergency Priority</span>
                  <span className="text-[10px] text-red-500 font-bold">QUICK RESPONSE</span>
                </div>
                <button 
                  onClick={() => setIsEmergency(!isEmergency)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isEmergency ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isEmergency ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Platform Fee</span>
                <span className="font-medium text-slate-800 dark:text-white">₹50</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center mb-6">
              <span className="font-bold text-slate-800 dark:text-white">Total Est.</span>
              <span className="font-bold text-xl text-teal-600 dark:text-teal-400">₹{((provider.hourlyRate || 300) * estimatedHours * workerCount) + 50}</span>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/10 p-4 rounded-xl flex items-center gap-3 text-teal-700 dark:text-teal-400 text-xs font-medium">
              <FiCreditCard size={24} className="text-teal-500" />
              <p>You can pay online via Razorpay once the booking is confirmed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
