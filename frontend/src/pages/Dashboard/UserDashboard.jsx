import { useState, useEffect, useContext } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiStar, FiMapPin, FiDollarSign, FiCreditCard, FiDownload } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../../components/Button';
...
                    {booking.status === 'in-progress' && (
                      <button
                        onClick={() => setTrackingModal(booking)}
                        className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 transition-colors text-sm flex items-center gap-1"
                      >
                        <FiMapPin size={14} /> Track Worker
                      </button>
                    )}
                    {booking.status === 'in-progress' && booking.otpRequested && (
...
      {/* Live Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-300">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Live Worker Tracking</h3>
                <p className="text-sm text-slate-500">Tracking: {trackingModal.provider?.name}</p>
              </div>
              <button onClick={() => setTrackingModal(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <FiXCircle size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <MapContainer 
                center={[workerLocations[trackingModal._id]?.lat || 19.0760, workerLocations[trackingModal._id]?.lng || 72.8777]} 
                zoom={14} 
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* Destination (Customer) */}
                <Marker position={[trackingModal.customerCoords?.coordinates[1] || 19.0760, trackingModal.customerCoords?.coordinates[0] || 72.8777]}>
                  <Popup>Service Location</Popup>
                </Marker>

                {/* Worker */}
                {workerLocations[trackingModal._id] && (
                  <Marker 
                    position={[workerLocations[trackingModal._id].lat, workerLocations[trackingModal._id].lng]}
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div style="background-color: #14b8a6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10]
                    })}
                  >
                    <Popup>Worker is here</Popup>
                  </Marker>
                )}
                <RecenterMap coords={workerLocations[trackingModal._id]} />
              </MapContainer>

              <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 z-[1000] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center animate-pulse">
                    <FiMapPin className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Real-time GPS Tracking Active</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Updates every 30 seconds</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Est. Arrival</p>
                  <p className="font-bold text-teal-600">Calculating...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
import { useToast } from '../../components/NotificationToast';

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView([coords.lat, coords.lng], map.getZoom());
  }, [coords, map]);
  return null;
};

