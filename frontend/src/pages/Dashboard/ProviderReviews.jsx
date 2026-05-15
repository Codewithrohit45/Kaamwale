import { useState, useEffect, useContext } from 'react';
import { FiStar, FiMessageCircle, FiCalendar } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';

export default function ProviderReviews() {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const providerId = user?._id || user?.id;
        const res = await fetch(`http://localhost:5000/api/providers/${providerId}/reviews`);
        const data = await res.json();
        if (res.ok) setReviews(data.reviews || []);
      } catch (err) {
        console.error('Fetch reviews failed', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchReviews();
  }, [user]);

  if (loading) return <div className="text-center py-12"><p className="text-slate-500">Loading reviews...</p></div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Customer Reviews</h1>
          <p className="text-slate-600 dark:text-slate-400">See what your customers are saying about your work.</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-amber-500 justify-end mb-1">
            <FiStar fill="currentColor" size={24} />
            <span className="text-3xl font-black">{averageRating}</span>
          </div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{reviews.length} total reviews</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
            <FiMessageCircle className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No reviews yet.</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Complete more bookings to get feedback!</p>
          </div>
        ) : (
          reviews.map((review, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold">
                    {review.user?.name?.[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{review.user?.name}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><FiCalendar size={12} /> {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed">
                "{review.review || 'No comment provided.'}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
