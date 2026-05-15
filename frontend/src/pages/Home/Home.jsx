import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiSearch, FiMapPin, FiTool, FiZap, FiBook, FiWind, FiScissors, FiHome } from 'react-icons/fi';
import { MdOutlineConstruction, MdOutlinePlumbing } from 'react-icons/md';
import { motion } from 'framer-motion';
import Button from '../../components/Button';
import ServiceCard from '../../components/ServiceCard';

const categories = [
  { name: 'Labour', image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&h=150&fit=crop', color: 'bg-orange-100 text-orange-600' },
  { name: 'Plumber', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=150&h=150&fit=crop', color: 'bg-blue-100 text-blue-600' },
  { name: 'Electrician', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=150&h=150&fit=crop', color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Carpenter', image: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=150&h=150&fit=crop', color: 'bg-amber-100 text-amber-600' },
  { name: 'Tutor', image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&h=150&fit=crop', color: 'bg-purple-100 text-purple-600' },
  { name: 'Painter', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&h=150&fit=crop', color: 'bg-pink-100 text-pink-600' },
  { name: 'Mechanic', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=150&h=150&fit=crop', color: 'bg-gray-100 text-gray-600' },
  { name: 'AC Repair', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=150&h=150&fit=crop', color: 'bg-cyan-100 text-cyan-600' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const navigate = useNavigate();

  // Fetch top-rated providers from the database
  useEffect(() => {
    const fetchTopProviders = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/providers/top');
        const data = await res.json();
        if (res.ok && data.length > 0) {
          setFeaturedProviders(data);
        }
      } catch (err) {
        console.error('Failed to fetch top providers', err);
      }
    };
    fetchTopProviders();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${search}&loc=${location}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-900">
          <img 
            src="/hero_banner.png" 
            alt="Kaamwale Hero" 
            className="w-full h-full object-cover object-center opacity-60 mix-blend-overlay"
          />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg"
          >
            Find Trusted <span className="text-teal-400">Gig Workers</span> in Minutes
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-100 mb-10 max-w-2xl mx-auto font-medium drop-shadow"
          >
            From expert labour to skilled plumbers and tutors, book reliable professionals around your location instantly.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-dark rounded-2xl p-4 md:p-6 max-w-3xl mx-auto"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="What service do you need?" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/95 border-0 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 font-medium outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Location (e.g. Mumbai)" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/95 border-0 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 font-medium outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="md:w-auto w-full py-4 px-8 text-lg rounded-xl">
                Search
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Explore Services</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-2xl mx-auto">Browse through our top categories to find the exact help you need today.</p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {categories.map((cat, idx) => (
              <motion.div variants={itemVariants} key={idx}>
                <Link to={`/category/${cat.name.toLowerCase().replace(' ', '-')}`} className="group p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center justify-center cursor-pointer h-full">
                  <div className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm border border-slate-100 dark:border-slate-700`}>
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{cat.name}</h3>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Workers — Now from DB */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Top Rated Providers</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-4">Highly rated professionals ready to work.</p>
            </div>
            <Link to="/search">
              <Button variant="ghost" className="dark:text-slate-300">View All &rarr;</Button>
            </Link>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {featuredProviders.length > 0 ? (
              featuredProviders.slice(0, 6).map(provider => (
                <motion.div variants={itemVariants} key={provider._id} className="h-full">
                  <ServiceCard provider={provider} />
                </motion.div>
              ))
            ) : (
              // Skeleton loaders while data loads
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-72 animate-pulse border border-slate-100 dark:border-slate-700"></div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-teal-900"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Are you a skilled professional?</h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            Join thousands of gig workers earning on their own terms. List your services, set your rates, and get hired instantly.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup?role=provider">
              <Button variant="primary" size="lg" className="bg-teal-500 hover:bg-teal-400 text-white rounded-xl px-8 border-none">
                Become a Provider
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" size="lg" className="border-teal-400 text-teal-400 hover:bg-teal-900/50 rounded-xl px-8">
                Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}