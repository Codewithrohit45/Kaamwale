import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiStar, FiClock, FiCheckCircle, FiPhone } from 'react-icons/fi';
import Button from '../../components/Button';

export default function ProviderProfile() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProvider = async () => {
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900"><p className="text-xl text-teal-600">Loading Provider...</p></div>;
  }

  if (error || !provider) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900"><p className="text-xl text-red-500">{error || 'Provider not found'}</p></div>;
  }

  const defaultImage = `https://ui-avatars.com/api/?name=${provider.name.replace(' ', '+')}&background=14b8a6&color=fff&size=400`;

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
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-1">{provider.name}</h1>
            <p className="text-teal-600 dark:text-teal-400 font-semibold mb-4">{provider.category}</p>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-500">
                <FiStar className="fill-current" /><FiStar className="fill-current" /><FiStar className="fill-current" /><FiStar className="fill-current" /><FiStar className="fill-current" />
              </div>
              <span className="text-slate-600 dark:text-slate-400 font-medium">{provider.rating || 4.5} ({provider.reviewsCount || 0} reviews)</span>
            </div>

            <div className="w-full space-y-3">
              <Link to={`/book/${provider._id}`} className="block w-full">
                <Button variant="primary" className="w-full py-3 text-lg rounded-xl">Book Now</Button>
              </Link>
              <Button variant="outline" className="w-full py-3 rounded-xl flex items-center justify-center gap-2"><FiPhone /> Contact</Button>
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
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Jobs Done</p>
                <p className="font-bold text-xl text-slate-800 dark:text-white">140+</p>
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

            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Availability</h2>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex items-center justify-center min-h-[200px] text-slate-500 dark:text-slate-400 transition-colors">
                <div className="text-center">
                  <FiClock size={40} className="mx-auto mb-3 opacity-50" />
                  <p>Interactive calendar will be implemented here.</p>
                  <p className="text-sm">Currently available all weekdays from 9 AM to 6 PM.</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Client Reviews</h2>
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                  <h3 className="text-5xl font-extrabold text-amber-500">{provider.rating || 4.5}</h3>
                  <div className="flex text-amber-500 my-2">
                    <FiStar className="fill-current" size={20} /><FiStar className="fill-current" size={20} /><FiStar className="fill-current" size={20} /><FiStar className="fill-current" size={20} /><FiStar className="fill-current" size={20} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Based on {provider.reviewsCount || 0} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5,4,3,2,1].map((stars, idx) => {
                    const percentages = [80, 15, 3, 2, 0];
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-16 text-right">{stars} Stars</span>
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${percentages[idx]}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-slate-500 w-10">{percentages[idx]}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
