import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ServiceCard from '../../components/ServiceCard';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

const categoryData = {
  labour: { title: 'Expert Labour Services', desc: 'Find reliable general and construction labour in your area.', bg: 'bg-orange-600', img: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=1200&h=400&fit=crop' },
  plumber: { title: 'Professional Plumbers', desc: 'Fix leaks, install pipes, and repair bathroom fittings quickly.', bg: 'bg-blue-600', img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&h=400&fit=crop' },
  electrician: { title: 'Certified Electricians', desc: 'Safe and certified electrical wiring, repairs, and installations.', bg: 'bg-yellow-500', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&h=400&fit=crop' },
  carpenter: { title: 'Skilled Carpenters', desc: 'Custom furniture, woodwork, and repairs.', bg: 'bg-amber-600', img: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=1200&h=400&fit=crop' },
  tutor: { title: 'Qualified Tutors', desc: 'Academic excellence and private tutoring for all subjects.', bg: 'bg-purple-600', img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&h=400&fit=crop' },
  painter: { title: 'House Painters', desc: 'Interior and exterior painting services with premium finishes.', bg: 'bg-pink-600', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&h=400&fit=crop' },
  mechanic: { title: 'Auto Mechanics', desc: 'Vehicle repair and maintenance at your convenience.', bg: 'bg-gray-700', img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&h=400&fit=crop' },
  'ac-repair': { title: 'AC Repair Specialists', desc: 'Cooling solutions, servicing, and gas refills.', bg: 'bg-cyan-600', img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=400&fit=crop' },
  'ac repair': { title: 'AC Repair Specialists', desc: 'Cooling solutions, servicing, and gas refills.', bg: 'bg-cyan-600', img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=400&fit=crop' }
};

const apiCategoryMap = {
  labour: 'Labour',
  plumber: 'Plumber',
  electrician: 'Electrician',
  carpenter: 'Carpenter',
  tutor: 'Tutor',
  painter: 'Painter',
  mechanic: 'Mechanic',
  'ac-repair': 'AC Repair',
  'ac repair': 'AC Repair'
};

export default function Category() {
  const { name } = useParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryKey = name.toLowerCase();
  const details = categoryData[categoryKey] || { title: `${name} Services`, desc: `Find top rated ${name} providers.`, bg: 'bg-teal-600', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=400&fit=crop' };

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const queryCategory = apiCategoryMap[categoryKey] || name;
        const res = await fetch(`http://localhost:5000/api/providers?category=${queryCategory}`);
        const data = await res.json();
        setProviders(data);
      } catch (error) {
        console.error('Error fetching category providers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [name, categoryKey]);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20 transition-colors">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-900">
          <img 
            src={details.img} 
            alt={details.title} 
            className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          />
        </div>
        <div className={`absolute inset-0 opacity-80 mix-blend-multiply ${details.bg}`}></div>
        
        <div className="relative z-10 text-center px-4">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm font-medium transition-colors">
            <FiArrowLeft className="mr-2" /> Back to Home
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md capitalize"
          >
            {details.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow"
          >
            {details.desc}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 md:p-10 border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Available Professionals <span className="text-teal-600 dark:text-teal-400 text-lg ml-2">({providers.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-100 dark:bg-slate-700 h-64 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No providers found</h3>
              <p className="text-slate-500 dark:text-slate-400">There are currently no professionals listed in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {providers.map(provider => (
                <ServiceCard key={provider._id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