export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const { socket } = useSocket();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewModal, setReviewModal] = useState(null); // booking id for review
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(null); // booking id for payment loading
  const [disputeModal, setDisputeModal] = useState(null); // booking id for dispute
  const [disputeData, setDisputeData] = useState({ reason: '', details: '' });
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [showOtp, setShowOtp] = useState(null); // { id, otp }
  const [trackingModal, setTrackingModal] = useState(null); // booking object
  const [workerLocations, setWorkerLocations] = useState({}); // { bookingId: { lat, lng } }

  useEffect(() => {
    if (!socket) return;
    socket.on('workerLocationChanged', ({ bookingId, coords }) => {
      setWorkerLocations(prev => ({ ...prev, [bookingId]: coords }));
    });
    return () => socket.off('workerLocationChanged');
  }, [socket]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/bookings/mybookings', {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        const data = await res.json();
        if (res.ok) setBookings(data);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchBookings();
  }, [user]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ reason: 'Cancelled by user' })
      });
      if (res.ok) {
        const booking = bookings.find(b => b._id === bookingId);
        if (booking && socket) {
          socket.emit('bookingUpdate', { receiverId: booking.provider?._id, bookingId, status: 'cancelled' });
        }
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'cancelled', cancelledBy: 'user' } : b));
        toast('Booking cancelled successfully', 'info');
      }
    } catch (err) {
      console.error('Cancel failed', err);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${reviewModal}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ rating: reviewRating, review: reviewText })
      });
      if (res.ok) {
        setBookings(bookings.map(b => b._id === reviewModal ? { ...b, rating: reviewRating, review: reviewText } : b));
        setReviewModal(null);
        setReviewRating(0);
        setReviewText('');
        toast('Review submitted! Thank you for your feedback ⭐', 'success');
      }
    } catch (err) {
      console.error('Review submit failed', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handlePayment = async (booking) => {
    setPaymentLoading(booking._id);
    try {
      // 1. Create order on backend
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ bookingId: booking._id })
      });
      const orderData = await res.json();

      if (!res.ok) throw new Error(orderData.message);

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount * 100,
        currency: orderData.order.currency,
        name: "Kaamwale",
        description: `Payment for ${booking.provider?.category} service`,
        order_id: orderData.order.orderId,
        handler: async (response) => {
          // 3. Verify payment on backend
          try {
            const verifyRes = await fetch(`http://localhost:5000/api/orders/${orderData.order._id}/payment`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyRes.ok) {
              setBookings(bookings.map(b => b._id === booking._id ? { ...b, paymentStatus: 'paid' } : b));
              toast('Payment successful! 🎉', 'success');
            } else {
              toast('Payment verification failed', 'error');
            }
          } catch (err) {
            toast('Error verifying payment', 'error');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#14b8a6" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast(err.message || 'Failed to initiate payment', 'error');
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleRaiseDispute = async () => {
    if (!disputeData.reason || !disputeData.details) return;
    setDisputeSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${disputeModal}/dispute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(disputeData)
      });
      if (res.ok) {
        const booking = bookings.find(b => b._id === disputeModal);
        if (booking && socket) {
          socket.emit('bookingUpdate', { receiverId: booking.provider?._id, bookingId: disputeModal, status: 'disputed' });
        }
        setBookings(bookings.map(b => b._id === disputeModal ? { ...b, dispute: { isRaised: true, ...disputeData } } : b));
        setDisputeModal(null);
        setDisputeData({ reason: '', details: '' });
        toast('Dispute raised. Admin will review it.', 'warning');
      }
    } catch (err) {
      console.error('Dispute failed', err);
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/invoice`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${bookingId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        toast('Failed to download invoice', 'error');
      }
    } catch (err) {
      console.error('Invoice download failed', err);
      toast('Error downloading invoice', 'error');
    }
  };

  const handleApproveWork = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/approve-work`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setShowOtp({ id: bookingId, otp: data.otp });
      }
    } catch (err) {
      console.error('Approve failed', err);
    }
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const getStatusStyle = (status) => {
    const styles = {
      'pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'accepted': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      'in-progress': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'completed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'accepted': case 'in-progress': return <FiCheckCircle />;
      case 'completed': return <FiCheckCircle />;
      case 'cancelled': return <FiXCircle />;
      default: return null;
    }
  };

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => ['pending', 'accepted', 'in-progress'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalSpent: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || 0), 0),
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-slate-500">Loading bookings...</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 dark:bg-slate-900 transition-colors pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">My Bookings</h1>
        <p className="text-slate-600 dark:text-slate-400">Track and manage your service requests.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: stats.total, icon: <FiClock />, color: 'text-slate-600 bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300' },
          { label: 'Active', value: stats.active, icon: <FiCheckCircle />, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400' },
          { label: 'Completed', value: stats.completed, icon: <FiCheckCircle />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
          { label: 'Total Spent', value: `₹${stats.totalSpent}`, icon: <FiDollarSign />, color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs + Bookings List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {['all', 'pending', 'accepted', 'in-progress', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-5 py-3.5 text-sm font-medium capitalize whitespace-nowrap transition-colors ${filter === f ? 'text-teal-600 border-b-2 border-teal-600 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {f === 'in-progress' ? 'In Progress' : f}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No bookings found.</p>
              <Link to="/search" className="text-teal-600 font-medium hover:underline mt-2 inline-block">Find a Service Provider</Link>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking._id} className={`p-5 border rounded-2xl relative overflow-hidden transition-colors ${booking.status === 'accepted' || booking.status === 'in-progress' ? 'border-teal-200 dark:border-teal-900/50 bg-white dark:bg-slate-800' : 'border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'}`}>
                {['accepted', 'in-progress'].includes(booking.status) && <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>}

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Provider Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={booking.provider?.image || `https://ui-avatars.com/api/?name=${booking.provider?.name?.replace(' ', '+')}&background=random`}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover bg-white flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded capitalize ${getStatusStyle(booking.status)}`}>
                        {getStatusIcon(booking.status)} {booking.status === 'in-progress' ? 'In Progress' : booking.status}
                      </span>
                      <Link to={`/provider/${booking.provider?._id}`} className="block font-bold text-slate-800 dark:text-white hover:underline mt-1 truncate">
                        {booking.provider?.name || 'Provider'}
                      </Link>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{booking.provider?.category}</p>
                      {booking.paymentStatus === 'paid' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded mt-1">
                          <FiCheckCircle size={10} /> PAID
                        </span>
                      )}
                      {booking.paymentStatus === 'refunded' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded mt-1">
                          <FiXCircle size={10} /> REFUNDED
                        </span>
                      )}
                      {booking.isEmergency && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded mt-1 ml-2 animate-pulse">
                          🚨 EMERGENCY
                        </span>
                      )}
                      {booking.isLocationVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-1.5 py-0.5 rounded mt-1 ml-2">
                          <FiMapPin size={10} /> VERIFIED LOCATION
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Date & Time</p>
                      <p className="font-semibold text-slate-800 dark:text-white text-xs">{new Date(booking.date).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{booking.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Location</p>
                      <p className="font-semibold text-slate-800 dark:text-white text-xs truncate" title={booking.serviceLocation}>
                        {booking.serviceLocation}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Total</p>
                      <p className="font-bold text-teal-600 dark:text-teal-400">₹{booking.totalPrice || '--'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {booking.status === 'completed' && (
                      <button
                        onClick={() => handleDownloadInvoice(booking._id)}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm flex items-center gap-1"
                      >
                        <FiDownload size={14} /> Invoice
                      </button>
                    )}
                    {booking.status === 'completed' && !booking.rating && (
                      <button
                        onClick={() => setReviewModal(booking._id)}
                        className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-sm flex items-center gap-1"
                      >
                        <FiStar size={14} /> Rate
                      </button>
                    )}
                    {booking.status === 'completed' && booking.rating && (
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <FiStar size={14} /> {booking.rating}/5
                      </span>
                    )}
                    {booking.status === 'in-progress' && booking.otpRequested && (
                      <button
                        onClick={() => handleApproveWork(booking._id)}
                        className="px-3 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                      >
                        Approve Work
                      </button>
                    )}
                    {['pending', 'accepted'].includes(booking.status) && (
                      <>
                        {booking.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => handlePayment(booking)}
                            disabled={paymentLoading === booking._id}
                            className="px-3 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition-colors text-sm flex items-center gap-1 shadow-md shadow-teal-500/20 disabled:opacity-50"
                          >
                            <FiCreditCard size={14} /> {paymentLoading === booking._id ? '...' : 'Pay Now'}
                          </button>
                        )}
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="px-3 py-2 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {['in-progress', 'completed'].includes(booking.status) && !booking.dispute?.isRaised && (
                      <button
                        onClick={() => setDisputeModal(booking._id)}
                        className="px-3 py-2 bg-white dark:bg-slate-700 border border-red-500 text-red-500 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm"
                      >
                        Raise Dispute
                      </button>
                    )}
                    {booking.dispute?.isRaised && (
                      <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                        DISPUTED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Rate Your Experience</h3>

            {/* Star Rating */}
            <div className="flex gap-2 mb-6 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`p-2 rounded-lg transition-all duration-200 ${star <= reviewRating
                      ? 'text-amber-500 scale-110'
                      : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
                    }`}
                >
                  <FiStar size={32} fill={star <= reviewRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
              {reviewRating === 0 ? 'Tap a star to rate' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
            </p>

            <textarea
              rows="3"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a review (optional)..."
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white mb-4 text-sm"
            ></textarea>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 py-2.5" onClick={() => { setReviewModal(null); setReviewRating(0); setReviewText(''); }}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1 py-2.5" onClick={handleSubmitReview} disabled={!reviewRating || reviewSubmitting}>
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Dispute Modal */}
      {disputeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
              <FiXCircle /> Raise a Dispute
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Our support team will review this and contact both parties.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Reason</label>
                <select
                  value={disputeData.reason}
                  onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white text-sm"
                >
                  <option value="">Select a reason</option>
                  <option value="Work not completed">Work not completed</option>
                  <option value="Poor quality of work">Poor quality of work</option>
                  <option value="Provider was unprofessional">Provider was unprofessional</option>
                  <option value="Incorrect billing/price">Incorrect billing/price</option>
                  <option value="Provider did not show up">Provider did not show up</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Details</label>
                <textarea
                  rows="4"
                  value={disputeData.details}
                  onChange={(e) => setDisputeData({ ...disputeData, details: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-white text-sm"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 py-2.5" onClick={() => setDisputeModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 border-red-600" onClick={handleRaiseDispute} disabled={disputeSubmitting || !disputeData.reason || !disputeData.details}>
                {disputeSubmitting ? 'Raising...' : 'Raise Dispute'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* OTP Modal */}
      {showOtp && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Work Approved!</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Please share this completion OTP with the worker to finalize the payment.</p>
            <div className="bg-slate-100 dark:bg-slate-900 py-4 rounded-2xl mb-8">
              <span className="text-4xl font-black tracking-[12px] text-teal-600 dark:text-teal-400 ml-3">
                {showOtp.otp}
              </span>
            </div>
            <Button variant="primary" className="w-full py-3" onClick={() => setShowOtp(null)}>
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* Live Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-300">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Live Worker Tracking</h3>
                <p className="text-sm text-slate-500">Tracking: {trackingModal.provider?.name}</p>
              </div>
              <button onClick={() => setTrackingModal(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <FiXCircle size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <MapContainer 
                center={[workerLocations[trackingModal._id]?.lat || 19.0760, workerLocations[trackingModal._id]?.lng || 72.8777]} 
                zoom={14} 
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* Destination (Customer) */}
                <Marker position={[trackingModal.customerCoords?.coordinates[1] || 19.0760, trackingModal.customerCoords?.coordinates[0] || 72.8777]}>
                  <Popup>Service Location</Popup>
                </Marker>

                {/* Worker */}
                {workerLocations[trackingModal._id] && (
                  <Marker 
                    position={[workerLocations[trackingModal._id].lat, workerLocations[trackingModal._id].lng]}
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div style="background-color: #14b8a6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10]
                    })}
                  >
                    <Popup>Worker is here</Popup>
                  </Marker>
                )}
                <RecenterMap coords={workerLocations[trackingModal._id]} />
              </MapContainer>

              <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 z-[1000] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center animate-pulse">
                    <FiMapPin className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Real-time GPS Tracking Active</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Updates every 30 seconds</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Est. Arrival</p>
                  <p className="font-bold text-teal-600">Calculating...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
