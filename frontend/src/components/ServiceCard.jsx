import { Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiClock } from 'react-icons/fi';
import Button from './Button';

export default function ServiceCard({ provider }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
          <img 
            src={provider.image || `https://ui-avatars.com/api/?name=${provider.name}&background=14b8a6&color=fff`} 
            alt={provider.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg text-slate-800 truncate">{provider.name}</h3>
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
        <Link to={`/provider/${provider.id}`}>
          <Button variant="primary" size="sm">Book Now</Button>
        </Link>
      </div>
    </div>
  );
}
