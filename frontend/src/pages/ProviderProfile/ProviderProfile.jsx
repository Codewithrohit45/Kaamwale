import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { FiStar, FiClock, FiCheckCircle, FiPhone, FiMessageCircle, FiCalendar, FiMapPin } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import Button from '../../components/Button';
import { AuthContext } from '../../context/AuthContext';

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, avgRating: 0, distribution: [0, 0, 0, 0, 0] });

  useEffect(() => {
    const fetchProvider = async () => {
      if (!id || id === 'undefined') {
        setError('Invalid provider ID');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/providers/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setProvider(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch provider details');
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id || id === 'undefined') return;
      try {
        const res = await fetch(`http://localhost:5000/api/providers/${id}/reviews`);
        const data = await res.json();
        if (res.ok) {
          setReviews(data.reviews || []);
          setReviewStats(data.stats || { totalReviews: 0, avgRating: 0, distribution: [0, 0, 0, 0, 0] });
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    };
    fetchReviews();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900"><p className="text-xl text-teal-600">Loading Provider...</p></div>;
  }

  if (error || !provider) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900"><p className="text-xl text-red-500">{error || 'Provider not found'}</p></div>;
  }

  const defaultImage = `https://ui-avatars.com/api/?name=${provider.name.replace(' ', '+')}&background=14b8a6&color=fff&size=400`;
  const workingHours = provider.workingHours && provider.workingHours.length > 0
    ? provider.workingHours
    : ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];
  const blockedDates = provider.unavailableDates || [];

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    return (
      <div className="flex text-amber-500">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            size={18}
            className={i < fullStars ? 'fill-current' : (i === fullStars && halfStar ? 'fill-current opacity-50' : 'text-slate-300 dark:text-slate-600')}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-12 transition-colors">
      {/* Header Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-teal-600 to-indigo-700 w-full relative">
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 md:p-10 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-8 transition-colors">

          {/* Profile Image & Quick Actions */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-200 -mt-20 md:-mt-32 mb-6">
              <img src={provider.image || defaultImage} alt={provider.name} className="w-full h-full object-cover" />
            </div>

            {provider.isVerified && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold mb-3 border border-blue-100 dark:border-blue-800">
                <MdVerified size={14} /> VERIFIED PROFESSIONAL
              </div>
            )}

            <h1 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-1">{provider.name}</h1>
            <p className="text-teal-600 dark:text-teal-400 font-semibold mb-4">{provider.category}</p>

            <div className="flex items-center gap-2 mb-6">
              {renderStars(reviewStats.avgRating || provider.rating || 0)}
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {reviewStats.avgRating || provider.rating || 0} ({reviewStats.totalReviews || provider.reviewsCount || 0} reviews)
              </span>
            </div>

            <div className="w-full space-y-3">
              <Link to={`/book/${provider._id}`} className="block w-full">
                <Button variant="primary" className="w-full py-3 text-lg rounded-xl">Book Now</Button>
              </Link>
              <Button
                variant="outline"
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                onClick={() => {
                  if (!user) { navigate('/login'); return; }
                  // Send a hello message to start the conversation
                  fetch('http://localhost:5000/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                    body: JSON.stringify({ receiverId: provider._id, text: `Hi ${provider.name}, I'm interested in your services!` })
                  }).then(() => navigate(user.role === 'provider' ? '/provider/messages' : '/user/messages'));
                }}
              >
                <FiMessageCircle /> Message
              </Button>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 text-center transition-colors">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Rate</p>
                <p className="font-bold text-xl text-slate-800 dark:text-white">₹{provider.hourlyRate || 300}/hr</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 text-center transition-colors">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Location</p>
                <p className="font-bold text-slate-800 dark:text-white truncate">{provider.location ? provider.location.split(',')[0] : 'Local Area'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 text-center transition-colors">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Reviews</p>
                <p className="font-bold text-xl text-slate-800 dark:text-white">{reviewStats.totalReviews}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 text-center transition-colors">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Response</p>
                <p className="font-bold text-xl text-slate-800 dark:text-white">&lt; 1 hr</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">About Me</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Experienced and reliable {provider.category} professional ready to help with your tasks. I ensure top quality service and customer satisfaction.
              </p>
            </div>

            {provider.packages && provider.packages.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Service Packages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.packages.map((pkg, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 border-2 border-teal-50 dark:border-teal-900/30 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">{pkg.name}</h3>
                        <span className="text-teal-600 dark:text-teal-400 font-bold text-xl">₹{pkg.price}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{pkg.description}</p>
                      <ul className="space-y-2">
                        {pkg.features.map((f, fi) => (
                          <li key={fi} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <FiCheckCircle className="text-teal-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Skills & Specialties</h2>
              <div className="flex flex-wrap gap-2">
                <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2">
                  <FiCheckCircle /> General Service
                </span>
                <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2">
                  <FiCheckCircle /> Professional Tooling
                </span>
              </div>
            </div>

            {/* Real Availability Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><FiCalendar /> Availability</h2>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 transition-colors">
                {/* Working Hours */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Working Hours</h3>
                  <div className="flex flex-wrap gap-2">
                    {workingHours.map(slot => (
                      <span key={slot} className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-sm font-medium rounded-lg border border-teal-200 dark:border-teal-800">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Blocked Dates */}
                {blockedDates.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Unavailable Dates</h3>
                    <div className="flex flex-wrap gap-2">
                      {blockedDates.slice(0, 10).map(date => (
                        <span key={date} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/15 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg border border-red-200 dark:border-red-900/30 line-through">
                          {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      ))}
                      {blockedDates.length > 10 && (
                        <span className="px-3 py-1.5 text-slate-500 text-sm">+{blockedDates.length - 10} more</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <FiCheckCircle /> Available all weekdays
                  </p>
                )}
              </div>
            </div>

            {/* Reviews Section — Real Data */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Client Reviews</h2>
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Aggregate Stats */}
                <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                  <h3 className="text-5xl font-extrabold text-amber-500">{reviewStats.avgRating || provider.rating || '—'}</h3>
                  <div className="my-2">{renderStars(reviewStats.avgRating || provider.rating || 0)}</div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Based on {reviewStats.totalReviews} reviews</p>
                </div>
                {/* Distribution Bars */}
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviewStats.distribution[stars - 1] || 0;
                    const pct = reviewStats.totalReviews > 0 ? Math.round((count / reviewStats.totalReviews) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-16 text-right">{stars} Stars</span>
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-slate-500 w-12">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual Reviews */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 transition-colors">
                      <div className="flex items-start gap-4">
                        <img
                          src={r.user?.image || `https://ui-avatars.com/api/?name=${r.user?.name?.replace(' ', '+')}&background=random&size=80`}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-slate-800 dark:text-white">{r.user?.name || 'Anonymous'}</h4>
                            <span className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString()}</span>
                          </div>
                          <div className="mb-2">{renderStars(r.rating)}</div>
                          {r.review && (
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{r.review}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <FiStar className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={32} />
                  <p className="text-slate-500 dark:text-slate-400">No reviews yet. Be the first to book and review!</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
