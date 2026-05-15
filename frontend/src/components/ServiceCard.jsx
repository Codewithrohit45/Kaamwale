import { Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiClock, FiZap } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import Button from './Button';
export default function ServiceCard({ provider }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full hover:-translate-y-1 relative overflow-hidden">
      {provider.isFeatured && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl flex items-center gap-1 z-10">
          <FiZap size={10} className="fill-current" /> FEATURED
        </div>
      )}
      <div className="flex items-start gap-4">
        <Link to={`/provider/${provider?._id || provider?.id || 'unknown'}`} className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
          <img 
            src={provider.image || `https://ui-avatars.com/api/?name=${provider.name}&background=14b8a6&color=fff`} 
            alt={provider.name}
            className="w-full h-full object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <Link to={`/provider/${provider?._id || provider?.id || 'unknown'}`} className="flex items-center gap-1 min-w-0">
              <h3 className="font-semibold text-lg text-slate-800 truncate hover:text-teal-600 transition-colors">{provider.name}</h3>
              {provider.isVerified && <MdVerified className="text-blue-500 shrink-0" size={18} title="Verified Professional" />}
            </Link>
            <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-0.5 rounded text-sm font-medium">
              <FiStar className="mr-1 fill-current" /> {provider.rating}
            </div>
          </div>
          <p className="text-teal-600 font-medium text-sm">{provider.category}</p>
          <div className="flex items-center text-slate-500 text-sm mt-1">
            <FiMapPin className="mr-1" /> {provider.location}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-slate-600 text-sm line-clamp-2">
        {provider.description}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-slate-800">₹{provider.hourlyRate}</span>
          <span className="text-slate-500 text-xs">/hr</span>
        </div>
        <Link to={`/book/${provider?._id || provider?.id || 'unknown'}`}>
          <Button variant="primary" size="sm">Book Now</Button>
        </Link>
      </div>
    </div>
  );
}
